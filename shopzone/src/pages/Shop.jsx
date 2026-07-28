// src/pages/Shop.jsx

import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'

// UNDERSTANDING useEffect:
// React components run their function body on every render.
// We can't put a fetch() call directly in the component body
// because it would fire on every single render (infinite loop risk).
// 
// useEffect runs AFTER the render is committed to the DOM.
// The dependency array [] means "run this only once, after first render."
// This is the correct place for side effects like data fetching.

export default function Shop() {
  // Three pieces of state to manage an async data load:
  // 1. The actual data
  // 2. Whether we're loading (to show spinner)
  // 3. Any error that occurred (to show error message)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    // We define the async function INSIDE useEffect
    // because useEffect's callback cannot be async directly
    // (async functions return Promises, useEffect expects nothing or a cleanup function)
    const fetchProducts = async () => {
      try {
        // Reset states at start of fetch
        setLoading(true)
        setError(null)
        
        // Fetch from the API
        // The API returns: { products: [...], total: 100, skip: 0, limit: 30 }
        const response = await fetch('https://dummyjson.com/products?limit=100')
        
        // Check if response was successful (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        // Parse JSON response body
        const data = await response.json()
        
        // Extract the products array from the response object
        setProducts(data.products)
      } catch (err) {
        // Catch both network errors and our thrown errors
        setError(err.message)
      } finally {
        // This runs whether fetch succeeded or failed
        setLoading(false)
      }
    }

    fetchProducts()
  }, []) // Empty array = run once on mount

  // Derive unique categories from products for the filter dropdown
  // Set removes duplicates, Array.from converts Set back to array
  const categories = ['all', ...new Set(products.map(p => p.category))]

  // DERIVED DATA (not state):
  // filteredProducts is computed from existing state on every render.
  // We don't need useState for this — it's always calculated fresh.
  // This is efficient because React re-renders when state changes,
  // so filteredProducts will always be up to date.
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Conditional rendering based on state:
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={{ color: 'red' }}>❌ Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Our Products</h1>
      
      {/* Search and Filter Controls */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          // onChange fires on every keystroke
          // e.target.value is the current input value
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.select}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={styles.resultsCount}>
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Product Grid */}
      <div style={styles.grid}>
        {filteredProducts.map(product => (
          // Each item in a list needs a unique "key" prop.
          // React uses this to efficiently update the DOM.
          // When list items change, React compares by key
          // to know which items to add, remove, or update.
          // NEVER use array index as key if list can be reordered/filtered.
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p style={styles.noResults}>No products found. Try a different search.</p>
      )}
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
    marginBottom: '1.5rem',
    color: '#333',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  resultsCount: {
    color: '#666',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    padding: '2rem',
  }
}