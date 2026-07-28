// src/pages/ProductDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// KEY CONCEPTS IN THIS FILE:
// 1. useParams() — extracts URL parameters
// 2. Dynamic data fetching based on URL
// 3. useCart() — dispatching to global state

export default function ProductDetail() {
  // useParams returns an object of all URL parameters.
  // Our route is /product/:id, so params = { id: "1" }
  // Note: URL params are always STRINGS. "1" not 1.
  const { id } = useParams()
  
  const navigate = useNavigate()
  const { addToCart, cartItems } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Template literal uses the id from useParams
        // This is what makes the route "dynamic" — different URLs
        // cause different data to be fetched
        const response = await fetch(`https://dummyjson.com/products/${id}`)
        
        if (!response.ok) {
          throw new Error('Product not found')
        }
        
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    
    // IMPORTANT: id is in the dependency array.
    // If the user navigates from /product/1 to /product/2,
    // React Router keeps this component mounted and just updates the URL.
    // Without id in the dependency array, the effect wouldn't re-run
    // and we'd still be showing product 1's data.
    // With id in the dependency, the effect re-runs whenever id changes.
  }, [id])

  // Check if this product is already in cart
  const isInCart = cartItems.some(item => item.id === product?.id)
  // Optional chaining (?.) prevents error if product is null

  const handleAddToCart = () => {
    addToCart(product)
    setAddedFeedback(true)
    // Reset feedback after 2 seconds
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={{ color: 'red' }}>❌ {error}</p>
        <button onClick={() => navigate('/shop')} style={styles.backBtn}>
          ← Back to Shop
        </button>
      </div>
    )
  }

  if (!product) return null

  return (
    <div style={styles.container}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
        {/* navigate(-1) is like pressing browser back button.
            React Router maintains a history stack.
            -1 means "go one step back in history." */}
      </button>

      <div style={styles.content}>
        {/* Image Gallery */}
        <div style={styles.imageSection}>
          <img 
            src={product.thumbnail} 
            alt={product.title}
            style={styles.mainImage}
          />
          {/* Thumbnail strip for multiple images */}
          <div style={styles.thumbnails}>
            {product.images?.slice(0, 4).map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`${product.title} view ${index + 1}`}
                style={styles.thumbnail}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div style={styles.infoSection}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.title}>{product.title}</h1>
          
          <div style={styles.ratingRow}>
            <span style={styles.rating}>⭐ {product.rating}</span>
            <span style={styles.stock}>
              {product.stock > 0 
                ? `✅ ${product.stock} in stock` 
                : '❌ Out of stock'}
            </span>
          </div>

          <p style={styles.description}>{product.description}</p>

          <div style={styles.priceRow}>
            <span style={styles.price}>${product.price}</span>
            {product.discountPercentage > 0 && (
              <span style={styles.discount}>
                {product.discountPercentage.toFixed(1)}% OFF
              </span>
            )}
          </div>

          {/* 
            Add to Cart Button
            Shows different states:
            - Normal: "Add to Cart"
            - Just added: "✓ Added!"
            - Already in cart: "In Cart — Add Another"
          */}
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              ...styles.addToCartBtn,
              backgroundColor: addedFeedback ? '#28a745' : '#007bff',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              opacity: product.stock === 0 ? 0.6 : 1,
            }}
          >
            {addedFeedback 
              ? '✓ Added to Cart!' 
              : isInCart 
              ? 'In Cart — Add Another' 
              : 'Add to Cart'}
          </button>

          {/* View Cart shortcut */}
          {isInCart && (
            <button 
              onClick={() => navigate('/cart')}
              style={styles.viewCartBtn}
            >
              View Cart →
            </button>
          )}

          {/* Product specs */}
          <div style={styles.specs}>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Brand</span>
              <span>{product.brand}</span>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>SKU</span>
              <span>{product.sku || 'N/A'}</span>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Warranty</span>
              <span>{product.warrantyInformation || 'Standard warranty'}</span>
            </div>
          </div>
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
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginTop: '1.5rem',
  },
  imageSection: {},
  mainImage: {
    width: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    maxHeight: '400px',
  },
  thumbnails: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  thumbnail: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '2px solid #e0e0e0',
    cursor: 'pointer',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  category: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    display: 'inline-block',
    width: 'fit-content',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
  },
  ratingRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  rating: {
    fontSize: '1rem',
    color: '#666',
  },
  stock: {
    fontSize: '0.9rem',
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.7,
    color: '#555',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#007bff',
  },
  discount: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  addToCartBtn: {
    width: '100%',
    padding: '1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  viewCartBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#fff',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  specs: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  specLabel: {
    color: '#888',
    fontWeight: '500',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  }
}