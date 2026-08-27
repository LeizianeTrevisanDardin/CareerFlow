"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// ======================================================
// SAVE RESUME
// ======================================================

export async function saveResume(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ====================================================
  // BASIC DATA
  // ====================================================

  const resumeId =
    String(
      formData.get("resumeId") || ""
    ).trim() || null;

  const title =
    String(
      formData.get("title") || ""
    ).trim() || "My Resume";

  const fullName =
    String(
      formData.get("fullName") || ""
    ).trim() || null;

  const jobTitle =
    String(
      formData.get("jobTitle") || ""
    ).trim() || null;

  const location =
    String(
      formData.get("location") || ""
    ).trim() || null;

  const email =
    String(
      formData.get("email") || ""
    ).trim() || null;

  const phone =
    String(
      formData.get("phone") || ""
    ).trim() || null;

  const linkedin =
    String(
      formData.get("linkedin") || ""
    ).trim() || null;

  const github =
    String(
      formData.get("github") || ""
    ).trim() || null;

  const portfolio =
    String(
      formData.get("portfolio") || ""
    ).trim() || null;

  const summary =
    String(
      formData.get("summary") || ""
    ).trim() || null;

  // ====================================================
  // JSON DATA
  // ====================================================

  const skillsJson =
    String(
      formData.get("skills") || "[]"
    );

  const skillSectionsJson =
    String(
      formData.get("skillSections") || "[]"
    );

  const experiencesJson =
    String(
      formData.get("experiences") || "[]"
    );

  const educationJson =
    String(
      formData.get("education") || "[]"
    );

  const projectsJson =
    String(
      formData.get("projects") || "[]"
    );

  const qualificationsJson =
    String(
      formData.get(
        "additionalQualifications"
      ) || "[]"
    );

  let skills: unknown[] = [];
  let skillSections: unknown[] = [];
  let experiences: unknown[] = [];
  let education: unknown[] = [];
  let projects: unknown[] = [];
  let additionalQualifications: unknown[] = [];

  try {
    skills =
      JSON.parse(
        skillsJson
      );

    skillSections =
      JSON.parse(
        skillSectionsJson
      );

    experiences =
      JSON.parse(
        experiencesJson
      );

    education =
      JSON.parse(
        educationJson
      );

    projects =
      JSON.parse(
        projectsJson
      );

    additionalQualifications =
      JSON.parse(
        qualificationsJson
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

  // ====================================================
  // PAYLOAD
  // ====================================================

  const payload = {
    user_id: user.id,

    title,

    full_name:
      fullName,

    job_title:
      jobTitle,

    location,

    email,

    phone,

    linkedin,

    github,

    portfolio,

    summary,

    skills,

    skill_sections:
      skillSections,

    experiences,

    education,

    projects,

    additional_qualifications:
      additionalQualifications,

    updated_at:
      new Date().toISOString(),
  };

  // ====================================================
  // UPDATE EXISTING RESUME
  // ====================================================

  if (resumeId) {
    const {
      error,
    } = await supabase
      .from("resumes")
      .update(payload)
      .eq(
        "id",
        resumeId
      )
      .eq(
        "user_id",
        user.id
      );

    if (error) {
      console.error(
        "Error updating resume:",
        error
      );

      redirect(
        `/dashboard/resume-builder?resume=${resumeId}&error=save_failed`
      );
    }

    revalidatePath(
      "/dashboard/resume-builder"
    );

    redirect(
      `/dashboard/resume-builder?resume=${resumeId}&success=saved`
    );
  }

  // ====================================================
  // CREATE NEW RESUME
  // ====================================================

  const {
    data: resume,
    error,
  } = await supabase
    .from("resumes")
    .insert(payload)
    .select("id")
    .single();

  if (
    error ||
    !resume
  ) {
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

// ======================================================
// DELETE RESUME
// ======================================================

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
    String(
      formData.get("resumeId") || ""
    ).trim();

  if (!resumeId) {
    redirect(
      "/dashboard/resume-builder?error=missing_resume"
    );
  }

  const {
    error,
  } = await supabase
    .from("resumes")
    .delete()
    .eq(
      "id",
      resumeId
    )
    .eq(
      "user_id",
      user.id
    );

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