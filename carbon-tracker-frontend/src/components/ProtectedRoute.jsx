import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './Common/Spinner' // Import the new Spinner

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--background-main)'
      }}>
        {/* Use the new Spinner component */}
        <Spinner size="large" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}