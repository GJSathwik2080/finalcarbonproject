import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FiTrendingUp } from 'react-icons/fi'

// Custom Tooltip for a more professional look
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'var(--background-white)',
        border: '1px solid var(--background-border)',
        borderRadius: 'var(--border-radius-small)',
        padding: '12px',
        boxShadow: 'var(--shadow-medium)'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--text-light)', 
          marginBottom: '5px' 
        }}>
          <strong>{label}</strong>
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--text-dark)', 
          margin: '0 0 5px 0' 
        }}>
          {data.product}
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--primary-color)', 
          margin: 0,
          fontWeight: '600'
        }}>
          {`Emissions: ${data.emissions.toFixed(2)} kg CO₂`}
        </p>
      </div>
    );
  }
  return null;
};


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

  return (
    <div className="data-card emissions-chart">
      <h2 className="data-card-header">
        <FiTrendingUp /> Emissions Trend
      </h2>
      
      {chartData.length === 0 ? (
        <div className="placeholder-container">
          <p>No data to display yet</p>
          <p className="placeholder-subtitle">Start logging purchases to see your emission trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              style={{ fontSize: '12px' }}
              stroke="var(--text-light)"
            />
            <YAxis 
              label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft', fill: 'var(--text-light)', dx: -10 }}
              style={{ fontSize: '12px' }}
              stroke="var(--text-light)"
            />
            
            {/* Use the new CustomTooltip */}
            <Tooltip content={<CustomTooltip />} />
            
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="emissions" 
              stroke="var(--primary-color)"
              strokeWidth={3}
              name="Carbon Emissions (kg)"
              dot={{ r: 0 }} // Hide dots by default
              activeDot={{ r: 6, fill: 'var(--primary-color)' }} // Show larger dot on hover
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}