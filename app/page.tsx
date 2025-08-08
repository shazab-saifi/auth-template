"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-xl font-medium">
        Loading...
      </div>
    );
  }

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
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
          <button
            className="rounded border border-black px-4 py-2 hover:bg-gray-50"
            onClick={() =>
              signIn("credentials", {
                email: "user@example.com",
                username: "user",
                password: "password",
              })
            }
          >
            Demo credentials sign-in
          </button>
        </div>
      )}
    </div>
  );
}
