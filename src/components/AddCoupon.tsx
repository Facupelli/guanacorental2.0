import { type Dispatch, type SetStateAction, useState } from "react";
import DialogWithState from "./DialogWithState";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { api } from "@/utils/api";
import { Label } from "./ui/label";
import { useSession } from "next-auth/react";
import { getIsAdmin } from "@/lib/utils";

type Discount = {
  value: number;
  typeName: string;
  code: string;
};

type AddCouponProps = {
  location: { id: string; name: string };
  setDiscount: Dispatch<SetStateAction<Discount | null>>;
  discount: Discount | null;
  total: number;
  setShowCouponModal: Dispatch<SetStateAction<boolean>>;
  showCouponModal: boolean;
  admin?: boolean;
  orderId?: string;
};

const AddCoupon = ({
  location,
  setDiscount,
  discount,
  total,
  setShowCouponModal,
  showCouponModal,
  admin,
  orderId,
}: AddCouponProps) => {
  const { data: session } = useSession();

  const [error, setError] = useState("");
  const { register, getValues } = useForm<{
    code: string;
    applyToSub: boolean;
  }>();

  const ctx = api.useContext();

  const { mutate } = api.discount.getValidDiscountByCode.useMutation();
  const orderMutate = api.discount.apllyDiscountToOrder.useMutation();

  const isAdmin = getIsAdmin(session);

  const handleApplyDiscount = () => {
    const code = getValues("code");
    mutate(
      { code, location: location.id, total },
      {
        onSuccess: (data) => {
          setDiscount({
            value: data.rule.value,
            typeName: data.rule.type.name,
            code: data.code,
          });

          setError("");

          if (admin && orderId) {
            const applyToSub = getValues("applyToSub");

            orderMutate.mutate(
              { orderId, discountId: data.id, total, applyToSub },
              {
                onSuccess: () => {
                  void ctx.order.getOrderById.invalidate();
                },
              }
            );
          }
          setShowCouponModal(false);
        },
        onError: (err) => {
          console.log(err.message);
          setError(err.message);
        },
      }
    );
  };

  return (
    <>
      <DialogWithState
        title="Ingresar cupón de descuento"
        isOpen={showCouponModal}
        setOpen={setShowCouponModal}
      >
        <div className="grid gap-2 p-2">
          <Input
            type="text"
            className="h-8"
            {...register("code")}
            disabled={!!discount}
            placeholder="Escribe aquí el código del cupón"
          />

          {isAdmin && (
            <div className="flex items-center gap-2">
              <div>
                <Input
                  type="checkbox"
                  className="h-8"
                  {...register("applyToSub")}
                  disabled={!!discount}
                  placeholder="Escribe aquí el código del cupón"
                  defaultChecked
                  id="applyToSub"
                />
              </div>
              <Label htmlFor="applyToSub">
                Aplicar descuento a subalquiler
              </Label>
            </div>
          )}
          <p className="text-red-600">{error}</p>
        </div>
        <DialogFooter>
          <Button
            disabled={!!discount}
            type="button"
            className="h-8"
            variant={discount ? "secondary" : "default"}
            onClick={handleApplyDiscount}
          >
            {discount ? "Aplicado" : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogWithState>
    </>
  );
};

export default AddCoupon;
