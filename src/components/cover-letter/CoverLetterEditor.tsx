"use client";

import {
  useState,
} from "react";

import {
  Save,
} from "lucide-react";

import {
  updateCoverLetterContent,
} from "@/app/dashboard/cover-letter/actions";

type CoverLetterEditorProps = {
  coverLetterId: string;
  content: string;
};

export default function CoverLetterEditor({
  coverLetterId,
  content,
}: CoverLetterEditorProps) {
  const [
    value,
    setValue,
  ] = useState(
    content
  );

  return (
    <form
      action={
        updateCoverLetterContent
      }
      className="space-y-4"
    >
      <input
        type="hidden"
        name="coverLetterId"
        value={
          coverLetterId
        }
      />

      <textarea
        name="content"
        value={
          value
        }
        onChange={(
          event
        ) =>
          setValue(
            event.target.value
          )
        }
        rows={24}
        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-emerald-500"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>
    </form>
  );
}