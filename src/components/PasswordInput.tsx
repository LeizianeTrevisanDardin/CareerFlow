"use client";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useState,
} from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export default function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  required = false,
}: PasswordInputProps) {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={
          showPassword
            ? "text"
            : "password"
        }
        required={
          required
        }
        autoComplete={
          autoComplete
        }
        placeholder={
          placeholder
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
  );
}