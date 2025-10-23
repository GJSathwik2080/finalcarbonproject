import { useState } from 'react'
import { logPurchase } from '../../services/api'
import './Purchase.css'

export default function LogPurchaseForm({ userId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    productName: '',
    weight: '',
    shippingDistance: '',
    deliveryMode: 'Ground'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const purchaseData = {
        UserId: userId,
        ProductName: formData.productName,
        Weight: parseFloat(formData.weight),
        ShippingDistance: parseFloat(formData.shippingDistance),
        DeliveryMode: formData.deliveryMode
      }

      await logPurchase(purchaseData)
      onSuccess()
      
      // Reset form
      setFormData({
        productName: '',
        weight: '',
        shippingDistance: '',
        deliveryMode: 'Ground'
      })
    } catch (err) {
      setError(err.message || 'Failed to log purchase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="log-purchase-form">
      <h3>📝 Log New Purchase</h3>
      {error && <div className="error-message">❌ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="productName">Product Name *</label>
          <input
            id="productName"
            name="productName"
            type="text"
            placeholder="e.g., Laptop, Coffee Beans, T-Shirt"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weight">Weight (kg) *</label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="2.5"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shippingDistance">Distance (km) *</label>
            <input
              id="shippingDistance"
              name="shippingDistance"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="150"
              value={formData.shippingDistance}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryMode">Delivery Mode</label>
          <select
            id="deliveryMode"
            name="deliveryMode"
            value={formData.deliveryMode}
            onChange={handleChange}
          >
            <option value="Ground">🚚 Ground</option>
            <option value="Air">✈️ Air</option>
            <option value="Sea">🚢 Sea</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ Logging...' : '✅ Log Purchase'}
          </button>
        </div>
      </form>
    </div>
  )
}
