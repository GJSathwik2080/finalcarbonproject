import { useState, useEffect } from 'react';
import Spinner from '../Common/Spinner';
import { FiCpu, FiX } from 'react-icons/fi';

// This function summarizes the data to create a smaller, more effective prompt
function summarizePurchases(purchases) {
  const categoryData = purchases.reduce((acc, p) => {
    const category = p.Category || 'Other';
    const emissions = parseFloat(p.CarbonEmissionValue) || 0;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += emissions;
    return acc;
  }, {});

  // Convert to a string format for the prompt
  return Object.keys(categoryData)
    .map(name => `${name}: ${categoryData[name].toFixed(2)} kg CO₂`)
    .join('\n');
}

// This function calls the Gemini API
async function generateTipsFromAI(purchaseSummary) {
  const apiKey = "AIzaSyC08ObgAPU2mqFot0sPBVdJgMV5P82p1HI"; // Leave this as an empty string.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an expert on sustainability and carbon footprints.
Analyze my user's carbon footprint summary (in kg CO₂) and provide 3-5 personalized, actionable, and encouraging tips for them to reduce their impact.
Format the response as a simple numbered list. Be friendly and non-judgmental. Do not use markdown. Start directly with the tips.`;
  
  const userQuery = `Here is my carbon footprint summary:
${purchaseSummary}

Please give me my personalized tips.`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
  };

  // Implement exponential backoff for retries
  let response;
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        break; // Success
      }
    } catch (error) {
      // Network error, will retry
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2;
  }

  if (!response || !response.ok) {
    throw new Error('Failed to connect to the AI model after 3 attempts.');
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('The AI model returned an empty response.');
  }
  
  return text;
}


// --- The Modal Component ---
export default function AiTipsModal({ purchases, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tips, setTips] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // This async function runs once when the modal opens
    async function fetchTips() {
      try {
        setError(null);
        setIsLoading(true);
        const summary = summarizePurchases(purchases);
        const aiResponse = await generateTipsFromAI(summary);
        setTips(aiResponse);
      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTips();
  }, [purchases]); // The 'purchases' prop will not change, so this runs once.

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-tips-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FiCpu /> Your AI-Powered Green Tips</h3>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>
        
        <div className="modal-body">
          {isLoading && (
            <div className="spinner-container-modal">
              <Spinner />
              <p>Analyzing your footprint...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="ai-tips-body">
              {tips}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}