import localFont from "next/font/local";

import "../styles/globals.css";
import "../styles/reactcalendar.css";
import "~/utils/dayjs-config";

import { Providers } from "~/providers/providers";
import ClientInitializer from "~/hooks/client-initializer";
import { type Metadata } from "next";
import Script from "next/script";
import Nav from "./_components/nav";
import { trpc } from "~/trpc/server";

const panton = localFont({
  src: [
    {
      path: "../public/fonts/panton-thin.woff2",
      weight: "100",
    },
    {
      path: "../public/fonts/panton-light.woff2",
      weight: "300",
    },
    {
      path: "../public/fonts/panton-regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/panton-semibold.woff2",
      weight: "600",
    },
    {
      path: "../public/fonts/panton-bold.woff2",
      weight: "700",
    },
    {
      path: "../public/fonts/panton-extrabold.woff2",
      weight: "800",
    },
  ],
  variable: "--font-panton",
});

export const metadata: Metadata = {
  title: "Guanaco Rental",
  description: "Guanaco Rental, alquiler de equipos para cine y fotografía. San Juan, Argentina.",
  openGraph: {
    title: "Guanaco Rental",
    description: "Aquiler de equipos para cine y fotografía.",
  },
  icons: {
    icon: "/logo-favicon.ico",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await trpc.location.getAllLocations.prefetch();
  await trpc.category.getAllCategories.prefetch();
  // TODO: save the default location in db, user preferences, so we can prefetch the equipments in the server

  return (
    <html lang="en" className={panton.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""}');
              `,
          }}
        />
      </head>
      <body className={panton.className}>
        <Providers>
          <ClientInitializer />

          <Nav />
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
