import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components';
import { getCategories, getFeaturedProducts, getProducts } from '../services/api';
import './Home.css';

const Home = ({ onAddToCart, onAddToWishlist }) => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [categoriesRes, productsRes] = await Promise.all([
          getCategories(),
          getProducts() // Get all products since we don't have featured yet
        ]);

        setCategories(categoriesRes.data.results || categoriesRes.data);
        
        // Use featured if available, otherwise just use all products
        const products = productsRes.data.results || productsRes.data;
        setFeaturedProducts(products.slice(0, 8)); // Limit to 8
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: "Pago Seguro",
      description: "Transacciones protegidas y encriptadas"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      title: "Envío Nacional",
      description: "Entregamos en toda Guatemala"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      title: "Hecho con Amor",
      description: "Cada pieza es única y especial"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: "Soporte Directo",
      description: "Estamos aquí para ayudarte"
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando artesanías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <main className="home">
      {/* Hero Section - Split Layout */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">✦ Artesanías Guatemaltecas</span>
            <h1 className="hero-title">
              Piezas Únicas Hechas con <span className="highlight">Alma</span>
            </h1>
            <p className="hero-subtitle">
              Descubre la belleza de las artesanías guatemaltecas. Cada pieza cuenta 
              una historia de tradición, cultura y amor por el arte hecho a mano.
            </p>
            <div className="hero-ctas">
              <Link to="/productos" className="btn-primary-hero">
                <span>Explorar Colección</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/nosotros" className="btn-secondary-hero">
                Conocer Más
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>100% Artesanal</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Comercio Justo</span>
              </div>
              <div className="trust-item">
                <span className="flag-icon">🇬🇹</span>
                <span>Hecho en Guatemala</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-grid">
              {categories.slice(0, 4).map((cat, index) => (
                <div key={cat.id} className={`hero-image-item item-${index + 1}`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <div className="hero-image-placeholder" />
                  )}
                </div>
              ))}
            </div>
            <div className="hero-decoration">
              <div className="deco-circle deco-1"></div>
              <div className="deco-circle deco-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Explora</span>
            <h2 className="section-title">Nuestras Categorías</h2>
            <p className="section-subtitle">
              Cada categoría representa una tradición artesanal única de Guatemala
            </p>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/categorias/${category.slug}`}
                className="category-card"
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="category-image">
                  {category.image ? (
                    <img src={category.image} alt={category.name} loading="lazy" />
                  ) : (
                    <div className="category-placeholder">
                      <span>{category.icon || '🎨'}</span>
                    </div>
                  )}
                  <div className="category-overlay">
                    <span className="category-explore">
                      Ver productos
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <span className="category-count">
                    {category.product_count} {category.product_count === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      {featuredProducts.length > 0 && (
        <section className="section products-section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Colección</span>
              <h2 className="section-title">Nuestros Productos</h2>
              <p className="section-subtitle">
                Piezas seleccionadas con el mayor cuidado y calidad artesanal
              </p>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: parseFloat(product.price),
                    originalPrice: product.original_price ? parseFloat(product.original_price) : null,
                    category: product.category_name,
                    categorySlug: product.category_slug,
                    badge: product.badge,
                    inStock: product.in_stock,
                    image: product.primary_image
                  }}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              ))}
            </div>
            <div className="section-footer">
              <Link to="/productos" className="btn-view-all">
                <span>Ver Todos los Productos</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-eyebrow">✦ Pedidos Especiales</span>
              <h2 className="cta-title">¿Buscas algo único?</h2>
              <p className="cta-text">
                Creamos piezas personalizadas según tus ideas. Nuestros artesanos 
                pueden hacer realidad cualquier diseño especial que tengas en mente.
              </p>
              <Link to="/contacto" className="btn-cta">
                <span>Solicitar Cotización</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="cta-decoration">
              <div className="cta-pattern"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;