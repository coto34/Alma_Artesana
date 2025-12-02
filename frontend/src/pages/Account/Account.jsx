import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getWishlist, updateProfile, changePassword } from '../../services/api';
import './Account.css';

const Account = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Real data from API
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch orders and wishlist in parallel
        const [ordersRes, wishlistRes] = await Promise.all([
          getOrders().catch(() => ({ data: { results: [] } })),
          getWishlist().catch(() => ({ data: [] }))
        ]);
        
        // Handle paginated or direct response
        setOrders(ordersRes.data.results || ordersRes.data || []);
        setWishlist(wishlistRes.data.results || wishlistRes.data || []);
      } catch (error) {
        console.error('Error fetching account data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Initialize profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || ''
      });
    }
  }, [user]);

  const formatPrice = (amount) => {
    return `Q ${Number(amount).toLocaleString('es-GT', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      await updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone
      });
      setProfileMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error al actualizar perfil' 
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al cambiar contraseña' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get address from profile (if exists)
  const userAddress = user?.profile?.address ? {
    address: user.profile.address,
    city: user.profile.city,
    department: user.profile.department
  } : null;

  // Redirect if not logged in
  if (!user) {
    return (
      <main className="account-page">
        <div className="container">
          <div className="not-logged-in">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1>Inicia sesión</h1>
            <p>Necesitas iniciar sesión para ver tu cuenta.</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
              <Link to="/registro" className="btn-secondary">Crear Cuenta</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="container">
        <div className="account-header">
          <h1>Mi Cuenta</h1>
          <p>Hola, {user.firstName}! Gestiona tu cuenta y pedidos aquí.</p>
        </div>

        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <nav className="account-nav">
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Resumen</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span>Pedidos</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Direcciones</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Perfil</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>Favoritos</span>
              </button>
            </nav>
            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </aside>

          {/* Content */}
          <div className="account-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Cargando...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-content">
                    <div className="overview-grid">
                      <div className="overview-card user-card">
                        <div className="user-avatar">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="user-info">
                          <h3>{user.firstName} {user.lastName}</h3>
                          <p>{user.email}</p>
                        </div>
                        <button className="edit-btn" onClick={() => setActiveTab('profile')}>
                          Editar Perfil
                        </button>
                      </div>

                      <div className="overview-card stats-card">
                        <div className="stat">
                          <span className="stat-value">{orders.length}</span>
                          <span className="stat-label">Pedidos</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{wishlist.length}</span>
                          <span className="stat-label">Favoritos</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{userAddress ? 1 : 0}</span>
                          <span className="stat-label">Direcciones</span>
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-header">
                        <h2>Pedidos Recientes</h2>
                        {orders.length > 0 && (
                          <button className="see-all" onClick={() => setActiveTab('orders')}>
                            Ver todos
                          </button>
                        )}
                      </div>
                      {orders.length === 0 ? (
                        <div className="empty-state-inline">
                          <p>No tienes pedidos aún.</p>
                          <Link to="/productos" className="btn-link">Explorar productos →</Link>
                        </div>
                      ) : (
                        <div className="orders-list">
                          {orders.slice(0, 2).map(order => (
                            <div key={order.order_number} className="order-card">
                              <div className="order-info">
                                <span className="order-id">#{order.order_number}</span>
                                <span className="order-date">{formatDate(order.created_at)}</span>
                              </div>
                              <div className="order-details">
                                <span className="order-items">{order.items?.length || 0} productos</span>
                                <span className="order-total">{formatPrice(order.total)}</span>
                              </div>
                              <span className={`order-status status-${order.status}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="tab-content">
                    <h2>Mis Pedidos</h2>
                    {orders.length === 0 ? (
                      <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        <p>No tienes pedidos aún.</p>
                        <Link to="/productos" className="btn-primary">Explorar Productos</Link>
                      </div>
                    ) : (
                      <div className="orders-list full">
                        {orders.map(order => (
                          <div key={order.order_number} className="order-card">
                            <div className="order-info">
                              <span className="order-id">#{order.order_number}</span>
                              <span className="order-date">{formatDate(order.created_at)}</span>
                            </div>
                            <div className="order-details">
                              <span className="order-items">{order.items?.length || 0} productos</span>
                              <span className="order-total">{formatPrice(order.total)}</span>
                            </div>
                            <span className={`order-status status-${order.status}`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <button className="view-order">Ver Detalles</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="tab-content">
                    <div className="section-header">
                      <h2>Mis Direcciones</h2>
                    </div>
                    {!userAddress ? (
                      <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>No tienes direcciones guardadas.</p>
                        <p className="hint">Tu dirección se guardará cuando hagas tu primer pedido.</p>
                      </div>
                    ) : (
                      <div className="addresses-grid">
                        <div className="address-card">
                          <span className="default-badge">Predeterminada</span>
                          <h3>Mi Dirección</h3>
                          <p>{userAddress.address}</p>
                          <p>{userAddress.city}, {userAddress.department}</p>
                          <div className="address-actions">
                            <button className="edit-link" onClick={() => setActiveTab('profile')}>
                              Editar en Perfil
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="tab-content">
                    <h2>Mi Perfil</h2>
                    
                    {profileMessage.text && (
                      <div className={`message ${profileMessage.type}`}>
                        {profileMessage.text}
                      </div>
                    )}
                    
                    <form className="profile-form" onSubmit={handleProfileSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input 
                            type="text" 
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Apellido</label>
                          <input 
                            type="text" 
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input 
                          type="tel" 
                          placeholder="+502 1234-5678"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <button type="submit" className="btn-save" disabled={profileLoading}>
                        {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </form>

                    <div className="password-section">
                      <h3>Cambiar Contraseña</h3>
                      
                      {passwordMessage.text && (
                        <div className={`message ${passwordMessage.type}`}>
                          {passwordMessage.text}
                        </div>
                      )}
                      
                      <form className="password-form" onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                          <label>Contraseña Actual</label>
                          <input 
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Nueva Contraseña</label>
                          <input 
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Confirmar Nueva Contraseña</label>
                          <input 
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                        <button type="submit" className="btn-save" disabled={passwordLoading}>
                          {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="tab-content">
                    <h2>Mis Favoritos</h2>
                    {wishlist.length === 0 ? (
                      <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <p>No tienes productos en favoritos.</p>
                        <Link to="/productos" className="btn-primary">Explorar Productos</Link>
                      </div>
                    ) : (
                      <div className="wishlist-grid">
                        {wishlist.map(item => (
                          <Link 
                            key={item.id} 
                            to={`/producto/${item.product?.slug}`} 
                            className="wishlist-item"
                          >
                            <div className="wishlist-image">
                              {item.product?.primary_image ? (
                                <img src={item.product.primary_image} alt={item.product.name} />
                              ) : (
                                <div className="placeholder-image">📷</div>
                              )}
                            </div>
                            <div className="wishlist-info">
                              <h4>{item.product?.name}</h4>
                              <p className="wishlist-price">{formatPrice(item.product?.price)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;