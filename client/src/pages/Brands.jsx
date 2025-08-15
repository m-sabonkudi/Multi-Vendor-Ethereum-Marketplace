import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, Search } from 'lucide-react'
import Spinner from '@/components/Spinner'
import { Input } from '@/components/ui/input'
import BrandLogo from '@/components/BrandLogo'

const Brands = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [brandsData, setBrandsData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase())
    }, 200)

    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    fetch('/api/get-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading && products.length > 0) {
      const brandMap = {}

      products.forEach(p => {
        if (!p.brand) return
        if (!brandMap[p.brand]) {
          brandMap[p.brand] = { count: 0, totalPrice: 0 }
        }
        brandMap[p.brand].count += 1
        brandMap[p.brand].totalPrice += p.price || 0
      })

      const brandArray = Object.entries(brandMap).map(([brand, { count, totalPrice }]) => ({
        brand,
        count,
        avgPrice: totalPrice / count
      }))

      setBrandsData(brandArray)
    }
  }, [loading, products])

  const filteredBrands = brandsData.filter(b =>
    b.brand.toLowerCase().includes(debouncedSearchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
        <Spinner />
      </div>
    )
  }

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse by Brand</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Explore vehicles grouped by popular manufacturers
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search brand..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <CarFront className="mx-auto w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">No matching brand found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredBrands.map(({ brand, count, avgPrice }) => (
              <div
                key={brand}
                onClick={() => navigate(`/products?brand=${encodeURIComponent(brand)}`)}
                className="cursor-pointer group rounded-2xl bg-card border border-border hover:shadow-xl transition-all p-6 flex flex-col gap-4 hover:border-primary"
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/products?brand=${encodeURIComponent(brand)}`)
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <BrandLogo brand={brand} />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {brand}
                    </h2>
                    <p className="text-sm">{count} {count === 1 ? 'car' : 'cars'}</p>
                  </div>
                </div>

                <div className="text-sm mt-auto text-muted-foreground">
                  Avg. Price:
                  <span className="block text-lg text-foreground font-medium mt-1">
                    {avgPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })} ethers
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Brands
