// src/components/ProductCard.jsx

import { useNavigate } from 'react-router-dom'

// WHY useNavigate instead of Link here?
// Link is for static clickable elements.
// useNavigate gives you a function you can call programmatically.
// A product card might have multiple clickable areas,
// or you might want to navigate after some other logic runs.
// useNavigate gives you that flexibility.

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  
  // navigate('/product/1') tells React Router to update the URL
  // and render the matching component — no server request.
  const handleClick = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <div 
      onClick={handleClick}
      style={styles.card}
    >
      <img 
        src={product.thumbnail} 
        alt={product.title}
        style={styles.image}
      />
      <div style={styles.info}>
        <h3 style={styles.title}>{product.title}</h3>
        <p style={styles.category}>{product.category}</p>
        <div style={styles.footer}>
          <span style={styles.price}>${product.price}</span>
          <span style={styles.rating}>⭐ {product.rating}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  info: {
    padding: '1rem',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    // Truncate long titles
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  category: {
    margin: '0 0 0.75rem',
    fontSize: '0.8rem',
    color: '#888',
    textTransform: 'capitalize',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#007bff',
  },
  rating: {
    fontSize: '0.85rem',
    color: '#666',
  }
}