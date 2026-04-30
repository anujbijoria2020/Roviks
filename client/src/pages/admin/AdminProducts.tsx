import { Layers, Palette, Plus, ShoppingBag, Upload, X, Pencil, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getAllProducts,
  toggleProduct,
  updateProduct,
} from '../../api/product.api'
import Badge from '../../components/ui/Badge'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { getImageUrl, handleImageError } from '../../utils/imageUrl'
import type { Category, Product } from '../../types/index'

interface ProductForm {
  name: string
  category: string
  description: string
  mrp: string
  dropshipperPrice: string
  moq: string
  weight: string
  dimensions: string
  material: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  contentType: 'product' | 'mockup' | 'design'
  sizes: string[]
}

const defaultForm: ProductForm = {
  name: '',
  category: '',
  description: '',
  mrp: '',
  dropshipperPrice: '',
  moq: '1',
  weight: '',
  dimensions: '',
  material: '',
  stockStatus: 'in_stock',
  contentType: 'product',
  sizes: [],
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'product' | 'mockup' | 'design'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ProductForm>(defaultForm)
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getAllProducts(filterType !== 'all' ? { contentType: filterType } : undefined),
        getAllCategories()
      ])
      const productsData = (productsRes.data?.products ?? productsRes.data ?? []) as Product[]
      const categoriesData = (categoriesRes.data?.categories ?? categoriesRes.data ?? []) as Category[]
      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [filterType])

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  )

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

  const profitPreview = Math.max(0, Number(form.mrp || 0) - Number(form.dropshipperPrice || 0))

  const openAddModal = () => {
    setEditingProduct(null)
    setForm(defaultForm)
    setImages([])
    setVideo(null)
    setPdf(null)
    setExistingImages([])
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      category: product.category?._id ?? '',
      description: product.description,
      mrp: String(product.mrp),
      dropshipperPrice: String(product.dropshipperPrice),
      moq: String(product.moq),
      weight: product.weight ?? '',
      dimensions: product.dimensions ?? '',
      material: product.material ?? '',
      stockStatus: product.stockStatus,
      contentType: product.contentType || 'product',
      sizes: product.sizes || [],
    })
    setImages([])
    setVideo(null)
    setPdf(null)
    setExistingImages(product.media.filter((m) => m.type === 'image').map((m) => m.url))
    setIsModalOpen(true)
  }

  const selectedCategory = categories.find((category) => category._id === form.category)
  const allowsVideo = selectedCategory?.kind !== 'designs'

  const handleToggle = async (id: string) => {
    await toggleProduct(id)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    await deleteProduct(deleteConfirmId)
    setDeleteConfirmId(null)
    toast.success('Product deleted')
    await fetchData()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('category', form.category)
      formData.append('description', form.description)
      formData.append('mrp', form.mrp)
      formData.append('dropshipperPrice', form.dropshipperPrice)
      formData.append('profitMargin', String(profitPreview))
      formData.append('moq', form.moq)
      formData.append('weight', form.weight)
      formData.append('dimensions', form.dimensions)
      formData.append('material', form.material)
      formData.append('stockStatus', form.stockStatus)
      formData.append('contentType', form.contentType)
      form.sizes.forEach((size) => formData.append('sizes', size))
      images.forEach((image) => formData.append('images', image))
      if (video) formData.append('video', video)
      if (pdf) formData.append('pdf', pdf)

      if (editingProduct) {
        await updateProduct(editingProduct._id, formData)
        toast.success('Product updated')
      } else {
        await createProduct(formData)
        toast.success('Product created')
      }

      setIsModalOpen(false)
      await fetchData()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to save product.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Products</h1>
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{products.length}</span>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="max-w-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-zinc-800 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'product', 'mockup', 'design'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                filterType === type
                  ? 'bg-orange-500 text-white font-medium'
                  : 'border border-zinc-700 bg-[#1a1a1a] text-zinc-400 hover:border-orange-500 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type}s
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a1a]">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#111111] text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Your Price</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const image = product.media?.find((item) => item.type === 'image')?.url
                  const typeConfig = {
                    product: { icon: ShoppingBag, color: 'text-blue-400', label: 'Product' },
                    mockup: { icon: Layers, color: 'text-purple-400', label: 'Mockup' },
                    design: { icon: Palette, color: 'text-pink-400', label: 'Design' },
                  }
                  const typeInfo = typeConfig[product.contentType || 'product']
                  const TypeIcon = typeInfo.icon
                  return (
                    <tr key={product._id} className="border-t border-zinc-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                          <span className={`text-sm ${typeInfo.color}`}>{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img src={getImageUrl(image)} alt={product.name} className="h-10 w-10 rounded-lg object-cover" onError={handleImageError} />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-zinc-800" />
                          )}
                          <p className="text-sm text-white">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{product.category?.name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">₹{product.mrp}</td>
                      <td className="px-4 py-3 font-medium text-white">₹{product.dropshipperPrice}</td>
                      <td className="px-4 py-3 text-sm text-green-400">₹{product.profitMargin}</td>
                      <td className="px-4 py-3">
                        <Badge status={product.stockStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleToggle(product._id)}
                          className={`relative h-6 w-10 rounded-full ${product.isActive ? 'bg-orange-500' : 'bg-zinc-700'}`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                              product.isActive ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="text-zinc-400 transition hover:text-orange-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(product._id)}
                            className="text-zinc-400 transition hover:text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirmId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] p-6">
            <h3 className="text-lg font-bold text-white">Delete Product?</h3>
            <p className="mt-2 text-sm text-zinc-400">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300"
              >
                Cancel
              </button>
              <button type="button" onClick={() => void handleDelete()} className="rounded-lg bg-red-500 px-4 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <p className="mb-3 text-sm text-zinc-400">Content Type</p>
                <div className="flex gap-3">
                  {[
                    { value: 'product' as const, icon: ShoppingBag, label: 'Product', desc: 'Has price & ordering' },
                    { value: 'mockup' as const, icon: Layers, label: 'Mockup', desc: 'Download only' },
                    { value: 'design' as const, icon: Palette, label: 'Design', desc: 'Download only' },
                  ].map((type) => {
                    const Icon = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${
                          form.contentType === type.value
                            ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contentType"
                          value={type.value}
                          checked={form.contentType === type.value}
                          onChange={(e) => setForm((prev) => ({ ...prev, contentType: e.target.value as any }))}
                          className="hidden"
                        />
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs opacity-70">{type.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {form.contentType !== 'product' && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                  This content is free to download
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  required
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
                <div>
                  <select
                    required
                    value={form.category}
                    onChange={(event) => {
                      const nextCategoryId = event.target.value
                      const nextCategory = categories.find((category) => category._id === nextCategoryId)
                      setForm((prev) => ({ ...prev, category: nextCategoryId }))
                      if (nextCategory?.kind === 'designs') {
                        setVideo(null)
                      }
                    }}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.contentType === 'product' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <input
                    required
                    type="number"
                    placeholder="MRP"
                    value={form.mrp}
                    onChange={(event) => setForm((prev) => ({ ...prev, mrp: event.target.value }))}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    required
                    type="number"
                    placeholder="Your Price"
                    value={form.dropshipperPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, dropshipperPrice: event.target.value }))}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-xs text-green-400">Profit/unit</p>
                    <p className="text-xl font-bold text-green-400">₹{profitPreview}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {form.contentType === 'product' && (
                  <input
                    type="number"
                    placeholder="MOQ"
                    value={form.moq}
                    onChange={(event) => setForm((prev) => ({ ...prev, moq: event.target.value }))}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                )}
                <input
                  placeholder="Weight"
                  value={form.weight}
                  onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                  className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
                <input
                  placeholder="Dimensions"
                  value={form.dimensions}
                  onChange={(event) => setForm((prev) => ({ ...prev, dimensions: event.target.value }))}
                  className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {form.contentType === 'product' && (
                  <input
                    placeholder="Material"
                    value={form.material}
                    onChange={(event) => setForm((prev) => ({ ...prev, material: event.target.value }))}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                )}
                {form.contentType === 'product' && (
                  <select
                    value={form.stockStatus}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        stockStatus: event.target.value as ProductForm['stockStatus'],
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="in_stock">in_stock</option>
                    <option value="low_stock">low_stock</option>
                    <option value="out_of_stock">out_of_stock</option>
                  </select>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
              />

              {form.contentType === 'product' && (
                <div>
                  <p className="mb-3 text-sm text-zinc-400">Available Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <label
                        key={size}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                          form.sizes.includes(size)
                            ? 'border-[#F5A623] text-[#F5A623]'
                            : 'border-zinc-800 bg-[#111111] text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={size}
                          checked={form.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm((prev) => ({ ...prev, sizes: [...prev.sizes, size] }))
                            } else {
                              setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }))
                            }
                          }}
                          className="hidden"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm text-zinc-400">Product Images</p>
                <label className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center transition hover:border-orange-500">
                  <Upload className="mx-auto h-5 w-5 text-zinc-500" />
                  <p className="mt-2 text-zinc-500">Click or drag images here</p>
                  <p className="text-xs text-zinc-600">JPG, PNG, WEBP up to 50MB each</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    className="hidden"
                    onChange={(event) => setImages(Array.from(event.target.files ?? []))}
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {existingImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg">
                      <img src={getImageUrl(url)} alt="Existing" className="h-full w-full object-cover" onError={handleImageError} />
                      <button
                        type="button"
                        onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.map((file, index) => (
                    <div key={file.name + index} className="relative h-20 w-20 overflow-hidden rounded-lg">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {allowsVideo ? (
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Product Video (Optional)</p>
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-6 text-center transition hover:border-orange-500">
                    <Upload className="mx-auto h-5 w-5 text-zinc-500" />
                    <p className="mt-2 text-zinc-500">{video?.name ?? 'Click or drag MP4 here'}</p>
                    <input
                      type="file"
                      accept=".mp4"
                      className="hidden"
                      onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                  Designs are image-only. Video uploads are disabled for this category.
                </div>
              )}

              <div>
                <p className="mb-2 text-sm text-zinc-400">Design Kit PDF (Optional)</p>
                <label className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-6 text-center transition hover:border-orange-500">
                  <Upload className="mx-auto h-5 w-5 text-zinc-500" />
                  <p className="mt-2 text-zinc-500">{pdf?.name ?? 'Click or drag PDF here'}</p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(event) => setPdf(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminProducts
