export default function PurchaseList({ purchases }) {
    if (purchases.length === 0) {
      return (
        <div className="purchase-list">
          <h2>📦 Purchase History</h2>
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p>No purchases logged yet</p>
            <p className="empty-subtitle">Click "+ Log Purchase" to add your first entry</p>
          </div>
        </div>
      )
    }
  
    // Sort by date, most recent first
    const sortedPurchases = [...purchases].sort((a, b) => 
      new Date(b.PurchaseDate) - new Date(a.PurchaseDate)
    )
  
    return (
      <div className="purchase-list">
        <h2>📦 Purchase History</h2>
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
              </tr>
            </thead>
            <tbody>
              {sortedPurchases.map((purchase) => (
                <tr key={purchase.PurchaseId}>
                  <td>{new Date(purchase.PurchaseDate).toLocaleDateString()}</td>
                  <td className="product-name">{purchase.ProductName}</td>
                  <td>{purchase.Weight}</td>
                  <td>{purchase.ShippingDistance}</td>
                  <td>
                    <span className="delivery-badge">
                      {purchase.DeliveryMode || 'Ground'}
                    </span>
                  </td>
                  <td className="emissions-value">
                    {parseFloat(purchase.CarbonEmissionValue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  