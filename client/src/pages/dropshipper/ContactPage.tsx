import { Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { sendMessage } from '../../api/message.api'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await sendMessage(formData)
      toast.success('Message sent successfully!')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contact Us</h1>
      <p className="mt-1 text-sm sm:text-base text-foreground-muted">We'd love to hear from you. Get in touch with us.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-secondary p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Phone</h3>
                <p className="mt-1 text-sm text-foreground-muted">+91 9301423789</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-secondary p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">WhatsApp</h3>
                <p className="mt-1 text-sm text-foreground-muted">+91 9301423789</p>
                <a
                  href="https://wa.me/919301423789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-primary hover:underline"
                >
                  Chat on WhatsApp →
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-secondary p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="mt-1 text-sm text-foreground-muted">roviks@gmail.com</p>
                <p className="text-xs text-foreground-muted">We'll reply within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-xl border border-border bg-surface-secondary p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="Inquiry about a product"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required                rows={6}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                placeholder="Tell us more about your query..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
