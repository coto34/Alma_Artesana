import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const {
    id,
    name,
    slug,
    price,
    originalPrice,
    category,
    badge,
    inStock = true,
    image
  } = product;

  // Format price in Guatemalan Quetzales
  const formatPrice = (amount) => {
    return `Q ${Number(amount).toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate discount percentage
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Badge display text
  const badgeText = {
    'new': 'Nuevo',
    'bestseller': 'Más Vendido',
    'sale': 'Oferta',
    'limited': 'Edición Limitada',
    'handmade': 'Artesanal'
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) {
      onAddToCart(product);
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  return (
    <article className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <Link to={`/producto/${slug || id}`} className="product-link">
        {/* Image Container */}
        <div className="product-image-wrapper">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="product-image"
              loading="lazy"
            />
          ) : (
            <div className="product-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}

          {/* Badge */}
          {badge && badgeText[badge] && (
            <span className={`product-badge badge-${badge}`}>
              {badgeText[badge]}
            </span>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <span className="product-badge badge-discount">
              -{discountPercentage}%
            </span>
          )}

          {/* Quick Actions */}
          <div className="product-actions">
            <button 
              className="action-btn"
              onClick={handleAddToWishlist}
              aria-label="Agregar a favoritos"
              title="Agregar a favoritos"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="stock-overlay">
              <span>Agotado</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {category && (
            <span className="product-category">{category}</span>
          )}
          
          <h3 className="product-name">{name}</h3>
          
          <div className="product-pricing">
            <span className="product-price">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="product-original-price">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <button 
        className={`btn-add-cart ${!inStock ? 'disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={!inStock}
      >
        {inStock ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>Agregar</span>
          </>
        ) : (
          <span>Agotado</span>
        )}
      </button>
    </article>
  );
};

export default ProductCard;