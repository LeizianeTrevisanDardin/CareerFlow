"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function isStrongPassword(
  password: string
) {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function signup(
  formData: FormData
) {
  const supabase =
    await createClient();

  const fullName =
    String(
      formData.get("fullName") || ""
    ).trim();

  const email =
    String(
      formData.get("email") || ""
    )
      .trim()
      .toLowerCase();

  const password =
    String(
      formData.get("password") || ""
    );

  // ==========================================
  // VALIDATION
  // ==========================================

  if (
    !fullName ||
    !email ||
    !password
  ) {
    redirect(
      "/signup?error=missing_fields"
    );
  }

  if (
    !isStrongPassword(password)
  ) {
    redirect(
      "/signup?error=weak_password"
    );
  }

  // ==========================================
  // SIGN UP
  // ==========================================

  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name:
            fullName,
        },
      },
    });

  if (error) {
    console.error(
      "Signup error:",
      error
    );

    if (
      error.message
        .toLowerCase()
        .includes(
          "already registered"
        )
    ) {
      redirect(
        "/signup?error=email_exists"
      );
    }

    if (
      error.message
        .toLowerCase()
        .includes(
          "password"
        )
    ) {
      redirect(
        "/signup?error=weak_password"
      );
    }

    redirect(
      "/signup?error=signup"
    );
  }

  // ==========================================
  // EMAIL CONFIRMATION
  // ==========================================

  if (
    data.user &&
    !data.session
  ) {
    redirect(
      "/login?success=check_email"
    );
  }

  // ==========================================
  // SESSION AVAILABLE
  // ==========================================

  redirect(
    "/dashboard"
  );
}