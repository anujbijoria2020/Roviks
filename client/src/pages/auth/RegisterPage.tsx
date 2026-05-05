import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AtSign, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerUser } from '../../api/auth.api'

const RegisterPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Join ROVIKS'
  }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    city: '',
    socialHandle: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await registerUser(formData)
      toast.success('Account created! Waiting for approval')
      navigate('/login')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to create account right now.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen animate-[fadeIn_0.2s_ease] items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-center text-3xl font-bold text-[#f97316]">Join ROVIKS</h1>
        <p className="mt-2 text-center text-sm text-foreground-muted">Start your dropshipping journey</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              required
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(event) => handleInputChange('fullName', event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(event) => handleInputChange('email', event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={formData.password}
              onChange={(event) => handleInputChange('password', event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-12 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition hover:text-foreground-secondary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
              <input
                type="tel"
                required
                placeholder="Phone"
                value={formData.phone}
                onChange={(event) => handleInputChange('phone', event.target.value)}
                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
              />
            </div>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
              <input
                type="tel"
                required
                placeholder="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={(event) => handleInputChange('whatsappNumber', event.target.value)}
                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              required
              placeholder="City"
              value={formData.city}
              onChange={(event) => handleInputChange('city', event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Instagram/Social Handle (optional)"
              value={formData.socialHandle}
              onChange={(event) => handleInputChange('socialHandle', event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder-zinc-500 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-[#f97316] py-3 font-bold text-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#f97316] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
