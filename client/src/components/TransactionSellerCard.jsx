import { Link } from 'react-router-dom'
import { Fuel, Settings, Heart, HeartOff, Flag, CheckCircle, XCircle, XCircleIcon } from 'lucide-react'
import { useState } from 'react'

import { useContext, useEffect } from "react";
import { toast } from 'sonner';
import LoadingButton from './LoadingButton';
import { Button } from './ui/button';
import { deliver, cancel, claim } from '@/contract/functions';


function TransactionSellerCard ({ transaction_id, buyer, seller, amount, status, status_num, image, product_title }) {
  const [statusNum, setStatusNum] = useState(status_num)
  const [statusText, setStatusText] = useState(status)
  const [loadingDeliver, setLoadingDeliver] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [loadingClaim, setLoadingClaim] = useState(false)

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


  async function handleDeliver() {
    setLoadingDeliver(true)
 
    const { success, ...resData } = await deliver(transaction_id) 

    if (!success) {
      const { errorMessage } = resData;
      toast.error(errorMessage)
      return setLoadingDeliver(false)
    }

    const { E_buyer, E_seller, E_amount } = resData

    try {
      const response = await fetch("/api/update-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          transaction_id: transaction_id,
          new_status: 1
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadingDeliver(false)
        return toast.error(data.message)
      }

      setStatusNum(data.new_status)
      return toast.success("Product delivered successfully.")
    } catch(error) {
      toast.error(error.message || "Something went updating status in db")
    } finally {
      return setLoadingDeliver(false)
    }
  }


  async function handleCancel() {
    setLoadingCancel(true)
 
    const { success, ...resData } = await cancel(transaction_id) 

    if (!success) {
      const { errorMessage } = resData;
      toast.error(errorMessage)
      return setLoadingCancel(false)
    }

    const { E_buyer, E_seller, E_transaction_id } = resData

    try {
      const response = await fetch("/api/update-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          transaction_id: transaction_id,
          new_status: 4
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadingCancel(false)
        return toast.error(data.message)
      }

      setStatusNum(data.new_status)
      return toast.success("Transaction cancelled successfully.")
    } catch(error) {
      toast.error(error.message || "Something went updating status in db")
    } finally {
      return setLoadingCancel(false)
    }
  }


  async function handleClaim() {
    setLoadingClaim(true)
 
    const { success, ...resData } = await claim(transaction_id) 

    if (!success) {
      const { errorMessage } = resData;
      toast.error(errorMessage)
      return setLoadingClaim(false)
    }

    const { E_buyer, E_seller, E_transaction_id } = resData

    try {
      const response = await fetch("/api/update-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          transaction_id: transaction_id,
          new_status: 5
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoadingClaim(false)
        return toast.error(data.message)
      }

      setStatusNum(data.new_status)
      return toast.success("Funds claimed successfully!")
    } catch(error) {
      toast.error(error.message || "Something went updating status in db")
    } finally {
      return setLoadingClaim(false)
    }
  }


  return (
    <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Transaction ID: {transaction_id}</h3>
        <p className="text-xl font-semibold text-primary">{amount} ETH</p>
        <p className="text-xl font-semibold text-primary">{product_title}</p>

        <div className="flex flex-wrap gap-2 text-sm mt-2">
          {buyer && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              Buyer: {buyer}
            </span>
          )}
        </div>

        {statusNum === 0 
        ?
          <Button
            onClick={handleDeliver}
            disabled={loadingDeliver}
          >
            {loadingDeliver ? <LoadingButton /> : "Deliver"}
          </Button>
        :  statusNum === 1 ?
          <p>Waiting for user to confirm.</p>
        : statusNum === 2 ?
          <Button onClick={handleClaim} disabled={loadingClaim}>
            {loadingClaim ? <LoadingButton /> : "Claim Funds"}
          </Button>
        : statusNum === 3 ?
          <Button onClick={handleCancel} disabled={loadingCancel}>
            {loadingCancel ? <LoadingButton /> : "Confirm Return"}
          </Button>
        : statusNum === 4 ?
          <XCircle color={"red"} />
        : statusNum === 5 ?
        <CheckCircle color={"#32CD32"}  />
        : 
          null
        }
      </div>
    </div>
  )
}

export default TransactionSellerCard
 