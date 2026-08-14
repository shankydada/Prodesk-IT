import { useEffect, useMemo, useState } from 'react'
import './App.css'

const totalSteps = 3
const stepLabels = ['Event Details', 'Contact & Cake Specs', 'Review & Acceptance']

const dietaryOptions = [
  'Gluten-free',
  'Vegetarian',
  'Vegan',
  'Nut allergy',
  'Dairy-free',
  'Halal',
  'Kosher',
  'No egg',
]

const initialForm = {
  clientName: '',
  eventDate: '',
  venue: '',
  cakeType: 'Buttercream cake',
  guestCount: '',
  contactName: '',
  phone: '',
  email: '',
  dietaryRequirements: [],
  waiverAccepted: false,
  notes: '',
  signature: '',
}

const sanitizeInput = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const logAnalytics = (message) => {
  console.log(`[Analytics] ${message}`)
}

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isValidPhone = (value) => /^[0-9+()\-\s]{7,20}$/.test(value)

function App() {
  const [formData, setFormData] = useState(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  const progress = useMemo(() => (currentStep / totalSteps) * 100, [currentStep])

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  const validateStep = (step) => {
    const nextErrors = {}

    if (step === 1) {
      if (!formData.clientName.trim()) nextErrors.clientName = 'Client name is required.'
      if (!formData.eventDate) nextErrors.eventDate = 'Event date is required.'
      if (!formData.venue.trim()) nextErrors.venue = 'Venue is required.'
      if (!formData.guestCount || Number(formData.guestCount) < 10 || Number(formData.guestCount) > 2000) {
        nextErrors.guestCount = 'Guest count must be between 10 and 2000.'
      }
    }

    if (step === 2) {
      if (!formData.contactName.trim()) nextErrors.contactName = 'Contact name is required.'
      if (!formData.phone || !isValidPhone(formData.phone)) nextErrors.phone = 'Enter a valid phone number.'
      if (!formData.email || !isValidEmail(formData.email)) nextErrors.email = 'Enter a valid email.'
      if (!formData.cakeType.trim()) nextErrors.cakeType = 'Cake type is required.'
    }

    if (step === 3) {
      if (!formData.signature.trim()) nextErrors.signature = 'Signature is required to approve the waiver.'
      if (!formData.waiverAccepted) nextErrors.waiverAccepted = 'Please accept the dietary waiver.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return
    }

    logAnalytics('User interacted with Wedding Cake Contract & Dietary Waiver')
    setCurrentStep((step) => Math.min(step + 1, totalSteps))
  }

  const handlePrev = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }

  const toggleDietary = (item) => {
    setFormData((current) => {
      const dietaryRequirements = current.dietaryRequirements.includes(item)
        ? current.dietaryRequirements.filter((value) => value !== item)
        : [...current.dietaryRequirements, item]

      return { ...current, dietaryRequirements }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const isValid = validateStep(3)
    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    logAnalytics('User interacted with Wedding Cake Contract & Dietary Waiver')

    await new Promise((resolve) => {
      setTimeout(resolve, 1200)
    })

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const reviewItems = [
    ['Client name', sanitizeInput(formData.clientName) || 'No data found'],
    ['Event date', formData.eventDate || 'No data found'],
    ['Venue', sanitizeInput(formData.venue) || 'No data found'],
    ['Cake type', sanitizeInput(formData.cakeType) || 'No data found'],
    ['Guest count', formData.guestCount || 'No data found'],
    ['Contact name', sanitizeInput(formData.contactName) || 'No data found'],
    ['Phone', sanitizeInput(formData.phone) || 'No data found'],
    ['Email', sanitizeInput(formData.email) || 'No data found'],
    ['Dietary requirements', formData.dietaryRequirements.length ? formData.dietaryRequirements.join(', ') : 'No data found'],
    ['Notes', sanitizeInput(formData.notes) || 'No data found'],
  ]

  return (
    <div className="app-shell">
      <div className="backdrop-glow" aria-hidden="true" />

      <div className="glass-panel" role="application" aria-label="Wedding cake contract and dietary waiver form">
        <header className="topbar">
          <div>
            <p className="eyebrow">Wedding Operations</p>
            <h1>Cake Contract & Dietary Waiver</h1>
          </div>
          <div className="meta-stack">
            <span className="meta-tag">Internal service record</span>
            <span className="status-badge">{isOffline ? 'Offline mode' : 'Connected'}</span>
          </div>
        </header>

        <div className="step-indicators" aria-label="Form steps">
          {stepLabels.map((label, index) => (
            <span
              key={label}
              className={`step-pill ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
            >
              <span className="step-number">0{index + 1}</span>
              {label}
            </span>
          ))}
        </div>

        <div className="progress-wrap" aria-label="Form progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {isOffline && (
          <div className="offline-banner" role="status" aria-live="polite">
            Slow connection detected. Changes are saved locally and can be submitted once connectivity is restored.
          </div>
        )}

        {isSubmitted ? (
          <section className="success-state" aria-live="polite">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h2>Submission complete</h2>
            <p>
              The wedding cake contract and dietary waiver has been successfully prepared for review.
            </p>

            <div className="summary-card">
              {reviewItems.map(([label, value]) => (
                <div key={label} className="summary-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setFormData(initialForm)
                setCurrentStep(1)
                setErrors({})
                setIsSubmitted(false)
              }}
            >
              Start another record
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {currentStep === 1 && (
              <section className="form-step">
                <div className="section-heading">
                  <h2>Event Details</h2>
                  <p>Capture the essential booking information.</p>
                </div>

                <div className="field-grid">
                  <div className="field-wrap">
                    <label htmlFor="clientName">Client name</label>
                    <input
                      id="clientName"
                      name="clientName"
                      type="text"
                      value={formData.clientName}
                      onChange={(event) => updateField('clientName', sanitizeInput(event.target.value))}
                      aria-invalid={Boolean(errors.clientName)}
                      aria-describedby={errors.clientName ? 'clientName-error' : undefined}
                      className={errors.clientName ? 'input-error' : ''}
                    />
                    {errors.clientName && <span id="clientName-error" className="error-text">{errors.clientName}</span>}
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="eventDate">Event date</label>
                    <input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(event) => updateField('eventDate', event.target.value)}
                      aria-invalid={Boolean(errors.eventDate)}
                      aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                      className={errors.eventDate ? 'input-error' : ''}
                    />
                    {errors.eventDate && <span id="eventDate-error" className="error-text">{errors.eventDate}</span>}
                  </div>

                  <div className="field-wrap full-width">
                    <label htmlFor="venue">Venue</label>
                    <input
                      id="venue"
                      name="venue"
                      type="text"
                      value={formData.venue}
                      onChange={(event) => updateField('venue', sanitizeInput(event.target.value))}
                      aria-invalid={Boolean(errors.venue)}
                      aria-describedby={errors.venue ? 'venue-error' : undefined}
                      className={errors.venue ? 'input-error' : ''}
                    />
                    {errors.venue && <span id="venue-error" className="error-text">{errors.venue}</span>}
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="guestCount">Guest count</label>
                    <input
                      id="guestCount"
                      name="guestCount"
                      type="number"
                      min="10"
                      max="2000"
                      value={formData.guestCount}
                      onChange={(event) => updateField('guestCount', event.target.value)}
                      aria-invalid={Boolean(errors.guestCount)}
                      aria-describedby={errors.guestCount ? 'guestCount-error' : undefined}
                      className={errors.guestCount ? 'input-error' : ''}
                    />
                    {errors.guestCount && <span id="guestCount-error" className="error-text">{errors.guestCount}</span>}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="form-step">
                <div className="section-heading">
                  <h2>Contact & Cake Specs</h2>
                  <p>Confirm the service detail and the dietary handling requirements.</p>
                </div>

                <div className="field-grid">
                  <div className="field-wrap">
                    <label htmlFor="contactName">Primary contact</label>
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      value={formData.contactName}
                      onChange={(event) => updateField('contactName', sanitizeInput(event.target.value))}
                      aria-invalid={Boolean(errors.contactName)}
                      aria-describedby={errors.contactName ? 'contactName-error' : undefined}
                      className={errors.contactName ? 'input-error' : ''}
                    />
                    {errors.contactName && <span id="contactName-error" className="error-text">{errors.contactName}</span>}
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="cakeType">Cake type</label>
                    <select
                      id="cakeType"
                      name="cakeType"
                      value={formData.cakeType}
                      onChange={(event) => updateField('cakeType', event.target.value)}
                      aria-invalid={Boolean(errors.cakeType)}
                      aria-describedby={errors.cakeType ? 'cakeType-error' : undefined}
                      className={errors.cakeType ? 'input-error' : ''}
                    >
                      <option value="Buttercream cake">Buttercream cake</option>
                      <option value="Fondant finish">Fondant finish</option>
                      <option value="Tiered wedding cake">Tiered wedding cake</option>
                      <option value="Custom sculpted cake">Custom sculpted cake</option>
                    </select>
                    {errors.cakeType && <span id="cakeType-error" className="error-text">{errors.cakeType}</span>}
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => updateField('phone', sanitizeInput(event.target.value))}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span id="phone-error" className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => updateField('email', sanitizeInput(event.target.value))}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
                  </div>

                  <div className="field-wrap full-width">
                    <label>Dietary requirements</label>
                    <div className="chip-group" role="group" aria-label="Dietary requirements">
                      {dietaryOptions.map((option) => {
                        const selected = formData.dietaryRequirements.includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`chip-button ${selected ? 'selected' : ''}`}
                            onClick={() => toggleDietary(option)}
                            aria-pressed={selected}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                    {formData.dietaryRequirements.length === 0 && (
                      <p className="empty-state small">No data found. No dietary requirements selected.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="form-step">
                <div className="section-heading">
                  <h2>Review & Acceptance</h2>
                  <p>Confirm the final waiver and signature before submission.</p>
                </div>

                <div className="summary-card">
                  {reviewItems.map(([label, value]) => (
                    <div key={label} className="summary-row">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="field-wrap">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={(event) => updateField('notes', sanitizeInput(event.target.value))}
                    placeholder="Add any final dietary handling or event notes"
                  />
                </div>

                <div className="field-wrap">
                  <label htmlFor="signature">Authorized signature</label>
                  <input
                    id="signature"
                    name="signature"
                    type="text"
                    value={formData.signature}
                    onChange={(event) => updateField('signature', sanitizeInput(event.target.value))}
                    aria-invalid={Boolean(errors.signature)}
                    aria-describedby={errors.signature ? 'signature-error' : undefined}
                    className={errors.signature ? 'input-error' : ''}
                  />
                  {errors.signature && <span id="signature-error" className="error-text">{errors.signature}</span>}
                </div>

                <label className="checkbox-row" htmlFor="waiverAccepted">
                  <input
                    id="waiverAccepted"
                    name="waiverAccepted"
                    type="checkbox"
                    checked={formData.waiverAccepted}
                    onChange={(event) => updateField('waiverAccepted', event.target.checked)}
                    aria-invalid={Boolean(errors.waiverAccepted)}
                  />
                  <span>I confirm that the dietary waiver and event details are accurate.</span>
                </label>
                {errors.waiverAccepted && <span className="error-text block">{errors.waiverAccepted}</span>}
              </section>
            )}

            <div className="actions-row">
              <button
                type="button"
                className="secondary-button"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button type="button" className="primary-button" onClick={handleNext}>
                  Next step
                </button>
              ) : (
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit waiver'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
