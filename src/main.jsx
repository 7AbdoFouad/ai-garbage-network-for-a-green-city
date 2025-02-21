import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css'
document.getElementById('html').style.cssText = 'width: 100vw;'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
