import { getServerSession } from "next-auth";
import ClientNewUserPage from "./page.client";
import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/utils";
import Script from "next/script";
import Nav from "app/_components/nav";

export default async function NewUserPage() {
  const session = await getServerSession();

  console.log({ session });

  if (!session) {
    redirect("/api/auth/signin");
  }

  const isAdmin = getIsAdmin(session);

  if (session.user.customerApproved && !isAdmin) {
    return redirect("/");
  }

  return (
    <>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" async></Script>
      <Nav />

      <main className="min-h-screen bg-app-bg px-10 pt-[70px]">
        <div className="mx-auto max-w-7xl">
          <ClientNewUserPage />
        </div>
      </main>
    </>
  );
}
