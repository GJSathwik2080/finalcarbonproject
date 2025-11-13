import { 
  FiArchive, 
  FiInbox, 
  FiTruck, 
  FiPaperclip, 
  FiAnchor,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi'

// Helper component to render delivery mode icon
const DeliveryMode = ({ mode }) => {
  const normalizedMode = mode || 'Ground';
  
  const modeMap = {
    'Ground': { icon: <FiTruck />, text: 'Ground' },
    'Air': { icon: <FiPaperclip />, text: 'Air' },
    'Sea': { icon: <FiAnchor />, text: 'Sea' },
  }
  
  const { icon, text } = modeMap[normalizedMode] || modeMap['Ground'];

  return (
    <span className="delivery-badge">
      {icon}
      {text}
    </span>
  )
}

// Add onEdit and onDelete props
export default function PurchaseList({ purchases, onEdit, onDelete }) {
  if (purchases.length === 0) {
    return (
      <div className="data-card purchase-list">
        <h2 className="data-card-header"><FiArchive /> Purchase History</h2>
        <div className="placeholder-container empty-state">
          <p className="placeholder-icon"><FiInbox /></p>
          <p>No purchases logged yet</p>
          <p className="placeholder-subtitle">Click "+ Log Purchase" to add your first entry</p>
        </div>
      </div>
    )
  }

  // Sort by date, most recent first
  const sortedPurchases = [...purchases].sort((a, b) => 
    new Date(b.PurchaseDate) - new Date(a.PurchaseDate)
  )

  return (
    <div className="data-card purchase-list">
      <h2 className="data-card-header"><FiArchive /> Purchase History</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Weight (kg)</th>
              <th>Distance (km)</th>
              <th>Mode</th>
              <th>Emissions (kg CO₂)</th>
              {/* Add Actions header */}
              <th className="actions-column">Actions</th> 
            </tr>
          </thead>
          <tbody>
            {sortedPurchases.map((purchase) => (
              <tr key={purchase.PurchaseId}>
                <td>{new Date(purchase.PurchaseDate).toLocaleDateString()}</td>
                <td className="product-name">{purchase.ProductName}</td>
                <td>{purchase.Weight}</td>
                <td>{purchase.ShippingDistance}</td>
                <td className="delivery-mode-cell">
                  <DeliveryMode mode={purchase.DeliveryMode} />
                </td>
                <td className="emissions-value">
                  {parseFloat(purchase.CarbonEmissionValue).toFixed(2)}
                </td>
                {/* Add Actions cell with buttons */}
                <td className="actions-cell">
                <button 
                    className="btn-icon" 
                    onClick={() => onEdit(purchase)} // <-- NEW
                    title="Edit"
                  >
                    <FiEdit2 />
                </button>
                  <button 
                    className="btn-icon btn-icon--delete" 
                    onClick={() => onDelete(purchase.PurchaseId)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}