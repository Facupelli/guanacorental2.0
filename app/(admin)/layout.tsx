import AdminNav from "app/_components/nav/adminNav";
import { type ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
