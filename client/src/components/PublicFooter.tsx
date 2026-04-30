import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getWhatsappNumber } from '../api/settings.api'
import { buildWhatsAppUrl } from '../utils/whatsapp'

const PublicFooter = () => {
  const navigate = useNavigate()
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
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

  return (
    <footer id="footer" className="border-t border-zinc-800 bg-[#111111] px-8 pb-8 pt-16">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wide text-[#F5A623]">Roviks</h3>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            Your one-stop platform for ready-to-sell fashion content. Start your clothing business
            without inventory.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="block text-sm text-zinc-400 transition hover:text-[#F5A623]"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => navigate('/start-selling')}
              className="block text-sm text-zinc-400 transition hover:text-[#F5A623]"
            >
              Start Selling
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="block text-sm text-zinc-400 transition hover:text-[#F5A623]"
            >
              Contact Us
            </button>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Get In Touch</h4>
          <p className="text-sm leading-relaxed text-zinc-400">
            Have questions? Want to partner with us? Reach out anytime.
          </p>
          <button
            type="button"
            onClick={() => {
              const whatsappUrl = buildWhatsAppUrl(whatsappNumber)

              if (whatsappUrl) {
                window.open(whatsappUrl, '_blank')
              }
            }}
            className="mt-4 text-sm font-medium text-[#F5A623] transition hover:underline"
          >
            Contact Us →
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-zinc-800 pt-8">
        <p className="text-center text-sm text-zinc-600">© 2026 Roviks. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default PublicFooter
