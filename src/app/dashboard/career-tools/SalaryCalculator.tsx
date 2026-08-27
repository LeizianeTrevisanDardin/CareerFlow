"use client";

import { useMemo, useState } from "react";

export default function SalaryCalculator() {
  const [salary, setSalary] =
    useState("");

  const annual =
    Number(salary) || 0;

  const results =
    useMemo(() => {
      return {
        annual,
        monthly:
          annual / 12,
        biweekly:
          annual / 26,
        weekly:
          annual / 52,
        hourly:
          annual / 2080,
      };
    }, [annual]);

  function formatMoney(
    value: number
  ) {
    return new Intl.NumberFormat(
      "en-CA",
      {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  return (
    <div>

      <div className="max-w-md">

        <label
          htmlFor="annualSalary"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Annual salary
        </label>

        <div className="relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            $
          </span>

          <input
            id="annualSalary"
            type="number"
            min="0"
            step="1000"
            value={salary}
            onChange={(event) =>
              setSalary(
                event.target.value
              )
            }
            placeholder="75000"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

        </div>

        <p className="mt-2 text-xs text-slate-400">
          Based on 40 hours per week and 52 weeks per year.
        </p>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">

        <SalaryResult
          label="Annual"
          value={
            formatMoney(
              results.annual
            )
          }
        />

        <SalaryResult
          label="Monthly"
          value={
            formatMoney(
              results.monthly
            )
          }
        />

        <SalaryResult
          label="Bi-weekly"
          value={
            formatMoney(
              results.biweekly
            )
          }
        />

        <SalaryResult
          label="Weekly"
          value={
            formatMoney(
              results.weekly
            )
          }
        />

        <SalaryResult
          label="Hourly"
          value={
            formatMoney(
              results.hourly
            )
          }
        />

      </div>

    </div>
  );
}

function SalaryResult({
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

      <p className="mt-2 break-words text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}