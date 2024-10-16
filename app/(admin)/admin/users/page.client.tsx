"use client";

import { type UseFormSetValue, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Pagination from "@components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Label } from "@components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Button } from "@components/ui/button";
import DataTable from "@components/ui/data-table";
import { Input } from "@components/ui/input";
import { MoreHorizontal } from "lucide-react";

import useDebounce from "~/hooks/useDebounce";

import { type Prisma, type Role } from "@prisma/client";
import type { Columns } from "types/table";
import { toArgentinaDate } from "~/lib/dates";
import { trpc } from "~/trpc/client";

type User = Prisma.UserGetPayload<{
  include: {
    role: true;
    address: true;
    orders: true;
  };
}>;

type PetitionUser = Prisma.UserGetPayload<{
  include: {
    address: true;
  };
}>;

type CellProps = unknown;

const userColumns: Columns<User, CellProps>[] = [
  {
    title: "Alta",
    cell: (rowData) => <div>{toArgentinaDate(rowData.address?.created_at || new Date())}</div>,
  },
  { title: "Nombre", cell: (rowData) => <div>{rowData.name}</div> },
  { title: "Teléfono", cell: (rowData) => <div>{rowData.address?.phone}</div> },
  { title: "DNI", cell: (rowData) => <div>{rowData.address?.dni_number}</div> },
  {
    title: "Provincia",
    cell: (rowData) => <div>{rowData.address?.province}</div>,
  },
  { title: "Pedidos", cell: (rowData) => <div>{rowData.orders.length}</div> },
  {
    title: "",
    cell: (rowData) => <ActionsDropMenu user={rowData} />,
  },
];

export default function ClientAdminUsers() {
  const router = useRouter();
  const [, setUser] = useState<User | null>(null);
  const [petitionUserSelected, setPetitionUser] = useState<PetitionUser | null>(null);

  const { watch, setValue, register } = useForm<{
    roleId: string;
    search: string;
    location: string;
  }>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const roleId = watch("roleId", undefined);
  const search = useDebounce(watch("search", undefined), 500);

  const roles = trpc.role.getAllRoles.useQuery();
  const petitionUsers = trpc.user.getPetitionUsers.useQuery();
  const { data } = trpc.user.getAllUsers.useQuery({
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    roleId,
    search,
  });

  const handleCreateUser = () => {
    void router.push("/new-user");
  };

  return (
    <>
      <h1 className="text-lg font-bold">CLIENTES</h1>
      <div className=" pt-6">
        <Tabs defaultValue="customers">
          <TabsList className="mb-4 w-full md:w-1/3" defaultValue="customers">
            <TabsTrigger value="customers" className="w-full">
              Clientes
            </TabsTrigger>
            <TabsTrigger value="petitions" className="w-full">
              Altas - {petitionUsers.data?.length}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 flex flex-wrap gap-4">
                <div className="flex w-full items-center gap-4 rounded-md bg-white p-4">
                  <Input type="search" placeholder="buscar por nombre y apellido" {...register("search")} />

                  <Label className="whitespace-nowrap">Rol del cliente</Label>
                  {roles.data && <SelectRole roles={roles.data} setValue={setValue} />}
                </div>
                <div className="col-span-12 ml-auto">
                  <Button onClick={handleCreateUser} className="whitespace-nowrap">
                    Crear Cliente
                  </Button>
                </div>
              </div>

              <div className="col-span-12">
                {data?.users && <DataTable data={data.users} setRowData={setUser} columns={userColumns} />}

                <Pagination
                  totalCount={data?.totalCount ?? 0}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page as number)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="petitions">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 overflow-y-auto sm:col-span-1">
                {petitionUsers.data?.map((user) => (
                  <div
                    className={`flex cursor-pointer items-center gap-3 rounded-bl-md rounded-tl-md border-r-[2px] border-app-bg bg-white/60 p-4 hover:bg-white/40 ${
                      petitionUserSelected?.id === user.id ? "border-secondary bg-white" : ""
                    }`}
                    onClick={() => setPetitionUser(user)}
                    key={user.id}
                  >
                    {user.image && (
                      <div className="relative h-10 w-10 rounded-full ">
                        <Image src={user.image} fill alt="profile picture" style={{ borderRadius: "100%" }} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-primary/60">Nombre</p>
                      <p className="font-semibold">{user.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              {petitionUserSelected && (
                <UserPetitionInfo user={petitionUserSelected} setPetitionUser={setPetitionUser} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

const SelectRole = ({
  roles,
  setValue,
}: {
  roles: Role[];
  setValue: UseFormSetValue<{
    roleId: string;
    location: string;
    search: string;
  }>;
}) => {
  return (
    <Select onValueChange={(e) => setValue("roleId", e)}>
      <SelectTrigger>
        <SelectValue placeholder="seleccionar" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Roles</SelectLabel>
          {roles.map((role) => (
            <SelectItem value={role.id} key={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const ActionsDropMenu = ({ user }: { user: User }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link href={`/admin/users/${user.id}`}>Ver detalle</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserPetitionInfo = ({
  user,
  setPetitionUser,
}: {
  user: PetitionUser;
  setPetitionUser: Dispatch<SetStateAction<PetitionUser | null>>;
}) => {
  const ctx = trpc.useContext();
  const { mutate } = trpc.user.approveUser.useMutation();

  const handleApprove = () => {
    mutate(
      { userId: user.id, customerApproved: true },
      {
        onSuccess: () => {
          setPetitionUser(null);
          void ctx.user.getPetitionUsers.invalidate();
        },
      }
    );
  };

  const handleReject = () => {
    mutate(
      { userId: user.id, customerApproved: false },
      {
        onSuccess: () => {
          void ctx.user.getPetitionUsers.invalidate();
        },
      }
    );
  };

  return (
    <div key={user.id} className="col-span-3 grid gap-5 rounded-md bg-white sm:col-span-2">
      <div className="grid gap-6 p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4">
          <div>
            <p className="text-sm text-primary/60">DNI</p>
            <p className="font-semibold">{user.address?.dni_number}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Teléfono</p>
            <p className="font-semibold">{user.address?.phone}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Fecha de nacimiento</p>
            <p className="font-semibold">{user.address?.birth_date}</p>
          </div>
        </div>

        <div className="grid grid-cols-4">
          <div className="col-span-2">
            <p className="text-sm text-primary/60">Domicilio</p>
            <p className="font-semibold">{user.address?.address_1}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Localidad</p>
            <p className="font-semibold">{user.address?.city}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Provincia</p>
            <p className="font-semibold">{user.address?.province}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-y-4">
          {user.address?.dni_front && (
            <div className="relative col-span-4 aspect-video w-full rounded sm:col-span-2 sm:w-[260px]">
              <Image src={user.address?.dni_front} alt="dni_front" fill style={{ borderRadius: 5 }} />
            </div>
          )}

          {user.address?.dni_back && (
            <div className="relative col-span-4 aspect-video w-full rounded sm:col-span-2 sm:w-[260px]">
              <Image src={user.address?.dni_back} alt="dni_front" fill style={{ borderRadius: 5 }} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-y-2">
          <div>
            <p className="text-sm text-primary/60">Ocupación</p>
            <p className="font-semibold">{user.address?.occupation}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Estudiante</p>
            <p className="font-semibold">{user.address?.student ? "Si" : "No"}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Empleado</p>
            <p className="font-semibold">{user.address?.employee ? "Si" : "No"}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">Empresa</p>
            <p className="font-semibold">{user.address?.company}</p>
          </div>

          <div>
            <p className="text-sm text-primary/60">CUIT</p>
            <p className="font-semibold">{user.address?.cuit}</p>
          </div>
        </div>

        <div className="grid grid-cols-4">
          <div>
            <p className="text-sm text-primary/60">contacto 1</p>
            <p className="font-semibold">{user.address?.contact_1}</p>
          </div>
          <div>
            <p className="text-sm text-primary/60">vínculo 1</p>
            <p className="font-semibold">{user.address?.bond_1}</p>
          </div>
          <div>
            <p className="text-sm text-primary/60">contacto 2</p>
            <p className="font-semibold">{user.address?.contact_2}</p>
          </div>
          <div>
            <p className="text-sm text-primary/60">vínculo 2</p>
            <p className="font-semibold">{user.address?.bond_2}</p>
          </div>
        </div>

        <div className="grid grid-cols-4">
          <div>
            <p className="text-sm text-primary/60">Banco</p>
            <p className="font-semibold">{user.address?.bank}</p>
          </div>
          <div>
            <p className="text-sm text-primary/60">Alias</p>
            <p className="font-semibold">{user.address?.alias}</p>
          </div>
          <div>
            <p className="text-sm text-primary/60">cbu</p>
            <p className="font-semibold">{user.address?.cbu}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 rounded-bl-md rounded-br-md bg-secondary p-6">
        <Button size="sm" variant="destructive" onClick={handleReject}>
          Rechazar
        </Button>
        <Button size="sm" onClick={handleApprove}>
          Aceptar
        </Button>
      </div>
    </div>
  );
};
