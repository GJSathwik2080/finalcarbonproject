import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

export default function Login() {
  const { user, handleSignIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">🌍</div>
        <h1>Carbon Footprint Tracker</h1>
        <p className="auth-subtitle">Track and reduce your environmental impact</p>
        
        <div className="auth-features">
          <div className="auth-feature">
            <span className="auth-feature-icon">📊</span>
            <div className="auth-feature-text">
              <h3>Track Purchases</h3>
              <p>Log your purchases and calculate emissions</p>
            </div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">📈</span>
            <div className="auth-feature-text">
              <h3>View Analytics</h3>
              <p>See detailed emission trends over time</p>
            </div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🌱</span>
            <div className="auth-feature-text">
              <h3>Reduce Emissions</h3>
              <p>Make informed decisions to reduce impact</p>
            </div>
          </div>
        </div>

        <button className="auth-signin-btn" onClick={handleSignIn}>
          Sign In with AWS Cognito
        </button>
        
        <p className="auth-info-text">
          Secure authentication powered by AWS
        </p>
      </div>
    </div>
  )
}
