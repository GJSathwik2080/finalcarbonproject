import { fetchAuthSession } from 'aws-amplify/auth'

const API_ENDPOINT = 'https://cja71ie2h4.execute-api.eu-north-1.amazonaws.com/dev'

async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    
    if (!token) {
      throw new Error('No auth token available')
    }
    
    console.log('🔑 Auth token obtained')
    
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  } catch (error) {
    console.error('❌ Error getting auth headers:', error)
    throw new Error('Not authenticated')
  }
}

export async function getPurchases(userId) {
  try {
    console.log('📡 Fetching purchases for:', userId)
    const headers = await getAuthHeaders()
    
    const url = `${API_ENDPOINT}/purchase?UserId=${userId}`
    console.log('🌐 Request URL:', url)
    
    const response = await fetch(url, { headers })
    console.log('📥 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Purchases loaded:', data)
    
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('❌ Error fetching purchases:', error)
    throw error
  }
}

export async function logPurchase(purchaseData) {
  try {
    console.log('📡 Logging purchase:', purchaseData)
    const headers = await getAuthHeaders()
    
    const response = await fetch(
      `${API_ENDPOINT}/purchase`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(purchaseData)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Purchase logged:', data)
    return data
  } catch (error) {
    console.error('❌ Error logging purchase:', error)
    throw error
  }
}
