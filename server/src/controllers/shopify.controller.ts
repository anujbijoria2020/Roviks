import crypto from 'crypto';
import { Request, Response } from 'express';
import User from '../models/User.model';
import Product from '../models/Product.model';

export const connectShopify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeName } = req.body;
    const userId = (req as any).user?.id;

    if (!storeName) {
      res.status(400).json({ message: 'Store name is required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Clean storeName
    let shop = storeName.trim().toLowerCase();
    shop = shop.replace('https://', '').replace('http://', '');
    if (!shop.includes('.myshopify.com')) {
      shop = shop + '.myshopify.com';
    }

    // Validate format
    if (!shop.includes('.')) {
      res.status(400).json({ message: 'Invalid store format' });
      return;
    }

    // Create state (base64)
    const state = Buffer.from(JSON.stringify({
      userId,
      shop,
      timestamp: Date.now()
    })).toString('base64');

    // Build OAuth URL
    const authUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${process.env.SHOPIFY_API_KEY}` +
      `&scope=${process.env.SHOPIFY_SCOPES}` +
      `&redirect_uri=${process.env.SHOPIFY_REDIRECT_URI}` +
      `&state=${state}`;

    res.status(200).json({ authUrl, shop });
  } catch (error) {
    console.error('ConnectShopify Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const shopifyCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, shop, hmac } = req.query;

    if (!code || !state || !shop || !hmac) {
      res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=failed`);
      return;
    }

    // Verify HMAC signature
    const message = Object.keys(req.query)
      .filter((key) => key !== 'hmac')
      .sort()
      .map((key) => `${key}=${req.query[key]}`)
      .join('&');
    const digest = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
      .update(message)
      .digest('hex');

    if (digest !== hmac) {
      console.error('HMAC verification failed');
      res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=failed`);
      return;
    }

    // Decode state to get userId
    let decodedState: { userId: string; shop: string; timestamp: number };
    try {
      decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (error) {
      console.error('Failed to decode state:', error);
      res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=failed`);
      return;
    }

    const { userId } = decodedState;

    // Exchange code for access token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });

    if (!tokenRes.ok) {
      console.error('Failed to exchange code for access token');
      res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=failed`);
      return;
    }

    const { access_token } = await tokenRes.json();

    // Save to DB
    await User.findByIdAndUpdate(userId, {
      'shopify.storeName': shop,
      'shopify.accessToken': access_token,
      'shopify.isConnected': true,
      'shopify.status': 'active',
      'shopify.connectedAt': new Date()
    });

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=connected`);
  } catch (error) {
    console.error('ShopifyCallback Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/dashboard/profile?shopify=failed`);
  }
};

export const disconnectShopify = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      'shopify.storeName': '',
      'shopify.accessToken': '',
      'shopify.isConnected': false,
      'shopify.status': 'pending',
      'shopify.connectedAt': null
    });

    res.status(200).json({ message: 'Shopify store disconnected' });
  } catch (error) {
    console.error('DisconnectShopify Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const pushProductToShopify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = (req as any).user?.id;

    console.log('PushProductToShopify - productId:', productId, 'userId:', userId);

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.shopify?.isConnected || user.shopify.status !== 'active') {
      res.status(400).json({ message: 'Please connect your Shopify store first' });
      return;
    }

    console.log('User shopify status:', user.shopify);

    const product = await Product.findById(productId).populate('category');
    if (!product) {
      console.error('Product not found for id:', productId);
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    console.log('Product found:', product.name);

    // Resolve public base URL for uploaded images (use SERVER_URL or request host)
    const baseUploadsUrl = (process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`).toString().replace(/\/+$/, '');

    // Build Shopify product payload with enhanced details
    const shopifyProduct = {
      product: {
        title: product.name,
        body_html: `<div>
          <p><strong>Description:</strong></p>
          <p>${product.description}</p>
          <p><strong>Category:</strong> ${(product.category as any)?.name || 'Clothing'}</p>
          <p><strong>SKU:</strong> ROVIKS-${product._id}</p>
        </div>`,
        vendor: 'ROVIKS',
        product_type: (product.category as any)?.name || 'Clothing',
        tags: `roviks, dropship, ${(product.category as any)?.name || ''}, trending, new arrival`,
        status: 'active',
        published_scope: 'global',
        template_suffix: null,
        options: [
          {
            name: 'Title',
            values: ['Default Title']
          }
        ],
        variants: [{
          title: 'Default Title',
          price: product.mrp.toString(),
          compare_at_price: product.mrp.toString(),
          sku: `ROVIKS-${product._id}`,
          barcode: null,
          inventory_management: 'shopify',
          inventory_policy: 'deny',
          inventory_quantity: 100,
          fulfillment_service: 'manual',
          requires_shipping: true,
          taxable: true,
          weight: 0,
          weight_unit: 'kg',
          option1: 'Default Title',
          position: 1
        }],
        images: product.media
          .filter((m: any) => m.type === 'image')
          .map((m: any) => {
            const raw = String(m.url || '').trim();
            const src = raw.startsWith('http') ? raw : `${baseUploadsUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
            return {
              src,
              alt: `${product.name} - ${(product.category as any)?.name || 'Clothing'}`,
              position: 1
            };
          }),
        metafields: [
          {
            namespace: 'global',
            key: 'description_tag',
            value: product.description?.substring(0, 160) || product.name,
            type: 'single_line_text_field'
          },
          {
            namespace: 'global',
            key: 'title_tag',
            value: `${product.name} | ROVIKS`,
            type: 'single_line_text_field'
          }
        ]
      }
    };

    console.log('Pushing to Shopify store:', user.shopify.storeName);
    console.log('API version:', process.env.SHOPIFY_API_VERSION);
    console.log('Product payload:', JSON.stringify(shopifyProduct, null, 2));

    // Push to Shopify
    const shopifyUrl = `https://${user.shopify.storeName}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`;
    console.log('Shopify API URL:', shopifyUrl);

    const shopifyRes = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': user.shopify.accessToken
      },
      body: JSON.stringify(shopifyProduct)
    });

    const responseText = await shopifyRes.text();
    console.log('Shopify response status:', shopifyRes.status);
    console.log('Shopify response body:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse Shopify response as JSON');
      res.status(500).json({ message: 'Failed to parse Shopify response', details: responseText });
      return;
    }

    if (!shopifyRes.ok) {
      res.status(400).json({
        message: data.errors || data.error || 'Failed to push product',
        details: responseText
      });
      return;
    }

    res.json({
      message: 'Product pushed to Shopify successfully!',
      shopifyProductId: data.product.id,
      productUrl: `https://${user.shopify.storeName}/products/${data.product.handle}`,
      adminUrl: `https://${user.shopify.storeName}/admin/products/${data.product.id}`
    });
  } catch (error) {
    console.error('PushProductToShopify Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
