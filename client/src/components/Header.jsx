import { useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu, X, User, Home, Car, BadgeCent, Info, Phone, PlusSquare, Heart, Plus, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { WishlistContext } from '@/contexts/WishlistContext'
import Spinner from './Spinner'
import useWallet from "@/contexts/WalletContext";



function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const { wishlists } = useContext(WishlistContext);

  const { walletAddress, setWalletAddress, loading: loadingAddress } = useWallet();
  const [userInforHeader, setuserInforHeader] = useState({
    email: "",
    name: "",
    address: "",
    is_seller: null,
  });
  
  const navigate = useNavigate();


  const navItems = [
    { icon: <Home /> , name: 'Home', path: '/' },
    { icon: <Car />, name: 'Vehicles', path: '/products' },
    { icon: <BadgeCent />, name: 'Brands', path: '/brands' },
    { icon: <Info />, name: 'About Us', path: '/about' },
    { icon: <Phone />, name: 'Contact Us', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }


  
  useEffect(() => {
    if (loadingAddress || !walletAddress) return;

    async function getUser() {
      try {
        const response = await fetch(`/api/user-exists/${walletAddress}`);
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        const data = await response.json();
        setuserInforHeader(data);
      } catch (error) {
        console.log(error.message);
      }
    }

    getUser();
    window.addEventListener("userBecameSeller", getUser);
    return () => window.removeEventListener("userBecameSeller", getUser);
  }, [walletAddress, loadingAddress]);


  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
        navigate("/?action=loggedout");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                <div className="bg-black text-white dark:bg-white dark:text-black font-bold w-7 h-7 rounded-md flex items-center justify-center">P</div>
                <span className="font-semibold text-lg">Pyman</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}


               {loadingAddress ? (
                  <div variant="outline" className="">Loading...</div>
                ) : !walletAddress ? (
                  <Link
                    to={"/auth"}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive("/auth") ? "bg-primary text-primary-foreground" : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                    `}
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    {userInforHeader.is_seller && (
                      <>
                      <Link
                        to="/add"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/add')
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        Add Product
                      </Link>
                      <Link
                        to="/transactions-seller"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/transactions-seller')
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        Transactions
                      </Link>
                      </>
                    )}
                    {!userInforHeader.is_seller && ( 
                      <Link
                        to="/transactions-buyer"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/transactions-buyer')
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        Transactions
                      </Link>
                    )}

                    <Link
                      to={"/account"}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive("/account") ? "bg-primary text-primary-foreground" : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                      `}
                    >
                      Account
                    </Link>
                  </>
                )}


                <Link
                  to="/wishlist"
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/wishlist')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Wishlist
                  {wishlists.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {wishlists.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Desktop Theme Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="w-9 h-9"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-64 bg-background border-l border-border z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="w-8 h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`block px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground border-r-2 border-primary'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-5 h-5">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}

                <Link
                  to="/wishlist"
                  onClick={toggleMobileMenu}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/wishlist')
                      ? 'bg-primary text-primary-foreground border-r-2 border-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-5 h-5"><Heart /></span>
                    <span>
                      Wishlist
                      {wishlists.length > 0 && (
                        <span className="ml-2 inline-block bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                          {wishlists.length}
                        </span>
                      )}
                    </span>
                  </div>
                </Link>

                {loadingAddress ? (
                  <div variant="outline">Loading...</div>
                ) : !walletAddress ? (
                  <Link
                    to="/auth"
                    onClick={toggleMobileMenu}
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/auth")
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-5 h-5"><User /></span>
                      <span>Sign In</span>
                    </div>
                  </Link>
                ) : (
                  <>
                    {userInforHeader.is_seller && (
                      <>
                      <Link
                        to="/add"
                        onClick={toggleMobileMenu}
                        className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive("/add")
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="w-5 h-5"><PlusSquare /></span>
                          <span>Add Product</span>
                        </div>
                      </Link>
                      <Link
                        to="/transactions-seller"
                        onClick={toggleMobileMenu}
                        className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive("/transactions-seller")
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="w-5 h-5"><CreditCard /></span>
                          <span>Transactions</span>
                        </div>
                      </Link>
                      </>
                    )}

                    {!userInforHeader.is_seller && (
                      <Link
                        to="/transactions-buyer"
                        onClick={toggleMobileMenu}
                        className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive("/transactions-buyer")
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="w-5 h-5"><CreditCard /></span>
                          <span>Transactions</span>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={toggleMobileMenu}
                      className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        isActive("/account")
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="w-5 h-5"><User /></span>
                        <span>Account</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* <div id='page-starter' className="min-h-screen flex items-center justify-center py-20 text-muted-foreground d-none">
        <Spinner />
      </div> */}
    </>

        
         
        
  )
}

export default Header

