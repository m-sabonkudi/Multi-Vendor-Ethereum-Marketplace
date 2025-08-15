import { ethers } from "ethers";
import abi from "./abi";

const CONTRACT_ADDRESS = "0xca5c9a13495152AB6390d0A26715fF56db404B36";

let contract;


async function initContract() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum); // ✅ v6
  const signer = await provider.getSigner(); // ✅ Must await in v6
  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  console.log("Contract loaded:", contract);
}

async function buy(price, seller, product_id) {
  if (!contract) {
    await initContract(); // ensure contract is initialized 
  }

//   const owner = await contract.owner(); // example read
//   alert(`Contract owner: ${owner}`);

  const ethValue = ethers.parseEther(price.toString())
  const testVal = ethers.parseEther((0.00001).toString())
  console.log('making...')
  
  // const tx = await contract.makeTransaction(ethValue, seller, { value: testVal })
  try {
  await contract.makeTransaction.staticCall(ethValue, seller, { value: ethValue });

  } catch(error) {
      console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }
  
  try {
    var tx = await contract.makeTransaction(ethValue, seller, { value: ethValue });
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }

  }

  console.log('made.')
  const receipt = await tx.wait()

  console.log("receipt: ")
  console.log(receipt)

  // Decode logs into readable events using contract interface
    const decodedLogs = receipt.logs.map(log => {
        try {
        return contract.interface.parseLog(log);
        } catch (e) {
        return null; // skip logs that don't belong to your contract
        }
    })
    .filter(event => event); // remove nulls

    console.log("logs: ")
    console.log(decodedLogs)
  
  for (const event of decodedLogs) {
    if (event.name === "NewTransaction") {
        var { transaction_id: E_transaction_id, buyer: E_buyer, seller: E_seller, amount: E_amount } = event.args;
        console.log("TransactionMade Event:");
        console.log("ID:", E_transaction_id.toString());
        console.log("Buyer:", E_buyer);
        console.log("Seller:", E_seller);
        console.log("Amount:", E_amount.toString());

        return {success: true, E_transaction_id, E_buyer, E_seller, E_amount: ethers.formatEther(E_amount), product_id }
    }
  }

}


async function deliver(transaction_id) {
  if (!contract) {
    await initContract()
  }
  
  try {
    await contract.deliver.staticCall(transaction_id);
  } catch(error) {
      console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.deliver(transaction_id)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

   const decodedLogs = receipt.logs.map(log => {
        try {
        return contract.interface.parseLog(log);
        } catch (e) {
        return null; // skip logs that don't belong to your contract
        }
    })
    .filter(event => event); // remove nulls

    console.log("logs: ")
    console.log(decodedLogs)
  
    for (const event of decodedLogs) {
      if (event.name === "Delivered") {
          var { buyer: E_buyer, seller: E_seller, amount: E_amount } = event.args;
          console.log("Delivered Event:");
          console.log("Buyer:", E_buyer);
          console.log("Seller:", E_seller);
          console.log("Amount:", E_amount.toString());

          return { success: true, E_buyer, E_seller, E_amount: ethers.formatEther(E_amount) }
      }
    }

}


async function confirm(transaction_id) {
  if (!contract) {
    await initContract()
  }

  try {
  await contract.satisfy.staticCall(transaction_id);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.satisfy(transaction_id)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "TransactionConfirmed") {
        var { buyer: E_buyer, seller: E_seller, amount: E_amount } = event.args;
        console.log("Confirmed Event:");
        console.log("Buyer:", E_buyer);
        console.log("Seller:", E_seller);
        console.log("Amount:", E_amount.toString());

        return { success: true, E_buyer, E_seller, E_amount: ethers.formatEther(E_amount) }
    }
  } 
}


async function dispute(transaction_id) {
  if (!contract) {
    await initContract()
  }

  try {
  await contract.dispute.staticCall(transaction_id);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.dispute(transaction_id)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "BuyerDisputed") {
        var { buyer: E_buyer, seller: E_seller, transactionId: E_transaction_id } = event.args;
        console.log("Disputed Event:");
        console.log("Buyer:", E_buyer);
        console.log("Seller:", E_seller);
        console.log("Transaction ID:", E_transaction_id);

        return { success: true, E_buyer, E_seller, E_transaction_id }
    }
  } 
}


async function cancel(transaction_id) {
  if (!contract) {
    await initContract()
  }

  try {
  await contract.sellerConfirm.staticCall(transaction_id);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.sellerConfirm(transaction_id)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "SellerConfirmed") {
        var { buyer: E_buyer, seller: E_seller, transactionId: E_transaction_id } = event.args;
        console.log("Disputed Event:");
        console.log("Buyer:", E_buyer);
        console.log("Seller:", E_seller);
        console.log("Transaction ID:", E_transaction_id);

        return { success: true, E_buyer, E_seller, E_transaction_id }
    }
  } 
}


async function claim(transaction_id) {
  if (!contract) {
    await initContract()
  }

  try {
  await contract.claim.staticCall(transaction_id);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        if (decoded.name === "WaitPeriodNotPassed") {
          const { requiredTime, currentTime } = decoded.args;

          // Make sure `now` is also a BigInt
          const now = BigInt(Math.floor(Date.now() / 1000));

          // Calculate remaining time as BigInt
          const remaining = requiredTime - now;

          // Convert to Number for display (safe if not too large)
          const remainingSeconds = Number(remaining);
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;

          const message = `Wait time remaining: ${hours}h ${minutes}m `;
          console.log(message);

                  
          return {success: false, errorMessage: message}
        }
        return {success: false, errorMessage: `${decoded.name}`}
      } catch(error) {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: error.message || "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.claim(transaction_id)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "SellerClaimed") {
        var { buyer: E_buyer, seller: E_seller, transactionId: E_transaction_id } = event.args;
        console.log("Disputed Event:");
        console.log("Buyer:", E_buyer);
        console.log("Seller:", E_seller);
        console.log("Transaction ID:", E_transaction_id);

        return { success: true, E_buyer, E_seller, E_transaction_id }
    }
  } 
}


async function toggleAutoWithdraw(value) {
  if (!contract) {
    await initContract()
  }

  try {
  await contract.setAutoWithdraw.staticCall(value);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.setAutoWithdraw(value)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "AutoWithdrawSet") {
        var { user: E_user, status: E_status } = event.args;
        console.log("AutoWithdrawSet Event:");
        console.log("User:", E_user);
        console.log("Status:", E_status);

        return { success: true, E_user, E_status }
    }
  } 
}


async function withdraw(amount) {
  if (!contract) {
    await initContract()
  }

  const ethAmount = ethers.parseEther(amount.toString())

  try {
  await contract.withdraw.staticCall(ethAmount);
  } catch(error) {
    console.log("Custom error caught (static call)");

    // Get raw error data
    const errorData = error?.error?.data || error?.data;
    if (errorData) {
      try {
        const decoded = contract.interface.parseError(errorData);
        console.log("Decoded Custom Error:", decoded.name);
        console.log("Arguments:", decoded.args);
        return {success: false, errorMessage: `${decoded.name}`}
      } catch {
        console.log("Couldn't decode error.");
        return {success: false, errorMessage: "Couldn't decode error."}
      }
    } else {
      console.log("No error data returned.");
      return {success: false, errorMessage: "No error data returned."}
    }
  }

  try {
    var tx = await contract.withdraw(ethAmount)
  } catch(error) {
    if (error.code === "ACTION_REJECTED") {
      return {success: false, errorMessage: "User rejected action."}
    } else if (error.message?.includes("MetaMask") && error.message?.includes("Failed to fetch")) {
      return {success: false, errorMessage: "Failed to fetch. Please check internet connection and retry."}
    } else {
      const message = 
        error?.shortMessage ||  // ethers v6 custom error message
        error?.reason ||       // general revert reason
        error?.message ||   // fallback message
        'Unknown error occurred'

      console.log(`Transaction failed: ${message}`)
      return { success: false, errorMessage: `Transaction failed: ${message}`}
    }
  }


  const receipt = await tx.wait()

  const decodedLogs = receipt.logs.map(log => {
    try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null; // skip logs that don't belong to your contract
      }
  }).filter(event => event); // remove nulls

  console.log("logs: ")
  console.log(decodedLogs)

  for (const event of decodedLogs) {
    if (event.name === "WithdrawalSuccessful") {
        var { account: E_user, amount: E_amount, newBalance: E_newBalance } = event.args;
        console.log("WithdrawalSuccessful Event:");
        console.log("User:", E_user);
        console.log("Amount:", E_amount);
        console.log("New Bal:", E_newBalance);

        return { success: true, E_user, E_amount, E_newBalance }
    }
  } 
}

// async function getAutoWithdrawStatus(address) {
  
//   const ALCHEMY_API_URL = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
//   const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

//   const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

//   const status = await contract.getAutoWithdraw(address);
//   console.log(`Status of ${address}:`, status);
//   return { status } 
  
// }

// async function getbalance(address) {

//   const ALCHEMY_API_URL = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
//   const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

//   const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

//   const balance = await contract.balanceOf(address);
//   console.log(`Balance of ${address}:`, balance.toString());
//   return { balance: ethers.formatEther(balance.toString()) } 
  
// }


export { buy, deliver, confirm, dispute, cancel, claim, toggleAutoWithdraw, withdraw };
