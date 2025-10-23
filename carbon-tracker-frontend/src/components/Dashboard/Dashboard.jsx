import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getPurchases } from '../../services/api'
import CarbonSummary from './CarbonSummary'
import PurchaseList from './PurchaseList'
import EmissionsChart from './EmissionsChart'
import LogPurchaseForm from '../Purchase/LogPurchaseForm'
import './Dashboard.css'

export default function Dashboard() {
  const { user, handleSignOut } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPurchases()
  }, [user])

  async function loadPurchases() {
    try {
      setLoading(true)
      setError('')
      const userId = user.username
      const data = await getPurchases(userId)
      setPurchases(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading purchases:', error)
      setError('Failed to load purchases. Please try again.')
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }

  function handlePurchaseAdded() {
    setShowAddForm(false)
    loadPurchases()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🌍 Carbon Footprint Tracker</h1>
          <p className="welcome-text">Welcome back, {user.username}!</p>
        </div>
        <button className="signout-btn" onClick={handleSignOut}>
          Logout
        </button>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadPurchases}>Retry</button>
        </div>
      )}

      <CarbonSummary purchases={purchases} />

      <div className="dashboard-actions">
        <button 
          className="add-purchase-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Cancel' : '+ Log Purchase'}
        </button>
      </div>

      {showAddForm && (
        <LogPurchaseForm 
          userId={user.username}
          onSuccess={handlePurchaseAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="loading-container">
          <h2>🔄 Loading purchases...</h2>
        </div>
      ) : (
        <>
          <EmissionsChart purchases={purchases} />
          <PurchaseList purchases={purchases} />
        </>
      )}
    </div>
  )
}
