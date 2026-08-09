import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const guestWishlistKey = 'wishlistItems_guest';

const getUserWishlistKey = (userId) => `wishlistItems_user_${userId}`;

const readWishlistFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeWishlistToStorage = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const normalizeWishlistIds = (items = []) =>
  [...new Set(items.map((item) => (typeof item === 'object' ? item.product || item._id : item)).filter(Boolean).map(String))];

const mergeWishlists = (baseItems = [], incomingItems = []) =>
  normalizeWishlistIds([...baseItems, ...incomingItems]);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistReady, setWishlistReady] = useState(false);

  const wishlistStorageKey = useMemo(() => {
    if (user?._id) {
      return getUserWishlistKey(user._id);
    }

    return guestWishlistKey;
  }, [user?._id]);

  useEffect(() => {
    const syncWishlist = async () => {
      setWishlistReady(false);

      if (!user?.token || !user?._id) {
        const guestItems = readWishlistFromStorage(guestWishlistKey);
        setWishlistItems(guestItems);
        setWishlistReady(true);
        return;
      }

      const guestItems = readWishlistFromStorage(guestWishlistKey);

      try {
        const { data } = await axios.get('https://niva-handloom-backend.onrender.com/api/wishlist', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const serverItems = data?.items || [];
        const mergedItems = guestItems.length > 0 ? mergeWishlists(serverItems, guestItems) : normalizeWishlistIds(serverItems);

        setWishlistItems(mergedItems);
        writeWishlistToStorage(wishlistStorageKey, mergedItems);

        if (guestItems.length > 0) {
          writeWishlistToStorage(guestWishlistKey, []);
          await axios.put(
            'https://niva-handloom-backend.onrender.com/api/wishlist',
            { items: mergedItems },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
        }
      } catch (error) {
        const fallbackItems = readWishlistFromStorage(wishlistStorageKey);
        setWishlistItems(fallbackItems);
      } finally {
        setWishlistReady(true);
      }
    };

    syncWishlist();
  }, [user?.token, user?._id, wishlistStorageKey]);

  const persistWishlist = async (nextItems) => {
    const normalizedItems = normalizeWishlistIds(nextItems);
    setWishlistItems(normalizedItems);
    writeWishlistToStorage(wishlistStorageKey, normalizedItems);

    if (user?.token) {
      await axios.put(
        'https://niva-handloom-backend.onrender.com/api/wishlist',
        { items: normalizedItems },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
    }
  };

  const isWishlisted = (productId) => wishlistItems.includes(productId);

  const addItem = async (product) => {
    if (!product?._id) {
      return;
    }

    if (isWishlisted(product._id)) {
      return;
    }

    await persistWishlist([...wishlistItems, product._id]);
  };

  const removeItem = async (productId) => {
    await persistWishlist(wishlistItems.filter((item) => item !== productId));
  };

  const toggleItem = async (product) => {
    if (!product?._id) {
      return;
    }

    if (isWishlisted(product._id)) {
      await removeItem(product._id);
      return;
    }

    await addItem(product);
  };

  const clearWishlist = async () => {
    setWishlistItems([]);
    writeWishlistToStorage(wishlistStorageKey, []);

    if (user?.token) {
      await axios.delete('https://niva-handloom-backend.onrender.com/api/wishlist', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistReady,
        isWishlisted,
        addItem,
        removeItem,
        toggleItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);