# Pyman — Multi-Vendor Ethereum Vehicle Marketplace

> A friendly, secure marketplace where people buy and sell vehicles using Ethereum. Pyman pairs a clean shopping experience with on-chain escrow so buyers and sellers transact with confidence.

## [📄 View Flowchart PDF](assets/flowchart.pdf)

## Table of Contents

- [About](#about)
- [Why Pyman?](#why-pyman)
- [Key Features](#key-features)
- [How It Works (user flow)](#how-it-works-user-flow)
- [Screenshots](#screenshots)
- [Getting Started (for users)](#getting-started-for-users)
- [For Vendors](#for-vendors)
- [Tech Stack (short)](#tech-stack-short)
- [License & Contact](#license--contact)
- [Contract ABI](#contract-abi)


---

## About

Pyman is a product-focused marketplace built for buying and selling vehicles with Ethereum-powered escrow. It hides blockchain complexity behind a modern storefront, letting users browse vehicles, make purchases with their wallet, and rely on smart contracts to hold funds until the sale is complete.

---

## Why Pyman?

- **Trust:** Payments go into a smart contract escrow until buyers confirm delivery.
- **Simple UX:** A marketplace feel — browse brands, filter vehicles, save favorites — with wallet integration.
- **Fairness:** Built-in dispute and refund flows protect both buyers and sellers.

---

## Key Features

- Browse vehicles by brand, mileage, newest listings, and more.
- Wishlist / favorites and a clear product page for every vehicle.
- On-chain escrow: funds are locked in a smart contract during the transaction.
- Clear on-chain transaction states: _initiated → delivered → confirmed → claimed_ (or _disputed_).
- Dispute system and return/refund flow.
- Vendor dashboard to manage listings and claims.

---

## How It Works (user flow)

A friendly breakdown of what happens when a buyer and vendor transact:

1. **Make a Purchase**

   - Buyer clicks _Buy_ on a vehicle and signs a transaction.
   - The marketplace calls the smart contract to create a transaction record `transaction(productPrice, seller)`, sets the transaction status as `Status.Pending` and returns a `txn_id`.
   - Funds (ETH) are placed into escrow by the contract.

2. **Vendor Delivers Product**

   - When the vendor ships/delivers the vehicle, they call `deliver(txn_id)`.
   - Contract updates the transaction status to `Status.Delivered` and emits a `Delivered` event.

3. **Buyer Confirms Delivery**

   - After receiving the vehicle, the buyer calls `satisfy(txn_id)` (confirm).
   - Contract updates the transaction status to `Status.Delivered`, emits `TransactionConfirmed` and the transaction moves toward settlement.

4. **Vendor Claims Funds**

   - Vendor calls `claim(txn_id)` to withdraw the escrowed ETH once the transaction is confirmed.
     - If 24 hrs **have not** passed since the transaction was confirmed, then `revert WaitPeriodHasNotPassed`
     - Else if 24 hrs **have** passed since the transaction was confirmed;
       - If the transaction status is `Status.Confirmed`;
         - Contract updates the transaction status to `Status.Delivered`, sends ETH to vendor and emits `SellerClaimed`.
       - Else revert transaction_status

5. **If Buyer Disputes**

   - If an issue appears (e.g., mismatch, damage) the buyer can call `dispute(txn_id)`.
     - If 24 hrs **have** passed since the transaction was confirmed, then `revert WaitPeriodHasPassed`
     - Else if 24 hrs **have not** passed since the transaction was confirmed;
       - Contract sets status to `Status.Disputed` and emits `BuyerDisputed`. This prevents the vendor from claiming the funds (currently in escrow).

6. **Return / Refund**
   - If the vendor confirms the product return, the vendor calls `sellerConfirm(txn_id)` to confirm seller side and trigger refund.
   - Contract returns ETH to buyer and emits `SellerConfirmed`.

This flow keeps both parties protected and auditable on-chain.

---

## Screenshots

(From the app wireframes / UI images included in the repo.)

- Home / Browse: ![Home](assets/home.png)
- Make a Purchase / Transaction creation: ![Home](assets/home.png)
- Vendor marks Delivered: ![Deliver](/assets/pdf_images/page3_img1.png)
- Buyer confirms: ![Confirm](/assets/pdf_images/page4_img1.png)
- Vendor claims funds: ![Claim](/assets/pdf_images/page5_img1.png)
- Dispute flow: ![Dispute prompt](/assets/pdf_images/page6_img1.png)
- Buyer disputes: ![Dispute action](/assets/pdf_images/page7_img1.png)
- Confirm return / refund: ![Return](/assets/pdf_images/page8_img1.png)

---

## Getting Started (for users)

These steps are written for shoppers who want to use the Pyman marketplace.

### 1. Prepare your wallet

- Install the MetaMask web3 wallet extension in your browser.
- Connect your wallet to the correct network (the app should indicate if it’s a testnet or mainnet).

### 2. Browse and choose

- Browse vehicles by brand, mileage, or newest listings.
- Save favorites to your wishlist.

### 3. Buy with confidence

- Click **Buy**, approve the transaction in your wallet. The smart contract will hold funds in escrow.
- Wait for the vendor to deliver to you.

### 4. Confirm or dispute

- When you receive the vehicle, confirm delivery of the order.
  - If there’s an issue, dispute the transaction **within 24 hrs** after confirming delivery — this will pause the vendor’s ability to claim funds and trigger dispute resolution steps.

---

## For Vendors

- Create accurate listings with photos, mileage, and clear descriptions.
- When ready to deliver, call the `deliver` flow in the app to mark the item as shipped/delivered.
- After the buyer confirms delivery, wait for 24 hrs, (if the buyer didn't dispute) you will then be claim your funds using the `claim` flow.
- If the buyer disputed, wait to get product return, then use the `sellerConfirm` step to process refunds as needed.

---

## Tech Stack (short)

- Frontend: React.js, Tailwind, Shadcn... <br>
  Wallet integration: Ethers.js v6
- Backend: Python / Flask
- Smart Contracts: Solidity (escrow, transaction lifecycle)
- Deployment: Sepolia testnet

---

## License & Contact

- **License:** MIT
- **Contact / Team:** mlawalskudi@gmail.com - https://linkedin.com/in/msabonkudi

---

## How to set up on your PC or Mac

### Cloning

To clone, run `git clone https://github.com/m-sabonkudi/Multi-Vendor-Ethereum-Marketplace.git`

### Running on PC or Mac

First, go into the project directory `cd Multi-Vendor-Ethereum-Marketplace`

---
#### Set up Flask
Create a new virtual environment: `cd server` -> `python -m venv venv` (windows) or `python3 -m venv venv` (mac)

You should now have a folder named venv in your flask directory containing the virtual environment.

Activate the just-created virtual environment: `venv\Scripts\activate` (windows) or `source venv/bin/activate` (mac)

Install required python libraries: `pip install -r requirements.txt` (windows) or `pip3 install -r requirements.txt` (mac)

---
#### Set up React
Install react dependencies: `cd client` -> `npm install`

---
#### Run Flask
`python app.py` (windows) or `python3 app.py` (mac)

---
#### Run React
`npm run dev`


Now you can go to this link in your browser: 🟢 [http://localhost:3051](http://localhost:3051)

---

## Contract ABI

```json
[
   {
      "inputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"constructor"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"required",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"sent",
            "type":"uint256"
         }
      ],
      "name":"InsufficientAmount",
      "type":"error"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"balance",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"requestedAmount",
            "type":"uint256"
         }
      ],
      "name":"InsufficientBalance",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"NotBuyer",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"NotSeller",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"ReentrancyGuardReentrantCall",
      "type":"error"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"idPassed",
            "type":"uint256"
         }
      ],
      "name":"Transaction404",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionAlreadyConfirmed",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionCancelled",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionDelivered",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionDisputed",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionFinalized",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionNotDisputed",
      "type":"error"
   },
   {
      "inputs":[
         
      ],
      "name":"TransactionPending",
      "type":"error"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"currentTime",
            "type":"uint256"
         }
      ],
      "name":"WaitPeriodHasPassed",
      "type":"error"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"requiredTime",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"currentTime",
            "type":"uint256"
         }
      ],
      "name":"WaitPeriodNotPassed",
      "type":"error"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"user",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"bool",
            "name":"status",
            "type":"bool"
         }
      ],
      "name":"AutoWithdrawSet",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"account",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"previousBalance",
            "type":"uint256"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"newBalance",
            "type":"uint256"
         }
      ],
      "name":"BalanceUpdated",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"transactionId",
            "type":"uint256"
         }
      ],
      "name":"BuyerDisputed",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
         }
      ],
      "name":"Delivered",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"transaction_id",
            "type":"uint256"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
         }
      ],
      "name":"NewTransaction",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"transactionId",
            "type":"uint256"
         }
      ],
      "name":"SellerClaimed",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"transactionId",
            "type":"uint256"
         }
      ],
      "name":"SellerConfirmed",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":false,
            "internalType":"address",
            "name":"user",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amountSent",
            "type":"uint256"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amountExpected",
            "type":"uint256"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amountRefunded",
            "type":"uint256"
         }
      ],
      "name":"SurplusRefund",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"cancelledAt",
            "type":"uint256"
         }
      ],
      "name":"TransactionCancelledEvent",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "indexed":true,
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
         }
      ],
      "name":"TransactionConfirmed",
      "type":"event"
   },
   {
      "anonymous":false,
      "inputs":[
         {
            "indexed":true,
            "internalType":"address",
            "name":"account",
            "type":"address"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
         },
         {
            "indexed":false,
            "internalType":"uint256",
            "name":"newBalance",
            "type":"uint256"
         }
      ],
      "name":"WithdrawalSuccessful",
      "type":"event"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"_account",
            "type":"address"
         }
      ],
      "name":"balanceOf",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"balance",
            "type":"uint256"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_transactionId",
            "type":"uint256"
         }
      ],
      "name":"claim",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_transactionId",
            "type":"uint256"
         }
      ],
      "name":"deliver",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_transactionId",
            "type":"uint256"
         }
      ],
      "name":"dispute",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"_address",
            "type":"address"
         }
      ],
      "name":"getAutoWithdraw",
      "outputs":[
         {
            "internalType":"bool",
            "name":"",
            "type":"bool"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_productPrice",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"_seller",
            "type":"address"
         }
      ],
      "name":"makeTransaction",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"",
            "type":"uint256"
         }
      ],
      "stateMutability":"payable",
      "type":"function"
   },
   {
      "inputs":[
         
      ],
      "name":"owner",
      "outputs":[
         {
            "internalType":"address",
            "name":"",
            "type":"address"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_transactionId",
            "type":"uint256"
         }
      ],
      "name":"satisfy",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_transactionId",
            "type":"uint256"
         }
      ],
      "name":"sellerConfirm",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"bool",
            "name":"_value",
            "type":"bool"
         }
      ],
      "name":"setAutoWithdraw",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"",
            "type":"uint256"
         }
      ],
      "name":"transactions",
      "outputs":[
         {
            "internalType":"address",
            "name":"buyer",
            "type":"address"
         },
         {
            "internalType":"address",
            "name":"seller",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"confirmedAt",
            "type":"uint256"
         },
         {
            "internalType":"enum Ecommerce.Status",
            "name":"status",
            "type":"uint8"
         },
         {
            "internalType":"bool",
            "name":"exists",
            "type":"bool"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         
      ],
      "name":"transactions_count",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"",
            "type":"uint256"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"_amount",
            "type":"uint256"
         }
      ],
      "name":"withdraw",
      "outputs":[
         
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   }
]
```

[↑ Back to Table of Contents](#table-of-contents)