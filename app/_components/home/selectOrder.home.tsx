"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useGetQueryParams } from "~/hooks/useGetQueryParams";
import { useRouter } from "next/navigation";

export default function SelectOrder() {
  const router = useRouter();
  const { createQueryString } = useGetQueryParams();

  const handleSetSort = (e: string) => {
    const query = createQueryString("sortBy", e);
    router.replace(`?${query}`);
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {/* <Label htmlFor="location">Sucursal:</Label> */}
      <Select onValueChange={handleSetSort}>
        <SelectTrigger className="h-8 w-[180px] md:h-10">
          <SelectValue placeholder="Ordenar por precio" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Precio</SelectLabel>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="asc">Ascendente</SelectItem>
            <SelectItem value="desc">Descendente</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
