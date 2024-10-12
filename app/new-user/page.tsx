import ClientNewUserPage from "./page.client";
import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/utils";
import Script from "next/script";
import { auth } from "auth";

export default async function NewUserPage() {
  const session = await auth();

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

      <main className="min-h-screen bg-app-bg px-10 pt-[70px]">
        <div className="mx-auto max-w-7xl">
          <ClientNewUserPage />
        </div>
      </main>
    </>
  );
}
