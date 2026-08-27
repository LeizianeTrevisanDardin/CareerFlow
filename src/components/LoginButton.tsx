"use client";

import {
  Loader2,
} from "lucide-react";

import {
  useFormStatus,
} from "react-dom";

export default function LoginButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-600"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />

          Signing in...
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}