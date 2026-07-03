import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 py-16">
      <Brand />
      <div className="mt-8 w-full max-w-sm rounded-[4px] border border-line bg-card p-7">
        <h1 className="text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-soft">
          Free to create — subscribe to a feed when you are ready.
        </p>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
        <p className="mt-6 text-sm text-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
