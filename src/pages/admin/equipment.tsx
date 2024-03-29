import superjason from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { getServerSession } from "next-auth";
import {
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { type Dispatch, type SetStateAction, useState } from "react";
import Head from "next/head";
import { type GetServerSideProps, type NextPage } from "next";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { appRouter } from "@/server/api/root";

import Nav from "@/components/Nav";
import AdminLayout from "@/components/layout/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSelectLocation } from "@/components/ui/SelectLocation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/Pagination";
import DialogWithState from "@/components/DialogWithState";
import DataTable from "@/components/ui/data-table";
import { Loader2, MoreHorizontal, Plus, Trash2, X } from "lucide-react";

import { getIsAdmin } from "@/lib/utils";
import { api } from "@/utils/api";
import useDebounce from "@/hooks/useDebounce";

import type { Location, Owner } from "@/types/models";
import type { Category, Prisma } from "@prisma/client";
import type { Columns } from "@/types/table";
import { type OwnerequipmentForm } from "@/types/ownerEquipment";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Equipment = Prisma.EquipmentGetPayload<{
  include: {
    owner: { include: { owner: true; location: true } };
    category: true;
  };
}>;

type CellProps = {
  setShowAddEquipmentModal: Dispatch<SetStateAction<boolean>>;
  setEquipmentId: Dispatch<SetStateAction<string | null>>;
  setEquipmentToEdit: Dispatch<SetStateAction<Equipment | null>>;
  setShowStockModal: Dispatch<SetStateAction<boolean>>;
  setShowDeleteModal: Dispatch<SetStateAction<boolean>>;
};

const equipmentColumns: Columns<Equipment, CellProps>[] = [
  { title: "Nombre", cell: (rowData) => <div>{rowData.name}</div> },
  { title: "Marca", cell: (rowData) => <div>{rowData.brand}</div> },
  { title: "Model", cell: (rowData) => <div>{rowData.model}</div> },
  { title: "Precio", cell: (rowData) => <div>{rowData.price}</div> },
  {
    title: "Stock",
    cell: (rowData) => {
      return (
        <div className="w-[40px]">
          {rowData.owner.reduce((acc, curr) => acc + curr.stock, 0)}
        </div>
      );
    },
  },
  {
    title: "Sucursal",
    cell: (rowData) => {
      const locations = new Set();
      rowData.owner.map((owner) => locations.add(owner.location.name));

      return <div className="w-[40px]">{Array.from(locations).join(", ")}</div>;
    },
  },
  { title: "Categoría", cell: (rowData) => <div>{rowData.category.name}</div> },
  {
    title: "Disponible",
    cell: (rowData) => {
      const ctx = api.useContext();
      const { mutate } = api.equipment.putAvailability.useMutation();

      const handleChangeAvailability = (checked: boolean) => {
        mutate(
          { equipmentId: rowData.id, availability: checked },
          {
            onSuccess: () => {
              void ctx.equipment.adminGetEquipment.invalidate();
            },
          }
        );
      };

      return (
        <div className="flex justify-center">
          <Switch
            checked={rowData.available}
            title="habilitado"
            onCheckedChange={(e) => handleChangeAvailability(e)}
          />
        </div>
      );
    },
  },
  {
    title: "",
    cell: (rowData, cellData) => (
      <ActionsDropMenu
        equipment={rowData}
        setShowAddEquipmentModal={cellData.cellProps?.setShowAddEquipmentModal}
        setEquipmentId={cellData.cellProps?.setEquipmentId}
        setEquipmentToEdit={cellData.cellProps?.setEquipmentToEdit}
        setShowStockModal={cellData.cellProps?.setShowStockModal}
        setShowDeleteModal={cellData.cellProps?.setShowDeleteModal}
      />
    ),
  },
];

type Props = {
  locations: Location[];
  owners: Owner[];
  categories: Category[];
};

const EquipmentAdmin: NextPage<Props> = ({
  locations,
  owners,
  categories,
}: Props) => {
  const { register, setValue, watch } = useForm<{
    search: string;
    location: string;
    categoryId: string;
  }>();

  const ctx = api.useContext();

  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(
    null
  );
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const search = useDebounce(watch("search", ""), 500);
  const locationId = watch("location");
  const categoryId = watch("categoryId", "all");

  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const equipment = api.equipment.getAdminEquipmentById.useQuery({
    equipmentId,
  });

  const { data } = api.equipment.adminGetEquipment.useQuery({
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    locationId,
    categoryId,
    search,
  });

  const deleteEquipment = api.equipment.deleteEquipment.useMutation();

  const handleDeleteEquipment = (equipmentId: string) => {
    deleteEquipment.mutate(
      { equipmentId },
      {
        onSuccess: () => {
          void ctx.equipment.adminGetEquipment.invalidate();
          setShowDeleteModal(false);
        },
        onError: () => {
          setShowDeleteModal(false);
        },
      }
    );
  };

  const cellProps = {
    setShowAddEquipmentModal,
    setEquipmentId,
    setEquipmentToEdit,
    setShowStockModal,
    setShowDeleteModal,
  };

  return (
    <>
      <Head>
        <title>Guanaco Admin | Equipos</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/logo-favicon.ico" />
      </Head>

      {equipment.data && (
        <OwnerLocationStockModal
          isOpen={showStockModal}
          setOpen={setShowStockModal}
          equipment={equipment.data}
          locations={locations}
          owners={owners}
        />
      )}

      <DialogWithState
        isOpen={showAddEquipmentModal}
        setOpen={setShowAddEquipmentModal}
        title={equipment ? "Editar equipo" : "Agregar equipo"}
      >
        <AddEquipment
          equipment={equipmentToEdit}
          setEquipmentToEdit={setEquipmentToEdit}
          setShowAddEquipmentModal={setShowAddEquipmentModal}
        />
      </DialogWithState>

      {equipmentToEdit && (
        <DialogWithState
          isOpen={showDeleteModal}
          setOpen={setShowDeleteModal}
          title={"Seguro que deseas eliminar el equipo?"}
        >
          <div className="flex justify-end">
            <Button
              onClick={() =>
                equipment && handleDeleteEquipment(equipmentToEdit.id)
              }
              variant="destructive"
            >
              Eliminar
            </Button>
          </div>
        </DialogWithState>
      )}

      <Nav />

      <main className="">
        <AdminLayout route="Equipos">
          <h1 className="text-lg font-bold">Equipos</h1>
          <div className="flex flex-wrap items-start gap-4 pt-6">
            <div className="flex w-full flex-wrap items-center gap-4 rounded-md bg-white p-4 md:w-2/3">
              <Input
                type="search"
                placeholder="buscar por nombre, marca o modelo"
                {...register("search")}
              />
              <Label>Sucursal</Label>
              <AdminSelectLocation
                locations={locations}
                setValue={(e) => setValue("location", e)}
              >
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="none">Sin sucursal</SelectItem>
              </AdminSelectLocation>
              <Label>Categoría</Label>
              <SelectCategory
                categories={categories}
                setValue={(e) => setValue("categoryId", e)}
              />
            </div>
            <div className="ml-auto flex items-start gap-6">
              <p>total: {data?.totalCount}</p>
              <Button
                onClick={() => {
                  setEquipmentId(null);
                  setShowAddEquipmentModal(true);
                }}
                size="sm"
                className="whitespace-nowrap"
              >
                Agregar equipo
              </Button>
            </div>
          </div>
          <div className="pt-6">
            {data?.equipment && (
              <DataTable
                columns={equipmentColumns}
                data={data.equipment}
                setRowData={setEquipmentToEdit}
                cellProps={cellProps}
              />
            )}
            {data?.equipment.length === 0 && (
              <div className="p-4">No hay equipos.</div>
            )}

            <Pagination
              totalCount={data?.totalCount ?? 0}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page as number)}
            />
          </div>
        </AdminLayout>
      </main>
    </>
  );
};

type OwnerLocationStockProps = {
  equipment: Equipment;
  locations: Location[];
  owners: Owner[];
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const OwnerLocationStockModal = ({
  equipment,
  locations,
  owners,
  isOpen,
  setOpen,
}: OwnerLocationStockProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    // formState: { errors },
  } = useForm<OwnerequipmentForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "owner",
  });

  const ctx = api.useContext();

  const { mutate, isLoading } =
    api.equipment.createEquipmentOnOwner.useMutation();
  const deleteEquipmenOnOwner =
    api.equipment.deleteEquipmentOnOwner.useMutation();

  const onSubmit = (data: OwnerequipmentForm) => {
    const mutateData = {
      owner: data.owner.map((owner) => ({
        ...owner,
        equipmentId: equipment.id,
      })),
    };

    mutate(mutateData, {
      onSuccess: () => {
        void ctx.equipment.adminGetEquipment.invalidate();
        void ctx.equipment.getAdminEquipmentById.invalidate();
        // setOpen(false);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  const handleDeleteStock = (id: string) => {
    deleteEquipmenOnOwner.mutate(
      { ownerId: id },
      {
        onSuccess: () => {
          void ctx.equipment.adminGetEquipment.invalidate();
          void ctx.equipment.getAdminEquipmentById.invalidate();
          // setOpen(false);
        },
      }
    );
  };

  return (
    <>
      <DialogWithState
        title={`${equipment.name} ${equipment.brand}`}
        description={equipment.model}
        isOpen={isOpen}
        setOpen={setOpen}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-7 gap-4 pb-2 text-sm font-semibold">
            <Label className="col-span-2">Dueño</Label>
            <Label className="col-span-2">Sucursal</Label>
            <Label className="col-span-2">Stock</Label>
          </div>
          <div className="grid gap-2">
            {equipment.owner?.map((owner) => (
              <div
                key={owner.id}
                className="grid grid-cols-7 items-center gap-2"
              >
                <p className="col-span-2 rounded-md border border-input px-3 py-1 text-sm">
                  {owner.owner?.name}
                </p>
                <p className="col-span-2 rounded-md border border-input px-3 py-1 text-sm">
                  {owner.location.name}
                </p>
                <p className="col-span-2 rounded-md border border-input px-3 py-1 text-sm">
                  {owner.stock}
                </p>
                <RemoveStockAlert
                  isLoading={isLoading}
                  handleDeleteStock={() => handleDeleteStock(owner.id)}
                />
              </div>
            ))}
            <div className="pt-4">
              {fields?.map((field, index) => (
                <FieldArray
                  key={field.id}
                  remove={remove}
                  locations={locations}
                  owners={owners}
                  register={register}
                  setValue={setValue}
                  index={index}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => append({ ownerId: "", stock: 1, locationId: "" })}
              className="flex items-center gap-2 "
            >
              Agregar dueño <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Actualizar"
              )}
            </Button>
          </div>
        </form>
      </DialogWithState>
    </>
  );
};

type RemoveStockAlert = {
  handleDeleteStock: () => void;
  isLoading: boolean;
};

const RemoveStockAlert = ({
  handleDeleteStock,
  isLoading,
}: RemoveStockAlert) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="ml-auto h-7 w-7 p-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Estas seguro que quieres eliminar este stock?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Marcará el stock como eliminado, y podrás crear uno nuevo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleDeleteStock}
            className="bg-red-600"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type SelecCategoryProps = {
  categories: Category[];
  setValue: (e: string) => void;
};

const SelectCategory = ({ categories, setValue }: SelecCategoryProps) => {
  return (
    <Select onValueChange={setValue} defaultValue="all">
      <SelectTrigger>
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categorías</SelectLabel>
          <SelectItem value="all">Todas</SelectItem>
          {categories.map((category) => (
            <SelectItem value={category.id} key={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

type FieldArrayProps = {
  owners: Owner[];
  locations: Location[];
  register: UseFormRegister<OwnerequipmentForm>;
  index: number;
  setValue: UseFormSetValue<OwnerequipmentForm>;
  remove: UseFieldArrayRemove;
};

const FieldArray = ({
  owners,
  locations,
  register,
  index,
  remove,
  setValue,
}: FieldArrayProps) => {
  return (
    <section className="grid grid-cols-7 items-center gap-2 rounded-md bg-slate-50 p-2">
      <div className="col-span-2">
        <SelectOwner owners={owners} index={index} setValue={setValue} />
      </div>
      <div className="col-span-2">
        <AdminSelectLocation
          locations={locations}
          setValue={(e) => setValue(`owner.${index}.locationId` as const, e)}
          className="h-6"
        />
      </div>
      <Input
        type="text"
        {...register(`owner.${index}.stock` as const, {
          valueAsNumber: true,
        })}
        className="col-span-2 h-6"
      />
      <Button
        variant="link"
        className="text-gray-800"
        onClick={() => remove(index)}
      >
        <X className="h-3 w-3" />
      </Button>
    </section>
  );
};

type SelectOwnerProps = {
  defaultValue?: string;
  owners: Owner[];
  index: number;
  setValue: UseFormSetValue<OwnerequipmentForm>;
};

const SelectOwner = ({
  defaultValue,
  owners,
  index,
  setValue,
}: SelectOwnerProps) => {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={(e) => setValue(`owner.${index}.ownerId` as const, e)}
    >
      <SelectTrigger className="h-6">
        <SelectValue placeholder="elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dueños</SelectLabel>
          {owners.map((owner) => (
            <SelectItem value={owner.id} key={owner.id}>
              {owner.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

type ActionsProps = {
  equipment: Equipment;
  setShowAddEquipmentModal?: Dispatch<SetStateAction<boolean>>;
  setEquipmentId?: Dispatch<SetStateAction<string | null>>;
  setEquipmentToEdit?: Dispatch<SetStateAction<Equipment | null>>;
  setShowStockModal?: Dispatch<SetStateAction<boolean>>;
  setShowDeleteModal?: Dispatch<SetStateAction<boolean>>;
};

const ActionsDropMenu = ({
  setEquipmentId,
  setEquipmentToEdit,
  setShowAddEquipmentModal,
  equipment,
  setShowStockModal,
  setShowDeleteModal,
}: ActionsProps) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setEquipmentToEdit && setEquipmentToEdit(equipment);
              setShowAddEquipmentModal && setShowAddEquipmentModal(true);
            }}
          >
            Editar equipo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setEquipmentId && setEquipmentId(equipment.id);
              setShowStockModal && setShowStockModal(true);
            }}
          >
            Editar stock
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setEquipmentToEdit && setEquipmentToEdit(equipment);
              setShowDeleteModal && setShowDeleteModal(true);
            }}
            className="text-red-500"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

type AddEquipmentForm = {
  name: string;
  model: string;
  brand: string;
  price: number;
  image: string;
  categoryId: string;
  accessories: string[];
};

type AddEquipmentProps = {
  equipment: Equipment | null;
  setEquipmentToEdit: Dispatch<SetStateAction<Equipment | null>>;
  setShowAddEquipmentModal?: Dispatch<SetStateAction<boolean>>;
};

const AddEquipment = ({
  equipment,
  setEquipmentToEdit,
  setShowAddEquipmentModal,
}: AddEquipmentProps) => {
  const { register, handleSubmit, setValue } = useForm<AddEquipmentForm>();

  const ctx = api.useContext();
  const { mutate, isLoading } = api.equipment.createEquipment.useMutation();
  const editEquipment = api.equipment.putEquipment.useMutation();

  const onSubmit = (data: AddEquipmentForm) => {
    if (equipment) {
      return editEquipment.mutate(
        {
          ...data,
          equipmentId: equipment.id,
          categoryId: data.categoryId ?? equipment.categoryId,
        },
        {
          onSuccess: () => {
            void ctx.equipment.adminGetEquipment.invalidate();
            setEquipmentToEdit(null);
            setShowAddEquipmentModal && setShowAddEquipmentModal(false);
          },
        }
      );
    }
    mutate(data, {
      onSuccess: () => {
        void ctx.equipment.adminGetEquipment.invalidate();
        setShowAddEquipmentModal && setShowAddEquipmentModal(false);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          type="text"
          id="name"
          {...register("name")}
          defaultValue={equipment?.name}
        />
      </div>

      <div>
        <Label htmlFor="brand">Marca</Label>
        <Input
          type="text"
          id="brand"
          {...register("brand")}
          defaultValue={equipment?.brand}
        />
      </div>

      <div>
        <Label htmlFor="model">Modelo</Label>
        <Input
          type="text"
          id="model"
          {...register("model")}
          defaultValue={equipment?.model}
        />
      </div>

      <div>
        <Label htmlFor="price">Precio</Label>
        <Input
          type="text"
          id="price"
          {...register("price", { valueAsNumber: true })}
          defaultValue={equipment?.price}
        />
      </div>

      <div>
        <Label>Categoría</Label>
        <SelectEquipmentCategory
          setValue={setValue}
          defaultValue={equipment?.categoryId}
        />
      </div>

      <div>
        <Label htmlFor="image">Imagen</Label>
        <Input
          type="text"
          id="image"
          {...register("image")}
          defaultValue={equipment?.image ?? undefined}
        />
      </div>

      <div>
        <Label htmlFor="accessories">Accesorios</Label>
        <Input
          type="text"
          id="accessories"
          {...register("accessories.0")}
          defaultValue={equipment?.accessories[0]}
        />
      </div>

      <div className="grid py-6">
        <Button disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : equipment ? (
            "Actualizar"
          ) : (
            "Agregar"
          )}
        </Button>
      </div>
    </form>
  );
};

const SelectEquipmentCategory = ({
  setValue,
  defaultValue,
}: {
  setValue: UseFormSetValue<AddEquipmentForm>;
  defaultValue?: string;
}) => {
  const { data } = api.category.getAllCategories.useQuery();

  return (
    <Select
      onValueChange={(e) => setValue("categoryId", e)}
      defaultValue={defaultValue}
    >
      <SelectTrigger>
        <SelectValue placeholder="seleccionar categoría" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categorías</SelectLabel>
          {data?.map((category) => (
            <SelectItem value={category.id} key={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const isAdmin = getIsAdmin(session);

  if (!isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjason,
  });

  const locations = await prisma.location.findMany({});
  const owners = await prisma.owner.findMany({});
  const categories = await prisma.category.findMany({});

  await helpers.equipment.adminGetEquipment.prefetch({ take: 15, skip: 0 });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      locations,
      owners,
      categories,
    },
  };
};

export default EquipmentAdmin;
