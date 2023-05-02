import Link from "next/link";
import { buttonVariants } from "./ui/button";

const adminRoutes = [
  { route: "/admin", name: "Calendario" },
  { route: "/admin/orders", name: "Pedidos" },
  { route: "/admin/users", name: "Clientes" },
  { route: "/admin/equipment", name: "Equipos" },
  { route: "/admin/rents", name: "Rentas" },
  { route: "/admin/discounts", name: "Descuentos" },
];

const AdminNav = () => {
  return (
    <nav className="h-screen w-[180px] bg-brand-primary/90">
      <ul className="grid gap-2 p-4">
        {adminRoutes.map((route, i) => (
          <li key={i} className="">
            <Link
              href={route.route}
              className={buttonVariants({ variant: "link" })}
            >
              {route.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNav;
