import React, { useState } from 'react';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Aura Solitaire Diamond Ring',
    category: 'Rings',
    price: '$1,850',
    description: '1.2ct lab-grown diamond set in handcrafted 18k white gold.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    tag: 'Bestseller'
  },
  {
    id: 2,
    name: 'Lumina Pearl Drop Earrings',
    category: 'Earrings',
    price: '$780',
    description: 'Lustrous freshwater pearls accented with 14k yellow gold.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    tag: 'New'
  },
  {
    id: 3,
    name: 'Celestial Diamond Pendant',
    category: 'Necklaces',
    price: '$1,420',
    description: 'Delicate constellation of brilliant cut diamonds on fine cable chain.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    tag: 'Exclusive'
  },
  {
    id: 4,
    name: 'Seraphina Eternity Band',
    category: 'Rings',
    price: '$1,290',
    description: 'Continuous pavé-set diamonds in polished platinum.',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    tag: 'Classic'
  }
];

const CATEGORIES = ['All', 'Rings', 'Necklaces', 'Earrings'];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState('');

  const handleAddToCart = (productName) => {
    setCartCount((prev) => prev + 1);
    setNotification(`Added "${productName}" to bag`);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  const filteredProducts =
    activeCategory === 'All'
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="site-wrapper">
      {/* Top Banner */}
      <div className="top-banner">
        <span>Complimentary insured shipping & signature gift packaging on all orders</span>
      </div>

      {/* Navigation */}
      <header className="navbar">
        <div className="nav-container">
          <nav className="nav-links">
            <a href="#collection">Collections</a>
            <a href="#featured">Featured</a>
            <a href="#about">About</a>
          </nav>

          <a href="#" className="brand-logo">
            ELETAS
            <span className="brand-sub">FINE JEWELRY</span>
          </a>

          <div className="nav-actions">
            <button
              className="cart-button"
              aria-label="Shopping Cart"
              onClick={() => alert(`Shopping bag has ${cartCount} items.`)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="toast">
          <span>✓ {notification}</span>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="hero-eyebrow">THE ATELIER COLLECTION</p>
            <h1 className="hero-title">Timeless Grace, Sculpted in Light</h1>
            <p className="hero-subtitle">
              Meticulously handcrafted using ethically sourced gemstones and recycled fine metals.
            </p>
            <div className="hero-actions">
              <a href="#featured" className="btn btn-primary">
                Explore Collection
              </a>
              <a href="#about" className="btn btn-outline">
                Our Story
              </a>
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="values-section">
          <div className="container values-grid">
            <div className="value-card">
              <span className="value-icon">◈</span>
              <h3>Ethically Sourced</h3>
              <p>Conflict-free natural & lab-grown diamonds chosen with integrity.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">✦</span>
              <h3>Master Craftsmanship</h3>
              <p>Each piece is finished by master artisans with generational precision.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">✧</span>
              <h3>Lifetime Care</h3>
              <p>Complimentary annual inspection, cleaning, and appraisal services.</p>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="featured" className="products-section">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">CURATED SELECTION</p>
              <h2 className="section-title">Featured Creations</h2>
              <p className="section-desc">
                Designed to be cherished today and passed down through generations.
              </p>

              {/* Category Filter */}
              <div className="filter-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                    {product.tag && <span className="product-tag">{product.tag}</span>}
                  </div>
                  <div className="product-info">
                    <span className="product-cat">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">{product.price}</span>
                      <button
                        className="btn-add-cart"
                        onClick={() => handleAddToCart(product.name)}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container about-container">
            <div className="about-text">
              <p className="section-eyebrow">OUR PHILOSOPHY</p>
              <h2 className="section-title">Jewelry with a Soul</h2>
              <p>
                At Eletas, we believe true luxury honors both beauty and provenance. Every silhouette
                is conceived in our private studio, blending architectural proportions with organic
                contours.
              </p>
              <p>
                Whether celebrating a milestone or marking an everyday quiet triumph, our pieces
                are made to live with you.
              </p>
              <a href="#featured" className="btn btn-secondary">
                View Signature Pieces
              </a>
            </div>
            <div className="about-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
                alt="Jewelry artisan workshop"
                className="about-image"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Newsletter / Contact */}
        <section className="newsletter-section">
          <div className="container newsletter-content">
            <h2 className="section-title">Join the Eletas Atelier</h2>
            <p>
              Receive private invitations to preview new capsule collections and bespoke design services.
            </p>
            {subscribed ? (
              <div className="subscribed-msg">
                <span>✦ Thank you for joining our private circle. Welcome to Eletas.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3 className="footer-brand">ELETAS</h3>
            <p className="footer-bio">
              Fine modern jewelry made for the moments that define you.
            </p>
          </div>
          <div>
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-list">
              <li><a href="#featured">Engagement Rings</a></li>
              <li><a href="#featured">Fine Necklaces</a></li>
              <li><a href="#featured">Earrings & Studs</a></li>
              <li><a href="#featured">Bespoke Inquiries</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-list">
              <li><a href="#">Complimentary Resizing</a></li>
              <li><a href="#">Care & Cleaning Guide</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Warranty & Authenticity</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Eletas Fine Jewelry. Ready for Vercel deployment.</p>
        </div>
      </footer>
    </div>
  );
}
