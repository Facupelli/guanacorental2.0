import { type Metadata } from "next";
import ClientAdminOrdersPage from "./page.client";

export const metadata: Metadata = {
  title: "Guanaco | Pedidos",
};

export default function AdminOrdersPage() {
  return <ClientAdminOrdersPage />;
}
