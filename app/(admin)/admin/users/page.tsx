import { type Metadata } from "next";
import ClientAdminUsers from "./page.client";

export const metadata: Metadata = {
  title: "Guanaco | Usuarios",
};

export default function AdminUsersPage() {
  return <ClientAdminUsers />;
}
