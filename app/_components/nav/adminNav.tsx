"use client";

import { buttonVariants } from "@components/ui/button";
import { getIsEmployee } from "~/lib/utils";
import { BarChart4, CalendarDays, Camera, CrownIcon, Percent, PiggyBank, ShoppingBag, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  {
    route: "/admin/roles",
    name: "Roles",
    icon: <CrownIcon className="h-5 w-5" />,
  },
  {
    route: "/admin/stats",
    name: "Estadísticas",
    icon: <BarChart4 className="h-5 w-5" />,
  },
];

export default function AdminNav() {
  const activeRoute = usePathname();
  const { data: session } = useSession();
  const isEmployee = getIsEmployee(session);

  return (
    <nav className="h-fit w-full bg-primary/90 md:h-screen md:w-[200px]">
      <ul className="flex items-center gap-2 overflow-x-auto p-2 md:grid md:p-4">
        {adminRoutes.map((route, i) => {
          if (
            isEmployee &&
            (route.name === "Rentas" ||
              route.name === "Equipos" ||
              route.name === "Roles" ||
              route.name === "Estadísticas")
          )
            return null;

          return (
            <li key={i} className="">
              <Link
                href={route.route}
                className={`${buttonVariants({
                  variant: "link",
                })} flex items-center gap-4 ${activeRoute === route.name ? "text-secondary-foreground" : "text-white"}`}
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
}
