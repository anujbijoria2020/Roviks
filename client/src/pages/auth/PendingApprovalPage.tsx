import { Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getWhatsappNumber } from '../../api/settings.api'
import { useAuth } from '../../context/AuthContext'
import { buildWhatsAppUrl } from '../../utils/whatsapp'

const PendingApprovalPage = () => {
  const { logout } = useAuth()
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
    <div className="flex min-h-screen animate-[fadeIn_0.2s_ease] flex-col items-center justify-center bg-background px-6 text-center">
      <Clock3 size={64} className="text-[#f97316]" />
      <h1 className="mt-6 text-2xl font-bold text-foreground">Account Under Review</h1>
      <p className="mt-3 max-w-md text-foreground-muted">
        Your account is pending admin approval. We will notify you once approved.
      </p>

      <a
        href={buildWhatsAppUrl(whatsappNumber) ?? '#'}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!whatsappNumber}
        className="mt-8 rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-foreground transition hover:opacity-90"
      >
        Contact us on WhatsApp
      </a>

      <button type="button" onClick={logout} className="mt-6 text-foreground-muted hover:text-foreground-secondary">
        Sign Out
      </button>
    </div>
  )
}

export default PendingApprovalPage
