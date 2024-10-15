"use client";

import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

import { type Dispatch, useReducer } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "@components/ui/button";
import SelectDateButton from "@components/ui/SelectDateButton";
import DialogWithState from "@components/DialogWithState";
import { DialogFooter } from "@components/ui/dialog";
import { Info, Loader2 } from "lucide-react";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";

import { toArgentinaDate } from "~/lib/dates";
import { formatPrice, getIsAdmin, getIsEmployee } from "~/lib/utils";

import Link from "next/link";
import { useCartItems, useCartStoreActions } from "~/stores/cart.store";
import { useEndDate, usePickupHour, useStartDate } from "~/stores/date.store";
import { useLocation } from "~/stores/location.store";
import { trpc } from "~/trpc/client";
import { FacebookButton, GoogleButton } from "../nav";
import AddCouponModal from "../AddCoupon";
import type { Discount } from "types/models";
import {
  CLOSE_ERROR_MODAL,
  type RightBarAction,
  rightBarInitialState,
  rightBarReducer,
  SET_DISCOUNT,
  SHOW_ERROR_MODAL,
  SHOW_SUCCESS_MODAL,
  TOGGLE_COUPON_MODAL,
  TOGGLE_ERROR_MODAL,
} from "~/utils/reducers/cart.reducer";
import { useCartState } from "~/hooks/cart/useCartState";
import { useDateState } from "~/hooks/cart/useDateState";
import { loginError, noPetitionSentError } from "~/utils/validation/validateMakeOrder";
import { useSubmitOrder } from "~/hooks/cart/useSubmitOrder";

export default function RightBar() {
  const [state, dispatch] = useReducer(rightBarReducer, rightBarInitialState);
  const { data: session } = useSession();
  const cartItems = useCartItems();
  const startDate = useStartDate();
  const endDate = useEndDate();
  const location = useLocation();
  const pickupHour = usePickupHour();

  const { workingDays, datesAreWeekend } = useDateState();
  const { areAllItemsAvailable, subtotal, cartTotal } = useCartState(workingDays, state.discount);

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  const handleSetDiscount = (discount: Discount | null) => {
    dispatch({ type: SET_DISCOUNT, payload: discount });
  };

  const { register, getValues } = useForm<{
    message: string;
    email?: string;
  }>();

  const { submitOrder } = useSubmitOrder(workingDays, getValues, state.discount);
  const { emptyCart } = useCartStoreActions();
  const { isPending } = trpc.order.createOrder.useMutation();

  const handleBookOrder = () => {
    try {
      submitOrder();
      emptyCart();
      dispatch({ type: SHOW_SUCCESS_MODAL });
    } catch (error) {
      dispatch({
        type: SHOW_ERROR_MODAL,
        payload: error instanceof Error ? error.message : "Ocurrió un error al realizar la orden",
      });
    }
  };

  return (
    <>
      <SuccessModal isOpen={state.showSuccessModal} startDate={startDate} pickupHour={pickupHour} />
      <ErrorModal isOpen={state.showErrorModal} error={state.error} dispatch={dispatch} />
      <AddCouponModal
        location={location}
        setDiscount={handleSetDiscount}
        discount={state.discount}
        total={cartTotal}
        showCouponModal={state.showCouponModal}
        setShowCouponModal={() => dispatch({ type: TOGGLE_COUPON_MODAL })}
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

              <Button onClick={() => dispatch({ type: TOGGLE_COUPON_MODAL })} variant="secondary" className="h-8">
                {state.discount ? "Cupón aplicado" : "Ingresar cupon de descuento"}
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
                  <ClientEmailTip />
                </div>
                <Input type="email" {...register("email")} className="ml-auto h-8 w-1/2" />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Button
              disabled={
                cartItems.length <= 0 || !startDate || !endDate || isPending || !areAllItemsAvailable || datesAreWeekend
              }
              onClick={handleBookOrder}
            >
              <div className="grid">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(!startDate || !endDate) && <p>Selecciona una fecha para alquilar!</p>}
                {cartItems.length <= 0 && <p>Tu carrito está vacío!</p>}
                {cartItems.length > 0 && startDate && endDate && !isPending && <p>Agendar Pedido</p>}
              </div>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

const ClientEmailTip = () => {
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

const SuccessModal = ({
  isOpen,
  startDate,
  pickupHour,
}: {
  isOpen: boolean;
  startDate: Date | undefined;
  pickupHour: string;
}) => {
  return (
    <DialogWithState isOpen={isOpen} title="Pedido realizado con éxito">
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
        <Link href="/">
          <Button>ACEPTAR</Button>
        </Link>
      </DialogFooter>
    </DialogWithState>
  );
};

const ErrorModal = ({
  isOpen,
  error,
  dispatch,
}: {
  isOpen: boolean;
  error: string;
  dispatch: Dispatch<RightBarAction>;
}) => {
  return (
    <DialogWithState title="Ocurrió un error" isOpen={isOpen} setOpen={() => dispatch({ type: TOGGLE_ERROR_MODAL })}>
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
            dispatch({ type: CLOSE_ERROR_MODAL });
          }}
        >
          ACEPTAR
        </Button>
      </DialogFooter>
    </DialogWithState>
  );
};
