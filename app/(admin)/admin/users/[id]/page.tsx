"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { type UseFormRegister, useForm } from "react-hook-form";
import { useState } from "react";
import Pagination from "@components/ui/Pagination";
import { Input } from "@components/ui/input";
import DataTable from "@components/ui/data-table";
import { CheckSquare, EditIcon } from "lucide-react";

import type { Prisma } from "@prisma/client";
import { trpc } from "~/trpc/client";
import { equipmentsList, orderColumns } from "~/lib/order";

type User = Prisma.UserGetPayload<{
  include: {
    address: true;
    orders: {
      include: {
        book: true;
        equipments: {
          include: { books: true; owner: true; equipment: true };
        };
        customer: {
          include: {
            address: true;
          };
        };
        location: true;
        earning: true;
      };
    };
  };
}>;

type EditUserForm = {
  fullName: string;
  company: string;
  phone: string;
  province: string;
  city: string;
  address_1: string;
  dni_number: string;
  occupation: string;
  cuit: string;
  bussinessName: string;
};

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params?.id as string;
  const { getValues, register } = useForm<EditUserForm>();

  const [editProfile, setEditProfile] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const ctx = trpc.useContext();
  const { data, isLoading } = trpc.user.getUserById.useQuery({
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    userId,
  });

  const { mutate } = trpc.user.editUser.useMutation();

  const handleConfirmEdit = () => {
    const editData = getValues();

    if (data?.user.id) {
      mutate(
        { ...editData, userId: data.user.id },
        {
          onSuccess: () => {
            setEditProfile(false);
            void ctx.user.getUserById.invalidate();
          },
        }
      );
    }
  };

  return (
    <>
      <h1 className="text-lg font-bold">CLIENTES DETALLE</h1>
      <div className="mt-6 grid gap-6 rounded-md bg-white p-6">
        <section className="flex rounded-md border border-app-bg p-4">
          <div className="flex items-center gap-6">
            {data?.user.image && (
              <div className="relative h-20 w-20 rounded-full">
                <Image
                  src={data?.user.image}
                  alt="user picure"
                  fill
                  style={{ objectFit: "cover", borderRadius: "100%" }}
                />
              </div>
            )}
            {editProfile ? (
              <EditProfile user={data?.user} register={register} />
            ) : (
              <div className="grid">
                <h2 className="text-xl font-bold">{data?.user.name}</h2>
                <p>{data?.user.email}</p>
                <div className="flex gap-2 text-sm">
                  <p>{data?.user.address?.province}</p>
                  <p>{data?.user.address?.city}</p>
                </div>
              </div>
            )}
          </div>
          <div className="ml-auto">
            {editProfile ? (
              <CheckSquare className="h-5 w-5 cursor-pointer text-green-400" onClick={handleConfirmEdit} />
            ) : (
              <EditIcon className="h-5 w-5 cursor-pointer" onClick={() => setEditProfile(true)} />
            )}
          </div>
        </section>
        <section className="grid gap-6 rounded-md border border-app-bg p-4">
          <h5 className="text-lg font-semibold">Información personal</h5>
          {editProfile ? (
            <EditPersonalInfo user={data?.user} register={register} />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Teléfono</p>
                <p>{data?.user.address?.phone}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">DNI</p>
                <p>{data?.user.address?.dni_number}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Dirección</p>
                <p>{data?.user.address?.address_1}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Ocupacción</p>
                <p>{data?.user.address?.occupation}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Estudiante</p>
                <p>{data?.user.address?.student ? "Si" : "No"}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Empleado</p>
                <p>{data?.user.address?.employee ? "Si" : "No"}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Empresa</p>
                <p>{data?.user.address?.company}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Cuit</p>
                <p>{data?.user.address?.cuit}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-primary/60">Razón social</p>
                <p>{data?.user.address?.bussines_name}</p>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-6 rounded-md border border-app-bg p-4">
          <h5 className="text-lg font-semibold">Contactos relacionados</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Contacto 1</p>
              <p>{data?.user.address?.contact_1}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Vínculo 1</p>
              <p>{data?.user.address?.bond_1}</p>
            </div>
            <div />
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Contacto 2</p>
              <p>{data?.user.address?.contact_2}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Vínculo 2</p>
              <p>{data?.user.address?.bond_2}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-md border border-app-bg p-4">
          <h5 className="text-lg font-semibold">Información del banco</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Banco</p>
              <p>{data?.user.address?.bank}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">Alias</p>
              <p>{data?.user.address?.alias}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-primary/60">cbu</p>
              <p>{data?.user.address?.cbu}</p>
            </div>
          </div>
        </section>

        <section className="grid rounded-md  ">
          <h5 className="p-4 text-lg font-semibold">Pedidos</h5>
          <div className="pb-4">
            {data?.user.orders?.length === 0 ? (
              <div className="py-5">Actualmente no hay pedidos</div>
            ) : (
              data?.user.orders && (
                <DataTable data={data.user.orders} columns={orderColumns} expandedComponent={equipmentsList} />
              )
            )}

            {isLoading && <div className="py-5">Cargando...</div>}

            <Pagination
              totalCount={data?.totalUserOrders ?? 0}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page as number)}
            />
          </div>
        </section>
      </div>
    </>
  );
}

const EditProfile = ({ user, register }: { user: User | undefined; register: UseFormRegister<EditUserForm> }) => {
  return (
    <div className="grid">
      <Input type="text" defaultValue={user?.name ?? ""} {...register("fullName")} />
      <p>{user?.email}</p>
      <div className="flex gap-2 text-sm">
        <Input type="text" defaultValue={user?.address?.province ?? ""} {...register("province")} />
        <Input type="text" defaultValue={user?.address?.city ?? ""} {...register("city")} />
      </div>
    </div>
  );
};

const EditPersonalInfo = ({ user, register }: { user: User | undefined; register: UseFormRegister<EditUserForm> }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Teléfono</p>
        <Input type="text" defaultValue={user?.address?.phone ?? ""} {...register("phone")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">DNI</p>
        <Input type="text" defaultValue={user?.address?.dni_number ?? ""} {...register("dni_number")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Dirección</p>
        <Input type="text" defaultValue={user?.address?.address_1 ?? ""} {...register("address_1")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Ocupacción</p>
        <Input type="text" defaultValue={user?.address?.occupation ?? ""} {...register("occupation")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Estudiante</p>
        <p>{user?.address?.student ? "Si" : "No"}</p>
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Empleado</p>
        <p>{user?.address?.employee ? "Si" : "No"}</p>
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Empresa</p>
        <Input type="text" defaultValue={user?.address?.company ?? ""} {...register("company")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Cuit</p>
        <Input type="text" defaultValue={user?.address?.cuit ?? ""} {...register("cuit")} />
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-primary/60">Razón social</p>
        <Input type="text" defaultValue={user?.address?.bussines_name ?? ""} {...register("bussinessName")} />
      </div>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await auth(context);
//   const { id } = context.query;

//   if (id) {
//     const helpers = createServerSideHelpers({
//       router: appRouter,
//       ctx: { prisma, session },
//       transformer: superjason,
//     });

//     await helpers.user.getUserById.prefetch({
//       userId: id as string,
//       take: 10,
//       skip: 0,
//     });

//     return {
//       props: {
//         session,
//         // trpcState: helpers.dehydrate(),
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

// export default AdminUserDetail;
