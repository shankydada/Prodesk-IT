// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Context Providers
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Checkout from './pages/Checkout'

// COMPONENT TREE MENTAL MODEL:
//
// BrowserRouter              ← Enables routing for everything inside
//   AuthProvider             ← Auth state available everywhere
//     CartProvider           ← Cart state available everywhere
//       Navbar               ← Renders on EVERY route (outside Routes)
//       Routes               ← Only ONE child renders at a time
//         Route /            ← Renders Home
//         Route /shop        ← Renders Shop
//         Route /product/:id ← Renders ProductDetail
//         ...etc

export default function App() {
  return (
    <BrowserRouter>
      {/*
        Why BrowserRouter wraps everything?
        It provides the routing "context" to all children.
        Components like useNavigate(), useParams(), Link
        all require BrowserRouter to be an ancestor.
        
        Why AuthProvider wraps CartProvider?
        No specific technical reason here, but nesting order matters
        when one context depends on another. Keep the more "global"
        things on the outside.
      */}
      <AuthProvider>
        <CartProvider>
          {/*
            Navbar is OUTSIDE the <Routes> block.
            This means it renders on EVERY route.
            This is how we get that persistent navigation bar.
            Routes only renders the MATCHING route's component.
          */}
          <Navbar />
          
          <main>
            <Routes>
              {/* Exact path match for home */}
              <Route path="/" element={<Home />} />
              
              {/* Shop listing page */}
              <Route path="/shop" element={<Shop />} />
              
              {/* 
                Dynamic route — the :id is a URL parameter.
                /product/1   → id = "1"
                /product/42  → id = "42"
                /product/abc → id = "abc"
                React Router captures whatever is at that position.
              */}
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Cart page */}
              <Route path="/cart" element={<Cart />} />
              
              {/* Contact page */}
              <Route path="/contact" element={<Contact />} />
              
              {/* Login page */}
              <Route path="/login" element={<Login />} />
              
              {/*
                Protected route pattern:
                We don't put <Checkout /> directly here.
                Instead, we wrap it in ProtectedRoute which checks
                authentication before deciding what to render.
              */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all for unknown routes */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <h2>404 — Page Not Found</h2>
                </div>
              } />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}