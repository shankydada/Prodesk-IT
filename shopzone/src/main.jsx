// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Why ReactDOM.createRoot?
// This is React 18's concurrent rendering API.
// It enables features like automatic batching of state updates.
// Before React 18, multiple setState calls in async functions
// would cause multiple re-renders. Now React batches them automatically.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      StrictMode is a DEVELOPMENT ONLY tool.
      It intentionally double-invokes functions like useEffect
      to help you catch side effects that aren't properly cleaned up.
      Your app will NOT double-fire in production.
      Don't remove it — let it teach you about your code.
    */}
    <App />
  </React.StrictMode>,
)