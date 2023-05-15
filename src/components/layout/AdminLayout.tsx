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
      <section className="fixed top-[70px] w-full sm:w-[180px]">
        <AdminNav />
      </section>
      <section className="min-h-[calc(100vh_-_70px)] px-10  py-6 sm:ml-[180px]">
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
    <nav className="h-fit w-full bg-primary/90 sm:h-screen sm:w-[180px]">
      <ul className="flex items-center gap-2 overflow-x-auto p-2 sm:grid sm:p-4">
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
                })} flex items-center gap-2`}
              >
                {route.name}
                {route.icon}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminLayout;
