import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prismaSingleton";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";

export const authProviders: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        email: { label: "Email", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.password ||
          !credentials?.email ||
          !credentials.username
        ) {
          return null;
        }
        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials?.email },
          });

          if (!user) return null;
          if (!credentials?.password || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials?.password,
            user.password,
          );

          if (!isPasswordValid) return null;

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const email = user?.email ?? undefined;
          if (!email) return false;

          const existingUser = await prisma.user.findFirst({
            where: { email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email,
                name: user?.name ?? "",
                provider: "GOOGLE",
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error("signIn callback error", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // On initial sign in, persist user fields onto the token
      if (user) {
        (token as any).id = (user as any).id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }

      // Backfill id on subsequent requests if missing
      if (!(token as any).id && token.email) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: { email: token.email },
          });
          if (dbUser) {
            (token as any).id = dbUser.id.toString();
          }
        } catch {}
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id ?? token.sub ?? null;
        session.user.email = token.email ?? session.user.email ?? null;
        session.user.name = token.name ?? session.user.name ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const urlObject = new URL(url, baseUrl);
        if (urlObject.origin === baseUrl || url.startsWith("/")) {
          return urlObject.pathname.startsWith("/")
            ? urlObject.toString()
            : `${baseUrl}${urlObject.pathname}${urlObject.search}`;
        }
      } catch {}
      return baseUrl;
    },
  },
};
