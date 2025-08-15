import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, ArrowLeftRight, Filter, Search, XCircle } from "lucide-react"
import { useDebounce } from "react-use"

import Spinner from "@/components/Spinner"
import TransactionBuyerCard from "@/components/TransactionBuyerCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import useWallet from "@/contexts/WalletContext"

function TransactionsBuyer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { walletAddress, loading: loadingAddress } = useWallet()

  const [transactions, setTransactions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')
  
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const [userInformation, setuserInformation] = useState({
      email: "",
      name: "",
      address: "",
      is_seller: null,
  });

    useEffect(() => {
    if (loadingAddress || !walletAddress) return;

    async function getUser() {
      try {
        const response = await fetch(`/api/user-exists/${walletAddress}`);
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        const data = await response.json();
        setuserInformation(data);
      } catch (error) {
        console.log(error.message);
      }
    }

    getUser();
  }, [walletAddress, loadingAddress]);


  // URL param sync
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchTerm(params.get('search') || '')
    setStatus(params.get('status') || 'all')
    setSort(params.get('sort') || 'newest')
  }, [location.search])

    useEffect(() => {
        if (!walletAddress && !loadingAddress)  {
            navigate("/")
        } else if (!loadingAddress && walletAddress) {
            setLoading(false)
        }
    }, [walletAddress, loadingAddress]);

  // Fetch transactions
  useEffect(() => {
    if (!walletAddress || loadingAddress) return

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/get-transactions?wallet=${walletAddress}`)
        if (!res.ok) throw new Error("Failed to fetch transactions")

        const data = await res.json()
        setTransactions(data.buyer)
        setFiltered(data.buyer)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [walletAddress, loadingAddress])

  // Filtering & Sorting
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (status !== 'all') params.set('status', status)
    if (sort !== 'newest') params.set('sort', sort)
    navigate(`/transactions-buyer?${params.toString()}`, { replace: true })

    let data = [...transactions]

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase()
      data = data.filter(txn =>
        txn.seller?.toLowerCase().includes(term) ||
        txn.product_title?.toLowerCase().includes(term) ||
        String(txn.transaction_id).toLowerCase().includes(term)
      )
    }

    if (status !== 'all') {
      data = data.filter(txn => txn.status === status)
    }

    switch (sort) {
      case 'newest':
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'amountLow':
        data.sort((a, b) => a.amount - b.amount)
        break
      case 'amountHigh':
        data.sort((a, b) => b.amount - a.amount)
        break
    }

    setFiltered(data)
  }, [debouncedSearchTerm, status, sort, transactions, navigate])

  if (loading || loadingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-muted-foreground">
        <Spinner />
      </div>
    )
  }

  const statusOptions = Array.from(new Set(transactions.map(t => t.status).filter(Boolean)))

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Page
        </Button>

        {!loadingAddress && walletAddress && userInformation.is_seller &&
        <Button
          onClick={() => navigate("/transactions-seller")}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
        >
          Vendor Transactions
        </Button>
        }
      </div>
    </div>


      <section className="py-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter UI */}
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
                  placeholder="Search by seller address, product title, transaction ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="min-w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Date: Newest First</SelectItem>
                  <SelectItem value="oldest">Date: Oldest First</SelectItem>
                  <SelectItem value="amountLow">Amount: Low to High</SelectItem>
                  <SelectItem value="amountHigh">Amount: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="zinc"
                onClick={() => {
                  setSearchTerm('')
                  setStatus('all')
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
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ArrowLeftRight className="mx-auto w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold">No Transactions</h3>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-muted-foreground text-sm">
                {filtered.length} Transactions Found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((txn) => (
                  <TransactionBuyerCard
                    key={txn.transaction_id}
                    transaction_id={txn.transaction_id}
                    buyer={txn.buyer}
                    seller={txn.seller}
                    amount={txn.amount}
                    status={txn.status}
                    status_num={txn.status_num}
                    image={txn.image}
                    product_title={txn.product_title}
                    created_at={txn.created_at}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default TransactionsBuyer
