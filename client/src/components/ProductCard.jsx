import { Link } from 'react-router-dom'
import { Fuel, Settings, Heart, HeartOff } from 'lucide-react'
import { useState } from 'react'

import { useContext } from "react";
import { WishlistContext } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import LoadingButton from './LoadingButton';


const ProductCard = ({ slug, image, title, price, transmission, fuel_type, id }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { addToWishlist, removeFromWishlist, isWishlisted } = useContext(WishlistContext)
  const [loadingWishlisting, setLoadingWishlisting] = useState(false)

  const wishlisted = isWishlisted(id)

  async function toggleWishlist() {
    setLoadingWishlisting(true)
    if (wishlisted) {
      const {status, ...data } = await removeFromWishlist(id)
      if (status) {
        toast.success("Removed from wishlist.")
      } else {
        const { message } = data
        toast.error(message)
      }
    } else {
      const {status, ...data} = await addToWishlist(id)
      if (status) {
        toast.success("Added to wishlist.")
      } else {
        const { message } = data
        toast.error(message)
      }
    }
    setLoadingWishlisting(false)
  }


  return (
    <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      {/* Wishlist Button */}
      <button
      disabled={loadingWishlisting}
      onClick={toggleWishlist}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/70 text-white rounded-full p-2 shadow-sm transition-colors"
      >
    {loadingWishlisting ? <LoadingButton /> :
      <Heart
        className={`w-5 h-5 ${wishlisted ? 'text-red-600 fill-red-600' : 'text-white fill-none'}`}
      />
    }


  {/* {showTooltip && (
    <div className="absolute top-full mt-1 right-1 whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded shadow">
      {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </div>
  )} */}
</button>


      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">{title}</h3>
        <p className="text-xl font-bold text-primary">{price} ethers</p>

        <div className="flex flex-wrap gap-2 text-sm mt-2">
          {transmission && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              <Settings className="w-4 h-4" />
              {transmission}
            </span>
          )}
          {fuel_type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              <Fuel className="w-4 h-4" />
              {fuel_type}
            </span>
          )}
        </div>

        <Link
          to={`/product-detail/${slug}`}
          className="mt-4 inline-block w-full text-center bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard