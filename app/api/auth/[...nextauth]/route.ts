import { authProviders } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authProviders);

export { handler as GET, handler as POST };
