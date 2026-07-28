// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// INTUITION:
// This component acts as a gatekeeper.
// It receives children (the protected component).
// Before rendering those children, it checks if user is logged in.
// If yes: render children normally.
// If no: redirect to /login.
//
// Think of it like a bouncer at a club.
// Everyone tries to enter through the same door.
// The bouncer checks your ID and either lets you in
// or sends you to get proper credentials.

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  
  if (!isLoggedIn) {
    // Navigate component performs a redirect.
    // replace={true} means it REPLACES the current history entry.
    // So if user is on /checkout and gets redirected to /login,
    // pressing "back" won't bring them back to /checkout.
    // It's a redirect, not a navigation — semantically correct.
    return <Navigate to="/login" replace={true} />
  }
  
  // If logged in, render whatever was passed as children
  // This is the <Checkout /> component in our case
  return children
}