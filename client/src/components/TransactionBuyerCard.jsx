import { Link } from 'react-router-dom'
import { Fuel, Settings, Heart, HeartOff, XCircle, CheckCircle } from 'lucide-react'
import { useState, useContext, useEffect } from 'react'

import { toast } from 'sonner';
import { Button } from './ui/button';
import { confirm, dispute } from '@/contract/functions';
import LoadingButton from './LoadingButton';


function TransactionBuyerCard ({ transaction_id, buyer, seller, amount, status, status_num, image, product_title }) {

  const [statusNum, setStatusNum] = useState(status_num)
  const [statusText, setStatusText] = useState(status)
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [loadingDispute, setLoadingDispute] = useState(false)
  
  useEffect(() => {
    const status_mapping = {
      0: "pending",
      1: "delivered",
      2: "confirmed",
      3: "disputed",
      4: "cancelled",
      5: "finalized"
    }
    setStatusText(status_mapping[statusNum])

  }, [statusNum])

  async function handleConfirm() {
    setLoadingConfirm(true)
    const { success, ...resData } = await confirm(transaction_id)

    if (!success) {
      const { errorMessage } = resData
      toast.error(errorMessage)
      return setLoadingConfirm(false)
    }

    const { E_buyer, E_seller, E_amount } = resData

    try {
      const response = await fetch("/api/update-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          transaction_id: transaction_id,
          new_status: 2
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadingConfirm(false)
        return toast.error(data.message)
      }

      setStatusNum(data.new_status)
      return toast.success("Product confirmed successfully.")

    } catch(error) {
      toast.error(error.message || "Something went updating status in db")
    } finally {
      return setLoadingConfirm(false)
    } 
  }


  async function handleDispute() {
    setLoadingDispute(true)
    const { success, ...resData } = await dispute(transaction_id)

    if (!success) {
      const { errorMessage } = resData
      toast.error(errorMessage)
      return setLoadingDispute(false)
    }

    const { E_buyer, E_seller, E_transaction_id } = resData

    try {
      const response = await fetch("/api/update-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          transaction_id: transaction_id,
          new_status: 3
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadingDispute(false)
        return toast.error(data.message)
      }

      setStatusNum(data.new_status)
      return toast.success("Transaction disputed. Waiting for seller to confirm product return.")

    } catch(error) {
      toast.error(error.message || "Something went updating status in db")
    } finally {
      return setLoadingDispute(false)
    } 
  }


  return (
    <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">

      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Transaction ID: {transaction_id}</h3>
        <p className="text-xl font-semibold text-primary">{amount} ETH</p>
        <p className="text-xl font-semibold text-primary">{product_title}</p>
        {/* <p>Status: {statusText}</p> */}

        <div className="flex flex-wrap gap-2 text-sm mt-2">
          {seller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              Seller: {seller}
            </span>
          )}
        </div>
         
      {statusNum === 0 ?
        <p>Waiting for seller to deliver.</p>
        : statusNum === 1 ?
        <Button onClick={handleConfirm} disabled={loadingConfirm} className="">
          {loadingConfirm ? <LoadingButton /> : "Confirm"}
        </Button>
        : statusNum === 2 ?
        <Button onClick={handleDispute} disabled={loadingDispute} className="">
          {loadingDispute ? <LoadingButton /> : "Dispute"}
        </Button>
        : statusNum === 3 ?
        <p>Waiting for seller to confirm product return.</p>
        : statusNum === 4 ?
          <XCircle color="red" />
        : statusNum === 5 ?
          <CheckCircle color="#32CD32" />
        : 
          null
      }
      </div>
    </div>
  )
}

export default TransactionBuyerCard
 