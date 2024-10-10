import { type UseFormRegister, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { type NextPage } from "next";
import { useRouter } from "next/navigation";
import Head from "next/head";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

import Nav, { FacebookButton, GoogleButton } from "@/components/Nav";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import SelectDateButton from "@/components/ui/SelectDateButton";
import DialogWithState from "@/components/DialogWithState";
import { DialogFooter } from "@/components/ui/dialog";
import CartItemCounter from "@/components/CartItemCounter";
import { Info, Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddCoupon from "@/components/AddCoupon";

import {
  disableWeekend,
  getDatesInRange,
  getTotalWorkingDays,
  toArgentinaDate,
} from "@/lib/dates";
import { api } from "@/utils/api";
import {
  calcaulateCartTotal,
  calculateTotalWithDiscount,
  formatPrice,
  getIsAdmin,
  getIsEmployee,
  isEquipmentAvailable,
} from "@/lib/utils";

import type { Equipment, Location } from "@/types/models";
import Link from "next/link";
import { LocationName } from "@/lib/magic_strings";
import MendozaAlert from "@/components/MendozaAlert";
import { useMendozaAlert } from "@/hooks/useMendozaAlert";
import { useCartItems, useCartStoreActions } from "stores/cart.store";
import { useEndDate, usePickupHour, useStartDate } from "stores/date.store";
import { useLocation } from "stores/location.store";

type Discount = {
  value: number;
  typeName: string;
  code: string;
};

const loginError = "Debes iniciar sesión para realizar una reserva.";
const noPetitionSentError =
  "No has enviado el alta de cliente. Para poder alquilar equipos es necesario llenar el formulario de alta de cliente.";

const CartPage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const { register, getValues } = useForm<{
    message: string;
    email?: string;
  }>();

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setErrorModal] = useState(false);
  const [error, setError] = useState("");

  const cartItems = useCartItems();
  const { emptyCart } = useCartStoreActions();

  const startDate = useStartDate();
  const endDate = useEndDate();
  const location = useLocation();
  const pickupHour = usePickupHour();

  const { showMendozaModal, setShowMendozaModal } = useMendozaAlert({
    location,
  });

  const { mutate, isLoading } = api.order.createOrder.useMutation();

  const workingDays = useMemo(() => {
    if (startDate && endDate) {
      const datesInRange = getDatesInRange(startDate, endDate);
      return getTotalWorkingDays(datesInRange, pickupHour);
    }
    return undefined;
  }, [startDate, endDate, pickupHour]);

  const subtotal = calcaulateCartTotal(cartItems, workingDays);

  const cartTotal = useMemo(() => {
    if (workingDays) {
      const total = subtotal;
      if (discount) {
        return calculateTotalWithDiscount(total, discount);
      }

      return total;
    }
    return 0;
  }, [workingDays, discount, subtotal]);

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  const handleBookOrder = () => {
    if (!session?.user) {
      setError(loginError);
      setErrorModal(true);
      return;
    }

    if (!startDate || !endDate || !workingDays) {
      return;
    }

    if (!session.user.petitionSent) {
      setError(noPetitionSentError);
      setErrorModal(true);
      return;
    }

    if (!session.user.customerApproved) {
      setError("Tu alta de cliente todavía no fue aprobada");
      setErrorModal(true);
      return;
    }

    if (location.name === LocationName.MENDOZA) {
      setShowMendozaModal(true);
      return;
    }

    const message = getValues("message");
    const email = getValues("email");

    const cart = cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      owner: item.owner?.map((owner) => ({
        id: owner.id,
        ownerId: owner.ownerId,
        onwerName: owner.owner?.name,
        stock: owner.stock,
        locationId: owner.locationId,
      })),
    }));

    mutate(
      {
        discount,
        startDate,
        endDate,
        locationId: location.id,
        customerId: session.user.id,
        pickupHour,
        subtotal,
        total: cartTotal,
        message,
        cart,
        workingDays,
        email: email ? email : null,
      },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
          emptyCart();
        },
        onError: (err) => {
          setError(err.message);
          setErrorModal(true);
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Guanaco Rental</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/logo-favicon.ico" />
      </Head>

      {/* ----- MENDOZA ALERT ----------- */}
      <MendozaAlert open={showMendozaModal} setOpen={setShowMendozaModal} />
      {/* ----- MENDOZA ALERT ----------- */}

      <DialogWithState
        isOpen={showSuccessModal}
        title="Pedido realizado con éxito"
      >
        <div>
          <p>Te enviamos un correo con todos los datos del pedido.</p>
          <p>
            Te esperamos el{" "}
            <strong>
              {startDate?.toLocaleDateString("es-AR", {
                year: "numeric",
                day: "numeric",
                month: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              })}
            </strong>{" "}
            a las <strong>{pickupHour}hs</strong> por el rental!
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              void router.push("/");
            }}
          >
            ACEPTAR
          </Button>
        </DialogFooter>
      </DialogWithState>

      <DialogWithState
        title="Ocurrió un error"
        isOpen={showErrorModal}
        setOpen={setErrorModal}
      >
        <p>{error}</p>
        {error === noPetitionSentError && (
          <Link
            href="/new-user"
            className="font-semibold text-primary hover:underline"
          >
            ir al alta
          </Link>
        )}
        {error === loginError && (
          <div className="grid gap-2">
            <GoogleButton />
            <FacebookButton />
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={() => {
              setErrorModal(false);
              setError("");
            }}
          >
            ACEPTAR
          </Button>
        </DialogFooter>
      </DialogWithState>

      <Nav />

      <main className="min-h-screen bg-app-bg px-4 pt-[70px] sm:px-6">
        <div className="mx-auto max-w-7xl py-8 sm:pt-12">
          <section className="grid grid-cols-12 gap-y-12 sm:gap-x-8 sm:gap-y-0">
            <section className="col-span-12 sm:col-span-8">
              <div className="hidden grid-cols-12 pb-6 text-primary/60 sm:grid">
                <p className="col-span-7">Equipos</p>
                <p className="col-span-2">Cantidad</p>
                <p className="col-span-2">Precio</p>
              </div>
              <ItemsList
                items={cartItems}
                startDate={startDate}
                endDate={endDate}
              />
            </section>
            <RightBar
              location={location}
              pickupHour={pickupHour}
              cartTotal={cartTotal}
              register={register}
              handleBookOrder={handleBookOrder}
              isLoading={isLoading}
              cart={cartItems}
              isAdmin={isAdmin}
              isEmployee={isEmployee}
              setDiscount={setDiscount}
              discount={discount}
              subtotal={subtotal}
            />
          </section>
        </div>
      </main>
    </>
  );
};

type ItemsListProps = {
  items: Equipment[];
  startDate: Date | undefined;
  endDate: Date | undefined;
};
const ItemsList = ({ items, startDate, endDate }: ItemsListProps) => {
  return (
    <div className="grid gap-4">
      {items.length > 0 ? (
        items.map((item) => (
          <Item
            key={item.id}
            item={item}
            startDate={startDate}
            endDate={endDate}
          />
        ))
      ) : (
        <div>
          No tienes equipos agregados al carrito! Ingresa a reservas onlines
          para ver los equipos dispobibles.
        </div>
      )}
    </div>
  );
};

type ItemProps = {
  item: Equipment;
  startDate: Date | undefined;
  endDate: Date | undefined;
};

const Item = ({ item, endDate, startDate }: ItemProps) => {
  const { deleteFromCart } = useCartStoreActions();

  const handleRemoveFromCart = (itemId: string) => {
    deleteFromCart(itemId);
  };

  const available = isEquipmentAvailable(item, { startDate, endDate });

  return (
    <div className="grid grid-cols-12 items-center gap-y-2 rounded-md bg-white/40 p-2 pb-4 sm:gap-y-0 md:border-none">
      <div className="col-span-12 sm:col-span-7">
        <p>
          <strong className="font-extrabold">
            {item.name} {item.brand}
          </strong>{" "}
          <strong className="font-semibold">{item.model}</strong>
        </p>
        <p
          className={`col-span-12 text-sm ${
            available ? "text-green-500" : "text-red-500"
          }`}
        >
          {available ? "Disponible" : "Reservado"}
        </p>
      </div>
      <div className="col-span-5 sm:col-span-2">
        <CartItemCounter item={item} />
      </div>
      <p className="col-span-5 text-lg font-semibold sm:col-span-2">
        {formatPrice(item.price * item.quantity)}
      </p>
      <button
        className="col-span-2 flex justify-end sm:col-span-1 "
        onClick={() => handleRemoveFromCart(item.id)}
      >
        <X className=" h-4 w-4 " />
      </button>
    </div>
  );
};

type RightBarProps = {
  cartTotal: number;
  location: Location;
  pickupHour: string;
  register: UseFormRegister<{ message: string; email?: string }>;
  handleBookOrder: () => void;
  isLoading: boolean;
  cart: Equipment[];
  isAdmin: boolean | undefined;
  isEmployee: boolean | undefined;
  setDiscount: Dispatch<SetStateAction<Discount | null>>;
  discount: Discount | null;
  subtotal: number;
};

const RightBar = ({
  cartTotal,
  location,
  pickupHour,
  register,
  handleBookOrder,
  isLoading,
  cart,
  isAdmin,
  isEmployee,
  setDiscount,
  discount,
  subtotal,
}: RightBarProps) => {
  const [showCouponModal, setShowCouponModal] = useState(false);
  const startDate = useStartDate();
  const endDate = useEndDate();

  const areAllItemsAvailable = cart.every((item) =>
    isEquipmentAvailable(item, { startDate, endDate })
  );

  const datesAreWeekend = disableWeekend(startDate, endDate);

  return (
    <>
      <AddCoupon
        location={location}
        setDiscount={setDiscount}
        discount={discount}
        total={cartTotal}
        showCouponModal={showCouponModal}
        setShowCouponModal={setShowCouponModal}
      />
      <section className="col-span-12 rounded-md bg-white p-4 sm:col-span-4">
        <div className="grid gap-6">
          {startDate && endDate && (
            <div className="grid w-full gap-2">
              <div className="flex w-full justify-between ">
                <p className="font-semibold">Retiro:</p>
                <p className="font-bold">
                  {toArgentinaDate(startDate)}{" "}
                  <span className="font-semibold">{pickupHour}hs</span>
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Devolución: </p>
                <p className="font-bold">
                  {toArgentinaDate(endDate)}{" "}
                  <span className="font-semibold">09:00hs</span>
                </p>
              </div>
            </div>
          )}

          <SelectDateButton />
          <Button variant="secondary">Continuar Alquilando</Button>

          <Textarea
            placeholder="Algo que nos quieras decir?"
            {...register("message")}
          />

          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between font-semibold">
                <p>Sucursal:</p>
                <p className="font-bold">{location.name}</p>
              </div>

              <Button
                onClick={() => setShowCouponModal(true)}
                variant="secondary"
                className="h-8"
              >
                {discount ? "Cupón aplicado" : "Ingresar cupon de descuento"}
              </Button>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <p>Subtotal:</p>
              {(startDate || endDate) && (
                <p className="font-semibold">{formatPrice(subtotal)}</p>
              )}
            </div>

            <div className="grid gap-1">
              <div className="flex items-center justify-between font-semibold">
                <p>Total:</p>
                <p className="text-xl font-extrabold">
                  {formatPrice(cartTotal)}
                </p>
              </div>
              <p className="text-right text-sm text-primary/60">
                El precio no incluye impuestos de facturación.
              </p>
            </div>

            {(isAdmin || isEmployee) && (
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center">
                  <p>Email cliente:</p>
                  <CLientEmailTip />
                </div>
                <Input
                  type="email"
                  {...register("email")}
                  className="ml-auto h-8 w-1/2"
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Button
              disabled={
                cart.length <= 0 ||
                !startDate ||
                !endDate ||
                isLoading ||
                !areAllItemsAvailable ||
                datesAreWeekend
              }
              onClick={handleBookOrder}
            >
              <div className="grid">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(!startDate || !endDate) && (
                  <p>Selecciona una fecha para alquilar!</p>
                )}
                {cart.length <= 0 && <p>Tu carrito está vacío!</p>}
                {cart.length > 0 && startDate && endDate && !isLoading && (
                  <p>Agendar Pedido</p>
                )}
              </div>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const CLientEmailTip = () => {
  return (
    <Popover>
      <PopoverTrigger className=" border-none hover:bg-secondary" asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[300px]">
        <p>
          El pedido estará registrado a nombre del usuario asociado al correo
          electrónico provisto.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default CartPage;
