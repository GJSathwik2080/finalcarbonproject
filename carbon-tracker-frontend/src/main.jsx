import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import 'aws-amplify/auth/enable-oauth-listener'
import './index.css'
import App from './App.jsx'

// Detect current domain
const currentDomain = window.location.origin

// Determine callback URLs based on environment
const isLocalhost = currentDomain.includes('localhost')
const redirectSignIn = isLocalhost 
  ? 'http://localhost:5173/' 
  : 'https://d18a6yrgaclvxe.cloudfront.net/'
const redirectSignOut = isLocalhost 
  ? 'http://localhost:5173/' 
  : 'https://d18a6yrgaclvxe.cloudfront.net/'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_KLfnWUPYQ',
      userPoolClientId: '3nl5920uu701rgef6drqu4qoa0',
      loginWith: {
        oauth: {
          domain: 'eu-north-1klfnwupyq.auth.eu-north-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: 'code'
        }
      }
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
