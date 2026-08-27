"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(
  formData: FormData
) {
  const password =
    (
      formData.get(
        "password"
      ) as string
    )?.trim();

  const confirmPassword =
    (
      formData.get(
        "confirmPassword"
      ) as string
    )?.trim();

  // ==========================================
  // VALIDATION
  // ==========================================

  if (
    !password ||
    !confirmPassword
  ) {
    redirect(
      "/update-password?error=missing_fields"
    );
  }

  if (
    password.length < 8
  ) {
    redirect(
      "/update-password?error=password_too_short"
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      "/update-password?error=password_mismatch"
    );
  }

  // ==========================================
  // SUPABASE
  // ==========================================

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect(
      "/login?error=reset_link_expired"
    );
  }

  // ==========================================
  // UPDATE PASSWORD
  // ==========================================

  const {
    error: updateError,
  } =
    await supabase.auth.updateUser({
      password,
    });

  if (updateError) {
    console.error(
      "Password update error:",
      updateError
    );

    redirect(
      "/update-password?error=update_failed"
    );
  }

  // ==========================================
  // SIGN OUT
  // ==========================================

  await supabase.auth.signOut();

  // ==========================================
  // SUCCESS
  // ==========================================

  redirect(
    "/login?success=password_updated"
  );
  
}