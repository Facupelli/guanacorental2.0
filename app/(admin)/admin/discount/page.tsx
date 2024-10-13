"use client";

import { useSession } from "next-auth/react";
import { type UseFormSetValue, useForm } from "react-hook-form";
import { type Dispatch, type SetStateAction, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import DialogWithState from "@components/DialogWithState";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import DataTable from "@components/ui/data-table";
import { MoreHorizontal } from "lucide-react";

import { getIsAdmin } from "~/lib/utils";
import { COUPON_STATUS, discountStatusClass } from "~/lib/constants";

import type { DiscountType, Prisma } from "@prisma/client";
import type { Columns } from "types/table";
import { toArgentinaDate } from "~/lib/dates";
import { trpc } from "~/trpc/client";

type Discount = Prisma.DiscountGetPayload<{
  include: {
    rule: {
      include: {
        type: true;
      };
    };
    location: true;
  };
}> & { status: string };

type CellProps = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setDiscount: Dispatch<SetStateAction<Discount | null>>;
  isAdmin: boolean | undefined;
};

const columns: Columns<Discount, CellProps>[] = [
  {
    title: "Código",
    cell: (rowData) => (
      <pre className="inline-block rounded-2xl bg-secondary-foreground/10 p-1 px-4">{rowData.code}</pre>
    ),
  },
  {
    title: "Tipo",
    cell: (rowData) => <div>{rowData.rule.type.name}</div>,
  },
  {
    title: "Valor",
    cell: (rowData) => <div>{rowData.rule.value}</div>,
  },
  {
    title: "Mínimo",
    cell: (rowData) => <div>{rowData.min_total}</div>,
  },
  {
    title: "Sucursal",
    cell: (rowData) => <div>{rowData.location.map((location) => location.name).join(", ")}</div>,
  },
  {
    title: "Estado",
    cell: (rowData) => {
      // const status = getDiscountStatus(rowData);

      return (
        <div>
          <span className={discountStatusClass[rowData.status]}>{rowData.status}</span>
        </div>
      );
    },
  },
  {
    title: "Empieza",
    cell: (rowData) => <div>{toArgentinaDate(rowData.starts_at || new Date())}</div>,
  },
  {
    title: "Termina",
    cell: (rowData) => <div>{toArgentinaDate(rowData.ends_at || new Date())}</div>,
  },
  {
    title: "Usado",
    cell: (rowData) => <div>{rowData.usage_count}</div>,
  },
  {
    title: "Límite",
    cell: (rowData) => <div>{rowData.usage_limit}</div>,
  },
  {
    title: "",
    cell: (rowData, cellData) => {
      if (!cellData.cellProps?.isAdmin) {
        return <div />;
      }

      return (
        <ActionsDropMenu
          discount={rowData}
          setShowModal={cellData.cellProps?.setShowModal}
          setDiscount={cellData.cellProps?.setDiscount}
        />
      );
    },
  },
];

type DiscountForm = {
  code: string;
  endsAt?: Date | null;
  startsAt?: Date | null;
  locationIds: string[];
  usageLimit: number;
  typeId: string;
  value: number;
  description?: string;
  minTotal?: number;
};

interface SelectFilter {
  status: string;
}

export default function AdminDiscounts() {
  const { data: session } = useSession();
  const [discountSelected, setDiscount] = useState<Discount | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { setValue, watch } = useForm<SelectFilter>();
  const status = watch("status", COUPON_STATUS.ACTIVE);

  const { data } = trpc.discount.getAllDiscounts.useQuery({ status });

  const filteredDiscounts = data?.discounts?.filter((discount) => {
    if (status === "all") {
      return true;
    } else {
      return discount.status === status;
    }
  });

  const isAdmin = getIsAdmin(session);

  const cellProps = {
    setShowModal,
    setDiscount,
    isAdmin,
  };

  return (
    <>
      <DialogWithState setOpen={setShowModal} isOpen={showModal} title="Crear Descuento">
        <DiscountForm setShowModal={setShowModal} discountTypes={data?.types} discountSelected={discountSelected} />
      </DialogWithState>

      <>
        <h1 className="text-lg font-bold">DESCUENTOS</h1>
        <div className="grid grid-cols-12 gap-6 pt-6">
          <div className="col-span-12 flex items-center gap-4">
            <div className="ml-auto grow rounded-md bg-white p-1">
              <SelectFilterDiscount setValue={setValue} value={status} />
            </div>
            <div className="">
              <Button
                onClick={() => {
                  setDiscount(null);
                  setShowModal(true);
                }}
                size="sm"
                disabled={!isAdmin}
              >
                Crear descuento
              </Button>
            </div>
          </div>

          <div className="col-span-12">
            {filteredDiscounts && (
              <DataTable data={filteredDiscounts} columns={columns} cellProps={cellProps} setRowData={setDiscount} />
            )}
          </div>
        </div>
      </>
    </>
  );
}

type SelectProps = {
  setValue: UseFormSetValue<SelectFilter>;
  value: string;
};

const SelectFilterDiscount = ({ setValue, value }: SelectProps) => {
  return (
    <Select onValueChange={(e) => setValue("status", e)} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Filtrar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Mes</SelectLabel>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={COUPON_STATUS.ACTIVE}>Activos</SelectItem>
          <SelectItem value={COUPON_STATUS.ENDED}>Finalizados</SelectItem>
          <SelectItem value={COUPON_STATUS.PENDING}>Pendientes</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

type DiscountFormProps = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  discountTypes: DiscountType[] | undefined;
  discountSelected: Discount | null;
};

const DiscountForm = ({ setShowModal, discountTypes, discountSelected }: DiscountFormProps) => {
  const { register, handleSubmit, setValue } = useForm<DiscountForm>();

  const ctx = trpc.useContext();
  const { mutate } = trpc.discount.createDiscount.useMutation();
  const locations = trpc.location.getAllLocations.useQuery();

  const onSubmit = (data: DiscountForm) => {
    mutate(
      {
        ...data,
        endsAt: data.endsAt ?? null,
        startsAt: data.startsAt ?? null,
        usageLimit: data.usageLimit > 0 ? data.usageLimit : null,
      },
      {
        onSuccess: () => {
          void ctx.discount.getAllDiscounts.invalidate();
          setShowModal(false);
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label id="code">Código</Label>
        <Input type="text" {...register("code")} required defaultValue={discountSelected?.code} />
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div>
          <Label id="starts">Empieza</Label>
          <Input
            type="date"
            {...register("startsAt", { valueAsDate: true })}
            defaultValue={discountSelected?.starts_at?.toDateString()}
          />
        </div>

        <div>
          <Label id="ens">Termina</Label>
          <Input
            type="date"
            {...register("endsAt", { valueAsDate: true })}
            defaultValue={discountSelected?.ends_at?.toDateString()}
          />
        </div>
      </div>

      <div>
        <Label id="limit">Límite</Label>
        <Input
          type="text"
          {...register("usageLimit", { valueAsNumber: true })}
          defaultValue={discountSelected?.usage_limit ?? undefined}
        />
      </div>

      <div className="grid gap-2">
        <Label>Sucursales:</Label>
        <div className="grid grid-cols-3">
          {locations.data &&
            locations.data.map((location) => (
              <div className="flex items-center gap-4" key={location.id}>
                <Input
                  className="h-5 w-5"
                  type="checkbox"
                  id={location.name}
                  value={location.id}
                  {...register("locationIds", { required: true })}
                  defaultChecked={
                    discountSelected
                      ? discountSelected.location.map((location) => location.id).includes(location.id)
                      : undefined
                  }
                />
                <Label htmlFor={location.name}>{location.name}</Label>
              </div>
            ))}
        </div>
      </div>

      {discountTypes && (
        <div>
          <Label id="limit">Tipo</Label>
          <SelectDiscountType types={discountTypes} setValue={setValue} />
        </div>
      )}

      <div>
        <Label id="value">Valor</Label>
        <Input
          type="text"
          {...register("value", { valueAsNumber: true })}
          defaultValue={discountSelected?.rule?.value}
          required
        />
      </div>

      <div>
        <Label id="value">Mínimo de la orden</Label>
        <Input
          type="text"
          {...register("minTotal", { valueAsNumber: true })}
          defaultValue={discountSelected?.min_total ?? 0}
        />
      </div>

      <div className="grid gap-4 pt-4">
        <Button type="submit">Crear</Button>
      </div>
    </form>
  );
};

const SelectDiscountType = ({
  types,
  setValue,
}: {
  types: DiscountType[];
  setValue: UseFormSetValue<DiscountForm>;
}) => {
  return (
    <Select
      onValueChange={(e) => setValue("typeId", e)}
      // defaultValue={types.find((type) => type.name === "Percentage")?.id}
    >
      <SelectTrigger>
        <SelectValue placeholder="selecionar tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipo de descuento</SelectLabel>
          {types.map((type) => (
            <SelectItem
              value={type.id}
              key={type.id}
              // disabled={type.name === "Fixed"}
            >
              {type.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const ActionsDropMenu = ({
  setShowModal,
  setDiscount,
  discount,
}: {
  setShowModal?: Dispatch<SetStateAction<boolean>>;
  setDiscount?: Dispatch<SetStateAction<Discount | null>>;
  discount: Discount;
}) => {
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
        <DropdownMenuItem
          onClick={() => {
            setDiscount && setDiscount(discount);
            setShowModal && setShowModal(true);
          }}
        >
          editar
        </DropdownMenuItem>
        <DropdownMenuItem>deshabilitar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
