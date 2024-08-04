import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ShoppingCart } from "lucide-react";
import CartItem from "@/app/components/CartItem";
import { Separator } from "@radix-ui/react-dropdown-menu";
import useCartStore from "@/hooks/useCartStore";
import useDataStore from "@/hooks/useDataStore";
import {API_1, API_URL, getCookie, getProjectName} from "@/lib/utils";
import {useEffect, useState} from "react";


export function ShoppingCartButton() {
  const cartItems = useCartStore((state) => state.cart); // Get cart items from the store
  const data = useDataStore((state) => state.data);
  const bundles = useDataStore((state) => state.bundles);
  const api_name = getCookie()
  const projectName = getProjectName('project_name');
  const [discountMessage, setDiscountMessage] = useState('');
  const [loyaltyPointsMessage, setLoyaltyPointsMessage] = useState('');

  const cartItemList = Object.keys(cartItems).map((productId) => {
    let product;
    let isBundle = false;

    // Check if the product exists in data
    product = data.find((item) => item.id === productId);

    // If the product doesn't exist in data, check in bundles
    if (!product) {
      product = bundles.find((item) => item.id === productId);
      isBundle = true; // Set a flag to indicate that this is a bundle
    }

    const quantity = cartItems[productId];
    return {
      id: productId,
      product: product ? (isBundle ? product.bundle : product.Description) : "", // Assuming the bundle name is in the 'bundle' field
      qty: cartItems[productId], // Assuming qty is now just a number
      total: product ? (quantity.price * quantity.quantity).toFixed(2) : 0,
    };
  });

  // console.log("Cart Items: ", cartItems);
  // console.log("Cart ItemList: ", cartItemList);

  // Calculate total price
  const totalPrice = cartItemList.reduce((acc, item) => acc + parseFloat(item.total), 0).toFixed(2);
  console.log(totalPrice)

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const response = await fetch(`${API_1}/apply_discount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_price: parseFloat(totalPrice),
            api_name: api_name,
            project_name: projectName
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data)
          const { discounted_price, message,loyalty_points_message } = data;

          if (parseFloat(discounted_price) === parseFloat(totalPrice)) {
            const nextTierAmount = message.match(/spend \$([\d.]+)/);
            const nextTierInfo = message.match(/to qualify for (.+)$/);
            setDiscountMessage(`No discount applied. Spend $${nextTierAmount[1]} to qualify for ${nextTierInfo[1]}`);
          } else {
            setDiscountMessage(message);
          }
          if (loyalty_points_message) {
            setLoyaltyPointsMessage(loyalty_points_message);
          }
        } else {
          setDiscountMessage('Failed to fetch discount information');
        }
      } catch (error) {
        console.error('Error fetching discount:', error);
        setDiscountMessage('An error occurred while fetching discount information');
      }
    };

    if (totalPrice > 0) {
      fetchDiscount();
    }
  }, [totalPrice]);

  return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="ml-auto bg-green-400 text-white">
            View Cart
            <ShoppingCart className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-200 max-w-[700px]">
          <div className="grid gap-4 ">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Items In This Cart</h4>
            </div>
            <hr className="bg-gray-100 w-full" />
            <div className="grid gap-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-2">Product Desc</div>
                <div className="flex items-center">Quantity</div>
                <div className="">Total</div>
              </div>

              {cartItemList
                  .filter((item) => item.qty.quantity > 0) // Filter out items with quantity zero
                  .map((item) => (
                      <CartItem
                          key={item.id}
                          id={item.id}
                          product={item.product}
                          qty={item.qty.quantity}
                          price={item.qty.price}
                          total={(item.qty.quantity * item.qty.price).toFixed(2)}
                      />
                  ))}
              <Separator />
              <hr className="bg-gray-100 w-full" />

              <div className="my-2">PROMOTIONS AVAILABLE FOR YOU</div>
              <div>{discountMessage}</div>
              {loyaltyPointsMessage && (
                  <div>{loyaltyPointsMessage}</div>
              )}

              <Separator />
              <hr className="bg-gray-100 w-full" />
              <div className="flex justify-between">
                <div className="text-xl px-2 text-gray-500">Total</div>
                <div className="px-2 font-bold text-2xl">${totalPrice}</div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
  );
}



