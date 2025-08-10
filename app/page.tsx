"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-xl font-medium">
        Loading...
      </div>
    );
  }

  console.log(session);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 text-center">
      <div className="text-2xl font-semibold">NextAuth Template</div>
      {session?.user ? (
        <div className="flex flex-col items-center gap-3">
          <div>
            Signed in as{" "}
            <span className="font-semibold">{session.user.email}</span>
          </div>
          <button
            className="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/signin"
            className="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
