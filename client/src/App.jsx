import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import Footer from './components/Footer'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Add from './pages/Add'
import './App.css'
import Product from './pages/Product'
import ScrollToTop from './components/ScrollToTop'
import Auth from './pages/Auth'
import Edit from './pages/Edit'
import Products from './pages/Products'
import Brands from './pages/Brands'
import WishlistPage from './pages/WishlistPage'
import Account from './pages/Account'
import VisitSeller from './pages/VisitSeller'
import TransactionsSeller from './pages/TransactionsSeller'
import TransactionsBuyer from './pages/TransactionsBuyer'
import NotFound from './pages/NotFound'


function App() {

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/add" element={ <Add /> } />

              <Route path="/edit-product/:slug" element={<Edit />} />

              <Route path="/product-detail/:slug" element={<Product />} />
              <Route path="/account" element={<Account />} />
              <Route path="/vendor/:vendor_address" element={<VisitSeller />} />
              
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/products" element={<Products />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path='/transactions-seller' element={<TransactionsSeller />} />
              <Route path="/transactions-buyer" element={<TransactionsBuyer />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
          <Footer /> 
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

