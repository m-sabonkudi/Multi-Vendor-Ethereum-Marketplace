import { Target, Eye, Award, Users } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize the automotive marketplace in Nigeria by providing a transparent, secure, and user-friendly platform for buying and selling vehicles.'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the most trusted automotive marketplace in Africa, connecting millions of buyers and sellers with quality vehicles.'
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'We maintain the highest standards of quality assurance, ensuring every vehicle meets our strict inspection criteria.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by car enthusiasts for car enthusiasts, we understand what matters most to our community.'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Vehicles Sold' },
    { number: '100,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Trusted Dealers' },
    { number: '25+', label: 'Cities Covered' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Pyman
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're passionate about connecting people with their perfect vehicles. 
              Since our founding, we've been committed to making car buying and selling 
              simple, transparent, and trustworthy.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-muted-foreground">
              Numbers that speak to our commitment and success
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Story
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-center mb-6">
              Founded with a simple belief that buying and selling cars should be straightforward, 
              transparent, and trustworthy, Pyman has grown from a small startup to Nigeria's 
              leading automotive marketplace.
            </p>
            
            <p className="text-center mb-6">
              Our team of automotive enthusiasts and technology experts work tirelessly to ensure 
              that every interaction on our platform exceeds expectations. We've built more than 
              just a marketplace – we've created a community where trust, quality, and customer 
              satisfaction are paramount.
            </p>
            
            <p className="text-center">
              Today, we're proud to serve customers across Nigeria, connecting them with quality 
              vehicles and trusted dealers. Our journey is just beginning, and we're excited to 
              continue revolutionizing the automotive industry in Africa.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

