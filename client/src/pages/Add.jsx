'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Upload, X, Check, Car, FileText, Camera, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import useWallet from '@/contexts/WalletContext'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/Spinner'


const Add = () => {
  const navigate = useNavigate()
  const { walletAddress, loading: loadingAddress } = useWallet(); 
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [brands, setBrands] = useState([])
  const [formData, setFormData] = useState({
    vehicleTitle: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    vehicleType: '',
    description: '',
    images: []
  })

  const [errors, setErrors] = useState({})

  const steps = [
    { id: 1, icon: Car, title: 'Basic Vehicle Information', description: 'Enter the essential details about your vehicle' },
    { id: 2, icon: FileText, title: 'Vehicle Details', description: 'Provide additional specifications' },
    { id: 3, icon: Camera, title: 'Vehicle Images', description: 'Add high-quality images of your vehicle' }
  ]

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.vehicleTitle.trim()) newErrors.vehicleTitle = 'Vehicle title is required'
      if (!formData.brand.trim()) newErrors.brand = 'Brand is required'
      if (!formData.price.trim()) newErrors.price = 'Price is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
    }

    if (step === 2) {
      if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required'
      if (!formData.transmission) newErrors.transmission = 'Transmission is required'
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required'
    }

    if (step === 3) {
        if (!formData.images.length) newErrors.images = 'At least one image is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  useEffect(() => {
    async function getBrands() {
      fetch('/api/get-brands')
      .then((res) => res.json())
      .then((data) => {
        console.log("brnds")
        console.log(data.brands)
        setBrands(data.brands)
      })
    }
    getBrands()
  }, [])


   useEffect(() => {
    if (!walletAddress && !loadingAddress)  {
      navigate("/")
    }
  if (loadingAddress || !walletAddress) return;

  fetch(`/api/user-exists/${walletAddress}`)
    .then(res => res.json())
    .then(data => {
      if (!data.is_seller) {
        return navigate("/")
      }
      setLoadingPage(false)
    })

}, [walletAddress, loadingAddress]);


  async function handleSubmit() {
    if (!validateStep(currentStep)) return
    setLoading(true)

    const form = new FormData()
    form.append('title', formData.vehicleTitle)
    form.append('brand', formData.brand)
    form.append('model', formData.model)
    form.append('year', formData.year)
    form.append('price', formData.price)
    form.append('mileage', formData.mileage || 0)
    form.append('fuel_type', formData.fuelType)
    form.append('transmission', formData.transmission)
    form.append('vehicle_type', formData.vehicleType)
    form.append('description', formData.description)
    form.append('address', walletAddress)

    formData.images.forEach((imgObj) => {
      form.append('images', imgObj.file)
    })

    try {
      const res = await fetch('/api/add-product', {
        method: 'POST',
        body: form
      })

      const data = await res.json()

      if (!res.ok) {
        // toast.error('Submission failed!')
        console.log("data", data)
        throw new Error(data.message || 'Submission failed!')
      } 

      toast.success('Vehicle listing submitted successfully!', {
        description: 'Your vehicle will be reviewed and published shortly.'
      })

      setFormData({
        vehicleTitle: '',
        brand: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        fuelType: '',
        transmission: '',
        vehicleType: '',
        description: '',
        images: []
      })
      setCurrentStep(1)
    } catch (err) {
      toast.error(err.message)
      // toast.error('Failed to submit vehicle listing')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

const didMountRef = useRef(false)

useEffect(() => {
  // Avoid scrolling if the page just mounted
  if (!didMountRef.current) return
  // Scroll smoothly a bit down, only when step changes
  window.scrollTo({ top: 150 })
}, [currentStep])

// This ensures the ref flips *after* first render
useEffect(() => {
  const id = requestAnimationFrame(() => {
    didMountRef.current = true
  })
  return () => cancelAnimationFrame(id)
}, [])


const moveImageUp = (index) => {
  if (index === 0) return
  setFormData(prev => {
    const newImages = [...prev.images]
    const temp = newImages[index - 1]
    newImages[index - 1] = newImages[index]
    newImages[index] = temp
    return { ...prev, images: newImages }
  })
}

const moveImageDown = (index) => {
  if (index === formData.images.length - 1) return
  setFormData(prev => {
    const newImages = [...prev.images]
    const temp = newImages[index + 1]
    newImages[index + 1] = newImages[index]
    newImages[index] = temp
    return { ...prev, images: newImages }
  })
}

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="vehicleTitle" className="mb-2 block">Vehicle Title *</Label>
          <Input
            id="vehicleTitle"
            placeholder="e.g., 2023 Tesla Model S Plaid"
            value={formData.vehicleTitle}
            onChange={(e) => handleInputChange('vehicleTitle', e.target.value)}
            className={errors.vehicleTitle ? 'border-red-500' : ''}
          />
          {errors.vehicleTitle && <p className="text-red-500 text-sm mt-1">{errors.vehicleTitle}</p>}
        </div>

        {/* <div>
          <Label htmlFor="brand" className="mb-2 block">Brand *</Label>
          <Input
            id="brand"
            placeholder="e.g., Tesla"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className={errors.brand ? 'border-red-500' : ''}
          />
          {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
        </div> */}

        <div>
          <Label htmlFor="brand" className="mb-2 block">Brand *</Label>
          <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
            <SelectTrigger className={errors.brand ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
        </div>


        <div>
          <Label htmlFor="model" className="mb-2 block">Model</Label>
          <Input
            id="model"
            placeholder="e.g., Model S"
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="year" className="mb-2 block">Year</Label>
          <Input
            id="year"
            placeholder="e.g., 2023"
            inputMode="numeric"
            value={formData.year}
            onChange={(e) => handleInputChange('year', e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div>
          <Label htmlFor="price" className="mb-2 block">Price (ETH) *</Label>
          <Input
            id="price"
            placeholder="e.g., 0.1 ETH"
            inputMode="numeric"      
            pattern="[0-9]*"           
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
            className={errors.price ? 'border-red-500' : ''}
          />
          {formData.price && <p className="text-muted-foreground text-sm mt-1"> {Number(formData.price).toLocaleString()}</p>}

          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <Label htmlFor="mileage" className="mb-2 block">Mileage (km)</Label>
          <Input
            id="mileage"
            placeholder="e.g., 15000"
            inputMode="numeric"
            value={formData.mileage}
            onChange={(e) => handleInputChange('mileage', e.target.value.replace(/\D/g, ''))}
          />

          {formData.mileage && <p className="text-muted-foreground text-sm mt-1"> {Number(formData.mileage).toLocaleString()}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description" className="mb-2 block">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your vehicle’s condition, features, etc..."
            rows={5}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="fuelType" className="mb-2 block">Fuel Type *</Label>
          <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
            <SelectTrigger className={errors.fuelType ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-red-500 text-sm mt-1">{errors.fuelType}</p>}
        </div>

        <div>
          <Label htmlFor="transmission" className="mb-2 block">Transmission *</Label>
          <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
            <SelectTrigger className={errors.transmission ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
          {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission}</p>}
        </div>

        <div className="">
          <Label htmlFor="vehicleType" className="mb-2 block">Vehicle Type *</Label>
          <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
            <SelectTrigger className={errors.vehicleType ? 'border-red-500 w-full' : 'w-full'}>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="convertible">Convertible</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Upload Vehicle Images</h3>
        <p className="text-muted-foreground mb-4">Drag and drop your images here, or click to browse</p>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
        <Button asChild variant="outline">
          <label htmlFor="image-upload" className="cursor-pointer">Choose Images</label>
        </Button>
        {errors.images && <p className="text-red-500 text-sm mt-2 text-center">{errors.images}</p>}
      </div>

      {formData.images.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-foreground mb-4">Uploaded Images ({formData.images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image.url} alt={`Vehicle ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
                <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>

                {/* ReORDER BUTTONS */}
                <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="w-6 h-6" onClick={() => moveImageUp(index)} disabled={index === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="w-6 h-6" onClick={() => moveImageDown(index)} disabled={index === formData.images.length - 1}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {/* ENDOF REORDER */}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const CurrentIcon = steps[currentStep - 1].icon

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
        <Spinner />
      </div>
    )
  }

  if (loadingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
        <Spinner />
      </div>
    )
  } 
  // else if (!walletAddress) {
  //   navigate("/")
  // }
  
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Page
        </Button>
      </div>

    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Add Your Vehicle</h1>
          <p className="text-lg text-muted-foreground">List your vehicle on Pyman and reach thousands of buyers</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-medium 
                    ${currentStep >= step.id ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>

                {index < steps.length - 1 && (
                  <div className={`w-10 sm:w-20 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <CurrentIcon className="w-5 h-5 text-primary" />
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>

        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="cursor-pointer flex items-center space-x-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} className="cursor-pointer flex items-center space-x-2">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="cursor-pointer flex items-center space-x-2">
              <span>{loading ? 'Submitting...' : 'Submit Listing'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Add
