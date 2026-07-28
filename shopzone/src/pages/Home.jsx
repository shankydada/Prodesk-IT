// src/pages/Home.jsx

import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={styles.container}>
      {/* Hero Banner */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to ShopZone</h1>
        <p style={styles.heroSubtitle}>
          Discover thousands of products at unbeatable prices.
          From electronics to fashion — we've got it all.
        </p>
        {/* 
          Link component vs <a> tag:
          Link intercepts the click event.
          It updates the URL using the History API.
          It tells React Router which component to render.
          NO network request is made.
          
          <a href="/shop"> would trigger a full page reload.
          All React state would be destroyed. Cart would empty.
        */}
        <Link to="/shop" style={styles.ctaButton}>
          Browse Products →
        </Link>
      </section>

      {/* Feature Highlights */}
      <section style={styles.features}>
        {[
          { icon: '🚀', title: 'Fast Delivery', desc: 'Same day shipping available' },
          { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encryption' },
          { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
        ].map((feature) => (
          <div key={feature.title} style={styles.featureCard}>
            <span style={styles.featureIcon}>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: '#fff',
    marginBottom: '3rem',
  },
  heroTitle: {
    fontSize: '3rem',
    margin: '0 0 1rem',
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    margin: '0 0 2rem',
    opacity: 0.9,
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    backgroundColor: '#fff',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    transition: 'transform 0.2s',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  featureIcon: {
    fontSize: '2.5rem',
  }
}