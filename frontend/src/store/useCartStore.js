import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  cartCount: 0,
  
  setCart: (items) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ cart: items, cartCount: count });
  },
  
  addItem: (item) => {
    set((state) => {
      const existing = state.cart.find((i) => i.product_id === item.product_id);
      let newCart;
      
      if (existing) {
        newCart = state.cart.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        newCart = [...state.cart, { ...item, quantity: item.quantity || 1 }];
      }
      
      const count = newCart.reduce((sum, i) => sum + i.quantity, 0);
      return { cart: newCart, cartCount: count };
    });
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => {
      const newCart = state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      const count = newCart.reduce((sum, item) => sum + item.quantity, 0);
      return { cart: newCart, cartCount: count };
    });
  },
  
  removeItem: (id) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.id !== id);
      const count = newCart.reduce((sum, item) => sum + item.quantity, 0);
      return { cart: newCart, cartCount: count };
    });
  },
  
  clearCart: () => {
    set({ cart: [], cartCount: 0 });
  },
}));
