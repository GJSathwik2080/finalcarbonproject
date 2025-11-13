import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

// Colors for the pie chart slices
const COLORS = [
  '#667eea', // var(--primary-color)
  '#764ba2', // var(--primary-color-dark)
  '#00C49F', // A nice teal
  '#FFBB28', // A nice yellow
  '#FF8042', // A nice orange
  '#e74c3c', // var(--accent-red)
  '#95a5a6'  // A nice grey for 'Other'
];

// Custom label for percentages
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent === 0) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="14px" fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function EmissionsByCategoryChart({ purchases }) {
  
  // 1. Process the purchase data
  const categoryData = purchases.reduce((acc, p) => {
    const category = p.Category || 'Other'; // Group old/missing data as 'Other'
    const emissions = parseFloat(p.CarbonEmissionValue) || 0;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += emissions;
    
    return acc;
  }, {});

  // 2. Convert from object to array for Recharts
  const data = Object.keys(categoryData)
    .map(name => ({
      name,
      value: parseFloat(categoryData[name].toFixed(2)),
    }))
    .filter(item => item.value > 0); // Remove categories with 0 emissions

  return (
    <div className="data-card emissions-category-chart">
      <h2 className="data-card-header">
        <FiPieChart /> Emissions by Category
      </h2>

      {data.length === 0 ? (
        <div className="placeholder-container">
          <p>No category data to display yet</p>
          <p className="placeholder-subtitle">Log purchases with categories to see a breakdown</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value} kg CO₂`}
              contentStyle={{ 
                background: 'var(--background-white)', 
                border: '1px solid var(--background-border)',
                borderRadius: 'var(--border-radius-small)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}