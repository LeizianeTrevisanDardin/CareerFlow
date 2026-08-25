"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type RateLimitNoticeProps = {
  seconds?: number;
};

export default function RateLimitNotice({
  seconds = 60,
}: RateLimitNoticeProps) {
  const [remaining, setRemaining] =
    useState(seconds);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (remaining <= 0) {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.delete("error");

      const query = params.toString();

      router.replace(
        query
          ? `${pathname}?${query}`
          : pathname
      );

      router.refresh();

      return;
    }

    const timer = window.setTimeout(() => {
      setRemaining((current) =>
        Math.max(current - 1, 0)
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    remaining,
    pathname,
    router,
    searchParams,
  ]);

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <p className="font-semibold text-amber-900">
        Just a moment
      </p>

      <p className="mt-1 text-sm text-amber-700">
        You&apos;ve generated several
        documents in a short period.
      </p>

      <p className="mt-2 text-sm font-medium text-amber-800">
        You can generate again in{" "}
        {remaining}{" "}
        {remaining === 1
          ? "second"
          : "seconds"}.
      </p>
    </div>
  );
}