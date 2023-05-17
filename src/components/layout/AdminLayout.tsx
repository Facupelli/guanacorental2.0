import { type ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import {
  CalendarDays,
  Camera,
  Percent,
  PiggyBank,
  ShoppingBag,
  Users,
} from "lucide-react";
import { getIsEmployee } from "@/lib/utils";
import { useSession } from "next-auth/react";

type Props = {
  children: ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="bg-app-bg pt-[70px]">
      <section className="fixed top-[70px] z-20 w-full md:w-[200px]">
        <AdminNav />
      </section>
      <section className="mt-12 min-h-[calc(100vh_-_70px)] px-4 py-6 md:ml-[200px] md:mt-0 md:px-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </div>
  );
};

const adminRoutes = [
  {
    route: "/admin",
    name: "Calendario",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    route: "/admin/orders",
    name: "Pedidos",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    route: "/admin/users",
    name: "Clientes",
    icon: <Users className="h-5 w-5" />,
  },
  {
    route: "/admin/equipment",
    name: "Equipos",
    icon: <Camera className="h-5 w-5" />,
  },
  {
    route: "/admin/rents",
    name: "Rentas",
    icon: <PiggyBank className="h-5 w-5" />,
  },
  {
    route: "/admin/discounts",
    name: "Descuentos",
    icon: <Percent className="h-5 w-5" />,
  },
];

const AdminNav = () => {
  const { data: session } = useSession();
  const isEmployee = getIsEmployee(session);

  return (
    <nav className="h-fit w-full bg-primary/90 md:h-screen md:w-[200px]">
      <ul className="flex items-center gap-2 overflow-x-auto p-2 md:grid md:p-4">
        {adminRoutes.map((route, i) => {
          if (
            isEmployee &&
            (route.name === "Rentas" || route.name === "Equipos")
          )
            return null;

          return (
            <li key={i} className="">
              <Link
                href={route.route}
                className={`${buttonVariants({
                  variant: "link",
                })} flex items-center gap-4`}
              >
                {route.icon}
                {route.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminLayout;
