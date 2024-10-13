import { type Metadata } from "next";
import ClientAdminPage from "../page.client";

export const metadata: Metadata = {
  title: "Guanaco | Calendario",
};

export default function AdminPage() {
  return <ClientAdminPage />;
}
