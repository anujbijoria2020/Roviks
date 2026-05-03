import { CheckCircle, ChevronDown, ChevronUp, ExternalLink, Lock, Pencil, ShoppingBag, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { updateMe } from '../../api/auth.api'
import { connectShopify, disconnectShopify } from '../../api/shopify.api'
import { useAuth } from '../../context/AuthContext'

interface ProfileForm {
  fullName: string
  phone: string
  whatsappNumber: string
  city: string
  socialHandle: string
}

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    phone: '',
    whatsappNumber: '',
    city: '',
    socialHandle: '',
  })
  const [storeUrl, setStoreUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)
  const [shopifyStatus, setShopifyStatus] = useState<'idle' | 'pending' | 'active' | 'failed'>('idle')

  useEffect(() => {
    if (!user) return
    setForm({
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      whatsappNumber: user.whatsappNumber ?? '',
      city: user.city ?? '',
      socialHandle: user.socialHandle ?? '',
    })
  }, [user])

  useEffect(() => {
    if (user?.shopify?.isConnected && user?.shopify?.status === 'active') {
      setShopifyStatus('active')
    } else if (user?.shopify?.status === 'failed') {
      setShopifyStatus('failed')
    } else {
      setShopifyStatus('idle')
    }
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shopifyParam = params.get('shopify')
    if (shopifyParam === 'connected') {
      toast.success('Shopify store connected successfully! 🎉')
      setShopifyStatus('active')
      window.history.replaceState({}, '', '/dashboard/profile')
    } else if (shopifyParam === 'failed') {
      toast.error('Shopify connection failed. Please try again.')
      setShopifyStatus('failed')
      window.history.replaceState({}, '', '/dashboard/profile')
    }
  }, [])

  const initials = useMemo(() => (user?.fullName?.[0] ?? 'U').toUpperCase(), [user?.fullName])

  const handleFieldChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCancel = () => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        phone: user.phone ?? '',
        whatsappNumber: user.whatsappNumber ?? '',
        city: user.city ?? '',
        socialHandle: user.socialHandle ?? '',
      })
    }
    setIsEditing(false)
  }

  const handleUpdate = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const response = await updateMe(form)
      const nextUser = (response.data?.user ?? response.data) ?? {}
      updateUser({
        ...user,
        ...nextUser,
      })
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to update profile right now.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnect = async () => {
    if (!storeUrl.trim()) {
      toast.error('Please enter your Shopify store URL')
      return
    }
    setIsConnecting(true)
    try {
      const res = await connectShopify({ storeName: storeUrl })
      const { authUrl } = res.data
      window.location.href = authUrl
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to connect. Check your store URL.')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectShopify()
      setShopifyStatus('idle')
      setStoreUrl('')
      toast.success('Shopify store disconnected')
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  if (!user) {
    return <div className="text-foreground-muted">Profile unavailable.</div>
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-foreground">
      <h1 className="text-3xl font-bold text-foreground">Profile</h1>
      <p className="mt-1 text-foreground-muted">Manage your account information.</p>

      <section className="mt-6 max-w-2xl rounded-2xl border border-border bg-surface-secondary p-8">
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-foreground">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-foreground">{user.fullName}</h2>
            <p className="truncate text-sm text-foreground-muted">{user.email}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs ${
                user.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}
            >
              {user.isApproved ? '✓ Approved Account' : '⏳ Pending Approval'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground-muted transition hover:border-primary hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: 'Full Name', key: 'fullName', colSpan: 'sm:col-span-2' },
            { label: 'Phone Number', key: 'phone' },
            { label: 'WhatsApp Number', key: 'whatsappNumber' },
            { label: 'City', key: 'city' },
            { label: 'Social Handle', key: 'socialHandle', colSpan: 'sm:col-span-2' },
          ].map((field) => (
            <div key={field.key} className={field.colSpan ?? ''}>
              <p className="mb-1 text-xs uppercase tracking-wider text-foreground-muted">{field.label}</p>
              {isEditing ? (
                <input
                  type="text"
                  value={form[field.key as keyof ProfileForm] ?? ''}
                  onChange={(event) =>
                    handleFieldChange(field.key as keyof ProfileForm, event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              ) : (
                <p className="py-2 text-sm text-foreground">{form[field.key as keyof ProfileForm] || '-'}</p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2">
            <p className="mb-1 text-xs uppercase tracking-wider text-foreground-muted">Email Address</p>
            <p className="flex items-center gap-2 py-2 text-sm text-foreground-muted">
              <Lock className="h-4 w-4" />
              {user.email}
            </p>
            <p className="text-xs text-zinc-600">Email cannot be changed</p>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => void handleUpdate()}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-2.5 text-foreground disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-border px-6 py-2.5 text-foreground-muted"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-4 max-w-2xl rounded-xl border border-border bg-surface-secondary p-6">
        <h3 className="mb-4 text-sm font-medium text-foreground-muted">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Member since</span>
            <span className="text-foreground">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Account role</span>
            <span className="capitalize text-foreground">{user.role}</span>
          </div>
        </div>
      </section>

      {/* ── SHOPIFY STORE CARD ── */}
      <div className="mt-4 max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface-secondary">
        {/* Header — always visible */}
        <div className="flex items-center gap-4 border-b border-border p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
            <ShoppingBag className="h-6 w-6 text-foreground-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase tracking-wide text-foreground">Shopify Store</h3>
            <p className="mt-0.5 text-sm text-foreground-muted">Sync store data and manage connected commerce flows</p>
          </div>
          {shopifyStatus === 'active' && (
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">Connected ✓</span>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* STATE — IDLE (not connected) */}
          {shopifyStatus === 'idle' && (
            <div className="space-y-4">
              {/* Store URL Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground-muted">Store URL *</label>
                <input
                  type="text"
                  placeholder="yourstore.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder-zinc-500 focus:border-[#96BF48] focus:outline-none transition"
                />
              </div>

              {/* How to get token — collapsible */}
              <div className="rounded-xl bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHowTo(!showHowTo)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <span className="text-sm text-foreground-muted">How does Shopify connection work?</span>
                  {showHowTo ? <ChevronUp className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
                </button>
                {showHowTo && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                    {[
                      '1. Click "Connect Shopify Store" below',
                      '2. Enter your store URL (yourstore.myshopify.com)',
                      '3. You will be redirected to Shopify login',
                      '4. Click "Install App" to grant permissions',
                      '5. You will be redirected back — done!',
                    ].map((step) => (
                      <p key={step} className="text-xs text-foreground-muted">{step}</p>
                    ))}
                    <button
                      type="button"
                      onClick={() => window.open('https://admin.shopify.com', '_blank')}
                      className="mt-2 text-xs text-[#96BF48] hover:underline"
                    >
                      Open Shopify Admin →
                    </button>
                  </div>
                )}
              </div>

              {/* Connect Button */}
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#96BF48] py-4 font-bold uppercase tracking-wide text-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConnecting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Connect Shopify Store →
                  </>
                )}
              </button>
            </div>
          )}

          {/* STATE — PENDING */}
          {shopifyStatus === 'pending' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Store Review In Progress</span>
              </div>
              <div className="rounded-xl border border-border p-5">
                <p className="font-bold uppercase text-foreground">{user?.shopify?.storeName}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Our team is setting up your connection. This usually takes a few minutes.</p>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="mt-6 text-sm text-foreground-muted underline hover:text-red-400 transition"
              >
                Cancel and start over
              </button>
            </div>
          )}

          {/* STATE — ACTIVE */}
          {shopifyStatus === 'active' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-green-500">Store Connected</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/5 p-5">
                <div>
                  <p className="font-bold uppercase text-foreground">{user?.shopify?.storeName}</p>
                  {user?.shopify?.connectedAt && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      Connected on{' '}
                      {new Date(user.shopify.connectedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>

              <button
                type="button"
                onClick={() => window.open(`https://${user?.shopify?.storeName}/admin`, '_blank')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-foreground-muted transition hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                Open Shopify Admin
              </button>

              <div className="mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-red-400 underline hover:text-red-300"
                >
                  Disconnect store
                </button>
              </div>
            </div>
          )}

          {/* STATE — FAILED */}
          {shopifyStatus === 'failed' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">Connection Failed</span>
              </div>

              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-center">
                <XCircle className="mx-auto h-10 w-10 text-red-500" />
                <p className="mt-3 font-medium text-foreground">Could not connect to your store</p>
                <p className="mt-1 text-sm text-foreground-muted">Please check your store URL and try again.</p>
              </div>

              <button
                type="button"
                onClick={() => setShopifyStatus('idle')}
                className="mt-4 w-full rounded-xl bg-red-500 py-3 font-bold text-foreground hover:bg-red-600 transition"
              >
                Try Again
              </button>

              <p
                className="mt-3 cursor-pointer text-center text-xs text-foreground-muted hover:text-foreground transition"
                onClick={() => window.open('https://wa.me/919999999999', '_blank')}
              >
                Need help? Contact Support →
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── WHAT THIS CONTROLS ── */}
      <div className="mt-4 max-w-2xl rounded-2xl border border-border bg-surface p-6">
        <h4 className="mb-4 font-black uppercase tracking-wide text-foreground">What These Settings Control</h4>
        <div className="space-y-3">
          {[
            'Push products directly to your Shopify store with one click',
            'Product images, descriptions and pricing auto-synced',
            'Manage all your dropshipping from one dashboard',
            'No manual copy-paste — everything automated',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#96BF48]" />
              <p className="text-sm text-foreground-muted">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
