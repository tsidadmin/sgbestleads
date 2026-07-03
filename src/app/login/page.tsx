import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 py-16">
      <Brand />
      <div className="mt-8 w-full max-w-sm rounded-[4px] border border-line bg-card p-7">
        <h1 className="text-xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-soft">
          Access your feeds and downloads.
        </p>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-6 text-sm text-soft">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-ink underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
