import { useEffect, useMemo, useState } from 'react'

const flavorOptions = ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon']
const toppingOptions = ['Buttercream', 'Fondant', 'Whipped Cream', 'Fruit Glaze']
const sizeOptions = ['Mini', 'Standard', 'Large']

function sanitizeText(value) {
  return value.replace(/[<>"'&]/g, '').trim()
}

function App() {
  const [formData, setFormData] = useState({
    customer: '',
    flavor: '',
    topping: '',
    size: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submittedOrder, setSubmittedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (submittedOrder) {
        console.log('[Analytics] User interacted with Cupcake Configurator')
      }
    }, 200)
    return () => window.clearTimeout(timer)
  }, [submittedOrder])

  const filteredOrders = useMemo(() => {
    if (!submittedOrder) return []
    const query = searchTerm.toLowerCase()
    return [submittedOrder].filter((order) => {
      return [order.customer, order.flavor, order.topping, order.size, order.notes]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [searchTerm, submittedOrder])

  const validate = () => {
    const nextErrors = {}
    if (!formData.customer.trim()) nextErrors.customer = 'Customer name is required.'
    if (!formData.flavor) nextErrors.flavor = 'Please select a flavor.'
    if (!formData.topping) nextErrors.topping = 'Please select a topping.'
    if (!formData.size) nextErrors.size = 'Please select a size.'
    if (!formData.notes.trim()) nextErrors.notes = 'Please add a short note.'
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    window.setTimeout(() => {
      const sanitizedValues = {
        customer: sanitizeText(formData.customer),
        flavor: sanitizeText(formData.flavor),
        topping: sanitizeText(formData.topping),
        size: sanitizeText(formData.size),
        notes: sanitizeText(formData.notes),
      }
      setSubmittedOrder(sanitizedValues)
      setLoading(false)
      setFormData({ customer: '', flavor: '', topping: '', size: '', notes: '' })
      setErrors({})
    }, 1200)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Artisan Bakery</p>
          <h1>Cupcake Configurator</h1>
        </div>
        <div className="status-pill" aria-live="polite">Offline-safe workflow</div>
      </header>

      <main className="content-grid">
        <section className="panel" aria-labelledby="configurator-heading">
          <h2 id="configurator-heading">Create an order</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Customer name</span>
              <input
                aria-label="Customer name"
                aria-invalid={Boolean(errors.customer)}
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={errors.customer ? 'invalid' : ''}
                placeholder="Enter customer name"
              />
              {errors.customer ? <small className="error">{errors.customer}</small> : null}
            </label>

            <label className="field">
              <span>Flavor</span>
              <select
                aria-label="Flavor"
                aria-invalid={Boolean(errors.flavor)}
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className={errors.flavor ? 'invalid' : ''}
              >
                <option value="">Select a flavor</option>
                {flavorOptions.map((flavor) => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
              {errors.flavor ? <small className="error">{errors.flavor}</small> : null}
            </label>

            <label className="field">
              <span>Topping</span>
              <select
                aria-label="Topping"
                aria-invalid={Boolean(errors.topping)}
                name="topping"
                value={formData.topping}
                onChange={handleChange}
                className={errors.topping ? 'invalid' : ''}
              >
                <option value="">Select a topping</option>
                {toppingOptions.map((topping) => (
                  <option key={topping} value={topping}>{topping}</option>
                ))}
              </select>
              {errors.topping ? <small className="error">{errors.topping}</small> : null}
            </label>

            <label className="field">
              <span>Size</span>
              <select
                aria-label="Size"
                aria-invalid={Boolean(errors.size)}
                name="size"
                value={formData.size}
                onChange={handleChange}
                className={errors.size ? 'invalid' : ''}
              >
                <option value="">Select a size</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.size ? <small className="error">{errors.size}</small> : null}
            </label>

            <label className="field">
              <span>Notes</span>
              <textarea
                aria-label="Notes"
                aria-invalid={Boolean(errors.notes)}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={errors.notes ? 'invalid' : ''}
                placeholder="Any special instructions?"
                rows="4"
              />
              {errors.notes ? <small className="error">{errors.notes}</small> : null}
            </label>

            <button type="submit" className="primary-btn" aria-label="Save cupcake order">
              {loading ? 'Saving…' : 'Save Order'}
            </button>
            {loading ? <div className="loading" role="status" aria-live="polite">Loading order…</div> : null}
          </form>
        </section>

        <aside className="panel" aria-labelledby="summary-heading">
          <div className="panel-header">
            <h2 id="summary-heading">Recent order</h2>
            <input
              aria-label="Search recent order"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search order"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-state" role="status">
              <p>No data found</p>
              <span>Submit an order to see the latest summary.</span>
            </div>
          ) : (
            <ul className="order-list">
              {filteredOrders.map((order) => (
                <li key={`${order.customer}-${order.flavor}`} className="order-card">
                  <strong>{order.customer}</strong>
                  <p>{order.flavor} • {order.topping} • {order.size}</p>
                  <small>{order.notes}</small>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
