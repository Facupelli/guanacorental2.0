import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import "../utils/dayjs-config";

import localFont from "next/font/local";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import "../styles/reactcalendar.css";
import { useLoadLocationFromLocalStorage } from "@/hooks/useLoadLocationFromLocalStorage";
// import { useLoadCartFromLocalStorage } from "@/hooks/useLoadCartFromLocalStorage";

const panton = localFont({
  src: [
    {
      path: "../../public/fonts/panton-thin.woff2",
      weight: "100",
    },
    {
      path: "../../public/fonts/panton-light.woff2",
      weight: "300",
    },
    {
      path: "../../public/fonts/panton-regular.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/panton-semibold.woff2",
      weight: "600",
    },
    {
      path: "../../public/fonts/panton-bold.woff2",
      weight: "700",
    },
    {
      path: "../../public/fonts/panton-extrabold.woff2",
      weight: "800",
    },
  ],
  variable: "--font-panton",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useLoadLocationFromLocalStorage();
  // useLoadCartFromLocalStorage();

  return (
    <SessionProvider session={session}>
      <main className={panton.className}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
