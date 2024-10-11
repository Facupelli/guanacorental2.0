import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db";
import type { Role } from "@/types/models";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: Role[];
      customerApproved: boolean;
      petitionSent: boolean;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Facebook, Google],
  callbacks: {
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    session: async ({ session, user }) => {
      const userRole = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          role: { select: { name: true } },
          customer_approved: true,
          petition_sent: true,
        },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: userRole?.role,
          customerApproved: userRole?.customer_approved,
          petitionSent: userRole?.petition_sent,
        },
      };
    },
  },
  pages: {
    newUser: "/new-user",
    signIn: "/",
  },
});
