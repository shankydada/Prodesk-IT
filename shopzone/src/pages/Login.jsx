// src/pages/Login.jsx

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  
  // useLocation gives us info about where the user came from.
  // When ProtectedRoute redirects to /login, we could optionally
  // pass state with the original intended destination.
  // For now, we redirect to /checkout after login.
  const location = useLocation()
  
  // Determine where to redirect after login
  // If user was heading somewhere specific, go there; otherwise go home
  const from = location.state?.from || '/'

  // If already logged in, redirect away from login page
  if (isLoggedIn) {
    navigate('/', { replace: true })
    return null
  }

  const handleGuestLogin = () => {
    login()
    // Navigate to where they were trying to go, or home
    // replace: true means this replaces the login page in history
    // So pressing back won't bring them back to /login
    navigate(from, { replace: true })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to access your account and checkout</p>

        {/* Guest Login Option */}
        <button onClick={handleGuestLogin} style={styles.guestBtn}>
          👤 Continue as Guest
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        {/* Mock form — non-functional, just UI demonstration */}
        <form onSubmit={(e) => { e.preventDefault(); handleGuestLogin() }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Sign In
          </button>
        </form>

        <p style={styles.note}>
          Note: This is a demo app. Any credentials will work.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem',
    backgroundColor: '#f5f7fa',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  guestBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#f0f7ff',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1.25rem',
  },
  divider: {
    textAlign: 'center',
    position: 'relative',
    margin: '1rem 0',
  },
  dividerText: {
    backgroundColor: '#fff',
    padding: '0 1rem',
    color: '#aaa',
    position: 'relative',
    zIndex: 1,
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '500',
    color: '#555',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  note: {
    color: '#aaa',
    fontSize: '0.8rem',
    textAlign: 'center',
    marginTop: '1rem',
  }
}