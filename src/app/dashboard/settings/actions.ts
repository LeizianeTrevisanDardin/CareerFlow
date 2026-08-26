"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ======================================================
// UPDATE PROFILE
// ======================================================

export async function updateProfile(
  formData: FormData
) {
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

  const fullName =
    (
      formData.get(
        "fullName"
      ) as string
    )?.trim();

  const jobTitle =
    (
      formData.get(
        "jobTitle"
      ) as string
    )?.trim();

  // ==========================================
  // VALIDATION
  // ==========================================

  if (!fullName) {
    redirect(
      "/dashboard/settings?error=profile_missing_name"
    );
  }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const {
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      full_name:
        fullName,

      job_title:
        jobTitle || null,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      user.id
    );

  if (updateError) {
    console.error(
      "Profile update error:",
      updateError
    );

    redirect(
      "/dashboard/settings?error=profile_update_failed"
    );
  }

  // ==========================================
  // REFRESH PAGES
  // ==========================================

  revalidatePath(
    "/dashboard/settings"
  );

  revalidatePath(
    "/dashboard"
  );

  // ==========================================
  // SUCCESS
  // ==========================================

  redirect(
    "/dashboard/settings?success=profile_updated"
  );
}

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

  // ==========================================
  // CONFIRM DELETE
  // ==========================================

  if (
    confirmation !== "DELETE"
  ) {
    redirect(
      "/dashboard/settings?error=delete_confirmation"
    );
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

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

  // ==========================================
  // ADMIN CLIENT
  // ==========================================

  const admin =
    createAdminClient();

  // ==========================================
  // DELETE AUTH USER
  // ==========================================

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

  // ==========================================
  // SIGN OUT
  // ==========================================

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error(
      "Sign out after account deletion failed:",
      error
    );
  }

  // ==========================================
  // REDIRECT
  // ==========================================

  redirect(
    "/login?success=account_deleted"
  );
}