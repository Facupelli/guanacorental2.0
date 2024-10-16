"use client";

import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "@components/ui/button";
import DialogWithState from "@components/DialogWithState";
import { Input } from "@components/ui/input";
import { DialogFooter } from "@components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import { EditIcon, Trash2, CheckSquare, Plus } from "lucide-react";

import { getOrderEquipmentOnOwners } from "~/utils/order";
import { formatPrice, getIsAdmin } from "~/lib/utils";

import useDebounce from "~/hooks/useDebounce";

import type { Location, Prisma } from "@prisma/client";
import { trpc } from "~/trpc/client";
import AddCoupon from "app/_components/AddCoupon";

type Order = Prisma.OrderGetPayload<{
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    equipments: {
      include: { books: true; equipment: true; owner: true };
    };
    earning: true;
    discount: {
      include: {
        rule: true;
      };
    };
  };
}>;

export default function ClientAdminOrderDetail() {
  const { data: session } = useSession();
  const params = useParams();
  const orderId = params?.id as string;

  const [discount, setDiscount] = useState<DiscountState | null>(null);

  const { data, isLoading } = trpc.order.getOrderById.useQuery({
    orderId,
  });

  let order;

  if (data) {
    order = {
      ...data,
      equipments: getOrderEquipmentOnOwners(data.equipments, data.bookId),
    };
  }

  const isAdmin = getIsAdmin(session);

  return (
    <>
      <h1 className="text-lg font-bold">PEDIDO DETALLE</h1>
      {isLoading && <div>Cargando...</div>}
      {!data || !order ? (
        <div>Order Not Found</div>
      ) : (
        <div className="grid gap-6 pt-6">
          <div className="grid gap-6 rounded-md bg-white p-6">
            <CustomerInfo
              order={{ number: order.number, createdAt: order.created_at }}
              customer={{
                name: order.customer.name,
                email: order.customer.email,
                phone: order.customer.address?.phone,
                dniNumber: order.customer.address?.dni_number,
              }}
            />

            {order.earning && <EquipmentsBooked equipments={order.equipments} order={order} />}

            <OrderInfo
              info={{
                startDate: order.book.start_date,
                endDate: order.book.end_date,
                message: order.message,
                total: order.total,
                subtotal: order.subtotal,
                workingDays: order.book.working_days,
                discount: order.discount,
                pickupHour: order.book.pickup_hour,
              }}
              discount={discount}
              setDiscount={setDiscount}
              total={order.subtotal}
              location={order.location}
              orderId={order.id}
            />

            {isAdmin && (
              <>
                <EarningsInfo
                  oscar={order.earning?.oscar ?? 0}
                  federico={order.earning?.federico ?? 0}
                  sub={order.earning?.sub ?? 0}
                />

                <section className="grid gap-2 rounded-md border border-red-400 p-4">
                  <h2 className="pb-2 text-lg font-semibold">Cancelar Pedido</h2>
                  <p>El pedido será cancelado. Se notificará al usuario via correo electrónico.</p>
                  <div>
                    <CancelOrderAlert bookId={order.bookId} orderId={order.id} />
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const CancelOrderAlert = ({ bookId, orderId }: { bookId: string; orderId: string }) => {
  const router = useRouter();
  const { mutate, isPending } = trpc.order.deleteOrderById.useMutation();

  const handleCancelOrder = (orderId: string, bookId: string) => {
    mutate(
      { orderId, bookId },
      {
        onSuccess: () => {
          void router.push("/admin/orders");
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancelar</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estas seguro que quieres cancelar el pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no puede deshacerse. Borrará el pedido permanetemente de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => handleCancelOrder(orderId, bookId)}
            className="bg-red-600"
          >
            {isPending ? "Cancelando..." : "Cancelar pedido"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type CustomerInfo = {
  order: {
    number: number;
    createdAt: Date;
  };
  customer: {
    name: string | null;
    email: string | null;
    phone: string | undefined;
    dniNumber: string | undefined;
  };
};

const CustomerInfo = ({ order, customer }: CustomerInfo) => {
  return (
    <section className="grid gap-6 rounded-md border border-app-bg p-4">
      <div>
        <h2 className="text-xl font-bold">#{order?.number}</h2>
        <p className="text-sm text-primary/60">
          {order.createdAt.toLocaleDateString("es-AR", {
            year: "numeric",
            day: "numeric",
            month: "short",
            timeZone: "America/Argentina/Buenos_Aires",
          })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 md:gap-2 lg:grid-cols-4">
        <div className="grid gap-1 ">
          <p className="text-xs text-primary/60">Cliente</p>
          <p>{customer?.name}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">Email</p>
          <p>{customer?.email}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">Teléfono</p>
          <p>{customer?.phone}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">DNI</p>
          <p>{customer?.dniNumber}</p>
        </div>
      </div>
    </section>
  );
};

type EquipmentOwner = Prisma.EquipmentOnOwnerGetPayload<{
  include: { books: true; equipment: true; owner: true };
}>;

type EquipmentsBookedProps = {
  equipments: EquipmentOwner[];
  order: Order;
};

const EquipmentsBooked = ({ equipments, order }: EquipmentsBookedProps) => {
  const [editEquipmentMode, setEditEquipmentMode] = useState(false);
  const [addEquipment, setAddEquipment] = useState(false);

  const { register, watch } = useForm<{ search: string }>();

  const search = useDebounce(watch("search", ""), 500);

  const { data } = trpc.equipment.getAllEquipment.useQuery({
    limit: 5,
    search,
    location: order.locationId,
  });

  const ctx = trpc.useContext();
  const { mutate } = trpc.order.removeEquipmentFromOrder.useMutation();

  const handleDeleteEquipment = (bookId: string, ownerEquipment: EquipmentOwner) => {
    if (order.earning?.id) {
      const data = {
        orderId: order.id,
        bookId,
        earningId: order.earning.id,
        ownerEquipment: {
          id: ownerEquipment.id,
          quantity: ownerEquipment.equipment.quantity,
          price: ownerEquipment.equipment.price,
        },
      };

      mutate(data, {
        onSuccess: () => {
          void ctx.order.getOrderById.invalidate();
        },
      });
    }
  };

  return (
    <>
      <DialogWithState isOpen={addEquipment} setOpen={setAddEquipment} title="Argegar equipo al pedido">
        <Input placeholder="buscar equipo" type="search" {...register("search")} />

        <div className="grid gap-2">
          {data?.equipments.map((equipment) => (
            <AddEquipment
              key={equipment.id}
              equipment={equipment}
              bookId={order.bookId}
              orderId={order.id}
              earningId={order.earning?.id ?? ""}
              discountId={order.discount_id}
            />
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button
            size="sm"
            onClick={() => {
              setEditEquipmentMode(false);
              setAddEquipment(false);
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogWithState>

      <section className="grid gap-6 rounded-md border border-app-bg p-4">
        <div className="flex">
          <h2 className="text-lg font-semibold">Equipos alquilados</h2>
          <div className="ml-auto">
            {editEquipmentMode ? (
              <CheckSquare
                className="h-5 w-5 cursor-pointer text-green-400"
                onClick={() => setEditEquipmentMode(false)}
              />
            ) : (
              <EditIcon className="h-5 w-5 cursor-pointer" onClick={() => setEditEquipmentMode(true)} />
            )}
          </div>
        </div>

        <div className="grid gap-3 overflow-x-auto">
          <div className="grid min-w-[600px] grid-cols-9 items-baseline gap-x-2  text-sm text-primary/60">
            <div className="col-span-1" />
            <p className="col-span-3">Equipo</p>
            <p className="col-span-1">Cantidad</p>
            <p className="col-span-1 text-xs">Precio</p>
            <p className="col-span-1 text-xs">Precio * Días</p>
            <p className="col-span-2 text-xs">Precio * Días * Cantidad</p>
          </div>

          <div className="grid gap-4 ">
            {equipments.map((ownerEquipment) => (
              <div key={ownerEquipment.id} className="grid grid-cols-9 items-center gap-x-2">
                {ownerEquipment.equipment.image ? (
                  <div className="relative col-span-1 h-12 w-12">
                    <Image src={ownerEquipment.equipment.image} alt="equipment picture" fill />
                  </div>
                ) : (
                  <div />
                )}

                <div className="col-span-3 grid md:min-w-[300px]">
                  <div className="flex gap-2">
                    <p>{ownerEquipment.equipment.name}</p>
                    <p>{ownerEquipment.equipment.brand}</p>
                  </div>
                  <p className="text-sm text-primary/70">{ownerEquipment.equipment.model}</p>
                </div>

                <p className=" pl-6 font-semibold">
                  x
                  {ownerEquipment.books.reduce((acc, curr) => {
                    return acc + curr.quantity;
                  }, 0)}
                </p>

                <p className="text-xs">{formatPrice(ownerEquipment.equipment.price)}</p>
                <p className="col-span-1 text-xs">
                  {formatPrice(
                    ownerEquipment.equipment.price *
                      ownerEquipment.books.reduce((acc, curr) => {
                        return acc + curr.quantity;
                      }, 0) *
                      order.book.working_days
                  )}
                </p>
                <p className="text-sm">
                  {formatPrice(
                    ownerEquipment.equipment.price *
                      order.book.working_days *
                      ownerEquipment.books.reduce((acc, curr) => {
                        return acc + curr.quantity;
                      }, 0)
                  )}
                </p>

                {editEquipmentMode && (
                  <Button
                    variant="secondary"
                    className="col-span-1 bg-transparent"
                    onClick={() => handleDeleteEquipment(order.bookId, ownerEquipment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {editEquipmentMode && (
          <Button onClick={() => setAddEquipment(true)} className="flex w-1/4 gap-2" size="sm" variant="secondary">
            Agregar equipos <Plus className="h-4 w-4" />
          </Button>
        )}
      </section>
    </>
  );
};

type Equipment = Prisma.EquipmentGetPayload<{
  include: {
    owner: {
      include: {
        owner: true;
        location: true;
        books: { include: { book: true } };
      };
    };
  };
}>;

type AddEquipmentProps = {
  equipment: Equipment;
  bookId: string;
  orderId: string;
  earningId: string;
  discountId: string | null;
};

const AddEquipment = ({ equipment, bookId, orderId, earningId, discountId }: AddEquipmentProps) => {
  const { register, getValues } = useForm<{ quantity: number }>();

  const ctx = trpc.useContext();
  const { mutate } = trpc.order.addEquipmentToOrder.useMutation();

  const handleAddEquipment = () => {
    const data = getValues();

    const cart = {
      id: equipment.id,
      quantity: data.quantity,
      price: equipment.price,
      owner: equipment.owner?.map((owner) => ({
        id: owner.id,
        ownerId: owner.ownerId,
        onwerName: owner.owner?.name,
        stock: owner.stock,
        locationId: owner.locationId,
      })),
    };

    mutate(
      {
        bookId,
        orderId,
        earningId,
        discountId,
        cart: [cart],
      },
      {
        onSuccess: () => {
          void ctx.order.getOrderById.invalidate();
        },
      }
    );
  };

  return (
    <div key={equipment.id} className="flex items-center gap-4">
      <p>
        {equipment.name} {equipment.brand} {equipment.model}
      </p>
      <Input type="text" className="ml-auto w-[40px]" {...register("quantity", { valueAsNumber: true })} />
      <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddEquipment} />
    </div>
  );
};

type Discount = Prisma.DiscountGetPayload<{
  include: {
    rule: true;
  };
}>;

type DiscountState = {
  value: number;
  typeName: string;
  code: string;
};

type OrderInfoProps = {
  info: {
    startDate: Date;
    endDate: Date;
    subtotal: number;
    total: number;
    message: string | null;
    workingDays: number;
    discount: Discount | null;
    pickupHour: string | null;
  };
  location: Location;
  setDiscount: Dispatch<SetStateAction<DiscountState | null>>;
  discount: DiscountState | null;
  total: number;
  orderId: string;
};

const OrderInfo = ({ info, discount, setDiscount, location, orderId }: OrderInfoProps) => {
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  return (
    <>
      <AddCoupon
        location={location}
        setDiscount={setDiscount}
        discount={discount}
        total={info.subtotal}
        showCouponModal={showCouponModal}
        setShowCouponModal={setShowCouponModal}
        admin
        orderId={orderId}
      />

      <section className="grid gap-6 rounded-md border border-app-bg p-4">
        <div className="flex">
          <h2 className="text-lg font-semibold">Información del pedido</h2>
          <div className="ml-auto">
            {editInfo ? (
              <CheckSquare className="h-5 w-5 cursor-pointer text-green-400" onClick={() => setEditInfo(false)} />
            ) : (
              <EditIcon className="h-5 w-5 cursor-pointer" onClick={() => setEditInfo(true)} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3">
          <div className="col-span-3 grid gap-1 sm:col-span-1">
            <p className="text-xs text-primary/60">Retiro</p>
            <p>
              {info.startDate.toLocaleDateString("es-AR", {
                year: "numeric",
                day: "numeric",
                month: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              })}{" "}
              - <span className="text-sm">{info.pickupHour}hs</span>
            </p>
          </div>
          <div className="col-span-3 grid gap-1 sm:col-span-1">
            <p className="text-xs text-primary/60">Devolución</p>
            <p>
              {info.endDate.toLocaleDateString("es-AR", {
                year: "numeric",
                day: "numeric",
                month: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              })}
            </p>
          </div>

          <div className="grid gap-1">
            <p className="text-xs text-primary/60">Días de renta</p>
            <p>{info.workingDays}</p>
          </div>

          <div className="col-span-3 grid gap-1">
            <p className="text-xs text-primary/60">Mensaje</p>
            <p>{info.message ?? "-"}</p>
          </div>

          <div className="col-span-1 grid gap-1">
            <p className="text-xs text-primary/60">Código</p>
            <p>{info.discount?.code ?? "-"}</p>
          </div>

          <div className="col-span-2 grid gap-1">
            <div className="flex items-center gap-4">
              <p className="text-xs text-primary/60">Descuento</p>
              {editInfo && (
                <Button className="h-5 px-2 text-xs" onClick={() => setShowCouponModal(true)}>
                  Aplicar
                </Button>
              )}
            </div>
            <p>{info.discount?.rule.value ?? "-"}</p>
          </div>

          <div className="grid gap-1">
            <p className="text-xs text-primary/60">Subtotal</p>
            <p>{formatPrice(info?.subtotal)}</p>
          </div>

          <div className="grid gap-1 ">
            <p className="text-xs text-primary/60">Total</p>
            <p className="font-bold">{formatPrice(info?.total)}</p>
          </div>
        </div>
      </section>
    </>
  );
};

type EarningsInfoProps = {
  oscar: number;
  federico: number;
  sub: number;
};

const EarningsInfo = ({ oscar, federico, sub }: EarningsInfoProps) => {
  return (
    <section className="grid gap-6 rounded-md border border-app-bg p-4">
      <h2 className="text-lg font-semibold">División</h2>

      <div className="grid grid-cols-3 md:max-w-[50%]">
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">Federico</p>
          <p>{formatPrice(federico)}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">Oscar</p>
          <p>{formatPrice(oscar)}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-primary/60">Subalquiler</p>
          <p>{formatPrice(sub)}</p>
        </div>
      </div>
    </section>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await auth(context);
//   const { id } = context.query;

//   if (id && session) {
//     const helpers = createServerSideHelpers({
//       router: appRouter,
//       ctx: { prisma, session },
//       transformer: superjason,
//     });

//     await helpers.order.getOrderById.prefetch({
//       orderId: id as string,
//     });

//     const { user } = session;

//     return {
//       props: {
//         user,
//         trpcState: helpers.dehydrate(),
//       },
//     };
//   }

//   return {
//     redirect: {
//       destination: "/",
//       permanent: false,
//     },
//   };
// };

// export default AdminOrderDetail;
