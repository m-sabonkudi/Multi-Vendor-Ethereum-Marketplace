import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const FilterComponent = ({
  initialBrand = 'all',
  initialMaxMileage = 'any',
  initialSort = 'newest',
  products = []
}) => {
  const navigate = useNavigate()

  const [brand, setBrand] = useState(initialBrand)
  const [maxMileage, setMaxMileage] = useState(initialMaxMileage)
  const [sort, setSort] = useState(initialSort)

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

  const onSearch = () => {
    const params = new URLSearchParams()
    if (brand !== 'all') params.set('brand', brand)
    if (maxMileage !== 'any') params.set('mileage', maxMileage)
    if (sort !== 'newest') params.set('sort', sort)
    navigate(`/products?${params.toString()}`)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-col gap-4 w-full md:flex-row md:flex-wrap md:items-center md:gap-4 md:flex-1 md:min-w-[280px] md:max-w-[calc(100%-160px)]">
          <Select
            value={brand}
            onValueChange={setBrand}
            className="w-60 md:w-72"
          >
            <SelectTrigger className="w-full md:w-auto text-[15px]">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(b => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={maxMileage}
            onValueChange={setMaxMileage}
            className="w-60 md:w-72"
          >
            <SelectTrigger className="w-full md:w-auto text-[15px]">
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

          <Select
            value={sort}
            onValueChange={setSort}
            className="w-60 md:w-72 "
          >
            <SelectTrigger className="w-full md:w-auto text-[15px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={"text-[15px]"}>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priceLow">Price: Low to High</SelectItem>
              <SelectItem value="priceHigh">Price: High to Low</SelectItem>
              <SelectItem value="mileageLow">Mileage: Low to High</SelectItem>
              <SelectItem value="mileageHigh">Mileage: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
  onClick={onSearch}
  className="w-full whitespace-nowrap px-8 py-2 md:w-48 cursor-pointer flex items-center gap-2"
>
  <Search />
  Search
</Button>

      </div>
    </div>
  )
}

export default FilterComponent
