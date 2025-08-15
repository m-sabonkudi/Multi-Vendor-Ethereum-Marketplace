import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CarFront, Search, Filter, XCircle, ArrowLeft } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/ProductCard'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { useDebounce } from 'react-use'


const Products = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const observerRef = useRef(null)

  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('')
  const [brand, setBrand] = useState('all')
  const [maxMileage, setMaxMileage] = useState('any')
  const [sort, setSort] = useState('newest')

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const [visibleCount, setVisibleCount] = useState(10)

  // Parse filters from URL on load
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchTerm(params.get('search') || '')
    setBrand(params.get('brand') || 'all')
    setMaxMileage(params.get('mileage') || 'any')
    setSort(params.get('sort') || 'newest')
  }, [location.search])

  useEffect(() => {
    fetch('/api/get-products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setFiltered(data)
        setLoading(false)
      })
  }, [])

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

  // Filter/sort + URL sync
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (brand !== 'all') params.set('brand', brand)
    if (maxMileage !== 'any') params.set('mileage', maxMileage)
    if (sort !== 'newest') params.set('sort', sort)
    navigate(`/products?${params.toString()}`, { replace: true })

    let data = [...products]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      data = data.filter(p =>
        p.title.toLowerCase().includes(term) ||
        (p.model && p.model.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term))
      )
    }

    if (brand !== 'all') {
      data = data.filter(p => p.brand === brand)
    }

    if (maxMileage !== 'any') {
      data = data.filter(p => p.mileage <= parseInt(maxMileage))
    }

    switch (sort) {
      case 'newest':
        data.sort((a, b) => b.year - a.year)
        break
      case 'oldest':
        data.sort((a, b) => a.year - b.year)
        break
      case 'priceLow':
        data.sort((a, b) => a.price - b.price)
        break
      case 'priceHigh':
        data.sort((a, b) => b.price - a.price)
        break
      case 'mileageLow':
        data.sort((a, b) => a.mileage - b.mileage)
        break
      case 'mileageHigh':
        data.sort((a, b) => b.mileage - a.mileage)
        break
    }

    setFiltered(data)
  }, [debouncedSearchTerm, brand, maxMileage, sort, products, navigate])

  // Infinite scroll
  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 10)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 1 })

    if (observerRef.current) observer.observe(observerRef.current)

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current)
    }
  }, [loadMore])

  return (
    <>
        <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
            >
            <ArrowLeft className="w-4 h-4" />
            Previous Page
            </Button>
        </div>
    <section className="py-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Options
          </h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by make, model, or title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={maxMileage} onValueChange={setMaxMileage}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="Max Mileage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Max Mileage</SelectItem>
                <SelectItem value="50000">50,000 km</SelectItem>
                <SelectItem value="100000">100,000 km</SelectItem>
                <SelectItem value="150000">150,000 km</SelectItem>
                <SelectItem value="200000">200,000 km</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priceLow">Price: Low to High</SelectItem>
                <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                <SelectItem value="mileageLow">Mileage: Low to High</SelectItem>
                <SelectItem value="mileageHigh">Mileage: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
                variant="zinc"
                onClick={() => {
                setSearchTerm('')
                setBrand('all')
                setMaxMileage('any')
                setSort('newest')
                }}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
                <XCircle className="w-4 h-4" />
                Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
            <div className="text-center py-10 text-muted-foreground">
                <Spinner />
                <h3 className="text-xl mt-4 font-semibold">Fetching cars...</h3>
                <p className="text-sm mt-2">Please hold on while we fetch products.</p>
            </div>
            ) : filtered.length > 0 ? (
            <>
                <p className="mb-6 text-muted-foreground text-sm">
                {filtered.length} Cars Found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.slice(0, visibleCount).map(car => (
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

                <div ref={observerRef} className="h-10" />
            </>
            ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
                <CarFront className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold">No Cars Found</h3>
                <p className="text-sm mt-2">There are no cars currently in the system.</p>
            </div>
            ) : (
            <div className="text-center py-20 text-muted-foreground">
                <CarFront className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold">No Cars Found</h3>
                <p className="text-sm mt-2">Try adjusting your search criteria or filters.</p>
            </div>
            )
          
          }

      </div>
    </section>
    </>
  )
}

export default Products
