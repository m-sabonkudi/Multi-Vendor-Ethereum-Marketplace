import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import {
  Heart,
  Fuel,
  Settings,
  Car,
  Gauge,
  Calendar,
  BadgeDollarSign,
  ArrowLeft,
  Badge,
  ArrowRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Spinner from '@/components/Spinner'
import { WishlistContext } from '@/contexts/WishlistContext'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import LoadingButton from '@/components/LoadingButton'
import useWallet from '@/contexts/WalletContext'
import { buy } from '@/contract/functions'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip'




const Product = () => {
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState()
  const [loadingDelete, setLoadingDelete] = useState(false)
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loadingBuy, setLoadingBuy] = useState(false)

  const { walletAddress, loading: loadingAddress } = useWallet();

    const { addToWishlist, removeFromWishlist, isWishlisted } = useContext(WishlistContext)
  
    const wishlisted = product ? isWishlisted(product.id) : false;
  
    const toggleWishlist = () => {
      if (wishlisted) {
        removeFromWishlist(product.id)
        toast.success("Removed from wishlist.")
      } else {
        addToWishlist(product.id)
        toast.success("Added to wishlist.")
      }
    } 

  const [mainImage, setMainImage] = useState()

  useEffect(() => {
    
      async function getProduct() {
        setLoading(true)
        try {

            const response = await fetch(`/api/get-product/${slug}`)

            if (!response.ok) {
              if (response.status === 404) {
                toast.error("Product not found!")
              }
              toast.error("Failed to retrieve product.")
            }

            const data = await response.json()
            console.log(data)
            setProduct(data)
            setMainImage(data.images[0])

        } catch (err) {
          toast.error(err.message)

        } finally {
          setLoading(false)
        }

      }

    getProduct()
  }, [])


    async function handleDelete() {
      setLoadingDelete(true)
      try {
        const res = await fetch(`/api/delete-product/${product.slug}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!res.ok) {
          const error = await res.json()
          toast.error(error.error || 'Failed to delete product.')
          return
        }

        toast.success('Product deleted successfully.')
        navigate(-1)
      } catch (err) {
        toast.error(`Something went wrong ${err.message}`)
      } finally {
        setLoadingDelete(false)
      }
  }



  if (!product && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  async function handleBuy() {
    setLoadingBuy(true);

    var { success, ...resData } = await buy(product.price, product.seller_address, product.id);
    if (!success) {
      const { errorMessage } = resData;
      toast.error(errorMessage)
      return setLoadingBuy(false);
    }  
    
    const { E_transaction_id, E_buyer, E_seller, E_amount, product_id } = resData;
    
    try {
      const response = await fetch("/api/create-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            transaction_id: E_transaction_id.toString(),
            seller: E_seller.toString(),
            buyer: E_buyer.toString(),
            amount: E_amount.toString(),
            product_id: product_id.toString()
        }),
      })
      
    const data = await response.json();
    console.log("Response:", data);

    if (!response.ok) { 
        setLoadingBuy(false)
        return toast.error(data.message)
    }

    return toast.success("You have successfully paid!")

    } catch(error) {
      toast.error(error.message || "Something went wrong saving transaction to db.")
    } finally {
      setLoadingBuy(false)
      return
    }
  }


  return (
    <>
      {/* Top-left Back Button */}
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

      {loading ? <div className="min-h-screen flex items-center justify-center">
                    <Spinner />
                </div>  : (

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div>
          <div className="border rounded-lg overflow-hidden mb-4">
            <img
              src={!loading && mainImage}
              alt="Main Vehicle"
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`cursor-pointer border rounded-lg overflow-hidden focus:outline-none ring-2 ${
                  img === mainImage ? 'ring-primary' : 'ring-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
          <p className="text-2xl font-bold text-primary">
            {product.price} ETH
          </p>
          <p className="text-muted-foreground text-base">{product.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-6">
            {product.brand && (
              <div className="flex items-center gap-2">
                <Badge className="w-4 h-4" />
                <span>{product.brand}</span>
              </div>
            )}
            {product.model && (
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4" />
                <span>{product.model}</span>
              </div>
            )}
            {product.year && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{product.year}</span>
              </div>
            )}
            {product.mileage && (
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>{product.mileage.toLocaleString()} km</span>
              </div>
            )}
            {product.fuel_type && (
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                <span>{product.fuel_type}</span>
              </div>
            )}
            {product.transmission && (
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>{product.transmission}</span>
              </div>
            )}
            {product.vehicle_type && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>{product.vehicle_type}</span>
              </div>
            )}
          </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-3 sm:space-y-0">
        <Button onClick={toggleWishlist} className="cursor-pointer inline-flex items-center gap-2">
              <Heart
              className={`w-5 h-5 ${wishlisted ? 'text-red-600 fill-red-600' : 'fill-none'}`}
            />
            {wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        </Button>

        <Button onClick={() => navigate(`/products?brand=${product.brand}`)} variant="outline" className="cursor-pointer inline-flex items-center gap-2">
            More from {product.brand}
            <ArrowRight className="w-4 h-4" />
        </Button>

        
        {!loadingAddress && walletAddress && walletAddress === product.seller_address ? 
          <Button onClick={() => navigate(`/edit-product/${product.slug}`)} variant="outline" className="cursor-pointer inline-flex items-center gap-2">
              Edit
          </Button>
          :
          null
        }

        {
          !loadingAddress && (
            !walletAddress ? (
              <Button 
                onClick={() => toast.error(
                      <span>
                        Please {" "}
                        <Link to="/auth" className=" text-blue-500 hover:text-blue-600">
                          connect MetaMask.
                        </Link>
                      </span>
                    )} 
                className="text-white bg-green-700 hover:bg-green-800 cursor-pointer inline-flex items-center gap-2"
              >
                Buy
              </Button>
            ) : (
              walletAddress !== product.seller_address && (
                <Button
                  disabled={loadingBuy} 
                  onClick={handleBuy} 
                  className="text-white bg-green-700 hover:bg-green-800 cursor-pointer inline-flex items-center gap-2"
                >
                  {loadingBuy ? <LoadingButton /> : "Buy"}
                </Button>
              )
            )
          )
        }


        </div>

        <Button onClick={() => navigate(`/vendor/${product.seller_address}`)} variant="outline" className="me-5 cursor-pointer inline-flex items-center gap-2">
            More from Vendor
            <ArrowRight className="w-4 h-4" />
        </Button>

        
        {!loadingAddress && walletAddress && walletAddress === product.seller_address ? 
          (!product.has_transaction ?
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={loadingDelete} className="cursor-pointer inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700">
                {loadingDelete ? <LoadingButton /> : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this product. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          : 
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative inline-block">
                  <Button
                    disabled
                    className="cursor-not-allowed inline-flex items-center gap-2 bg-red-500 text-white pr-5"
                  >
                    Delete
                  </Button>

                  <span className="absolute top-1 right-1 text-white/60 pointer-events-none">
                    <Info size={12} strokeWidth={2} />
                  </span>
                </div>
              </TooltipTrigger>

            <TooltipContent
              className="bg-black text-white px-3 py-1 rounded shadow-md text-sm z-50"
              side="top"
              align="center"
            >
              Can't delete product because a transaction has been made.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

          )
        :
        null
        }
        </div>
      </div>
      )}
      
    </>
  )
}

export default Product
