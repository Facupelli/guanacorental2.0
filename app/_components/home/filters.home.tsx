"use client";

import { Input } from "@components/ui/input";
import useDebounce from "~/hooks/useDebounce";
import { useGetQueryParams } from "~/hooks/useGetQueryParams";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function Filters() {
  const router = useRouter();
  const { register, watch } = useForm<{ search: string }>();
  const search = useDebounce(watch("search", ""), 500);
  const { createQueryString } = useGetQueryParams();

  useEffect(() => {
    const query = createQueryString("s", search);
    router.replace(`?${query}`);
  }, [search, router, createQueryString]);

  return (
    <div className="flex w-full items-center ">
      <Input
        type="search"
        placeholder="Buscar por nombre, marca o modelo"
        className="rounded-br-none rounded-tr-none focus-visible:outline focus-visible:ring-0"
        {...register("search")}
      />
      <div className="h-10 rounded-br-md rounded-tr-md bg-primary px-3">
        <SearchIcon className="h-10 w-6 text-primary-foreground" />
      </div>
    </div>
  );
}
