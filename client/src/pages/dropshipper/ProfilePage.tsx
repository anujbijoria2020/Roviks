import { CheckCircle, Lock, Pencil, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { updateMe } from '../../api/auth.api'
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
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <h4 className="text-lg font-bold text-foreground">Coming Soon!</h4>
          <p className="mt-2 text-sm text-foreground-muted">
            We are working hard to bring you a seamless Shopify integration. Stay tuned for updates!
          </p>
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
