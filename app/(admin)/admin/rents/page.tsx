"use client";

import { type UseFormSetValue, useForm } from "react-hook-form";
import dayjs from "dayjs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { formatPrice } from "@/lib/utils";
import { MONTHS, monthList, yearList } from "@/lib/constants";
import { AdminSelectLocation } from "@/components/ui/SelectLocation";
import { trpc } from "trpc/client";

type RentForm = { month: string; year: string; location: string };

export default function ClientAdminRents() {
  const locations = trpc.location.getAllLocations.useQuery();

  const currentMonth = dayjs().month() + 1;
  const formatedCurrentMonth = currentMonth.toString().padStart(2, "0");

  const { setValue, watch } = useForm<RentForm>({
    defaultValues: {
      month: formatedCurrentMonth,
      year: String(dayjs().year()),
    },
  });

  const year = watch("year", "2023");
  const month = watch("month", formatedCurrentMonth);
  const location = watch("location", "all");

  const { data } = trpc.rent.getTotal.useQuery({
    year,
    month,
    location,
  });

  const handleDownloadExcel = () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, month, location }),
    };

    const fetch4nodeBuffer = () =>
      fetch(
        process.env.NODE_ENV === "production"
          ? "https://www.guanacorental.shop/api/4node"
          : `http://localhost:3000/api/4node`,
        options
      );

    fetch4nodeBuffer()
      .then((res) => res.blob())
      .then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `resumen rentas ${month}-${year}.xlsx`;
          link.click();
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1 className="text-lg font-bold">RENTAS</h1>
      <div className="grid gap-6 pt-6">
        {locations.data && (
          <div className="flex items-center gap-4 rounded-md bg-white p-4 md:w-1/2">
            <Label>Sucursal</Label>
            <AdminSelectLocation locations={locations.data} setValue={(e) => setValue("location", e)}>
              <SelectItem value="all">Todas</SelectItem>
            </AdminSelectLocation>
          </div>
        )}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex w-full items-center gap-6 rounded-md bg-white p-4 md:w-1/2">
            <div className="flex w-full items-center gap-2">
              <Label>Mes</Label>
              <SelectMonth setValue={setValue} value={month} />
            </div>
            <div className="flex w-full items-center gap-2">
              <Label>Año</Label>
              <SelectYear setValue={setValue} value={year} />
            </div>
          </div>
          <div className="ml-auto">
            <Button disabled={data?.totalFromOrders === 0} onClick={handleDownloadExcel}>
              Descargar Excel
            </Button>
          </div>
        </section>

        <div className="w-fit rounded-md bg-white px-8 py-4">
          <p className="font-semibold text-primary/70">Total</p>
          <p className="text-2xl font-bold">{formatPrice(data?.totalFromOrders ?? 0)}</p>
        </div>

        <section className="grid gap-4 rounded-md bg-white px-8 py-4 sm:w-fit">
          <div className="grid gap-4">
            <p className="font-semibold text-primary/70">Divisón</p>
            <div className="flex flex-wrap gap-12 gap-y-6">
              <div>
                <p className="text-sm text-primary/70">Federico:</p>
                <p className="text-xl font-semibold">{formatPrice(data?.splitFromEarnings.federico ?? 0)}</p>
              </div>

              <div className="">
                <p className="text-sm text-primary/70">Oscar:</p>
                <p className="text-xl font-semibold">{formatPrice(data?.splitFromEarnings.oscar ?? 0)}</p>
              </div>

              <div className="">
                <p className="text-sm text-primary/70">Subalquiler:</p>
                <p className="text-xl font-semibold">{formatPrice(data?.splitFromEarnings.sub ?? 0)}</p>
              </div>
            </div>
          </div>

          <div className="place-self-end pt-4">
            <p className="text-xs font-semibold text-primary/70">Total División</p>
            <p className="text-base">{formatPrice(data?.totalFromEarnings ?? 0)}</p>
          </div>
        </section>
      </div>
    </>
  );
}

type SelectProps = {
  setValue: UseFormSetValue<RentForm>;
  value: string;
};

const SelectMonth = ({ setValue, value }: SelectProps) => {
  return (
    <Select onValueChange={(e) => setValue("month", e)} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="elegir mes" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Mes</SelectLabel>
          <SelectItem value="all">Todos</SelectItem>
          {monthList.map((month) => (
            <SelectItem value={MONTHS[month] ?? "all"} key={month}>
              {month}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const SelectYear = ({ setValue }: SelectProps) => {
  return (
    <Select onValueChange={(e) => setValue("year", e)} defaultValue={String(dayjs().year())}>
      <SelectTrigger>
        <SelectValue placeholder="elegir año" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Año</SelectLabel>
          <SelectItem value="all">Todos</SelectItem>
          {yearList.map((year) => (
            <SelectItem value={year} key={year}>
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
