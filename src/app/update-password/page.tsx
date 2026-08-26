import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const { error } = await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?error=reset_link_expired"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

        {/* ICON */}

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <KeyRound className="h-5 w-5 text-emerald-700" />
        </div>

        {/* HEADER */}

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Careerflow
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Create a new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter and confirm your new password below.
          </p>
        </div>

        {/* ERRORS */}

        {error === "missing_fields" && (
          <ErrorMessage>
            Please enter and confirm your new password.
          </ErrorMessage>
        )}

        {error === "password_too_short" && (
          <ErrorMessage>
            Your password must be at least 8 characters.
          </ErrorMessage>
        )}

        {error === "password_mismatch" && (
          <ErrorMessage>
            The passwords do not match.
          </ErrorMessage>
        )}

        {error === "update_failed" && (
          <ErrorMessage>
            We couldn&apos;t update your password. Please request a new reset
            link and try again.
          </ErrorMessage>
        )}

        {/* FORM */}

        <form
          action={updatePassword}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Minimum 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Update Password
          </button>
        </form>

      </div>
    </main>
  );
}

function ErrorMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm font-medium text-red-700">
        {children}
      </p>
    </div>
  );
}