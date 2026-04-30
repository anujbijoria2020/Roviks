import { Lock, Pencil } from 'lucide-react'
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
    return <div className="text-zinc-400">Profile unavailable.</div>
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-white">
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-zinc-400">Manage your account information.</p>

      <section className="mt-6 max-w-2xl rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8">
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-white">{user.fullName}</h2>
            <p className="truncate text-sm text-zinc-400">{user.email}</p>
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
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-orange-500 hover:text-orange-500"
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
              <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">{field.label}</p>
              {isEditing ? (
                <input
                  type="text"
                  value={form[field.key as keyof ProfileForm] ?? ''}
                  onChange={(event) =>
                    handleFieldChange(field.key as keyof ProfileForm, event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <p className="py-2 text-sm text-white">{form[field.key as keyof ProfileForm] || '-'}</p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2">
            <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Email Address</p>
            <p className="flex items-center gap-2 py-2 text-sm text-zinc-500">
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
              className="rounded-lg bg-orange-500 px-6 py-2.5 text-white disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-zinc-700 px-6 py-2.5 text-zinc-400"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-4 max-w-2xl rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-400">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Member since</span>
            <span className="text-white">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Account role</span>
            <span className="capitalize text-white">{user.role}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
