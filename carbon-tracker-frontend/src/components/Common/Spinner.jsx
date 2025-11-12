import './Spinner.css'

export default function Spinner({ size = 'medium' }) {
  const sizeClass = `spinner-container--${size}`
  return (
    <div className={`spinner-container ${sizeClass}`}>
      <div className="spinner"></div>
    </div>
  )
}