import { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfUserExists = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length === 0) {
          setWalletAddress(null);
          return;
        }

        const address = accounts[0];
        const res = await fetch(`/api/user-exists/${address}`);
        if (!res.ok) {
          setWalletAddress(null);
        } else {
          setWalletAddress(address);
        }
      } catch (err) {
        setWalletAddress(null);
      } finally {
        setLoading(false);
      }
    };

    checkIfUserExists();
  }, []);

  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => useContext(WalletContext);

// ✅ All exports at the bottom
export { WalletContext, WalletProvider, useWallet };
export default useWallet;
