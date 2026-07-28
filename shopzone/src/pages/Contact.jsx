// src/pages/Contact.jsx

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // Controlled input pattern:
  // React state is the single source of truth for input values.
  // Every keystroke triggers onChange → setState → re-render → input shows new value.
  // This gives us full control: we can validate, transform, or track every character.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,        // Keep all existing fields
      [name]: value   // Update only the changed field
      // [name] is computed property name — it uses the variable value as the key
    }))
  }

  const handleSubmit = (e) => {
    // Prevent default form submission which would cause page reload
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={styles.centered}>
        <h2>✅ Message Sent!</h2>
        <p>We'll get back to you within 24 hours.</p>
        <button 
          onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
          style={styles.resetBtn}
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>Have a question? We'd love to hear from you.</p>
      </div>

      <div style={styles.layout}>
        {/* Contact Info */}
        <div style={styles.infoSection}>
          {[
            { icon: '📧', label: 'Email', value: 'support@shopzone.com' },
            { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
            { icon: '🕒', label: 'Hours', value: 'Mon-Fri, 9AM – 6PM IST' },
            { icon: '📍', label: 'Address', value: 'Mumbai, Maharashtra, India' },
          ].map(item => (
            <div key={item.label} style={styles.infoItem}>
              <span style={styles.infoIcon}>{item.icon}</span>
              <div>
                <p style={styles.infoLabel}>{item.label}</p>
                <p style={styles.infoValue}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Order inquiry, feedback..."
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell us how we can help..."
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Send Message →
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#888',
    fontSize: '1.1rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '3rem',
    alignItems: 'start',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: '1.5rem',
    marginTop: '0.2rem',
  },
  infoLabel: {
    margin: '0 0 0.2rem',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem',
  },
  infoValue: {
    margin: 0,
    color: '#666',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontWeight: '500',
    color: '#555',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    padding: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    textAlign: 'center',
  },
  resetBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }
}