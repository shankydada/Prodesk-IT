// src/context/AuthContext.jsx

import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  
  // Check if user was previously logged in
  // We store a simple boolean — 'true' string in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('shopzone-auth') === 'true'
  })

  const login = () => {
    setIsLoggedIn(true)
    localStorage.setItem('shopzone-auth', 'true')
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('shopzone-auth')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}