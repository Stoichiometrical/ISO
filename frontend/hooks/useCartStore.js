
import create from "zustand";

// Create a Zustand store for managing the cart state
const useCartStore = create((set) => ({
  cart: {},
  addToCart: (productId, price) =>
    set((state) => ({
      cart: {
        ...state.cart,
        [productId]: {
          quantity: (state.cart[productId]?.quantity || 0) + 1,
          price: price,
        },
      },
    })),
  removeFromCart: (productId) =>
    set((state) => {
      const updatedCart = { ...state.cart };
      if (updatedCart[productId]?.quantity > 0) {
        updatedCart[productId].quantity -= 1;
      }
      return { cart: updatedCart };
    }),
}));

export default useCartStore;
