import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const guestCartKey = 'cartItems_guest';

const getUserCartKey = (userId) => `cartItems_user_${userId}`;

const readCartFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeCartToStorage = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const normalizeCartItem = (item) => ({
  product: item.product,
  name: item.name,
  imageUrl: item.imageUrl,
  price: Number(item.price),
  qty: Number(item.qty),
});

const resolvePrice = (item) => {
  if (item?.showDiscount !== undefined) {
    return item.showDiscount && item.discountedPrice ? item.discountedPrice : item.originalPrice;
  }

  return item?.price;
};

const mergeCarts = (baseItems = [], incomingItems = []) => {
  const merged = [...baseItems.map(normalizeCartItem)];

  incomingItems.map(normalizeCartItem).forEach((incomingItem) => {
    const existingIndex = merged.findIndex((item) => item.product === incomingItem.product);

    if (existingIndex > -1) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        qty: merged[existingIndex].qty + incomingItem.qty,
        price: incomingItem.price,
        imageUrl: incomingItem.imageUrl,
        name: incomingItem.name,
      };
    } else {
      merged.push(incomingItem);
    }
  });

  return merged.filter((item) => item.qty > 0);
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartReady, setCartReady] = useState(false);

  const cartStorageKey = useMemo(() => {
    if (user?._id) {
      return getUserCartKey(user._id);
    }

    return guestCartKey;
  }, [user?._id]);

  useEffect(() => {
    const syncCart = async () => {
      setCartReady(false);

      if (!user?.token || !user?._id) {
        const guestItems = readCartFromStorage(guestCartKey);
        setCartItems(guestItems);
        setCartReady(true);
        return;
      }

      const guestItems = readCartFromStorage(guestCartKey);

      try {
        const { data } = await axios.get('https://niva-handloom-backend.onrender.com/api/cart', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const serverItems = data?.items || [];
        const mergedItems = guestItems.length > 0 ? mergeCarts(serverItems, guestItems) : serverItems;

        setCartItems(mergedItems);
        writeCartToStorage(cartStorageKey, mergedItems);

        if (guestItems.length > 0) {
          writeCartToStorage(guestCartKey, []);
          await axios.put(
            'https://niva-handloom-backend.onrender.com/api/cart',
            { items: mergedItems },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
        }
      } catch (error) {
        const fallbackItems = readCartFromStorage(cartStorageKey);
        setCartItems(fallbackItems);
      } finally {
        setCartReady(true);
      }
    };

    syncCart();
  }, [user?.token, user?._id, cartStorageKey]);

  const persistCart = async (nextItems) => {
    const normalizedItems = nextItems.map(normalizeCartItem).filter((item) => item.qty > 0);
    setCartItems(normalizedItems);
    writeCartToStorage(cartStorageKey, normalizedItems);

    if (user?.token) {
      await axios.put(
        'https://niva-handloom-backend.onrender.com/api/cart',
        { items: normalizedItems },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
    }
  };

  const getItemQuantity = (productId) => cartItems.find((item) => item.product === productId)?.qty || 0;

  const addItem = async (product) => {
    const price = resolvePrice(product);
    const existingIndex = cartItems.findIndex((item) => item.product === product._id);
    let nextItems = [...cartItems];

    if (existingIndex > -1) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        qty: nextItems[existingIndex].qty + 1,
        price,
        name: product.name,
        imageUrl: product.imageUrl,
      };
    } else {
      nextItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price,
        qty: 1,
      });
    }

    await persistCart(nextItems);
  };

  const setItemQuantity = async (product, qty) => {
    const price = resolvePrice(product);
    const productId = product._id || product.product;
    const name = product.name;
    const imageUrl = product.imageUrl;

    let nextItems = cartItems.filter((item) => item.product !== productId);

    if (qty > 0) {
      nextItems = [
        ...nextItems,
        {
          product: productId,
          name,
          imageUrl,
          price,
          qty,
        },
      ];
    }

    await persistCart(nextItems);
  };

  const removeItem = async (productId) => {
    const nextItems = cartItems.filter((item) => item.product !== productId);
    await persistCart(nextItems);
  };

  const clearCart = async () => {
    setCartItems([]);
    writeCartToStorage(cartStorageKey, []);

    if (user?.token) {
      await axios.delete('https://niva-handloom-backend.onrender.com/api/cart', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartReady,
        addItem,
        setItemQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);