     "use client";

import {
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { useFormStatus } from "react-dom";

type AIActionButtonProps = {
  idleText: string;
  loadingText: string;
  title?: string;
  description?: string;
  helperText?: string;
  className?: string;
};

export default function AIActionButton({
  idleText,
  loadingText,
  title = "AI analysis in progress",
  description = "Careerflow is analyzing your information and preparing recommendations.",
  helperText = "This may take a few seconds.",
  className = "",
}: AIActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <div className={`w-full sm:w-auto ${className}`}>
      {pending && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:min-w-[420px]">
          <div className="flex items-start gap-3">

            <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-emerald-700" />

            <div>
              <p className="font-semibold text-emerald-900">
                {title}
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                {description}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                {helperText}
              </p>
            </div>

          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="
          inline-flex w-full items-center justify-center gap-2
          rounded-xl bg-emerald-700 px-6 py-3
          text-sm font-semibold text-white
          transition
          hover:bg-emerald-800
          disabled:cursor-not-allowed
          disabled:bg-emerald-600
          disabled:opacity-80
          sm:w-auto
        "
      >
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {idleText}
          </>
        )}
      </button>
    </div>
  );
}