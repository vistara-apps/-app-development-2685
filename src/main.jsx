import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Create .env file for environment variables
if (!import.meta.env.VITE_API_URL) {
  console.warn('API URL not set. Using default: http://localhost:5000/api');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
