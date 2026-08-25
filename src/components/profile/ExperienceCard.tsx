"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

type Experience = {
  id: string;
  company_name: string;
  job_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
};

type ExperienceCardProps = {
  experience: Experience;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

export default function ExperienceCard({
  experience,
  updateAction,
  deleteAction,
}: ExperienceCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Edit experience
          </h3>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={updateAction} className="space-y-4">
          <input
            type="hidden"
            name="experienceId"
            value={experience.id}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="companyName"
              defaultValue={experience.company_name}
              placeholder="Company name"
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <input
              name="experienceJobTitle"
              defaultValue={experience.job_title}
              placeholder="Job title"
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <input
            name="experienceLocation"
            defaultValue={experience.location ?? ""}
            placeholder="Location"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="startDate"
              type="date"
              defaultValue={experience.start_date ?? ""}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <input
              name="endDate"
              type="date"
              defaultValue={experience.end_date ?? ""}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              name="isCurrent"
              type="checkbox"
              defaultChecked={experience.is_current}
              className="h-4 w-4"
            />
            I currently work here
          </label>

          <textarea
            name="description"
            rows={5}
            defaultValue={experience.description ?? ""}
            placeholder="Responsibilities and achievements"
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {experience.job_title}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {experience.company_name}
          </p>

          {experience.location && (
            <p className="mt-1 text-sm text-slate-400">
              {experience.location}
            </p>
          )}

          <p className="mt-2 text-sm text-slate-500">
            {experience.start_date || "Start date not set"} →{" "}
            {experience.is_current
              ? "Present"
              : experience.end_date || "End date not set"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Edit experience"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <form action={deleteAction}>
            <input
              type="hidden"
              name="experienceId"
              value={experience.id}
            />

            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
              title="Delete experience"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {experience.description && (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
          {experience.description}
        </p>
      )}
    </div>
  );
}