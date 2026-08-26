"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function saveResume(
  formData: FormData
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resumeId =
    (formData.get("resumeId") as string) || null;

  const title =
    (formData.get("title") as string)?.trim() ||
    "My Resume";

  const fullName =
    (formData.get("fullName") as string)?.trim() ||
    null;

  const jobTitle =
    (formData.get("jobTitle") as string)?.trim() ||
    null;

  const location =
    (formData.get("location") as string)?.trim() ||
    null;

  const email =
    (formData.get("email") as string)?.trim() ||
    null;

  const phone =
    (formData.get("phone") as string)?.trim() ||
    null;

  const linkedin =
    (formData.get("linkedin") as string)?.trim() ||
    null;

  const summary =
    (formData.get("summary") as string)?.trim() ||
    null;

  const skillsJson =
    formData.get("skills") as string;

  const experiencesJson =
    formData.get("experiences") as string;

  let skills: string[] = [];
  let experiences: unknown[] = [];

  try {
    skills =
      JSON.parse(skillsJson || "[]");

    experiences =
      JSON.parse(
        experiencesJson || "[]"
      );
  } catch (error) {
    console.error(
      "Error parsing resume data:",
      error
    );

    redirect(
      "/dashboard/resume-builder?error=invalid_data"
    );
  }

  const payload = {
    user_id: user.id,
    title,
    full_name: fullName,
    job_title: jobTitle,
    location,
    email,
    phone,
    linkedin,
    summary,
    skills,
    experiences,
    updated_at:
      new Date().toISOString(),
  };

  // UPDATE EXISTING RESUME
  if (resumeId) {
    const { error } =
      await supabase
        .from("resumes")
        .update(payload)
        .eq("id", resumeId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error updating resume:",
        error
      );

      redirect(
        `/dashboard/resume-builder?error=save_failed`
      );
    }

    revalidatePath(
      "/dashboard/resume-builder"
    );

    redirect(
      `/dashboard/resume-builder?resume=${resumeId}&success=saved`
    );
  }

  // CREATE NEW RESUME
    const {
      data: resume,
      error,
    } = await supabase
      .from("resumes")
      .insert(payload)
      .select("id")
      .single();

    if (error || !resume) {
      console.error(
        "Error creating resume:",
        error
      );

      redirect(
        "/dashboard/resume-builder?error=save_failed"
      );
    }

    revalidatePath(
      "/dashboard/resume-builder"
    );

    redirect(
      `/dashboard/resume-builder?resume=${resume.id}&success=saved`
    );
  }

  export async function deleteResume(
    formData: FormData
  ) {
    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const resumeId =
      formData.get("resumeId") as string;

    if (!resumeId) {
      redirect(
        "/dashboard/resume-builder?error=missing_resume"
      );
    }

    const { error } =
      await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error deleting resume:",
        error
      );

      redirect(
        "/dashboard/resume-builder?error=delete_failed"
      );
    }

    revalidatePath(
      "/dashboard/resume-builder"
    );

    redirect(
      "/dashboard/resume-builder?success=deleted"
    );
  }