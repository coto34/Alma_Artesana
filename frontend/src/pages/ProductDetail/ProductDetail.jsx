import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getProducts } from '../../services/api';
import { ProductCard } from '../../components';
import './ProductDetail.css';

const ProductDetail = ({ onAddToCart, onAddToWishlist }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getProduct(slug);
        setProduct(response.data);
        setSelectedImage(0);
        setQuantity(1);
        setAddedToCart(false);

        // Fetch related products from same category
        if (response.data.category?.slug) {
          const relatedRes = await getProducts({ 
            category: response.data.category.slug 
          });
          const related = (relatedRes.data.results || relatedRes.data)
            .filter(p => p.slug !== slug)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatPrice = (amount) => {
    return `Q ${Number(amount).toLocaleString('es-GT', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart && product) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: parseFloat(product.price),
          image: product.images?.[0]?.image || null
        });
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist && product) {
      onAddToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.price),
        image: product.images?.[0]?.image || null
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <div className="error-icon">😕</div>
        <h2>Producto no encontrado</h2>
        <p>Lo sentimos, no pudimos encontrar este producto.</p>
        <button onClick={() => navigate('/productos')}>
          Ver todos los productos
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : [{ image: null, alt_text: product.name }];

  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <main className="product-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span className="separator">/</span>
          <Link to="/productos">Productos</Link>
          <span className="separator">/</span>
          {product.category && (
            <>
              <Link to={`/categorias/${product.category.slug}`}>
                {product.category.name}
              </Link>
              <span className="separator">/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>
      </nav>

      {/* Product Section */}
      <section className="product-section">
        <div className="container">
          <div className="product-layout">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="gallery-main">
                {images[selectedImage]?.image ? (
                  <img 
                    src={images[selectedImage].image} 
                    alt={images[selectedImage].alt_text || product.name}
                  />
                ) : (
                  <div className="image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                {discountPercentage > 0 && (
                  <span className="discount-badge">-{discountPercentage}%</span>
                )}
                {product.badge && (
                  <span className={`product-badge badge-${product.badge}`}>
                    {product.badge === 'new' && 'Nuevo'}
                    {product.badge === 'bestseller' && 'Más Vendido'}
                    {product.badge === 'handmade' && 'Artesanal'}
                    {product.badge === 'limited' && 'Edición Limitada'}
                  </span>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="gallery-thumbnails">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      {img.image ? (
                        <img src={img.image} alt={img.alt_text || `Vista ${index + 1}`} />
                      ) : (
                        <div className="thumb-placeholder" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              {product.category && (
                <Link to={`/categorias/${product.category.slug}`} className="product-category">
                  {product.category.name}
                </Link>
              )}
              
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-pricing">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                  <span className="original-price">{formatPrice(product.original_price)}</span>
                )}
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="product-details">
                {product.materials && (
                  <div className="detail-item">
                    <span className="detail-label">Materiales</span>
                    <span className="detail-value">{product.materials}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="detail-item">
                    <span className="detail-label">Dimensiones</span>
                    <span className="detail-value">{product.dimensions}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="detail-item">
                    <span className="detail-label">Origen</span>
                    <span className="detail-value">{product.origin}</span>
                  </div>
                )}
                {product.artisan_name && (
                  <div className="detail-item">
                    <span className="detail-label">Artesano</span>
                    <span className="detail-value">{product.artisan_name}</span>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="stock-status">
                {product.in_stock ? (
                  <span className="in-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="out-of-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Agotado
                  </span>
                )}
              </div>

              {/* Add to Cart Section */}
              {product.in_stock && (
                <div className="add-to-cart-section">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Reducir cantidad"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    <span className="quantity">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      aria-label="Aumentar cantidad"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>

                  <button 
                    className={`btn-add-to-cart ${addedToCart ? 'added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {addedToCart ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Wishlist Button */}
              <button className="btn-wishlist" onClick={handleAddToWishlist}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>Agregar a Favoritos</span>
              </button>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Pago Seguro</span>
                </div>
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="3" width="15" height="13" rx="2"/>
                    <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span>Envío Nacional</span>
                </div>
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>Hecho a Mano</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <div className="container">
            <h2 className="section-title">Productos Relacionados</h2>
            <div className="related-grid">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={{
                    id: relProduct.id,
                    name: relProduct.name,
                    slug: relProduct.slug,
                    price: parseFloat(relProduct.price),
                    originalPrice: relProduct.original_price ? parseFloat(relProduct.original_price) : null,
                    category: relProduct.category_name,
                    badge: relProduct.badge,
                    inStock: relProduct.in_stock,
                    image: relProduct.primary_image
                  }}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;