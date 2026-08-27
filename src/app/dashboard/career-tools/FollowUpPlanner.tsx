"use client";

import { useMemo, useState } from "react";

import {
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

export default function FollowUpPlanner() {
  const [applicationDate, setApplicationDate] =
    useState("");

  const followUpDate =
    useMemo(() => {
      if (!applicationDate) {
        return null;
      }

      const date =
        new Date(
          `${applicationDate}T12:00:00`
        );

      // Suggest follow-up after 7 calendar days
      date.setDate(
        date.getDate() + 7
      );

      return date;
    }, [applicationDate]);

  function formatDate(
    date: Date
  ) {
    return new Intl.DateTimeFormat(
      "en-CA",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    ).format(date);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* DATE INPUT */}

      <div>

        <label
          htmlFor="applicationDate"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          When did you apply?
        </label>

        <input
          id="applicationDate"
          type="date"
          value={applicationDate}
          onChange={(event) =>
            setApplicationDate(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Careerflow currently suggests following up approximately
          one week after applying.
        </p>

      </div>

      {/* RESULT */}

      <div
        className={`rounded-2xl border p-5 ${
          followUpDate
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >

        {followUpDate ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />

            <p className="mt-4 text-sm font-medium text-emerald-700">
              Suggested follow-up
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-900">
              {formatDate(
                followUpDate
              )}
            </p>

            <p className="mt-3 text-sm leading-6 text-emerald-700">
              If you haven&apos;t heard back by then, consider sending
              a short and professional follow-up.
            </p>
          </>
        ) : (
          <>
            <CalendarClock className="h-5 w-5 text-slate-400" />

            <p className="mt-4 font-semibold text-slate-700">
              Select your application date
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your suggested follow-up date will appear here.
            </p>
          </>
        )}

      </div>

    </div>
  );
}