"use client";

import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useMemo, useState } from "react";

import { FacebookButton, GoogleButton } from "@/components/Nav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import SelectDateButton from "@/components/ui/SelectDateButton";
import DialogWithState from "@/components/DialogWithState";
import { DialogFooter } from "@/components/ui/dialog";
import { Info, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddCoupon from "@/components/AddCoupon";

import { disableWeekend, getDatesInRange, getTotalWorkingDays, toArgentinaDate } from "@/lib/dates";
import {
  calcaulateCartTotal,
  calculateTotalWithDiscount,
  formatPrice,
  getIsAdmin,
  getIsEmployee,
  isEquipmentAvailable,
} from "@/lib/utils";

import Link from "next/link";
import { useCartItems, useCartStoreActions } from "stores/cart.store";
import { useEndDate, usePickupHour, useStartDate } from "stores/date.store";
import { useLocation } from "stores/location.store";
import { trpc } from "utils/trpc";

type Discount = {
  value: number;
  typeName: string;
  code: string;
};

const loginError = "Debes iniciar sesión para realizar una reserva.";
const noPetitionSentError =
  "No has enviado el alta de cliente. Para poder alquilar equipos es necesario llenar el formulario de alta de cliente.";

export default function RightBar() {
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

  const [showCouponModal, setShowCouponModal] = useState(false);
  const areAllItemsAvailable = cartItems.every((item) => isEquipmentAvailable(item, { startDate, endDate }));

  const datesAreWeekend = disableWeekend(startDate, endDate);

  const { mutate, isLoading } = trpc.order.createOrder.useMutation();

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
      <DialogWithState isOpen={showSuccessModal} title="Pedido realizado con éxito">
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

      <DialogWithState title="Ocurrió un error" isOpen={showErrorModal} setOpen={setErrorModal}>
        <p>{error}</p>
        {error === noPetitionSentError && (
          <Link href="/new-user" className="font-semibold text-primary hover:underline">
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
                  {toArgentinaDate(startDate)} <span className="font-semibold">{pickupHour}hs</span>
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Devolución: </p>
                <p className="font-bold">
                  {toArgentinaDate(endDate)} <span className="font-semibold">09:00hs</span>
                </p>
              </div>
            </div>
          )}

          <SelectDateButton />
          <Button variant="secondary">Continuar Alquilando</Button>

          <Textarea placeholder="Algo que nos quieras decir?" {...register("message")} />

          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between font-semibold">
                <p>Sucursal:</p>
                <p className="font-bold">{location.name}</p>
              </div>

              <Button onClick={() => setShowCouponModal(true)} variant="secondary" className="h-8">
                {discount ? "Cupón aplicado" : "Ingresar cupon de descuento"}
              </Button>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <p>Subtotal:</p>
              {(startDate || endDate) && <p className="font-semibold">{formatPrice(subtotal)}</p>}
            </div>

            <div className="grid gap-1">
              <div className="flex items-center justify-between font-semibold">
                <p>Total:</p>
                <p className="text-xl font-extrabold">{formatPrice(cartTotal)}</p>
              </div>
              <p className="text-right text-sm text-primary/60">El precio no incluye impuestos de facturación.</p>
            </div>

            {(isAdmin || isEmployee) && (
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center">
                  <p>Email cliente:</p>
                  <CLientEmailTip />
                </div>
                <Input type="email" {...register("email")} className="ml-auto h-8 w-1/2" />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Button
              disabled={
                cartItems.length <= 0 || !startDate || !endDate || isLoading || !areAllItemsAvailable || datesAreWeekend
              }
              onClick={handleBookOrder}
            >
              <div className="grid">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(!startDate || !endDate) && <p>Selecciona una fecha para alquilar!</p>}
                {cartItems.length <= 0 && <p>Tu carrito está vacío!</p>}
                {cartItems.length > 0 && startDate && endDate && !isLoading && <p>Agendar Pedido</p>}
              </div>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

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
        <p>El pedido estará registrado a nombre del usuario asociado al correo electrónico provisto.</p>
      </PopoverContent>
    </Popover>
  );
};
