import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { WalletProvider } from './contexts/WalletContext.jsx'
import { WishlistProvider } from './contexts/WishlistContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </WalletProvider>
  </StrictMode>,
)
