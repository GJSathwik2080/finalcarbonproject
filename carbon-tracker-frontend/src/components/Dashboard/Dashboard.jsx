import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Import all API functions
import { getPurchases, deletePurchase, updatePurchase, logPurchase } from '../../services/api'; 
import CarbonSummary from './CarbonSummary';
import PurchaseList from './PurchaseList';
import EmissionsChart from './EmissionsChart';
import EmissionsByCategoryChart from './EmissionsByCategoryChart';
import LogPurchaseForm from '../Purchase/LogPurchaseForm';
import Spinner from '../Common/Spinner';
import AiTipsModal from './AiTipsModal'; // --- NEW ---
import { FiLogOut, FiPlus, FiX, FiGlobe, FiAlertTriangle, FiCpu } from 'react-icons/fi'; // --- ADDED FiCpu ---
import './Dashboard.css';

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ onConfirm, onCancel }) {
  // (This component is unchanged)
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3><FiAlertTriangle style={{ color: 'var(--accent-red)' }} /> Are you sure?</h3>
        <p>This action cannot be undone. This will permanently delete the purchase record.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, handleSignOut } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState(null);
  
  // --- NEW: State for AI Modal ---
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadPurchases();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function loadPurchases() {
    // (This function is unchanged)
    try {
      setLoading(true);
      setError('');
      const data = await getPurchases();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading purchases:', error);
      setError('Failed to load purchases. Please try again.');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  // (All other handlers: handleFormSuccess, handleFormCancel, handleEditClick, handleDeleteClick, confirmDelete... are unchanged)

  function handleFormSuccess() {
    setShowAddForm(false);
    setEditingPurchase(null);
    loadPurchases(); 
  }

  function handleFormCancel() {
    setShowAddForm(false);
    setEditingPurchase(null);
  }

  function handleEditClick(purchase) {
    setEditingPurchase(purchase);
    setShowAddForm(true); 
  }

  function handleDeleteClick(purchaseId) {
    setDeletingPurchaseId(purchaseId);
  }

  async function confirmDelete() {
    if (!deletingPurchaseId) return;
    try {
      setError('');
      await deletePurchase(deletingPurchaseId);
      setDeletingPurchaseId(null);
      loadPurchases(); 
    } catch (err) {
      setError('Failed to delete purchase. Please try again.');
      setDeletingPurchaseId(null);
    }
  }

  if (!user) {
    return <Spinner size="large" />;
  }

  return (
    <div className="dashboard">
      {/* --- NEW: Render the AI Modal --- */}
      {showAiModal && (
        <AiTipsModal
          purchases={purchases}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {deletingPurchaseId && (
        <DeleteConfirmationModal
          onConfirm={confirmDelete}
          onCancel={() => setDeletingPurchaseId(null)}
        />
      )}

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
          onClick={() => {
            if (showAddForm) {
              handleFormCancel();
            } else {
              setEditingPurchase(null);
              setShowAddForm(true);
            }
          }}
        >
          {showAddForm ? <FiX /> : <FiPlus />}
          {showAddForm ? 'Cancel' : 'Log Purchase'}
        </button>
        
        {/* --- NEW: AI Tips Button --- */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowAiModal(true)}
          disabled={purchases.length === 0} // Disable if no data
          title={purchases.length === 0 ? "Log purchases to get tips" : "Get AI-powered green tips"}
        >
          <FiCpu />
          Get AI Tips
        </button>
      </div>

      {showAddForm && (
        <LogPurchaseForm 
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          editingData={editingPurchase} 
        />
      )}

      {loading ? (
        <div className="loading-container">
          <Spinner size="large" />
        </div>
      ) : (
        <>
          <div className="charts-container">
            <EmissionsChart purchases={purchases} />
            <EmissionsByCategoryChart purchases={purchases} />
          </div>

          <PurchaseList 
            purchases={purchases} 
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </>
      )}
    </div>
  );
}