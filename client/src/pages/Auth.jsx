import { useEffect, useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { ethers } from "ethers";
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import LoadingButton from '@/components/LoadingButton'
import { useNavigate } from 'react-router-dom'
import useWallet from "@/contexts/WalletContext";
import Spinner from '@/components/Spinner'
import { KeyRound } from 'lucide-react'


const Auth = () => {
  const { walletAddress, loading: loadingAddress } = useWallet();

  const [showRegister, setShowRegister] = useState(false)
  const [inputs, setInputs] = useState({name: "", email: ""})
  const [userAddress, setUserAddress] = useState()
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState()
  const [loading, setLoading] = useState()
  const [pageloading, setPageLaoding] = useState(true)
  const [connectionMessage, setConnectionMessage] = useState()
  const [connectionError, setConnectionError] = useState()


  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')


  /// THE BEGINNING 

   useEffect(() => {
        if (walletAddress && !loadingAddress)  {
            navigate("/")
        } else if (!walletAddress && !loadingAddress) {
          setPageLaoding(false)
        }

    }, [walletAddress, loadingAddress]);

  
  function handleInputs(event) {
    const {name, value} = event.target;

    setInputs((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }

  async function verifyOtp(event) {
    setLoading(true)
    event.preventDefault()
    try {
        const response = await fetch("/api/verify-otp", {
           method: "POST",
           credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({otp: otp}),
        })

        const data = await response.json();
        console.log("Response:", data);

        if (!response.ok) { 
          return toast.error(data.message)
        }

        window.location.href = "/?action=registered";
        
        
      } catch (error) {
          console.log(error.message);
          return toast.error(error.message)
          
      } finally {setLoading(false)}

  }

  async function registerUser(event) {
    event.preventDefault()
    setLoading(true)
    if (!inputs.name || !inputs.email) {
      // setConnectionError("Both fields are required.")
      toast.warning("Both fields are required.")
      return
    }

      try {
        const response = await fetch("/api/register-user", {
           method: "POST",
           credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({name: inputs.name, email: inputs.email, address: userAddress}),
        })

        const data = await response.json();
        console.log("Response:", data);

        if (!response.ok) { 
          toast.error(data.message)
        }

        if (data.status) {
          toast.info(`Enter the OTP sent to ${inputs.email}`)
          setShowRegister(false)
          setConnectionMessage(`Enter the OTP sent to ${inputs.email}`)
          return setShowOtp(true)

        } else {
            toast.error(data.message)
        }
        
      } catch (error) {
          console.log(error.message);
          toast.error(error.message)
          
      } finally {
        setLoading(false)
          return
      }
  }


  async function signinBackend(addr) {
    try {

      const response = await fetch(`/api/user-exists/${addr}`)

      if (!response.ok) {
        if (response.status == 404) {
          setShowRegister(true)
          return setConnectionMessage("Create an account to receive email notifications.")
        }

        else {
          throw new Error(`Server responded with status ${response.status}`)
        }
      }

      // toast.success("Sign in successful!")
      window.location.href = "/?action=loggedin";
    
      
    } catch (error) {
          console.log(error.message);
        return toast.error(error.message)
      
    } finally { 

    }
  }


    async function handleSignin() {
      setLoading(true)
      setConnectionError()

      try {
        if (!window.ethereum) {
          return toast.error("MetaMask extension not installed!")
        } 
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          console.log("Signererrr", signer)
          
          toast.success("Wallet connected successfully!")

          const addr = await signer.getAddress()

          setUserAddress(addr)
          // setWalletAddress(addr)

          return await signinBackend(addr)


      } catch(error) {
        if (error.code === 4001) {
        // 4001 = User rejected the request
        console.log("User rejected the connection.");
        setConnectionError("You must connect your wallet to proceed.")
        return toast.error("Please connect your wallet to proceed.")
      }

      } finally {
        setLoading(false)

      }
    
  }

  ///END OF IT

  if (pageloading) {
    return (
        <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
            <Spinner />
        </div>
        )
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">

          {showRegister ? (
              <h1 className="text-3xl font-bold text-foreground mb-1">Sign Up</h1>
            ) : showOtp ? (
              <h1 className="text-3xl font-bold text-foreground mb-1">Verify OTP</h1>
            ) : (
              <h1 className="text-3xl font-bold text-foreground mb-1">Connect MetaMask</h1>
          )}


          {connectionError && 
            <p className="text-red-500 text-center my-5">
              {connectionError}
            </p>
          }


          {connectionMessage && 
            <p className="text-center mt-3 text-gray-500 mb-6">{connectionMessage}</p>
          }

          {/* <p className="text-sm text-muted-foreground">Login or sign up to continue</p> */}

          {!showRegister && !showOtp && 
            <Button disabled={loading} className="mt-5" onClick={handleSignin}>{loading ? <LoadingButton/ > : "Connect"}</Button>
          }

        </div>


        {showRegister && 
        <form onSubmit={registerUser} className="space-y-4">
              <div>
                <Label htmlFor="register-name" className="mb-1 block text-sm">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={inputs.name}
                  onChange={handleInputs}
                  className="h-9"
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-email" className="mb-1 block text-sm">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={inputs.email}
                  onChange={handleInputs}
                  className="h-9"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="cursor-pointer w-full mt-4 h-9 text-sm">
                {loading ? <LoadingButton /> : "Send OTP"}
              </Button>
            </form>
          }


          {showOtp && 
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="register-name" className="mb-2 block text-sm">6-digit OTP</Label>
              <Input
                inputMode="numeric"
                placeholder="Enter OTP"
                onChange={event => setOtp(event.target.value)}
                value={otp}
                className="w-full outline-none text-sm"
              />
            </div>

            <Button disabled={loading}>{loading ? <LoadingButton /> : "Confirm"}</Button>
          </form>
          }


         
      

          
      </div>
    </div>
  )
}

export default Auth
