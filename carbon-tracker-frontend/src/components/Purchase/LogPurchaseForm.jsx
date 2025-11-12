import { useState } from 'react'
import { logPurchase } from '../../services/api'
import Spinner from '../Common/Spinner' // Import Spinner
import { FiPlusCircle, FiAlertTriangle, FiCheck } from 'react-icons/fi' // Import Icons
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
      onSuccess() // Callback to refresh list and close form
      
      // Reset form (optional, as component will unmount)
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
      <h3><FiPlusCircle /> Log New Purchase</h3>
      {error && (
        <div className="error-message">
          <FiAlertTriangle /> {error}
        </div>
      )}

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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
          >
            {/* Removed emojis for a cleaner native select */}
            <option value="Ground">Ground</option>
            <option value="Air">Air</option>
            <option value="Sea">Sea</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary submit-btn" 
            disabled={loading}
            style={{ minWidth: '140px' }} // Prevents layout shift
          >
            {loading ? <Spinner size="small" /> : <><FiCheck /> Log Purchase</>}
          </button>
        </div>
      </form>
    </div>
  )
}