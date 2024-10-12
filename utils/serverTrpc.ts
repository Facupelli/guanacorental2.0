import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "trpc/routers";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return `http://localhost:3000`;
};

export const serverTrpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
