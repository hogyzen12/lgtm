import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AlphaPage from './pages/AlphaPage'
import PreorderPage from './pages/PreorderPage'
import MetaMePage from './pages/MetaMePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alpha" element={<AlphaPage />} />
        <Route path="/preorder" element={<PreorderPage />} />
        <Route path="/metame" element={<MetaMePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)