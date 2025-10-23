import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

export default function Login() {
  const { user, handleSignIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🌍 Carbon Footprint Tracker</h1>
        <p className="subtitle">Track and reduce your environmental impact</p>
        
        <div className="features">
          <div className="feature">
            <span className="icon">📊</span>
            <span>Track Purchases</span>
          </div>
          <div className="feature">
            <span className="icon">📈</span>
            <span>View Analytics</span>
          </div>
          <div className="feature">
            <span className="icon">🌱</span>
            <span>Reduce Emissions</span>
          </div>
        </div>

        <button className="signin-btn" onClick={handleSignIn}>
          Sign In with AWS Cognito
        </button>
        
        <p className="info-text">
          Secure authentication powered by AWS
        </p>
      </div>
    </div>
  )
}
