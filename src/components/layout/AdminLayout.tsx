import { ReactNode } from "react";
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

type Props = {
  children: ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="pt-[70px]">
      <section className="fixed top-[70px] w-[180px]">
        <AdminNav />
      </section>
      <section className="ml-[180px] min-h-[calc(100vh_-_70px)] bg-app-bg px-10 py-6">
        {children}
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
  return (
    <nav className="h-screen w-[180px] bg-brand-primary/90">
      <ul className="grid gap-2 p-4">
        {adminRoutes.map((route, i) => (
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
        ))}
      </ul>
    </nav>
  );
};

export default AdminLayout;
