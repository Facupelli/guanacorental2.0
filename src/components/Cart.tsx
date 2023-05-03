import { useBoundStore } from "@/zustand/store";
import { Button } from "./ui/button";
import { Equipment } from "@/types/models";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/router";
import SelectDateButton from "./ui/SelectDateButton";
import CartItemCounter from "./CartItemCounter";

const Cart = () => {
  const router = useRouter();

  const startDate = useBoundStore((state) => state.startDate);
  const endDate = useBoundStore((state) => state.endDate);

  const showCartModal = useBoundStore((state) => state.showCartModal);
  const closeCartModal = useBoundStore((state) => state.setCloseCartModal);

  const cartItems = useBoundStore((state) => state.cartItems);

  const handleGoToCartPage = () => {
    router.push("/cart");
    closeCartModal();
  };
  return (
    <>
      <aside
        className={`fixed  ${
          showCartModal ? "right-0" : "right-[-30vw]"
        } top-[70px] z-20 h-[calc(100vh_-_70px)] w-[25%] bg-white p-4 transition-all duration-300 ease-in-out`}
      >
        <div className="relative flex h-full flex-col gap-3 ">
          <div className="flex items-center justify-between">
            <h1 className="font-bold">MI PEDIDO</h1>
            <button onClick={closeCartModal}>X</button>
          </div>

          {!startDate || !endDate ? (
            <SelectDateButton />
          ) : (
            <div className="flex items-center justify-between">
              <p>{new Date(startDate).toLocaleDateString()}</p>
              <p>{"->"}</p>
              <p>{new Date(endDate).toLocaleDateString()}</p>
            </div>
          )}

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
      </aside>
      <div
        className={`fixed top-[70px] z-10 h-screen w-screen bg-[rgba(0,0,0,0.3)] backdrop-blur-[1px] ${
          showCartModal ? "right-0" : "right-[1000%]"
        }`}
      />
    </>
  );
};

type CartItemProps = {
  item: Equipment;
};

const CartItem = ({ item }: CartItemProps) => {
  const deleteFromCart = useBoundStore((state) => state.deleteFromCart);

  return (
    <div className="p-2 shadow">
      <div className="flex justify-end">
        <button onClick={() => deleteFromCart(item.id)}>X</button>
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
