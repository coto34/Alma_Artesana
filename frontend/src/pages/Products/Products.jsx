import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api';
import { ProductCard } from '../../components';
import './Products.css';

const Products = ({ onAddToCart, onAddToWishlist }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-created_at');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;
      if (sortBy) params.ordering = sortBy;

      const response = await getProducts(params);
      setProducts(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (priceRange.min) params.set('min_price', priceRange.min);
    if (priceRange.max) params.set('max_price', priceRange.max);
    if (sortBy && sortBy !== '-created_at') params.set('sort', sortBy);
    setSearchParams(params);
  }, [selectedCategory, searchQuery, priceRange, sortBy, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setSortBy('-created_at');
  };

  const hasActiveFilters = selectedCategory || searchQuery || priceRange.min || priceRange.max;

  return (
    <main className="products-page">
      {/* Hero Banner */}
      <section className="products-hero">
        <div className="container">
          <h1>Nuestros Productos</h1>
          <p>Descubre nuestra colección de artesanías guatemaltecas</p>
        </div>
      </section>

      <div className="products-container">
        <div className="container">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                <span>Filtros</span>
                {hasActiveFilters && <span className="filter-count">•</span>}
              </button>
              <span className="products-count">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            <div className="toolbar-right">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" aria-label="Buscar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </form>

              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-created_at">Más recientes</option>
                <option value="created_at">Más antiguos</option>
                <option value="price">Precio: menor a mayor</option>
                <option value="-price">Precio: mayor a menor</option>
                <option value="name">Nombre: A-Z</option>
                <option value="-name">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          <div className="products-layout">
            {/* Filters Sidebar */}
            <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
              <div className="filters-header">
                <h3>Filtros</h3>
                {hasActiveFilters && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="filter-group">
                <h4>Categorías</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    <span>Todas las categorías</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                      />
                      <span>{cat.name}</span>
                      <span className="count">({cat.product_count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-group">
                <h4>Precio</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>

              {/* Mobile Close Button */}
              <button 
                className="filters-close-mobile"
                onClick={() => setShowFilters(false)}
              >
                Ver {products.length} productos
              </button>
            </aside>

            {/* Products Grid */}
            <div className="products-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Cargando productos...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button onClick={fetchProducts}>Reintentar</button>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No encontramos productos</h3>
                  <p>Intenta ajustar los filtros o buscar algo diferente.</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters}>Limpiar filtros</button>
                  )}
                </div>
              ) : (
                <div className="products-grid">
                  {products.map((product) => (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Products;