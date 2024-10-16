"use client";

import { useForm } from "react-hook-form";
import { Label } from "@components/ui/label";

import { Input } from "@components/ui/input";
import useDebounce from "~/hooks/useDebounce";
import DataTable from "@components/ui/data-table";
import { useState } from "react";
import { toArgentinaDate } from "~/lib/dates";
import { type Prisma } from "@prisma/client";
import type { Columns } from "types/table";
import { Button } from "@components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
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
import { useAdminRolesUserSearch, useAdminStoreActions } from "~/stores/admin.store";
import { trpc } from "~/trpc/client";

type User = Prisma.UserGetPayload<{
  include: {
    role: true;
    address: true;
    orders: true;
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
  {
    title: "Provincia",
    cell: (rowData) => <div>{rowData.address?.province}</div>,
  },
  {
    title: "",
    cell: (rowData) => <ActionsDropMenu user={rowData} />,
  },
];

type RolesForm = { roleId: string; location: string };

export default function AdminRolesPage() {
  const userSearch = useAdminRolesUserSearch();
  const { setRolesUserSearch: setUserSearch } = useAdminStoreActions();

  const { watch } = useForm<RolesForm>();
  const [, setUser] = useState<User | null>(null);

  const roleId = watch("roleId", undefined);
  const search = useDebounce(userSearch, 500);

  const { data } = trpc.user.getAllUsers.useQuery({
    take: 5,
    skip: 0,
    roleId,
    search,
  });

  return (
    <>
      <h1 className="text-lg font-bold">Roles</h1>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex items-center gap-4 rounded-md bg-white p-4">
          <Label htmlFor="search" className="w-[150px]">
            Buscar usuario
          </Label>
          <Input
            id="search"
            type="search"
            placeholder="buscar por nombre y o apellido"
            onChange={(e) => {
              setUserSearch(e.target.value);
            }}
            value={userSearch}
          />
        </div>

        <div>
          {data?.users && <DataTable data={search ? data.users : []} setRowData={setUser} columns={userColumns} />}
        </div>
      </div>
    </>
  );
}

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
        <div className="select-none rounded-sm text-sm outline-none">
          <AssignOrRemoveRoleDialog user={user} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AssignOrRemoveRoleDialog = ({ user }: { user: User }) => {
  const ctx = trpc.useContext();
  const roles = trpc.role.getAllRoles.useQuery();
  const [isOpen, setOpen] = useState(false);

  const { mutate } = trpc.role.assignRoleToUser.useMutation();

  const rolesAvailableToAssign = roles.data?.filter(
    (role) => !user.role.map((userRole) => userRole.id).includes(role.id)
  );

  const handleAssignRole = (userId: string, roleId: string) => {
    mutate(
      { userId, roleId },
      {
        onSuccess: () => {
          void ctx.user.getAllUsers.invalidate();
          void ctx.user.getUserById.invalidate();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-transparent py-1 text-sm font-normal text-primary hover:bg-secondary">
          Asignar / Eliminar rol
        </Button>
      </DialogTrigger>
      <DialogContent className="md:min-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-bold md:text-2xl">{user.name}</DialogTitle>
          <DialogDescription className="md:text-md">Asigna | Elimina Roles</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 gap-y-8 pt-4 md:gap-8 md:p-3 md:pt-0">
          <div className="col-span-2 border-r-0 border-t-zinc-400 md:col-span-1 md:border-r">
            <p className="pb-4 font-semibold">Activos</p>
            <div className="grid gap-2 ">
              {user.role.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <p className="basis-1/2">{role.name}</p>
                  {role.name !== "Customer" && <RemoveStockAlert roleId={role.id} userId={user.id} />}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 border-t border-t-zinc-300 md:col-span-1 md:border-t-0">
            <p className="pb-4 pt-4 font-semibold md:pt-0">Roles</p>
            <div className="grid gap-2">
              {rolesAvailableToAssign?.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <p className="basis-1/2">{role.name}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 basis-1/2 hover:bg-secondary"
                    onClick={() => handleAssignRole(user.id, role.id)}
                  >
                    agregar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-6">
          <Button onClick={() => setOpen(false)}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RemoveStockAlert = ({ userId, roleId }: { userId: string; roleId: string }) => {
  const ctx = trpc.useContext();

  const { mutate } = trpc.role.removeRoleFromUser.useMutation();

  const handleRemoveRole = (userId: string, roleId: string) => {
    mutate(
      { roleId, userId },
      {
        onSuccess: () => {
          void ctx.user.getAllUsers.invalidate();
          void ctx.user.getUserById.invalidate();
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="h-6 ">
        <Button variant="outline" className="basis-1/2 border-red-500 px-1.5 md:basis-0">
          <div className="flex items-center gap-2 text-red-500">
            <Trash2 className="h-4 w-4 " /> Eliminar
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estas seguro que quieres eliminar este Rol?</AlertDialogTitle>
          <AlertDialogDescription>El usuario perderá sus privilegios.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            // disabled={isLoading}
            onClick={() => handleRemoveRole(userId, roleId)}
            className="bg-red-600"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
