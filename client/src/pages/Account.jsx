import { Mail, Lock, Eye, User, Wallet, UserCog, Store, ArrowLeft, ArrowRight, CreditCard, CreditCardIcon } from "lucide-react";
import { useState, useEffect } from "react";
import useWallet from "@/contexts/WalletContext";
import Spinner from "@/components/Spinner";
import { toast } from 'sonner'
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getbalance } from "@/contract/functions";
import { Switch } from "@/components/ui/switch";
import { toggleAutoWithdraw, getAutoWithdrawStatus, withdraw } from "@/contract/functions";
import LoadingButton from "@/components/LoadingButton";


function Account() {

  const [loading, setLoading] = useState(true)
  const [userInformation, setuserInformation] = useState({email: "", name: "", address: "", is_seller: null})
  const [originalName, setOriginalName] = useState("");
  const [accountBalance, setAccountBalance] = useState()
  const [isAutoWithdraw, setIsAutoWithdraw] = useState(false);
  const [loadingAutoWithdraw, setloadingAutoWithdraw] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [showBalance, setShowBalance] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [loadingWithdrawing, setLoadingWithdrawing] = useState(false)
  const [errorAdvancedPage, setErrorAdvancedPage] = useState({message: "", show: false})
  const [updatingName, setUpdatingName] = useState(false)
  const [becomingVendor, setBecomingVendor] = useState(false)


  const { walletAddress, loading: loadingAddress } = useWallet(); 
  const navigate = useNavigate()
  const location = useLocation()

  
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('show') === "advanced") {
      setShowBalance(true)
    } else if (params.get('search') === "basic") {
      setShowBalance(false)
    } else {

    }

  }, [])


   useEffect(() => {
    if (!walletAddress && !loadingAddress) {
      navigate("/")
    }

  if (loadingAddress || !walletAddress) return;

  async function getUser() {
    try {
      const response = await fetch(`/api/user-exists/${walletAddress}`);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setuserInformation(data);
      setOriginalName(data.name);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
        setLoading(false)
    }
  }

  getUser();
}, [walletAddress, loadingAddress]);


  useEffect(() => {
    if (loadingAddress || !walletAddress) return

    // async function fetch() {
      
    //   try {
    //     const { balance } = await getbalance(walletAddress)
    //     setAccountBalance(balance)
    //     const { status } = await getAutoWithdrawStatus(walletAddress)
    //     setIsAutoWithdraw(status)
    //     setLoadingBalance(false)
    //   } catch (error) {
    //     setErrorAdvancedPage(true)
    //   }

    //   // alert(accountBalance)
    // }
    async function fetchNow() {
      try {
        const response = await fetch(`/api/balance-and-autowithdraw`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({address: walletAddress})
        })
        const data = await response.json()
        
        if (!response.ok) {
          return setErrorAdvancedPage({message: data.error, show: true})
        }

        setAccountBalance(data.balance)
        setIsAutoWithdraw(data.status)
        return setLoadingBalance(false)


      } catch (error) {
        setErrorAdvancedPage({message: "", show: true})
      }
    }

    if (!loadingAddress && walletAddress) {
      fetchNow()
    }
  }, [walletAddress, loadingAddress])


async function updateName() {
  setUpdatingName(true)
  try {
    const response = await fetch("/api/update-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: walletAddress,
        name: userInformation.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update name.");
    }

    const result = await response.json();
    toast.success(result.message);
    setOriginalName(userInformation.name); // Update originalName to hide button again
  } catch (error) {
    toast.error(error.message);
  } finally {
    setUpdatingName(false)
  }
}


async function makeVendor() {
  setBecomingVendor(true)
  try {
    const response = await fetch("/api/make-vendor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to become a vendor.");
    }

    const result = await response.json();
    toast.success(result.message);
    window.dispatchEvent(new Event("userBecameSeller"));


    // Optionally update state if you want to reflect the change in UI
    setuserInformation((prev) => ({ ...prev, is_seller: true }));

  } catch (error) {
    toast.error(error.message);
  } finally {
    setBecomingVendor(false)
  }
}



 async function handleToggleAutoWithdraw() {
    setloadingAutoWithdraw(true)
    const { success, ...resData } = await toggleAutoWithdraw(!isAutoWithdraw)

    if (!success) {
      const { errorMessage } = resData
      toast.error(errorMessage) 
      return setloadingAutoWithdraw(false)
    }

    const { E_user, E_status } = resData

    setloadingAutoWithdraw(false)
    setIsAutoWithdraw(E_status)
    if (E_status) {
      return toast.success("Auto-withdraw turned on successfully!")
    } else {
      return toast.success("Auto-withdraw successfully disabled.")
    }
    
  }

  async function handleWithdraw() {
    if (!withdrawalAmount || !/^\d+(\.\d+)?$/.test(withdrawalAmount)) {
      return;
    }
    
    setLoadingWithdrawing(true)

    const { success, ...resData } = await withdraw(withdrawalAmount)

    if (!success) {
      const { errorMessage } = resData
      toast.error(errorMessage) 
      return setLoadingWithdrawing(false)
    }

    const { E_amount, E_newBalance } = resData
    // setAccountBalance(E_newBalance)
    toast.success(`Successfully withdrew ${E_amount}`)
    return setLoadingWithdrawing(false)

    
  }


  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
            <Spinner />
        </div>
        )
  }

  return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background py-20">
        
        <div className="bg-gray rounded-xl shadow-sm p-8 w-full max-w-md">

          <div className="mb-15">
            <Button
              onClick={() => {
                const params = new URLSearchParams()
                if (showBalance)  {
                  params.set('show', "basic")
                } else {
                  params.set("show", "advanced")
                }
                navigate(`?${params.toString()}`, { replace: true });
                setShowBalance(!showBalance)
              }}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              {!showBalance ? 
                <>
                  Advanced
                  <ArrowRight className="w-4 h-4" />
                </>
              : 
              <>
                <ArrowLeft className="w-4 h-4" />
                Basic
              </>
              }
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-center mb-5">Account Info</h2>

          {showBalance ? (loadingBalance ? <div className="flex flex-col gap-4 mb-37">
            {errorAdvancedPage.show ? 
            (
              errorAdvancedPage === "" ? 
                (<p className="mt-10 text-2xl text-red-500 text-center">
                  Failed to fetch. 
                  <Link onClick={() => window.location.href="/account?show=advanced"} className="ms-2 text-blue-600 underline text-1xl">
                    Reload
                  </Link>
                </p>) 
                :
                (<p className="mt-10 text-2xl text-red-500 text-center">
                  {errorAdvancedPage.message}
                  <Link onClick={() => window.location.href="/account?show=advanced"} className="ms-2 text-blue-600 underline text-1xl">
                    Reload
                  </Link>
                </p>)
            ) :
            <div className="mt-5"><Spinner /> </div>
          }
            
          </div> :
            <div className="flex flex-col gap-4 mb-15">
              {/* Account Balance */}
              {accountBalance ? (
                <h3 className="font-medium text-2xl">Balance: {accountBalance} ETH</h3>
              ) : (
                <h3 className="font-medium text-2xl">Fetching balance...</h3>
              )}
              
              <div className="flex items-center space-x-2 mt-5">
                <label htmlFor="custom-toggle" className="text-sm font-medium flex items-center">
                  Auto-withdraw
                  {loadingAutoWithdraw && (
                    <span className="ml-2 inline-block w-4 h-4">
                      <span className="block w-full h-full border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    </span>
                  )}
                </label>

                <Switch
                  disabled={loadingAutoWithdraw}
                  id="custom-toggle"
                  style={loadingAutoWithdraw ? { cursor: "not-allowed" } : {}}
                  checked={isAutoWithdraw}
                  onCheckedChange={handleToggleAutoWithdraw}
                />
              </div>

              {/* <p className="text-white">{withdrawalAmount}</p> */}
              
              <div className="mt-7">
                <label className="block text-sm font-medium mb-1">
                    Amount (ETH)
                </label>

                  <div className="flex items-center border rounded-md px-3 py-2 bg-gray shadow-sm 
                      focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 
                      transition-all duration-200 ease-in-out focus:outline-none hover:outline-none">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                      placeholder="Enter amount to withdraw"
                      className="w-full outline-none text-sm"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                      />
                  </div>
                </div>

                <Button className="w-full" disabled={loadingWithdrawing} onClick={handleWithdraw}>
                    {loadingWithdrawing ? <LoadingButton /> : "Withdraw"}
                </Button>
                
            </div>)
          :

          (
            loadingAddress ? <div className="my-30"><Spinner /></div> : 
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email (read-only)</label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-gray shadow-sm 
                focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 
                transition-all duration-200 ease-in-out focus:outline-none hover:outline-none">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none text-sm"
                  value={userInformation.email}
                  readOnly
                />
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium mb-1">Address (read-only)</label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-gray shadow-sm 
                focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 
                transition-all duration-200 ease-in-out focus:outline-none hover:outline-none">
                <Wallet className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  placeholder="Enter your address"
                  className="w-full outline-none text-sm"
                  value={userInformation.address}
                  readOnly
                />
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                  {!loading && !loadingAddress
                    ? !userInformation.is_seller
                      ? "Name"
                      : "Business Name"
                    : ""}
                </label>

                <div className="flex items-center border rounded-md px-3 py-2 bg-gray shadow-sm 
                    focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 
                    transition-all duration-200 ease-in-out focus:outline-none hover:outline-none">
                      {!loading && !loadingAddress
                    ? !userInformation.is_seller
                      ? <User className="w-4 h-4 text-gray-400 mr-2" />
                      : <Store className="w-4 h-4 text-gray-400 mr-2" />
                    : null}
                    <input
                    placeholder="Enter your name"
                    className="w-full outline-none text-sm"
                    value={userInformation.name}
                    onChange={(e) =>
                        setuserInformation((prev) => ({ ...prev, name: e.target.value }))
                    }
                    />
                </div>

                {(userInformation.name.trim() !== originalName && userInformation.name.trim().length !== 0) && (
                    <Button
                      onClick={updateName}
                      disabled={updatingName}
                      className="mt-2 text-sm"
                    >
                    {updatingName ? <LoadingButton /> : "Update name"}
                    </Button>
                )}
                </div>

                {!loading && !loadingAddress && !userInformation.is_seller && (
                <Button
                    onClick={makeVendor}
                    disabled={becomingVendor}
                    className="w-full"
                >
                    {becomingVendor ? <LoadingButton /> : "Become a Vendor"}
                </Button>
                )}

          </div>
          )
          }





          
        </div>
      </div>

  );
}

export default Account