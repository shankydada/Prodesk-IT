// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from 'react'

// Step 1: CREATE the context
// Think of this as creating the "mail slot" in the building.
// It's just an empty container right now.
// The null default value means: if someone tries to use this context
// outside of a Provider, they get null (which will help us debug).
const CartContext = createContext(null)

// Step 2: BUILD the Provider component
// This is the component that WRAPS our app and makes the data available.
// Think of this as the actual mail room — it holds all the packages
// and has rules for how to add/remove them.
export function CartProvider({ children }) {
  
  // Why this initialization pattern?
  // useState can accept a FUNCTION instead of a direct value.
  // This function only runs ONCE on mount — not on every re-render.
  // We use this to check localStorage for saved cart data.
  // If we just did useState([]), we'd lose cart data on refresh.
  
  const [cartItems, setCartItems] = useState(() => {
    // Try to read saved cart from localStorage
    const savedCart = localStorage.getItem('shopzone-cart')
    
    // If data exists, parse it from JSON string back to JavaScript array
    // If not, start with an empty array
    // JSON.parse turns '[]' → []
    // JSON.parse turns '[{"id":1,"title":"Phone"}]' → [{id:1, title:"Phone"}]
    return savedCart ? JSON.parse(savedCart) : []
  })

  // This useEffect watches cartItems for changes
  // Every time cartItems changes, we sync it to localStorage
  // This is our "persistence layer" — data survives browser refresh
  useEffect(() => {
    // JSON.stringify turns our array into a string for storage
    // localStorage can only store strings, not JavaScript objects
    localStorage.setItem('shopzone-cart', JSON.stringify(cartItems))
  }, [cartItems]) // ← Dependency array: run this effect when cartItems changes

  // ADD TO CART LOGIC
  // This function handles two cases: new item vs. existing item
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // prevItems is the CURRENT state at the time of update
      // Using the functional form of setState guarantees we're working
      // with the latest state, not a stale closure value
      
      // Check if this product already exists in cart
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        // Product exists: increment quantity, don't add duplicate
        // We use .map() to create a NEW array (never mutate state directly!)
        // For every item, if it's the one we want, return it with quantity+1
        // Otherwise, return it unchanged
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            // The spread operator ...item copies all existing properties
            // Then we override just the quantity property
            : item
        )
      } else {
        // New product: add it to cart with quantity: 1
        // We create a NEW array with [...prevItems, newItem]
        // NEVER do prevItems.push() — that mutates state directly
        // React won't detect the change and won't re-render
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  // REMOVE FROM CART LOGIC
  const removeFromCart = (productId) => {
    // Filter creates a new array containing only items that DON'T match the id
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    )
  }

  // UPDATE QUANTITY LOGIC
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity drops below 1, remove the item entirely
      removeFromCart(productId)
      return
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // CLEAR CART
  const clearCart = () => setCartItems([])

  // DERIVED VALUES
  // These aren't state — they're calculated FROM state on every render
  // Total number of individual units in cart (for badge count)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  
  // Total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  )

  // Step 3: PROVIDE the value to all children
  // Everything inside value={} becomes accessible to any component
  // that calls useContext(CartContext)
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Step 4: Create a CUSTOM HOOK for consuming the context
// This is a best practice pattern. Instead of:
//   import CartContext from './CartContext'
//   const { cartItems } = useContext(CartContext)
// Components just do:
//   const { cartItems } = useCart()
// Cleaner, and we can add error handling in one place
export function useCart() {
  const context = useContext(CartContext)
  
  // If context is null, someone used useCart() outside CartProvider
  if (!context) {
    throw new Error('useCart must be used inside CartProvider. Check your component tree.')
  }
  
  return context
}