import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getPurchases } from '../../services/api'
import CarbonSummary from './CarbonSummary'
import PurchaseList from './PurchaseList'
import EmissionsChart from './EmissionsChart'
import LogPurchaseForm from '../Purchase/LogPurchaseForm'
import Spinner from '../Common/Spinner' // Import Spinner
import { FiLogOut, FiPlus, FiX, FiGlobe } from 'react-icons/fi' // Import icons
import './Dashboard.css'

export default function Dashboard() {
  const { user, handleSignOut } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user exists before loading
    if (user?.username) {
      loadPurchases()
    } else {
      setLoading(false) // Not logged in, stop loading
    }
  }, [user]) // Re-run when user object changes

  async function loadPurchases() {
    if (!user?.username) {
      setError("User not found. Please sign in again.")
      return
    }
    
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
    loadPurchases() // Refresh data after new purchase
  }

  // Handle case where user is not yet loaded
  if (!user) {
    return <Spinner size="large" />
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1><FiGlobe /> Carbon Footprint Tracker</h1>
          <p className="welcome-text">Welcome back, {user.username}!</p>
        </div>
        <button className="btn btn-primary signout-btn" onClick={handleSignOut}>
          <FiLogOut />
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
          className="btn btn-primary add-purchase-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <FiX /> : <FiPlus />}
          {showAddForm ? 'Cancel' : 'Log Purchase'}
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
          <Spinner size="large" />
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