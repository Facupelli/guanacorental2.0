import { es } from "date-fns/locale";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
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
import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
  useRef,
} from "react";

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
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cart from "@/components/Cart";
import SelectDateButton from "@/components/ui/SelectDateButton";
import SelectLocation from "@/components/ui/SelectLocation";
import { Label } from "@/components/ui/label";
import DialogWithState from "@/components/DialogWithState";
import { FilterIcon, SearchIcon, ShoppingCart } from "lucide-react";

import { api } from "@/utils/api";
import {
  cn,
  formatPrice,
  handleLocationChange,
  isEquipmentAvailable,
} from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";

import type { Category, Equipment, Location } from "@/types/models";
import { toArgentinaDate } from "@/lib/dates";
import { useSideMenu } from "@/hooks/useSideMenu";

type Props = {
  locations: Location[];
  categories: Category[];
};

const Home: NextPage<Props> = ({ locations, categories }: Props) => {
  const { ref, inView } = useInView();

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

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const equipments = data?.pages
    .map((page) => page.equipments)
    .flat()
    .map((item) => ({
      ...item,
      owner: item.owner.filter(
        (ownerOnEquipment) => ownerOnEquipment.locationId === location.id
      ),
    }));

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
                    placeholder="Buscar por nombre, marca o modelo"
                    className="rounded-br-none rounded-tr-none focus-visible:outline focus-visible:ring-0"
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
                <div className="flex justify-center py-6" ref={ref}>
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
  const { showSideMenu, handleShowSideMenu, setShowSideMenu } = useSideMenu();

  const filtersSectionRef = useRef<HTMLElement | null>(null);

  const startDate = useBoundStore((state) => state.startDate);
  const endDate = useBoundStore((state) => state.endDate);
  const setLocation = useBoundStore((state) => state.setLocation);
  const location = useBoundStore((state) => state.location);
  const emptyCart = useBoundStore((state) => state.emptyCart);

  return (
    <>
      <input
        className="peer hidden"
        id="filters"
        type="checkbox"
        checked={showSideMenu}
        onChange={handleShowSideMenu}
      />
      <label
        htmlFor="filters"
        className="col-span-3 col-start-10 flex justify-end gap-2 pb-2 peer-checked:text-secondary-foreground md:hidden"
      >
        Filtros
        <FilterIcon className="h-5 w-5" />
      </label>
      <section
        ref={filtersSectionRef}
        className="fixed left-[-110%] top-[70px] z-30  flex h-screen w-[60%] flex-col justify-start gap-6 overflow-y-auto bg-primary p-4 text-white transition-all duration-300 ease-in-out peer-checked:left-0 sm:z-0 lg:relative lg:left-0 lg:top-0 lg:col-span-3 lg:flex lg:h-[calc(100vh_-_148px)] lg:w-full lg:flex-col lg:gap-4 lg:rounded-md lg:bg-white lg:p-4 lg:text-primary lg:shadow-sm"
      >
        <SelectLocation
          locations={locations}
          placeholder="Elegir sucursal"
          defaultValue={
            location.id ? `${location.id}-${location.name}` : undefined
          }
          onValueChange={(e) => {
            handleLocationChange(e, setLocation);
            emptyCart();
          }}
        />

        <SelectDateButton />

        <div>
          <div className="flex items-center justify-between">
            <p>Retiro:</p>
            <p className="font-semibold">
              {(startDate && toArgentinaDate(startDate)) ?? (
                <span className="text-xs text-gray-500">DD/MM/YYYYY</span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p>Devolución:</p>
            <p className="font-semibold">
              {(endDate && toArgentinaDate(endDate)) ?? (
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
            {categories
              .sort((a, b) => (a.order > b.order ? 1 : -1))
              .map((category) => (
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
      {showSideMenu && (
        <div
          onClick={() => setShowSideMenu(false)}
          className="fixed right-0 top-0 z-10 h-screen w-full bg-background/30 backdrop-blur-sm"
        />
      )}
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

    if (cartItems.length === 0) setShowCart(true);
  };

  const available = isEquipmentAvailable(equipment, { startDate, endDate });

  const isFreeDay = (date: Date) => {
    if (
      isEquipmentAvailable(equipment, {
        startDate: date,
        endDate: dayjs(date).add(1, "day").toDate(),
      })
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <DialogWithState isOpen={showCalendar} setOpen={setShowCalendar} title="">
        <Calendar
          locale={es}
          fixedWeeks
          initialFocus
          classNames={{
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "w-10 h-10 md:h-12 md:w-16 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary rounded-none"
            ),
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground ",
          }}
          modifiers={{
            freeDay: isFreeDay,
            bookedDay: (date: Date) => !isFreeDay(date),
          }}
          modifiersClassNames={{
            freeDay: "free-day",
            bookedDay: "booked-day",
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
              sizes="(max-width: 468px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
              priority={equipment.model === "FX3 Cinema Line 4K 120 FPS"}
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
            aria-label="add-to-cart-button"
            disabled={!available}
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
