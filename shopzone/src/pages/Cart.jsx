// src/pages/Cart.jsx

import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  // Early return pattern: if cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/shop" style={styles.shopBtn}>
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Shopping Cart</h1>
      <p style={styles.itemCount}>{cartItems.length} item(s)</p>

      <div style={styles.layout}>
        {/* Cart Items List */}
        <div style={styles.itemsList}>
          {cartItems.map(item => (
            <div key={item.id} style={styles.cartItem}>
              <img 
                src={item.thumbnail} 
                alt={item.title}
                style={styles.itemImage}
              />
              
              <div style={styles.itemInfo}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemPrice}>${item.price} each</p>
                
                {/* Quantity Controls */}
                <div style={styles.quantityControls}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={styles.qtyBtn}
                  >
                    −
                  </button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.itemRight}>
                {/* Line total: price × quantity */}
                <span style={styles.lineTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={styles.removeBtn}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}

          {/* Clear cart option */}
          <button onClick={clearCart} style={styles.clearBtn}>
            Clear Cart
          </button>
        </div>

        {/* Order Summary Sidebar */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          
          {/* Itemized list */}
          {cartItems.map(item => (
            <div key={item.id} style={styles.summaryRow}>
              <span>{item.title} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div style={styles.summaryDivider} />
          
          {/* Total */}
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            {/* 
              toFixed(2) ensures we always show 2 decimal places.
              JavaScript floating point: 1.1 + 2.2 = 3.3000000000000003
              toFixed(2) rounds to "3.30"
            */}
            <span style={styles.totalAmount}>${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            style={styles.checkoutBtn}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
    color: '#1a1a1a',
  },
  itemCount: {
    color: '#888',
    marginBottom: '2rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cartItem: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    alignItems: 'center',
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '6px',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
  },
  itemPrice: {
    margin: '0 0 0.75rem',
    color: '#888',
    fontSize: '0.9rem',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: '1rem',
    fontWeight: '600',
    minWidth: '24px',
    textAlign: 'center',
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  lineTotal: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  removeBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#fff0f0',
    color: '#cc0000',
    border: '1px solid #ffcccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  clearBtn: {
    padding: '0.75rem',
    backgroundColor: '#fff',
    color: '#888',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    alignSelf: 'flex-start',
  },
  summary: {
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    position: 'sticky',
    top: '80px',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    marginBottom: '1.25rem',
    fontWeight: '700',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '1rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  totalLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#007bff',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    color: '#888',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  shopBtn: {
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
  }
}