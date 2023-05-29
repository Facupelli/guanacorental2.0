import { useRouter } from "next/router";
import { useBoundStore } from "@/zustand/store";

import { Button } from "./ui/button";
import SelectDateButton from "./ui/SelectDateButton";
import CartItemCounter from "./CartItemCounter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ArrowRight, ShoppingCart, X } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";

import { type Equipment } from "@/types/models";
import { type Dispatch, type SetStateAction } from "react";
import { type CartItem } from "@/types/cart";

const Cart = ({
  trigger,
  open,
  setOpen,
}: {
  trigger?: boolean;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();

  const { sheetSize } = useScreenSize();

  const startDate = useBoundStore((state) => state.startDate);
  const endDate = useBoundStore((state) => state.endDate);

  const cartItems = useBoundStore((state) => state.cartItems);

  const handleGoToCartPage = () => {
    void router.push("/cart");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && (
        <SheetTrigger asChild className="p-0">
          <Button className="flex items-center gap-2 font-panton">
            <span className="hidden text-base sm:block">CARRITO</span>
            <ShoppingCart className="h-6 w-6 sm:h-4 sm:w-4" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent position="right" size={sheetSize}>
        <SheetHeader>
          <SheetTitle>MI PEDIDO</SheetTitle>
          <SheetDescription className="grid">
            {!startDate || !endDate ? (
              <SelectDateButton />
            ) : (
              <div className="flex items-center justify-between">
                <p>{new Date(startDate).toLocaleDateString()}</p>
                <ArrowRight className="h-4 w-4" />{" "}
                <p>{new Date(endDate).toLocaleDateString()}</p>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="relative flex h-[90%] flex-col gap-3 pt-4">
          <div className="grid gap-6 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div>
                Tu carrito está vacío. Agrega equipos desde reservas para poder
                alquilarlos!
              </div>
            ) : (
              cartItems.map((item) => <CartItem key={item.id} item={item} />)
            )}
          </div>

          <div className="absolute bottom-0 grid w-full ">
            <Button size="sm" onClick={handleGoToCartPage}>
              VER CARRITO
            </Button>
          </div>
        </div>

        {/* <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
};

type CartItemProps = {
  item: Equipment;
};

const CartItem = ({ item }: CartItemProps) => {
  const deleteFromCart = useBoundStore((state) => state.deleteFromCart);

  const handleRemoveFromCart = (itemId: string) => {
    deleteFromCart(itemId);

    //LOCALSTORAGE
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      const updatedCart = JSON.parse(localCart).filter(
        (localItem: CartItem) => localItem.id !== item.id
      );
      localStorage.setItem("cart", JSON.stringify([...updatedCart]));
    }
  };

  return (
    <div className="rounded-md bg-secondary/50 p-4 shadow">
      <div className="flex justify-end">
        <button onClick={() => handleRemoveFromCart(item.id)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <p>{item.name}</p>
        <p>{item.brand}</p>
      </div>
      <p>{item.model}</p>

      <div className="flex items-center justify-between pt-2">
        <div>
          <CartItemCounter item={item} />
        </div>
        <p className="font-semibold">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
};

export default Cart;
