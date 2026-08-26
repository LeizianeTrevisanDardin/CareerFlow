"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ======================================================
// SEND PASSWORD RESET
// ======================================================

export async function sendPasswordReset() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user ||
    !user.email
  ) {
    redirect(
      "/dashboard/settings?error=password_reset_failed"
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const redirectTo =
    `${siteUrl}/update-password`;

  const {
    error: resetError,
  } =
    await supabase.auth.resetPasswordForEmail(
      user.email,
      {
        redirectTo,
      }
    );

  if (resetError) {
    console.error(
      "Password reset error:",
      resetError
    );

    if (
      resetError.code ===
      "over_email_send_rate_limit"
    ) {
      redirect(
        "/dashboard/settings?error=password_reset_rate_limit"
      );
    }

    redirect(
      "/dashboard/settings?error=password_reset_failed"
    );
  }

  redirect(
    "/dashboard/settings?success=password_email_sent"
  );
}

// ======================================================
// DELETE ACCOUNT
// ======================================================

export async function deleteAccount(
  formData: FormData
) {
  const confirmation =
    (
      formData.get(
        "confirmation"
      ) as string
    )
      ?.trim()
      .toUpperCase();

  if (
    confirmation !== "DELETE"
  ) {
    redirect(
      "/dashboard/settings?error=delete_confirmation"
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/login");
  }

  const userId =
    user.id;

  const admin =
    createAdminClient();

  const {
    error: deleteError,
  } =
    await admin.auth.admin.deleteUser(
      userId
    );

  if (deleteError) {
    console.error(
      "Delete account error:",
      deleteError
    );

    redirect(
      "/dashboard/settings?error=delete_failed"
    );
  }

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error(
      "Sign out after account deletion failed:",
      error
    );
  }

  redirect(
    "/login?success=account_deleted"
  );
}