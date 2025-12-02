import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategory, getCategoryProducts } from '../../services/api';
import { ProductCard } from '../../components';
import './CategoryDetail.css';

const CategoryDetail = ({ onAddToCart, onAddToWishlist }) => {
  const { slug } = useParams();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('-created_at');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoryRes, productsRes] = await Promise.all([
          getCategory(slug),
          getCategoryProducts(slug)
        ]);

        setCategory(categoryRes.data);
        setProducts(productsRes.data.results || productsRes.data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Categoría no encontrada');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case '-price':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case '-name':
        return b.name.localeCompare(a.name);
      case '-created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando categoría...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="error-container">
        <div className="error-icon">😕</div>
        <h2>Categoría no encontrada</h2>
        <p>Lo sentimos, no pudimos encontrar esta categoría.</p>
        <Link to="/productos" className="btn-back">Ver todos los productos</Link>
      </div>
    );
  }

  return (
    <main className="category-page">
      {/* Category Hero */}
      <section className="category-hero">
        {category.image && (
          <div className="hero-image">
            <img src={category.image} alt={category.name} />
            <div className="hero-overlay"></div>
          </div>
        )}
        <div className="hero-content">
          <nav className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/productos">Productos</Link>
            <span>/</span>
            <span className="current">{category.name}</span>
          </nav>
          <h1>{category.name}</h1>
          {category.description && <p>{category.description}</p>}
          <span className="product-count">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      </section>

      {/* Products Section */}
      <section className="category-products">
        <div className="container">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span>{sortedProducts.length} productos</span>
            </div>
            <div className="toolbar-right">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="-created_at">Más recientes</option>
                <option value="price">Precio: menor a mayor</option>
                <option value="-price">Precio: mayor a menor</option>
                <option value="name">Nombre: A-Z</option>
                <option value="-name">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No hay productos en esta categoría</h3>
              <p>Pronto agregaremos más productos.</p>
              <Link to="/productos" className="btn-browse">Ver otros productos</Link>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: parseFloat(product.price),
                    originalPrice: product.original_price ? parseFloat(product.original_price) : null,
                    category: category.name,
                    categorySlug: category.slug,
                    badge: product.badge,
                    inStock: product.in_stock,
                    image: product.primary_image
                  }}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CategoryDetail;