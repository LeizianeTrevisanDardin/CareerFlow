"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(
  formData: FormData
) {
  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(
      "/forgot-password?error=missing_email"
    );
  }

  const supabase =
    await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const redirectTo =
    `${siteUrl}/update-password`;

  const {
    error,
  } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

  if (error) {
    console.error(
      "Password reset request error:",
      error
    );

    if (
      error.code ===
      "over_email_send_rate_limit"
    ) {
      redirect(
        "/forgot-password?error=rate_limit"
      );
    }

    redirect(
      "/forgot-password?error=reset_failed"
    );
  }

  redirect(
    "/forgot-password?success=email_sent"
  );
}