import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import App from './App.jsx'
import { awsConfig } from './aws-config'
import './index.css'

// CRITICAL: Enable OAuth listener
import 'aws-amplify/auth/enable-oauth-listener'

Amplify.configure(awsConfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
