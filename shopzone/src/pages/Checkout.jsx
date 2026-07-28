// src/pages/Checkout.jsx

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

// This page is only reachable if isLoggedIn = true
// The ProtectedRoute in App.jsx enforces this

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handlePlaceOrder = () => {
    // In a real app: call payment API, backend, etc.
    // For demo: clear cart and show success
    clearCart()
    setOrderPlaced(true)
  }

  if (orderPlaced) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <span style={styles.successIcon}>✅</span>
          <h1>Order Placed!</h1>
          <p>Thank you for shopping with ShopZone.</p>
          <p style={styles.orderId}>
            Order #SZ-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <button onClick={() => navigate('/shop')} style={styles.continueBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Checkout</h1>

      <div style={styles.layout}>
        {/* Checkout Form */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Shipping Details</h2>
          <form style={styles.form}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input type="text" style={styles.input} placeholder="John" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input type="text" style={styles.input} placeholder="Doe" />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input type="email" style={styles.input} placeholder="john@example.com" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input type="text" style={styles.input} placeholder="123 Main St" />
            </div>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input type="text" style={styles.input} placeholder="Mumbai" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>PIN Code</label>
                <input type="text" style={styles.input} placeholder="400001" />
              </div>
            </div>
          </form>

          <h2 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Payment</h2>
          <div style={styles.paymentOptions}>
            {['💳 Credit/Debit Card', '📱 UPI', '💵 Cash on Delivery'].map(option => (
              <label key={option} style={styles.paymentOption}>
                <input type="radio" name="payment" defaultChecked={option.includes('UPI')} />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={styles.summary}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} style={styles.summaryItem}>
              <span>{item.title} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <strong>Total</strong>
            <strong style={styles.total}>${cartTotal.toFixed(2)}</strong>
          </div>
          <button onClick={handlePlaceOrder} style={styles.placeOrderBtn}>
            Place Order
          </button>
        </div>
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
  heading: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#1a1a1a',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start',
  },
  formSection: {},
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  paymentOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  summary: {
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    position: 'sticky',
    top: '80px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '1rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
  },
  total: {
    color: '#007bff',
    fontSize: '1.3rem',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  successCard: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  successIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  orderId: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: '1.1rem',
    margin: '1rem 0',
  },
  continueBtn: {
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
  }
}