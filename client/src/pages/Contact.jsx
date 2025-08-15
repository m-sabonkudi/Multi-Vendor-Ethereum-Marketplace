import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import LoadingButton from '@/components/LoadingButton'
import { toast } from 'sonner'


function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'mlawalskudi@gmail.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 234 567 890',
      description: 'Open 24 hrs, 7 days',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Web3 World',
      description: 'Come say hello at our office',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: '7 days: 24 hours',
      description: 'Weekend support available',
    },
  ]

  const [formData, setFormData] = useState({"name": "", "email": "", "phone": "", "subject": "", "message": ""})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    e.preventDefault()
    const {name, value} = e.target

    setFormData((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })

    if (errors[name]) {
      setErrors((prev) => {
        return {
          ...prev,
          [name]: ''
        }
      })
    }
  }

  async function handleSubmit(e){
    e.preventDefault();
    const items = ["name", "email", "message"];
    let proceed = true; // use `let` instead of `const`

    
    items.forEach((item) => {
      if (!formData[item]?.trim()) {
        setErrors((prev) => ({
          ...prev,
          [item]: `${item.charAt(0).toUpperCase() + item.slice(1)} is required`,
        }));
        proceed = false;
      }
    });

    const isValidEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (formData.email && !isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Enter a valid email address" }));
      proceed = false;
    }

    if (!proceed) return;

    setLoading(true)
    try {
      const response = await fetch("/api/contact", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      const data = response.json()

      if (!response.ok) {
        toast.error(data.message || "Error (from backend) submitting form.")
      }
      else {
        toast.success(data.message || "Form submitted successfully.")
        setFormData({"name": "", "email": "", "phone": "", "subject": "", "message": ""})
      }

    } catch(error) {
      toast.error(error.message || "Error submitting form.")

    } finally {
      setLoading(false)
    }

  };


  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about buying or selling a vehicle? We're here to help.
            Reach out to our friendly team anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Contact Information
            </h2>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {info.title}
                      </h3>
                      <p className="text-primary font-medium mb-1">
                        {info.details}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Pyman" 
                    value={formData.name} 
                    onChange={handleChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="text" 
                    placeholder="mlawalskudi@gmail.com" 
                    value={formData.email} 
                    onChange={handleChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  type="tel" 
                  placeholder="+1 234 567 890" 
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  name="subject"
                  placeholder="How can we help you?" 
                  value={formData.subject} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  value={formData.message} 
                  onChange={handleChange}
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingButton /> : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Google Map */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Our Office Location
        </h2>
        <p className="text-center text-muted-foreground mb-8 text-sm max-w-xl mx-auto">
          Web3 World
        </p>
        <div className="w-full h-[450px] overflow-hidden rounded-xl shadow-md border border-border">
          <iframe
            src="https://www.google.com"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div> */}
    </div>
  )
}

export default Contact
