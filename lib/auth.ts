import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import prisma from "./prismaSingleton";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";

export const authProviders: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        name: { label: "Username", type: "text", placeholder: "Username" },
        email: { label: "Email", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.password ||
          !credentials?.email ||
          !credentials.name
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
  pages: {
    signIn: "/signin",
  },
  // Handler callbacks accrording to your need.
  callbacks: {
    async signIn({ user, account }) {
      try {
        await prisma.user.upsert({
          where: { email: user.email as string },
          update: { provider: account?.provider.toUpperCase() },
          create: {
            name: user.name as string,
            email: user.email as string,
            provider: account?.provider.toUpperCase() as string,
          },
        });

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};
