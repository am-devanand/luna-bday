import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import './index.css'

/* Dev-only render tooling — never ships to production (VITE_DISABLE_REACT_DEVTOOLS=1 skips) */
if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_REACT_DEVTOOLS !== '1') {
  void import('react-scan')
  void import('react-grab')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
