"use client";

import {
  useEffect,
  useState,
} from "react";

type DashboardGreetingProps = {
  name: string;
};

export default function DashboardGreeting({
  name,
}: DashboardGreetingProps) {
  const [dateText, setDateText] =
    useState("");

  const [greeting, setGreeting] =
    useState("");

  useEffect(() => {
    function updateGreeting() {
      const now = new Date();

      const hour =
        now.getHours();

      let greetingText =
        "Good Evening";

      if (
        hour >= 5 &&
        hour < 12
      ) {
        greetingText =
          "Good Morning";
      } else if (
        hour >= 12 &&
        hour < 17
      ) {
        greetingText =
          "Good Afternoon";
      }

      const formattedDate =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
          }
        ).format(now);

      setGreeting(
        greetingText
      );

      setDateText(
        formattedDate
      );
    }

    updateGreeting();

    const interval =
      window.setInterval(
        updateGreeting,
        60 * 1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  if (
    !dateText ||
    !greeting
  ) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
        {dateText}
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
        {greeting}, {name}.
      </h1>

      <p className="mt-2 text-lg text-slate-500">
        Ready to take the next step in your career?
      </p>
    </div>
  );
}