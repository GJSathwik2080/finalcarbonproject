import { FiGlobe, FiBarChart2, FiCalendar } from 'react-icons/fi'

export default function CarbonSummary({ purchases }) {
  const totalEmissions = purchases.reduce(
    (sum, p) => sum + (parseFloat(p.CarbonEmissionValue) || 0), 
    0
  )

  const averageEmissions = purchases.length > 0 
    ? (totalEmissions / purchases.length).toFixed(2)
    : 0

  const lastMonthEmissions = purchases
    .filter(p => {
      const purchaseDate = new Date(p.PurchaseDate)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return purchaseDate >= monthAgo
    })
    .reduce((sum, p) => sum + (parseFloat(p.CarbonEmissionValue) || 0), 0)

  return (
    <div className="carbon-summary">
      <div className="summary-card">
        <div className="card-icon"><FiGlobe /></div>
        <h3>Total Emissions</h3>
        <p className="metric">{totalEmissions.toFixed(2)} <span className="unit">kg CO₂</span></p>
        <span className="subtitle">{purchases.length} purchases tracked</span>
      </div>

      <div className="summary-card">
        <div className="card-icon"><FiBarChart2 /></div>
        <h3>Average per Purchase</h3>
        <p className="metric">{averageEmissions} <span className="unit">kg CO₂</span></p>
        <span className="subtitle">Across all purchases</span>
      </div>

      <div className="summary-card">
        <div className="card-icon"><FiCalendar /></div>
        <h3>Last 30 Days</h3>
        <p className="metric">{lastMonthEmissions.toFixed(2)} <span className="unit">kg CO₂</span></p>
        <span className="subtitle">Recent activity</span>
      </div>
    </div>
  )
}