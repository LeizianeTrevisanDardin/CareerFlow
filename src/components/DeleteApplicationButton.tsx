"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

type DeleteApplicationButtonProps = {
  applicationId: string;
  deleteAction: (formData: FormData) => void;
};

export default function DeleteApplicationButton({
  applicationId,
  deleteAction,
}: DeleteApplicationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Delete application"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Delete application?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This application will be permanently removed from your tracker.
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <form action={deleteAction}>
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />

                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete application
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}