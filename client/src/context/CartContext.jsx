import React, { createContext, useState } from 'react';
export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const addToCart = (product) => setCart([...cart, { ...product, qty: 1 }]);
  const clearCart = () => setCart([]);
  return <CartContext.Provider value={{ cart, addToCart, clearCart }}>{children}</CartContext.Provider>;
};