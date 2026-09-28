'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface CartAlertInfo {
  id: string;
  item: CartItem;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variant_id: string) => void;
  updateQuantity: (variant_id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartAlert: CartAlertInfo | null;
  dismissCartAlert: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartAlert, setCartAlert] = useState<CartAlertInfo | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('anhthu_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse cart from localStorage');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('anhthu_cart', JSON.stringify(cart));
      } catch (e) {
        console.warn('Could not save cart to localStorage');
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.variant_id === newItem.variant_id);
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });

    // UX Optimization: Do not force open the cart drawer!
    // Trigger smooth, non-intrusive alert toast instead
    setCartAlert({
      id: Date.now().toString(),
      item: newItem,
    });
  };

  const dismissCartAlert = () => {
    setCartAlert(null);
  };

  const removeFromCart = (variant_id: string) => {
    setCart((prev) => prev.filter((item) => item.variant_id !== variant_id));
  };

  const updateQuantity = (variant_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variant_id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.variant_id === variant_id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        cartAlert,
        dismissCartAlert,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
