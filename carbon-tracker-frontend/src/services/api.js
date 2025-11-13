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

// UPDATED: No longer needs UserId. The token is used for authentication.
export async function getPurchases() {
  try {
    console.log('📡 Fetching purchases for authenticated user...')
    const headers = await getAuthHeaders()
    
    // The URL no longer needs a query parameter
    const url = `${API_ENDPOINT}/purchase` 
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
        body: JSON.stringify(purchaseData) // UserId is no longer needed here
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

// NEW: Function to update a purchase
export async function updatePurchase(purchaseData) {
  try {
    console.log('📡 Updating purchase:', purchaseData);
    const headers = await getAuthHeaders();
    
    const response = await fetch(
      `${API_ENDPOINT}/purchase`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(purchaseData) // Send the full updated object
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Purchase updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating purchase:', error);
    throw error;
  }
}

// NEW: Function to delete a purchase
export async function deletePurchase(purchaseId) {
  try {
    console.log('📡 Deleting purchase:', purchaseId);
    const headers = await getAuthHeaders();
    
    const response = await fetch(
      `${API_ENDPOINT}/purchase`,
      {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ PurchaseId: purchaseId }) // Send the ID to delete
      }
    );
    
    // 204 No Content is a successful delete, it has no body
    if (!response.ok && response.status !== 204) { 
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Purchase deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    throw error;
  }
}