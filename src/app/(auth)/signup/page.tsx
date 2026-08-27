"use client";

import Link from "next/link";

import {
  Check,
  Circle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useFormStatus,
} from "react-dom";

import {
  signup,
} from "./actions";

export default function SignupPage() {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const requirements = {
    length:
      password.length >=
      10,

    lowercase:
      /[a-z]/.test(
        password
      ),

    uppercase:
      /[A-Z]/.test(
        password
      ),

    number:
      /\d/.test(
        password
      ),

    symbol:
      /[^A-Za-z0-9]/.test(
        password
      ),
  };

  const isStrong =
    Object.values(
      requirements
    ).every(Boolean);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-emerald-700">
            Careerflow
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Start building your career profile and preparing better applications.
          </p>

        </div>

        {/* ======================================
            FORM
        ====================================== */}

        <form
          action={
            signup
          }
          className="space-y-5"
        >

          {/* ====================================
              FULL NAME
          ==================================== */}

          <div>

            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />

          </div>

          {/* ====================================
              EMAIL
          ==================================== */}

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

          {/* ====================================
              PASSWORD
          ==================================== */}

          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                autoComplete="new-password"
                placeholder="Create a password"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

            </div>

            {/* ==================================
                PASSWORD REQUIREMENTS
            ================================== */}

            <div className="mt-4 rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password requirements
              </p>

              <div className="mt-3 space-y-2">

                <Requirement
                  valid={
                    requirements.length
                  }
                >
                  At least 10 characters
                </Requirement>

                <Requirement
                  valid={
                    requirements.uppercase
                  }
                >
                  One uppercase letter
                </Requirement>

                <Requirement
                  valid={
                    requirements.lowercase
                  }
                >
                  One lowercase letter
                </Requirement>

                <Requirement
                  valid={
                    requirements.number
                  }
                >
                  One number
                </Requirement>

                <Requirement
                  valid={
                    requirements.symbol
                  }
                >
                  One special character
                </Requirement>

              </div>

            </div>

          </div>

          {/* ====================================
              CREATE ACCOUNT
          ==================================== */}

          <SignupButton
            passwordValid={
              isStrong
            }
          />

        </form>

        {/* ======================================
            LOGIN LINK
        ====================================== */}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}

          <Link
            href="/login"
            className="font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            Sign in
          </Link>
        </p>

      </div>

    </main>
  );
}

// ======================================================
// REQUIREMENT
// ======================================================

function Requirement({
  valid,
  children,
}: {
  valid: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">

      {valid ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Circle className="h-4 w-4 text-slate-300" />
      )}

      <span
        className={`text-sm ${
          valid
            ? "font-medium text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {children}
      </span>

    </div>
  );
}

// ======================================================
// SIGNUP BUTTON
// ======================================================

function SignupButton({
  passwordValid,
}: {
  passwordValid: boolean;
}) {
  const {
    pending,
  } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={
        pending ||
        !passwordValid
      }
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />

          Creating account...
        </>
      ) : (
        "Create account"
      )}
    </button>
  );
}