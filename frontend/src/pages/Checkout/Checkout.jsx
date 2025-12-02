import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/api';
import './Checkout.css';

const Checkout = ({ cart, cartTotal, onClearCart, user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState({
    // Contact
    email: '',
    phone: '',
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    addressLine2: '',
    city: '',
    department: '',
    postalCode: '',
    // Payment
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        department: user.profile?.department || '',
        postalCode: user.profile?.postal_code || ''
      }));
    }
  }, [user]);

  const shipping = cartTotal >= 500 ? 0 : 35;
  const total = cartTotal + shipping;

  const departments = [
    'Guatemala', 'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 
    'Chiquimula', 'El Progreso', 'Escuintla', 'Huehuetenango',
    'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango',
    'Quiché', 'Retalhuleu', 'Sacatepéquez', 'San Marcos',
    'Santa Rosa', 'Sololá', 'Suchitepéquez', 'Totonicapán', 'Zacapa'
  ];

  const formatPrice = (amount) => {
    return `Q ${Number(amount).toLocaleString('es-GT', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.firstName) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.city) newErrors.city = 'La ciudad es requerida';
    if (!formData.department) newErrors.department = 'El departamento es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Número de tarjeta requerido';
      if (!formData.cardExpiry) newErrors.cardExpiry = 'Fecha de expiración requerida';
      if (!formData.cardCVC) newErrors.cardCVC = 'CVC requerido';
      if (!formData.cardName) newErrors.cardName = 'Nombre en tarjeta requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && validateStep2()) {
      handleSubmitOrder();
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setApiError('');
    
    try {
      // Prepare order data for API
      const orderData = {
        email: formData.email,
        phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        address: formData.address,
        address_line2: formData.addressLine2,
        city: formData.city,
        department: formData.department,
        postal_code: formData.postalCode,
        payment_method: formData.paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity
        }))
      };

      // Call API to create order
      const response = await createOrder(orderData);
      const { order } = response.data;
      
      // Store order number for confirmation
      setOrderNumber(order.order_number);
      
      // Clear cart and go to confirmation
      if (onClearCart) onClearCart();
      setStep(3);
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Order creation error:', error);
      setApiError(
        error.response?.data?.detail || 
        error.response?.data?.message ||
        'Error al procesar tu pedido. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Empty cart redirect
  if ((!cart || cart.length === 0) && step !== 3) {
    return (
      <main className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h1>Tu carrito está vacío</h1>
            <p>Agrega productos antes de continuar con el pago.</p>
            <Link to="/productos" className="btn-shop">
              Ver Productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Confirmation step
  if (step === 3) {
    return (
      <main className="checkout-page">
        <div className="container">
          <div className="confirmation-wrapper">
            <div className="confirmation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>¡Pedido Confirmado!</h1>
            <p className="order-number">Orden #{orderNumber}</p>
            <p className="confirmation-text">
              Gracias por tu compra. Hemos enviado los detalles de tu pedido a 
              <strong> {formData.email}</strong>
            </p>
            
            <div className="confirmation-details">
              <div className="detail-card">
                <h3>Dirección de Envío</h3>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.address}</p>
                {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                <p>{formData.city}, {formData.department}</p>
              </div>
              <div className="detail-card">
                <h3>Método de Pago</h3>
                <p>
                  {formData.paymentMethod === 'card' && 'Tarjeta de crédito/débito'}
                  {formData.paymentMethod === 'transfer' && 'Transferencia bancaria'}
                  {formData.paymentMethod === 'cash' && 'Pago contra entrega'}
                </p>
                {formData.paymentMethod === 'transfer' && (
                  <p className="payment-note">
                    Recuerda enviar tu comprobante a pagos@almaartesana.gt
                  </p>
                )}
              </div>
            </div>

            <div className="confirmation-actions">
              {user ? (
                <Link to="/cuenta" className="btn-primary">
                  Ver Mis Pedidos
                </Link>
              ) : (
                <Link to="/" className="btn-primary">
                  Volver al Inicio
                </Link>
              )}
              <Link to="/productos" className="btn-secondary">
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        {/* Progress Steps */}
        <div className="checkout-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Información</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Pago</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Confirmación</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Form Section */}
          <div className="checkout-form-section">
            {/* API Error */}
            {apiError && (
              <div className="api-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {apiError}
              </div>
            )}

            {/* Step 1: Information */}
            {step === 1 && (
              <>
                <div className="form-section">
                  <h2>Información de Contacto</h2>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="phone">Teléfono *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+502 1234-5678"
                        className={errors.phone ? 'error' : ''}
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Dirección de Envío</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">Nombre *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Juan"
                        className={errors.firstName ? 'error' : ''}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Apellido *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Pérez"
                        className={errors.lastName ? 'error' : ''}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="address">Dirección *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="4a Calle 12-45, Zona 10"
                        className={errors.address ? 'error' : ''}
                      />
                      {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="addressLine2">Apartamento, suite, etc. (opcional)</label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Edificio Torre Azul, Oficina 501"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">Ciudad *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Guatemala"
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="department">Departamento *</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={errors.department ? 'error' : ''}
                      >
                        <option value="">Seleccionar...</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && <span className="error-message">{errors.department}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode">Código Postal (opcional)</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="01010"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <>
                <div className="form-section">
                  <h2>Método de Pago</h2>
                  
                  <div className="payment-methods">
                    <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="4" width="22" height="16" rx="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                        </div>
                        <div className="payment-info">
                          <span className="payment-title">Tarjeta de crédito/débito</span>
                          <span className="payment-desc">Visa, MasterCard, American Express</span>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'transfer' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleChange}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 21h18"/>
                            <path d="M3 7v14"/>
                            <path d="M21 7v14"/>
                            <path d="M3 7l9-4 9 4"/>
                            <path d="M9 21v-6h6v6"/>
                          </svg>
                        </div>
                        <div className="payment-info">
                          <span className="payment-title">Transferencia bancaria</span>
                          <span className="payment-desc">Deposita a nuestra cuenta</span>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="6" width="20" height="12" rx="2"/>
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M6 12h.01M18 12h.01"/>
                          </svg>
                        </div>
                        <div className="payment-info">
                          <span className="payment-title">Pago contra entrega</span>
                          <span className="payment-desc">Paga cuando recibas tu pedido</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Card Details */}
                  {formData.paymentMethod === 'card' && (
                    <div className="card-details">
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label htmlFor="cardNumber">Número de tarjeta *</label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            className={errors.cardNumber ? 'error' : ''}
                          />
                          {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                        </div>
                        <div className="form-group full-width">
                          <label htmlFor="cardName">Nombre en la tarjeta *</label>
                          <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            placeholder="JUAN PÉREZ"
                            className={errors.cardName ? 'error' : ''}
                          />
                          {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                        </div>
                        <div className="form-group">
                          <label htmlFor="cardExpiry">Fecha de expiración *</label>
                          <input
                            type="text"
                            id="cardExpiry"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            placeholder="MM/AA"
                            className={errors.cardExpiry ? 'error' : ''}
                          />
                          {errors.cardExpiry && <span className="error-message">{errors.cardExpiry}</span>}
                        </div>
                        <div className="form-group">
                          <label htmlFor="cardCVC">CVC *</label>
                          <input
                            type="text"
                            id="cardCVC"
                            name="cardCVC"
                            value={formData.cardCVC}
                            onChange={handleChange}
                            placeholder="123"
                            className={errors.cardCVC ? 'error' : ''}
                          />
                          {errors.cardCVC && <span className="error-message">{errors.cardCVC}</span>}
                        </div>
                      </div>
                      <p className="card-disclaimer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Nota: Esta es una demostración. No se procesarán pagos reales.
                      </p>
                    </div>
                  )}

                  {/* Transfer Instructions */}
                  {formData.paymentMethod === 'transfer' && (
                    <div className="transfer-info">
                      <h4>Instrucciones de pago</h4>
                      <p>Realiza la transferencia a la siguiente cuenta:</p>
                      <div className="bank-details">
                        <p><strong>Banco:</strong> Banrural</p>
                        <p><strong>Cuenta:</strong> 1234-56789-01</p>
                        <p><strong>Nombre:</strong> Alma Artesana, S.A.</p>
                      </div>
                      <p className="transfer-note">
                        Envía el comprobante a pagos@almaartesana.gt con tu número de orden.
                      </p>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {formData.paymentMethod === 'cash' && (
                    <div className="cash-info">
                      <p>
                        Pagarás <strong>{formatPrice(total)}</strong> en efectivo al momento de recibir tu pedido.
                        Por favor ten el monto exacto disponible.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="checkout-actions">
              {step === 1 ? (
                <Link to="/carrito" className="btn-back">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Volver al carrito
                </Link>
              ) : (
                <button className="btn-back" onClick={() => setStep(step - 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Volver
                </button>
              )}
              
              <button 
                className="btn-next"
                onClick={handleNextStep}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : step === 2 ? (
                  <>
                    Confirmar Pedido
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </>
                ) : (
                  <>
                    Continuar al pago
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Resumen del Pedido</h2>
              
              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      {item.image || item.primary_image ? (
                        <img src={item.image || item.primary_image} alt={item.name} />
                      ) : (
                        <div className="image-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{formatPrice(item.price)}</span>
                    </div>
                    <span className="item-total">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="total-row">
                  <span>Envío</span>
                  <span>{shipping === 0 ? <span className="free">¡Gratis!</span> : formatPrice(shipping)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="security-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Compra 100% Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;