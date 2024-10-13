import { useSearchParams } from "next/navigation";

export const useGetQueryParams = () => {
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const queryParams = new URLSearchParams(searchParams?.toString());
    queryParams.set(name, value);
    return queryParams.toString();
  };

  return { createQueryString };
};
