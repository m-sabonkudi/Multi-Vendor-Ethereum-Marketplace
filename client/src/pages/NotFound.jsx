import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, Link } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg- text-foreground">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold tracking-tight text-primary mb-6">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Page Not Found!
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Sorry, the page you’re looking for doesn’t exist or was moved.
          But we’re still here to help!
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button className="w-48">
            <Link to="/" >Go Home</Link>
          </Button>
          
          <Button variant="secondary" className="w-48">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>

    
    </div>
  )
}
