"use client";

import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import SelectDateButton from "./ui/SelectDateButton";
import CartItemCounter from "./CartItemCounter";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ArrowRight, ShoppingCart, X } from "lucide-react";

import { formatPrice } from "~/lib/utils";

import { type Equipment } from "types/models";
import { type CartItem } from "types/cart";
import { toArgentinaDate } from "~/lib/dates";
import { useEndDate, useStartDate } from "~/stores/date.store";
import { useCartItems, useCartStoreActions, useShowCartModal } from "~/stores/cart.store";

const Cart = ({ trigger }: { trigger?: boolean }) => {
  const showCartModal = useShowCartModal();
  const { setShowCartModal } = useCartStoreActions();

  const router = useRouter();

  const startDate = useStartDate();
  const endDate = useEndDate();

  const cartItems = useCartItems();

  const handleGoToCartPage = () => {
    void router.push("/cart");
    setShowCartModal(false);
  };

  return (
    <Sheet open={showCartModal} onOpenChange={setShowCartModal}>
      {trigger && (
        <SheetTrigger asChild className="p-0">
          <Button className="font-panton flex items-center gap-2" aria-label="shopping-cart-buton">
            <span className="hidden text-base sm:block">CARRITO</span>
            <ShoppingCart className="h-6 w-6 sm:h-4 sm:w-4" />
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="w-full md:w-[400px]">
        <SheetHeader>
          <SheetTitle>MI PEDIDO</SheetTitle>
          <SheetDescription className="grid">
            {!startDate || !endDate ? (
              <SelectDateButton />
            ) : (
              <div className="flex items-center justify-between">
                <p>{toArgentinaDate(startDate)}</p>
                <ArrowRight className="h-4 w-4" /> <p>{toArgentinaDate(endDate)}</p>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="relative flex h-[90%] flex-col gap-3 pt-4">
          <div className="grid gap-6 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div>Tu carrito está vacío. Agrega equipos desde reservas para poder alquilarlos!</div>
            ) : (
              cartItems.map((item) => <CartItem key={item.id} item={item} />)
            )}
          </div>

          <div className="absolute bottom-0 grid w-full gap-2">
            <SheetTrigger asChild className="p-0">
              <Button size="sm" variant="secondary">
                CONTINUAR ALQUILANDO
              </Button>
            </SheetTrigger>
            <Button size="sm" onClick={handleGoToCartPage}>
              VER CARRITO
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

type CartItemProps = {
  item: Equipment;
};

const CartItem = ({ item }: CartItemProps) => {
  const { deleteFromCart } = useCartStoreActions();

  const handleRemoveFromCart = (itemId: string) => {
    deleteFromCart(itemId);
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
