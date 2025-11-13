import { useState, useEffect } from 'react';
import { logPurchase, updatePurchase } from '../../services/api';
import Spinner from '../Common/Spinner';
import { FiPlusCircle, FiAlertTriangle, FiCheck, FiEdit, FiCpu, FiType } from 'react-icons/fi';
import './Purchase.css';

// Define categories
const CATEGORIES = [
  'Other',
  'Electronics',
  'Food & Groceries',
  'Clothing & Apparel',
  'Home & Garden',
  'Travel & Transport',
];

// Define initial state
const INITIAL_FORM_STATE = {
  productName: '',
  weight: '',
  shippingDistance: '',
  deliveryMode: 'Ground',
  category: 'Other',
};

// --- NEW: AI JSON Call ---

// 1. Define the JSON schema we want the AI to return
const AI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    productName: { type: "STRING" },
    weight: { type: "NUMBER" },
    shippingDistance: { type: "NUMBER" },
    category: {
      type: "STRING",
      enum: CATEGORIES,
    },
  },
  required: ["productName", "weight", "shippingDistance", "category"]
};

// 2. The function that calls the Gemini API
async function generateEstimateFromAI(prompt) {
  const apiKey = "AIzaSyC08ObgAPU2mqFot0sPBVdJgMV5P82p1HI"; // Leave this as an empty string for the platform
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an expert logistics estimator. A user bought an item. Based on their natural language description, you must estimate the product's name, its typical weight in kg, a likely shipping distance in km (e.g., local=20, domestic=300, international=5000), and pick the most appropriate category.
You MUST respond in valid JSON that adheres to the provided schema.`;
  
  const userQuery = `User description: "${prompt}"`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    // This part is crucial: we tell the AI to respond in JSON
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AI_RESPONSE_SCHEMA,
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
  const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error('The AI model returned an empty response.');
  }
  
  // The response is a string of JSON, so we parse it
  return JSON.parse(jsonText);
}
// --- END AI ---


// --- Main Component ---
export default function LogPurchaseForm({ onSuccess, onCancel, editingData }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For submitting
  
  // --- NEW: AI State ---
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  // --- END NEW ---

  const isEditMode = Boolean(editingData);

  useEffect(() => {
    if (isEditMode) {
      setIsAiMode(false); // No AI mode when editing
      setFormData({
        productName: editingData.ProductName,
        weight: editingData.Weight,
        shippingDistance: editingData.ShippingDistance,
        deliveryMode: editingData.DeliveryMode || 'Ground',
        category: editingData.Category || 'Other',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [editingData, isEditMode]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  // --- NEW: AI Handler ---
  async function handleAiEstimate() {
    if (!aiPrompt) {
      setAiError('Please describe your purchase.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setError('');

    try {
      const estimatedData = await generateEstimateFromAI(aiPrompt);
      // AI returns data, auto-fill the form
      setFormData({
        ...formData, // Keep deliveryMode
        productName: estimatedData.productName,
        weight: estimatedData.weight,
        shippingDistance: estimatedData.shippingDistance,
        category: estimatedData.category,
      });
      // Switch back to the manual form so the user can review
      setIsAiMode(false);
    } catch (err) {
      setAiError(err.message || 'Failed to get AI estimate.');
    } finally {
      setAiLoading(false);
    }
  }

  // --- Main Submit Handler (Unchanged) ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        // ... (update logic is unchanged)
        const updatedData = {
          PurchaseId: editingData.PurchaseId,
          ProductName: formData.productName,
          Weight: parseFloat(formData.weight),
          ShippingDistance: parseFloat(formData.shippingDistance),
          DeliveryMode: formData.deliveryMode,
          Category: formData.category,
        };
        await updatePurchase(updatedData); 
      } else {
        // ... (logPurchase logic is unchanged)
        const purchaseData = {
          ProductName: formData.productName,
          Weight: parseFloat(formData.weight),
          ShippingDistance: parseFloat(formData.shippingDistance),
          DeliveryMode: formData.deliveryMode,
          Category: formData.category,
        };
        await logPurchase(purchaseData);
      }
      
      onSuccess();
      
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'log'} purchase`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="log-purchase-form">
      <div className="form-header">
        <h3>
          {isEditMode ? <FiEdit /> : <FiPlusCircle />}
          {isEditMode ? 'Edit Purchase' : 'Log New Purchase'}
        </h3>
        {/* --- NEW: AI Mode Toggle --- */}
        {!isEditMode && (
          <button
            className="btn-ai-toggle"
            onClick={() => setIsAiMode(!isAiMode)}
            title={isAiMode ? "Switch to manual entry" : "Use AI to estimate"}
          >
            {isAiMode ? <FiType /> : <FiCpu />}
            {isAiMode ? 'Manual Entry' : 'Estimate with AI'}
          </button>
        )}
      </div>
      
      {error && <div className="error-message"><FiAlertTriangle /> {error}</div>}

      {/* --- NEW: Conditional Form Rendering --- */}
      {isAiMode ? (
        // --- AI Mode ---
        <div className="ai-form-container">
          <p className="ai-form-subtitle">Describe your purchase, and our AI will estimate the details for you.</p>
          <div className="form-group">
            <label htmlFor="aiPrompt">Purchase Description</label>
            <textarea
              id="aiPrompt"
              name="aiPrompt"
              rows="3"
              placeholder="e.g., 'A new 27-inch monitor from an online store', 'My weekly groceries', 'A wool sweater shipped from Scotland'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
          </div>
          {aiError && <div className="error-message"><FiAlertTriangle /> {aiError}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAiEstimate}
              disabled={aiLoading}
              style={{ minWidth: '160px' }}
            >
              {aiLoading ? <Spinner size="small" /> : <><FiCpu /> Estimate Details</>}
            </button>
          </div>
        </div>
      ) : (
        // --- Manual Mode (Your existing form) ---
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              id="productName"
              name="productName"
              type="text"
              placeholder="e.g., Laptop, Coffee Beans, T-Shirt"
              value={formData.productName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Weight (kg) *</label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="2.5"
                value={formData.weight}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="shippingDistance">Distance (km) *</label>
              <input
                id="shippingDistance"
                name="shippingDistance"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="150"
                value={formData.shippingDistance}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deliveryMode">Delivery Mode</label>
            <select
              id="deliveryMode"
              name="deliveryMode"
              value={formData.deliveryMode}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Ground">Ground</option>
              <option value="Air">Air</option>
              <option value="Sea">Sea</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary submit-btn" 
              disabled={loading}
              style={{ minWidth: '140px' }} 
            >
              {loading ? <Spinner size="small" /> : 
                (isEditMode ? <><FiCheck /> Save Changes</> : <><FiCheck /> Log Purchase</>)
              }
            </button>
          </div>
        </form>
      )}
    </div>
  );
}