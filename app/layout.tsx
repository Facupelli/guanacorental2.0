import localFont from "next/font/local";

import "@/styles/globals.css";
import "@/styles/reactcalendar.css";
import "@/utils/dayjs-config";

import { Providers } from "providers/providers";
import ClientInitializer from "hooks/client-initializer";

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

export const metadata = {
  title: "Guanaco Rental",
  description: "Alquiler de equipos audiovisuales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={panton.variable}>
      <body className={panton.className}>
        <Providers>
          <ClientInitializer />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
