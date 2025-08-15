import { createContext, useContext, useEffect, useState } from "react";
import useWallet from "./WalletContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlists, setWishlists] = useState([]);           // string[]
  const [loadingWishlists, setLoadingWishlists] = useState(false);

   const { walletAddress, loading: loadingAddress } = useWallet(); 
   const logged = !!walletAddress && !loadingAddress;


  useEffect(() => {
    if (logged) {
      syncGuestWishlist();
      fetchWishlists();
    } else {
      const guest = JSON.parse(localStorage.getItem("guest_wishlist")) || [];
      setWishlists(guest);  // also string[]
    }
  }, [logged]);

  const fetchWishlists = async () => {
    setLoadingWishlists(true);
    try {
      const res = await fetch(`/api/wishlists?wallet=${walletAddress}`, { credentials: "include" });
      const data = await res.json();
      // data.wishlists should be string[]
      setWishlists(data.wishlists || []);
    } catch (err) {
      console.error("Failed to fetch wishlists:", err);
    } finally {
      setLoadingWishlists(false);
    }
  };

  const syncGuestWishlist = async () => {
    const guest = JSON.parse(localStorage.getItem("guest_wishlist")) || [];
    if (!guest.length) return;

    for (const product_id of guest) {
      await fetch(`/api/add-wishlist?wallet=${walletAddress}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id }),
      });
    }
    localStorage.removeItem("guest_wishlist");
  };

  const addToWishlist = async (product_id) => {
    if (logged) {
      try {
        const res = await fetch(`/api/add-wishlist?wallet=${walletAddress}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product_id }),
        });
        if (res.ok) {
          setWishlists(prev => [...prev, product_id]);
        }
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
      }
    } else {
      const updated = [...wishlists, product_id];
      setWishlists(updated);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
    }
  };

  const removeFromWishlist = async (product_id) => {
    if (logged) {
      try {
        const res = await fetch(`/api/remove-wishlist?wallet=${walletAddress}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product_id }),
        });
        if (res.ok || res.status === 204) {
          setWishlists(prev => prev.filter(id => id !== product_id));
        }
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
      }
    } else {
      const updated = wishlists.filter(id => id !== product_id);
      setWishlists(updated);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
    }
  };

  const isWishlisted = product_id => wishlists.includes(product_id);

  return (
    <WishlistContext.Provider
      value={{
        wishlists,
        loadingWishlists,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        fetchWishlists,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export { WishlistContext };
