import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

// --- Date Grouping Helpers ---

// Groups by 'YYYY-MM-DD'
function getDailyKey(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
  } catch (e) {
    return 'Invalid Date';
  }
}

// Groups by 'YYYY-W##' (e.g., "2025-W46")
function getWeekKey(dateStr) {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    // Go to the Thursday of this week (this logic standardizes week numbers)
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
  } catch (e) {
    return 'Invalid Date';
  }
}

// Groups by 'YYYY-MM'
function getMonthlyKey(dateStr) {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  } catch (e) {
    return 'Invalid Date';
  }
}
// --- End Helpers ---


// Custom Tooltip (unchanged from before)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--background-white)',
        border: '1px solid var(--background-border)',
        borderRadius: 'var(--border-radius-small)',
        padding: '12px',
        boxShadow: 'var(--shadow-medium)'
      }}>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--text-dark)', 
          margin: '0 0 5px 0',
          fontWeight: '600'
        }}>
          {label}
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--primary-color)', 
          margin: 0,
          fontWeight: '600'
        }}>
          {`Total Emissions: ${payload[0].value.toFixed(2)} kg CO₂`}
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
export default function EmissionsChart({ purchases }) {
  // 1. Add state for the time view
  const [timeView, setTimeView] = useState('daily'); // 'daily', 'weekly', or 'monthly'

  // 2. Memoize the aggregated data so it only recalculates when needed
  const chartData = useMemo(() => {
    // Select the correct grouping function
    const getKey = 
      timeView === 'daily' ? getDailyKey :
      timeView === 'weekly' ? getWeekKey :
      getMonthlyKey;

    // Group and sum the purchases
    const aggregated = purchases.reduce((acc, p) => {
      const key = getKey(p.PurchaseDate);
      if (key === 'Invalid Date') return acc;
      
      const emissions = parseFloat(p.CarbonEmissionValue) || 0;
      
      if (!acc[key]) {
        acc[key] = { date: key, emissions: 0 };
      }
      acc[key].emissions += emissions;
      
      return acc;
    }, {});

    // Convert from object to sorted array
    return Object.values(aggregated)
      .map(d => ({ ...d, emissions: parseFloat(d.emissions.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  }, [purchases, timeView]); // Re-run when purchases or timeView changes

  return (
    <div className="data-card emissions-chart">
      <div className="data-card-header-container">
        <h2 className="data-card-header">
          <FiTrendingUp /> Emissions Trend
        </h2>
        
        {/* 3. Add the toggle buttons */}
        <div className="toggle-group">
          <button
            className={`toggle-btn ${timeView === 'daily' ? 'active' : ''}`}
            onClick={() => setTimeView('daily')}
          >
            Daily
          </button>
          <button
            className={`toggle-btn ${timeView === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeView('weekly')}
          >
            Weekly
          </button>
          <button
            className={`toggle-btn ${timeView === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeView('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      
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
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="emissions" 
              stroke="var(--primary-color)"
              strokeWidth={3}
              name="Carbon Emissions (kg)"
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: 'var(--primary-color)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}