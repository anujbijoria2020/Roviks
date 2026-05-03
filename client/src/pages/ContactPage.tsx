import { Clock3, Mail, MessageCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getWhatsappNumber } from '../api/settings.api'
import PublicFooter from '../components/PublicFooter'
import PublicNavbar from '../components/PublicNavbar'
import { buildWhatsAppUrl } from '../utils/whatsapp'

const ContactPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    document.title = 'Contact Us - ROVIKS'

    const loadWhatsappNumber = async () => {
      try {
        const response = await getWhatsappNumber()
        setWhatsappNumber(
          response.data?.value ?? response.data?.whatsappNumber ?? response.data?.settings?.value ?? '',
        )
      } catch {
        setWhatsappNumber('')
      }
    }

    void loadWhatsappNumber()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Message sent! We'll get back to you soon.")

      const text = `Hi ROVIKS! My name is ${name}. ${message} Contact: ${email} | ${phone || '-'}`
      const whatsappUrl = buildWhatsAppUrl(whatsappNumber, text)

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank')
      }

      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      <main className="pt-16">
        <section className="px-8 py-20 text-center">
          <h1 className="text-4xl font-black uppercase leading-none sm:text-6xl">
            <span className="text-foreground">Contact</span> <span className="text-primary">Us</span>
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">Have questions? We're here to help.</p>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-12 px-8 pb-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-8 text-2xl font-bold text-foreground">Get In Touch</h2>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  const whatsappUrl = buildWhatsAppUrl(whatsappNumber)

                  if (whatsappUrl) {
                    window.open(whatsappUrl, '_blank')
                  }
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface-secondary p-6 text-left transition hover:cursor-pointer hover:border-[#25D366]/50"
              >
                <MessageCircle className="h-12 w-12 rounded-xl bg-[#25D366]/20 p-3 text-[#25D366]" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-foreground-muted">WhatsApp</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {whatsappNumber ? `+${whatsappNumber}` : 'Not configured'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => window.open('mailto:hello@roviks.com')}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface-secondary p-6 text-left transition hover:cursor-pointer hover:border-primary/50"
              >
                <Mail className="h-12 w-12 rounded-xl bg-primary/20 p-3 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-foreground-muted">Email</p>
                  <p className="mt-1 text-lg font-bold text-foreground">hello@roviks.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => window.open('https://instagram.com/roviks.official', '_blank')}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface-secondary p-6 text-left transition hover:cursor-pointer hover:border-pink-500/50"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-foreground-muted">Instagram</p>
                  <p className="mt-1 text-lg font-bold text-foreground">@roviks.official</p>
                </div>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface-secondary p-6">
              <Clock3 className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-bold text-foreground">We're Available</h3>
              <p className="mt-1 text-sm text-foreground-muted">Monday - Saturday</p>
              <p className="text-sm text-foreground-secondary">10:00 AM - 8:00 PM IST</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-secondary p-8">
            <h2 className="mb-6 text-xl font-bold text-foreground">Send a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Full Name"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder-zinc-500 transition focus:border-primary focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder-zinc-500 transition focus:border-primary focus:outline-none"
              />
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder-zinc-500 transition focus:border-primary focus:outline-none"
              />
              <textarea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                placeholder="Tell us how we can help you..."
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder-zinc-500 transition focus:border-primary focus:outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    Send Message
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default ContactPage
