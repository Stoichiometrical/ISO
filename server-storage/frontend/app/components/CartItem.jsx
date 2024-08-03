import { Button } from "@/components/ui/button";
import useCartStore from "@/hooks/useCartStore";

export default function CartItem({ id, product, qty, total, price }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const cart = useCartStore((state) => state.cart);

  const handleAddToCart = () => {
    addToCart(id, price); // Pass both id and price
  };

  const handleRemoveFromCart = () => {
    removeFromCart(id); // Pass only product id to removeFromCart
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4 ">
      <div className="col-span-2 whitespace-normal overflow-hidden">{product}</div>

      <div className="flex items-center">
        <Button variant="outline" className="mx-3" onClick={handleAddToCart}>
          +
        </Button>
        {qty}
        <Button
          variant="outline"
          className="mx-3"
          onClick={handleRemoveFromCart}
        >
          -
        </Button>
      </div>
      <div className="col-span-1">${total}</div>
    </div>
  );
}
