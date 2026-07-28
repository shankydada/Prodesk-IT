// src/components/Navbar.jsx

import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

// WHY NavLink instead of Link for navigation items?
// NavLink automatically adds an "active" CSS class when
// the current URL matches its "to" prop.
// This lets you style the current page's link differently.
// Regular Link has no awareness of whether it's "active."

export default function Navbar() {
  const { cartCount } = useCart()
  const { isLoggedIn, logout } = useAuth()

  return (
    <nav style={styles.nav}>
      {/* Logo/Brand — Link to home */}
      <Link to="/" style={styles.logo}>
        🛍️ ShopZone
      </Link>

      {/* Navigation Links */}
      <div style={styles.links}>
        <NavLink 
          to="/" 
          end  
          // "end" prop means it only matches EXACTLY "/"
          // Without "end", it would also match "/shop", "/cart" etc.
          // because they all start with "/"
          style={({ isActive }) => ({
            ...styles.link,
            color: isActive ? '#007bff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal'
          })}
        >
          Home
        </NavLink>

        <NavLink 
          to="/shop"
          style={({ isActive }) => ({
            ...styles.link,
            color: isActive ? '#007bff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal'
          })}
        >
          Shop
        </NavLink>

        <NavLink 
          to="/contact"
          style={({ isActive }) => ({
            ...styles.link,
            color: isActive ? '#007bff' : '#333',
            fontWeight: isActive ? 'bold' : 'normal'
          })}
        >
          Contact
        </NavLink>

        {/* Cart link with dynamic badge */}
        <Link to="/cart" style={styles.cartLink}>
          {/* 
            Cart Icon with Badge
            The badge shows cartCount, which is derived from CartContext.
            When cartCount changes (item added/removed), React re-renders
            this component automatically — the badge updates instantly.
            No manual DOM manipulation needed.
          */}
          <span style={styles.cartIcon}>🛒</span>
          {/* 
            Conditional rendering:
            Only show the badge if there are items in the cart.
            cartCount > 0 is a boolean check.
            && short-circuits: if left side is false, right side doesn't render.
          */}
          {cartCount > 0 && (
            <span style={styles.badge}>{cartCount}</span>
          )}
        </Link>

        {/* Auth section */}
        {isLoggedIn ? (
          <button onClick={logout} style={styles.authBtn}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

// Inline styles object
// In a real project, use CSS modules or Tailwind
// but inline styles work fine for demonstrating the logic
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#007bff',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1rem',
    transition: 'color 0.2s',
  },
  cartLink: {
    position: 'relative',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: '1.5rem',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ff4444',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  authBtn: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#ff4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  }
}