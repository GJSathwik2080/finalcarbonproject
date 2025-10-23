import { createContext, useContext, useState, useEffect } from 'react'
import { 
  getCurrentUser, 
  signInWithRedirect, 
  signOut,
  fetchAuthSession 
} from 'aws-amplify/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      console.log('🔍 Checking for authenticated user...')
      const currentUser = await getCurrentUser()
      console.log('✅ User authenticated:', currentUser)
      setUser(currentUser)
    } catch (error) {
      console.log('ℹ️ No authenticated user found')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn() {
    try {
      console.log('🔐 Redirecting to Cognito Hosted UI...')
      await signInWithRedirect()
    } catch (error) {
      console.error('❌ Error redirecting to sign in:', error)
      throw error
    }
  }

  async function handleSignOut() {
    try {
      console.log('👋 Signing out...')
      await signOut()
      console.log('✅ Sign out successful')
      setUser(null)
    } catch (error) {
      console.error('❌ Error signing out:', error)
    }
  }

  async function getAuthToken() {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString()
    } catch (error) {
      console.error('Error fetching auth token:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      handleSignIn, 
      handleSignOut, 
      checkUser,
      getAuthToken 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
