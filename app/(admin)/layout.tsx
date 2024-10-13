import { getIsAdmin, getIsEmployee } from "~/lib/utils";
import AdminNav from "app/_components/nav/adminNav";
import { auth } from "~/auth";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const isAdmin = getIsAdmin(session);
  const isEmployee = getIsEmployee(session);

  if (!isAdmin && !isEmployee) {
    redirect("/");
  }
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
}
