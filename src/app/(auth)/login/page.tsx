import Link from "next/link";

import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const {
    error,
    success,
  } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-700">
            Careerflow
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue building your career.
          </p>
        </div>

        {/* SUCCESS MESSAGES */}

        {success === "password_updated" && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">
              Password updated successfully.
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              You can sign in with your new password.
            </p>
          </div>
        )}

        {success === "account_deleted" && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">
              Account deleted successfully.
            </p>
          </div>
        )}

        {/* ERROR MESSAGES */}

        {error === "invalid_credentials" && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              Invalid email or password.
            </p>

            <p className="mt-1 text-xs text-red-600">
              Please check your credentials and try again.
            </p>
          </div>
        )}

        {error === "reset_link_expired" && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              Password reset link expired.
            </p>

            <p className="mt-1 text-xs text-red-600">
              Please request a new password reset link.
            </p>
          </div>
        )}

        {/* LOGIN FORM */}

        <form
          action={login}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* SIGN IN BUTTON */}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Sign in
          </button>

        </form>

        {/* SIGN UP */}

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}

          <Link
            href="/signup"
            className="font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            Create one
          </Link>
        </p>

      </div>
    </main>
  );
}