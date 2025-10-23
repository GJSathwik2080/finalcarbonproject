import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function EmissionsChart({ purchases }) {
  // Prepare data for chart
  const chartData = purchases
    .sort((a, b) => new Date(a.PurchaseDate) - new Date(b.PurchaseDate))
    .map(p => ({
      date: new Date(p.PurchaseDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      emissions: parseFloat(p.CarbonEmissionValue || 0),
      product: p.ProductName
    }))

  if (chartData.length === 0) {
    return (
      <div className="emissions-chart">
        <h2>📈 Emissions Trend</h2>
        <div className="chart-placeholder">
          <p>No data to display yet</p>
          <p className="placeholder-subtitle">Start logging purchases to see your emission trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="emissions-chart">
      <h2>📈 Emissions Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            style={{ fontSize: '12px' }}
            stroke="#7f8c8d"
          />
          <YAxis 
            label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '12px' }}
            stroke="#7f8c8d"
          />
          <Tooltip 
            contentStyle={{ 
              background: '#fff', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="emissions" 
            stroke="#667eea" 
            strokeWidth={3}
            name="Carbon Emissions (kg)"
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
