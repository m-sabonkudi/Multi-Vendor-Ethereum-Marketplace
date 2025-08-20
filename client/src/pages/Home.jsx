import { useEffect, useState } from 'react'
import { Car, Star, Users, Shield, ArrowRight, Filter, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'
import Spinner from '@/components/Spinner'
import FilterComponent from '@/components/FilterComponent'
import { toast } from 'sonner'
import { FaGithub } from 'react-icons/fa6'
import EtherscanLogo from '@/components/EtherscanLogo'



const Home = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const action = params.get("action");

  if (action) {
    if (action === "loggedin") {
      setTimeout(() => toast.success("Logged in."), 0);
    } else if (action === "loggedout") {
      setTimeout(() => toast.success("Logged out."), 0);
    } else if (action === "registered") {
      setTimeout(() => toast.success("Account created!"), 0);
    }

    // Remove "action" param after showing toast
    params.delete("action");
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }
}, [location.search, navigate]);


  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/get-products')
        const data = await res.json()
        setCars(data)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  const features = [
    {
      icon: Car,
      title: 'Wide Selection',
      description: 'Browse through thousands of quality vehicles from trusted dealers and private sellers.'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'Every vehicle is thoroughly inspected and verified before listing on our platform.'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Join thousands of satisfied customers who found their perfect vehicle with us.'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Safe and secure payment processing with buyer protection guarantee.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Button size={"sm"} variant="outline" className={"mb-2"} asChild>
              <Link target='_blank' className="flex items-center gap-2" to="https://sepolia.etherscan.io/address/0xca5c9a13495152AB6390d0A26715fF56db404B36">View on Etherscan <EtherscanLogo /></Link>
            </Button>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Multi-Vendor
              <span className="text-primary block">Ethereum Marketplace</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the largest marketplace for quality vehicles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Button size="lg" asChild>
                <Link to="/products">Browse Vehicles</Link>
              </Button> */}
              <Button size="lg" asChild>
                <Link target='_blank' className="flex items-center gap-2 pop-animate" to="https://github.com/m-sabonkudi/Multi-Vendor-Ethereum-Marketplace">View case study & source! <FaGithub/></Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground mb-8 max-w-3xl mx-auto flex flex-col items-center text-center">
              <ArrowUp className="" />
              Includes architecture diagrams, flowcharts, design decisions, and full source with setup instructions.
            </p>
          </div>
        </div>
        <div className='mt-10'>
          <FilterComponent products={cars} />
        </div>
        
      </section>



      {/* Vehicles Section */}
      <section className="py-20 bg-background">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Vehicles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover top-quality vehicles handpicked for reliability, performance, and value.
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cars.map((car) => (
                <ProductCard
                  key={car.id}
                  id={car.id}
                  slug={car.slug}
                  title={car.title}
                  image={car.images?.[0]}
                  price={car.price}
                  transmission={car.transmission}
                  fuel_type={car.fuel_type}
                />
              ))}
            </div>
          )}
          <div className='text-center mt-20'>
            <Link to={"/products"}>
              <Button className="cursor-pointer" >View All Products <ArrowRight /> </Button>
            </Link>
          </div>
        </div>
        
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Pyman?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make buying and selling vehicles simple, secure, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and find your perfect vehicle today.
          </p>
          <Button size="lg" asChild>
            <Link to="/brands">Start Shopping</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
