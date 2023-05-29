import { useForm } from "react-hook-form";
import superjason from "superjson";
import { getServerSession } from "next-auth";
import { type GetServerSideProps, type NextPage } from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import Head from "next/head";
import Image from "next/image";
import { authOptions } from "@/server/auth";
import { useBoundStore } from "@/zustand/store";
import { type Dispatch, type SetStateAction, useState } from "react";

import Nav from "@/components/Nav";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cart from "@/components/Cart";
import SelectDateButton from "@/components/ui/SelectDateButton";
import SelectLocation from "@/components/ui/SelectLocation";
import { Label } from "@/components/ui/label";
import DialogWithState from "@/components/DialogWithState";
import { FilterIcon, SearchIcon, ShoppingCart } from "lucide-react";

import { api } from "@/utils/api";
import {
  formatPrice,
  handleLocationChange,
  isEquipmentAvailable,
} from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";

import type { Category, Equipment, Location } from "@/types/models";
import Calendar from "react-calendar";
import dayjs from "dayjs";

type Props = {
  locations: Location[];
  categories: Category[];
};

const Home: NextPage<Props> = ({ locations, categories }: Props) => {
  const [showCart, setShowCart] = useState(false);
  const [sort, setSort] = useState<string>("default");
  const [category, setCategory] = useState<string>("");

  const { register, watch } = useForm<{ search: string }>();

  const search = useDebounce(watch("search", ""), 500);

  const location = useBoundStore((state) => state.location);
  const showLocationModal = useBoundStore((state) => state.showLocationModal);
  const toggleModal = useBoundStore((state) => state.setToggleModal);
  const setLocation = useBoundStore((state) => state.setLocation);

  const { data, fetchNextPage, hasNextPage, isLoading } =
    api.equipment.getAllEquipment.useInfiniteQuery(
      {
        sort,
        category,
        location: location.id ?? "Mendoza",
        search,
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const handleLoadMore = async () => {
    await fetchNextPage();
  };

  const equipments = data?.pages.map((page) => page.equipments).flat();

  return (
    <>
      <Head>
        <title>Guanaco Rental</title>
        <meta
          name="description"
          content="Guanaco Rental, alquiler de equipos para cine y fotografía. San Juan, Argentina."
        />
        <meta property="og:title" content="Guanaco Rental" />
        <meta
          property="og:description"
          content="Aquiler de equipos para cine y fotografía."
        />
        <link rel="icon" href="/logo-favicon.ico" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </Head>

      <DialogWithState
        title="¿DONDE QUERÉS ALQUILAR?"
        isOpen={showLocationModal}
        setOpen={toggleModal}
      >
        <Label htmlFor="location" className="col-span-1">
          Sucursal:
        </Label>
        <SelectLocation
          locations={locations}
          placeholder="seleccionar"
          onValueChange={(e) =>
            handleLocationChange(e, setLocation, toggleModal)
          }
        />
      </DialogWithState>

      <Cart open={showCart} setOpen={setShowCart} />

      <Nav />

      <main className="min-h-screen bg-app-bg px-4 pt-[70px] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <section className="mt-6 grid grid-cols-12 gap-x-6 gap-y-2 lg:mt-12">
            <LeftBar
              locations={locations}
              categories={categories}
              setCategory={setCategory}
              selectedCategory={category}
            />
            <div className="col-span-12 flex flex-col gap-4 lg:col-span-9">
              <section className="grid gap-4 rounded-sm bg-white p-4 shadow-sm lg:flex">
                <div className="flex w-full items-center ">
                  <Input
                    type="search"
                    placeholder="Buscar equipos por nombre, marca o modelo"
                    className="rounded-br-none rounded-tr-none"
                    {...register("search")}
                  />
                  <div className="h-10 rounded-br-md rounded-tr-md bg-primary px-3">
                    <SearchIcon className="h-10 w-6 text-primary-foreground" />
                  </div>
                </div>
                <SelectOrder setSort={setSort} />
              </section>
              <section className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] content-start gap-8 pb-10">
                {isLoading && <div>Cargando...</div>}
                {equipments?.length === 0 ? (
                  <p>
                    No se encontraron equipos disponibles para esta sucursal{" "}
                    {":("}
                  </p>
                ) : (
                  equipments?.map((equipment) => (
                    <EquipmentCard
                      key={equipment.id}
                      equipment={equipment}
                      setShowCart={setShowCart}
                    />
                  ))
                )}
              </section>
              {equipments && equipments.length > 0 && hasNextPage && (
                <div className="flex justify-center py-6">
                  <Button onClick={handleLoadMore}>cargar más</Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

type LeftBarProps = {
  locations: Location[];
  categories: Category[];
  setCategory: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
};

const LeftBar = ({
  categories,
  locations,
  setCategory,
  selectedCategory,
}: LeftBarProps) => {
  const startDate = useBoundStore((state) => state.startDate);
  const endDate = useBoundStore((state) => state.endDate);
  const setLocation = useBoundStore((state) => state.setLocation);
  const location = useBoundStore((state) => state.location);

  return (
    <>
      <input className="peer hidden" id="filters" type="checkbox" />
      <label
        htmlFor="filters"
        className="col-span-3 col-start-10 flex justify-end gap-2 pb-2 peer-checked:text-secondary-foreground md:hidden"
      >
        Filtros
        <FilterIcon className="h-5 w-5" />
      </label>
      <section className="fixed left-[-110%] top-[70px] z-10 flex h-screen w-[60%] flex-col justify-start gap-6 overflow-y-auto bg-primary p-4 text-white transition-all duration-300 ease-in-out peer-checked:left-0 sm:z-0 lg:relative lg:left-0 lg:top-0 lg:col-span-3 lg:flex lg:h-[calc(100vh_-_148px)] lg:w-full lg:flex-col lg:gap-4 lg:rounded-md lg:bg-white lg:p-4 lg:text-primary lg:shadow-sm">
        <SelectLocation
          locations={locations}
          placeholder="Elegir sucursal"
          defaultValue={
            location.id ? `${location.id}-${location.name}` : undefined
          }
          onValueChange={(e) => handleLocationChange(e, setLocation)}
        />

        <SelectDateButton />

        <div>
          <div className="flex items-center justify-between">
            <p>Retiro:</p>
            <p className="font-semibold">
              {(startDate && new Date(startDate).toLocaleDateString()) ?? (
                <span className="text-xs text-gray-500">DD/MM/YYYYY</span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p>Devolución:</p>
            <p className="font-semibold">
              {(endDate && new Date(endDate).toLocaleDateString()) ?? (
                <span className="text-xs text-gray-500">DD/MM/YYYYY</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="font-bold">Categorías:</p>
          <ul className="grid">
            <li
              onClick={() => setCategory("")}
              className={`cursor-pointer rounded-sm px-2 py-1 ${
                !selectedCategory
                  ? "bg-secondary font-bold text-secondary-foreground"
                  : ""
              }`}
            >
              Todos
            </li>
            {categories.map((category) => (
              <li
                key={category.id}
                onClick={() => setCategory(category.id)}
                className={`cursor-pointer rounded-sm px-2 py-1 ${
                  selectedCategory === category.id
                    ? "bg-secondary font-bold text-secondary-foreground"
                    : ""
                }`}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

const SelectOrder = ({
  setSort,
}: {
  setSort: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className="ml-auto flex items-center gap-2">
      {/* <Label htmlFor="location">Sucursal:</Label> */}
      <Select onValueChange={(e) => setSort(e)}>
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
};

type EquipmentCardProps = {
  equipment: Equipment;
  setShowCart: Dispatch<SetStateAction<boolean>>;
};
const EquipmentCard = ({ equipment, setShowCart }: EquipmentCardProps) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const cartItems = useBoundStore((state) => state.cartItems);
  const addToCart = useBoundStore((state) => state.addToCart);
  const startDate = useBoundStore((state) => state.startDate);
  const endDate = useBoundStore((state) => state.endDate);

  const isAlreadyInCart = !!cartItems.find((item) => item.id === equipment.id);

  const handleAddToCart = (isAlreadyInCart: boolean, equipment: Equipment) => {
    if (isAlreadyInCart) return;

    addToCart(equipment);

    //LOCALSTORAGE
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      localStorage.setItem(
        "cart",
        JSON.stringify([
          ...JSON.parse(localCart),
          { ...equipment, quantity: 1 },
        ])
      );
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify([{ ...equipment, quantity: 1 }])
      );
    }

    if (cartItems.length === 0) setShowCart(true);
  };

  const available = isEquipmentAvailable(equipment, { startDate, endDate });

  return (
    <>
      <DialogWithState isOpen={showCalendar} setOpen={setShowCalendar} title="">
        <Calendar
          minDate={new Date()}
          tileClassName={({ date }) => {
            if (date < new Date()) {
              return;
            }
            if (
              isEquipmentAvailable(equipment, {
                startDate: date,
                endDate: dayjs(date).add(1, "day").toDate(),
              })
            ) {
              return "free-day";
            }
            return "booked-day";
          }}
        />
      </DialogWithState>
      <article className="grid gap-2 rounded-sm bg-white p-4 shadow-sm">
        {equipment.image && (
          <div className="relative h-[200px] w-auto">
            <Image
              src={equipment.image}
              alt={`${equipment.name} ${equipment.brand} equipment picture`}
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        <div>
          <p className="font-bold">
            {equipment.name} {equipment.brand}
          </p>
          <p>{equipment.model}</p>
        </div>

        <div className="flex items-center justify-end text-sm">
          <p className={`${available ? "text-green-500" : "text-red-500"}`}>
            {available ? "Disponible" : "Reservado"}
          </p>
          <Button
            size="sm"
            variant="darklink"
            className="text-xs"
            onClick={() => setShowCalendar(true)}
          >
            ver más
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{formatPrice(equipment.price)}</p>
          <Button
            size="sm"
            variant="secondary"
            className="font-bold"
            onClick={() => handleAddToCart(isAlreadyInCart, equipment)}
          >
            {isAlreadyInCart ? (
              "Agregado"
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </Button>
        </div>
      </article>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjason,
  });

  const categories = await prisma.category.findMany({});
  const locations = await prisma.location.findMany({});

  await helpers.equipment.getAllEquipment.prefetch({ sort: "", limit: 20 });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      categories,
      locations,
    },
  };
};

export default Home;
