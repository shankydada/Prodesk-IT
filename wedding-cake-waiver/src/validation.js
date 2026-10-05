const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,99}$/u
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9+()\-\s]{7,20}$/

export const sanitizeInput = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/[<>]/g, '')
    .split('')
    .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
    .join('')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export const isValidEmail = (value) => emailPattern.test(value)
export const isValidPhone = (value) => phonePattern.test(value)
export const isValidName = (value) => namePattern.test(value)

export const validateStepData = (formData, step) => {
  const nextErrors = {}

  if (step === 1) {
    if (!isValidName(formData.clientName.trim())) nextErrors.clientName = 'Enter a valid client name.'
    if (!formData.eventDate) nextErrors.eventDate = 'Event date is required.'
    if (!formData.venue.trim()) nextErrors.venue = 'Venue is required.'
    if (!/^\d+$/.test(formData.guestCount) || Number(formData.guestCount) < 10 || Number(formData.guestCount) > 2000) {
      nextErrors.guestCount = 'Guest count must be between 10 and 2000.'
    }
  }

  if (step === 2) {
    if (!isValidName(formData.contactName.trim())) nextErrors.contactName = 'Enter a valid contact name.'
    if (!isValidPhone(formData.phone)) nextErrors.phone = 'Enter a valid phone number.'
    if (!isValidEmail(formData.email)) nextErrors.email = 'Enter a valid email.'
    if (!formData.cakeType.trim()) nextErrors.cakeType = 'Cake type is required.'
  }

  if (step === 3) {
    if (!isValidName(formData.signature.trim())) nextErrors.signature = 'Enter a valid signature.'
    if (!formData.waiverAccepted) nextErrors.waiverAccepted = 'Please accept the dietary waiver.'
  }

  return nextErrors
}