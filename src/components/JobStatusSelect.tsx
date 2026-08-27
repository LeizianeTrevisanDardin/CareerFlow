"use client";

import {
  Check,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type JobStatus =
  | "saved"
  | "interested"
  | "applied"
  | "archived";

type JobStatusSelectProps = {
  name?: string;
  defaultValue: JobStatus;
};

const options: {
  value: JobStatus;
  label: string;
}[] = [
  {
    value: "saved",
    label: "Saved",
  },
  {
    value: "interested",
    label: "Interested",
  },
  {
    value: "applied",
    label: "Applied",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

export default function JobStatusSelect({
  name = "status",
  defaultValue,
}: JobStatusSelectProps) {
  const [open, setOpen] =
    useState(false);

  const [value, setValue] =
    useState<JobStatus>(
      defaultValue
    );

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const selected =
    options.find(
      (option) =>
        option.value === value
    ) ?? options[0];

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Hidden input sent to Server Action */}

      <input
        type="hidden"
        name={name}
        value={value}
      />

      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-expanded={open}
        className="
          inline-flex min-w-[150px]
          items-center justify-between gap-3
          rounded-xl
          border border-emerald-300
          bg-white
          px-4 py-2.5
          text-sm font-semibold
          text-emerald-700
          outline-none
          transition
          hover:bg-emerald-50
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-100
        "
      >
        {selected.label}

        <ChevronDown
          className={`h-4 w-4 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute left-0 top-full z-50
            mt-2 min-w-[180px]
            overflow-hidden
            rounded-xl
            border border-slate-200
            bg-white
            p-1
            shadow-lg
          "
        >
          {options.map(
            (option) => {
              const active =
                option.value ===
                value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() => {
                    setValue(
                      option.value
                    );

                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-emerald-100 font-semibold text-emerald-800"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  {option.label}

                  {active && (
                    <Check className="h-4 w-4 text-emerald-700" />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}