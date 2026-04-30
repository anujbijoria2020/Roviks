export const normalizeWhatsappNumber = (value: string) => value.replace(/\D/g, '')

export const buildWhatsAppUrl = (number: string, message?: string) => {
  const normalizedNumber = normalizeWhatsappNumber(number)

  if (!normalizedNumber) {
    return null
  }

  const suffix = message ? `?text=${encodeURIComponent(message)}` : ''

  return `https://wa.me/${normalizedNumber}${suffix}`
}