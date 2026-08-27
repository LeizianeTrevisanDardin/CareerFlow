import Link from "next/link";

import {
  ArrowLeft,
  Mail,
} from "lucide-react";

import {
  requestPasswordReset,
} from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const {
    success,
    error,
  } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <p className="text-lg font-bold text-slate-900">
            career
            <span className="text-emerald-600">
              flow
            </span>
          </p>

          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <Mail className="h-5 w-5 text-emerald-700" />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Forgot your password?
          </h1>

          <p className="mt-2 leading-6 text-slate-500">
            Enter the email associated with your Careerflow account and we&apos;ll send you a password reset link.
          </p>

          {success === "email_sent" && (
            <Message
              type="success"
              title="Check your email"
              message="We sent you a password reset link."
            />
          )}

          {error === "missing_email" && (
            <Message
              type="error"
              title="Email required"
              message="Please enter your email address."
            />
          )}

          {error === "rate_limit" && (
            <Message
              type="error"
              title="Too many requests"
              message="Please wait a few minutes before requesting another reset email."
            />
          )}

          {error === "reset_failed" && (
            <Message
              type="error"
              title="We couldn't send the email"
              message="Please try again."
            />
          )}

          <form
            action={requestPasswordReset}
            className="mt-7"
          >

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Send reset link
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>

        </section>

      </div>

    </main>
  );
}

function Message({
  type,
  title,
  message,
}: {
  type: "success" | "error";
  title: string;
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={`mt-6 rounded-xl border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`font-semibold ${
          success
            ? "text-emerald-900"
            : "text-red-900"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-1 text-sm ${
          success
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {message}
      </p>
    </div>
  );
}