import Link from "next/link";
import { redirect } from "next/navigation";

import {
  CreditCard,
  KeyRound,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import {
  deleteAccount,
  sendPasswordReset,
} from "./actions";
import { createClient } from "@/lib/supabase/server";


type SettingsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const {
    success,
    error,
  } = await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      job_title,
      credits
    `)
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Manage your account, billing, security, and account preferences.
          </p>
        </div>

        {/* ======================================
            MESSAGES
        ====================================== */}

        {success === "password_email_sent" && (
          <Message
            type="success"
            title="Password reset email sent"
            message="Check your inbox for a password reset link."
          />
        )}

        {error === "password_reset_failed" && (
          <Message
            type="error"
            title="We couldn't send the reset email"
            message="Please try again."
          />
        )}

        {error === "delete_confirmation" && (
          <Message
            type="error"
            title="Confirmation required"
            message='Type DELETE exactly to permanently delete your account.'
          />
        )}

        {error === "delete_failed" && (
          <Message
            type="error"
            title="We couldn't delete your account"
            message="Please try again. If the problem continues, contact support."
          />
        )}

        {error === "password_reset_rate_limit" && (
        <Message
            type="error"
            title="Too many reset emails"
            message="Please wait a few minutes before requesting another password reset email."
        />
        )}

        {/* ======================================
            ACCOUNT
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <UserRound className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Account information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information associated with your Careerflow account.
              </p>
            </div>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <InfoField
              label="Name"
              value={
                profile?.full_name ||
                "Not provided"
              }
            />

            <InfoField
              label="Job title"
              value={
                profile?.job_title ||
                "Not provided"
              }
            />

            <InfoField
              label="Email"
              value={
                user.email ||
                "Not available"
              }
            />

            <InfoField
              label="Credits"
              value={`${profile?.credits ?? 0}`}
            />

          </div>

        </section>

        {/* ======================================
            BILLING
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <CreditCard className="h-5 w-5 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Billing & credits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View your credit balance and billing options.
              </p>
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Available credits
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {profile?.credits ?? 0}
              </p>
            </div>

            <Link
              href="/dashboard/billing"
              className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Manage Billing
            </Link>

          </div>

        </section>

        {/* ======================================
            SECURITY
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <KeyRound className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Security
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage password and account access.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold text-slate-900">
                  Password
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Send a password reset link to {user.email}.
                </p>
              </div>

              <form action={sendPasswordReset}>
                <button
                    type="submit"
                    className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Reset Password
                </button>
              </form>

            </div>

          </div>

        </section>

        {/* ======================================
            DANGER ZONE
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-red-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50">
              <ShieldAlert className="h-5 w-5 text-red-700" />
            </div>

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-red-500">
                Danger Zone
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Delete account
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Permanently delete your Careerflow account and associated data.
                This action cannot be undone.
              </p>

            </div>

          </div>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <p className="font-semibold text-red-900">
              Permanently delete your account
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              Your resumes, analyses, applications, generated documents,
              and other account data will be permanently removed.
            </p>

            <form
              action={deleteAccount}
              className="mt-5"
            >
              <label
                htmlFor="confirmation"
                className="block text-sm font-semibold text-red-900"
              >
                Type DELETE to confirm
              </label>

             <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">

            <input
                id="confirmation"
                name="confirmation"
                type="text"
                autoComplete="off"
                placeholder="DELETE"
                className="w-full max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400"
            />

            <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
                Delete Account
            </button>

            </div>

                   <p className="mt-2 text-xs text-red-500">
                This permanently deletes your account and associated data.
              </p>

            </form>

          </div>

        </section>

      </div>
    </div>
  );
}

/* ======================================================
   INFO FIELD
====================================================== */

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* ======================================================
   MESSAGE
====================================================== */

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
      className={`mt-6 rounded-2xl border px-5 py-4 ${
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