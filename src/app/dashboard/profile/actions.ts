"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";


// ======================================================
// UPDATE PROFILE
// ======================================================

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = formData.get("fullName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const location = formData.get("location") as string;
  const yearsExperience =
    Number(formData.get("yearsExperience")) || 0;

  const preferredJobTitle =
    formData.get("preferredJobTitle") as string;

  const linkedinUrl =
    formData.get("linkedinUrl") as string;

  const careerGoal =
    formData.get("careerGoal") as string;

  const skillsInput =
    formData.get("skills") as string;

  const skills = skillsInput
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const profileFields = [
    fullName,
    jobTitle,
    location,
    yearsExperience > 0 ? yearsExperience : null,
    preferredJobTitle,
    linkedinUrl,
    careerGoal,
    skills.length > 0 ? skills : null,
  ];

  const completedFields = profileFields.filter((field) => {
    if (typeof field === "string") {
      return field.trim() !== "";
    }

    return field !== null;
  }).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      job_title: jobTitle,
      location,
      years_experience: yearsExperience,
      preferred_job_title: preferredJobTitle,
      linkedin_url: linkedinUrl,
      career_goal: careerGoal,
      skills,
      profile_completion: profileCompletion,
    })
    .eq("id", user.id);

  if (error) {
    console.error(
      "Error updating profile:",
      error
    );

    redirect(
      "/dashboard/profile?error=update_failed"
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  redirect(
    "/dashboard/profile?success=true"
  );
}


// ======================================================
// CREATE PROFESSIONAL EXPERIENCE
// ======================================================

export async function createProfessionalExperience(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const companyName =
    formData.get("companyName") as string;

  const jobTitle =
    formData.get("experienceJobTitle") as string;

  const location =
    formData.get("experienceLocation") as string;

  const startDate =
    formData.get("startDate") as string;

  const endDate =
    formData.get("endDate") as string;

  const isCurrent =
    formData.get("isCurrent") === "on";

  const description =
    formData.get("description") as string;

  if (!companyName?.trim() || !jobTitle?.trim()) {
    redirect(
      "/dashboard/profile?error=experience_missing_fields"
    );
  }

  const { error } = await supabase
    .from("professional_experiences")
    .insert({
      user_id: user.id,
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      location: location?.trim() || null,
      start_date: startDate || null,
      end_date: isCurrent
        ? null
        : endDate || null,
      is_current: isCurrent,
      description: description?.trim() || null,
    });

  if (error) {
    console.error(
      "Error creating professional experience:",
      error
    );

    redirect(
      "/dashboard/profile?error=experience_create_failed"
    );
  }

  revalidatePath("/dashboard/profile");

  redirect(
    "/dashboard/profile?success=experience_created"
  );
}


// ======================================================
// UPDATE PROFESSIONAL EXPERIENCE
// ======================================================

export async function updateProfessionalExperience(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const experienceId =
    formData.get("experienceId") as string;

  const companyName =
    formData.get("companyName") as string;

  const jobTitle =
    formData.get("experienceJobTitle") as string;

  const location =
    formData.get("experienceLocation") as string;

  const startDate =
    formData.get("startDate") as string;

  const endDate =
    formData.get("endDate") as string;

  const isCurrent =
    formData.get("isCurrent") === "on";

  const description =
    formData.get("description") as string;

  if (!experienceId) {
    redirect(
      "/dashboard/profile?error=experience_missing_id"
    );
  }

  const { error } = await supabase
    .from("professional_experiences")
    .update({
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      location: location?.trim() || null,
      start_date: startDate || null,
      end_date: isCurrent
        ? null
        : endDate || null,
      is_current: isCurrent,
      description: description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", experienceId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error updating professional experience:",
      error
    );

    redirect(
      "/dashboard/profile?error=experience_update_failed"
    );
  }

  revalidatePath("/dashboard/profile");

  redirect(
    "/dashboard/profile?success=experience_updated"
  );
}


// ======================================================
// DELETE PROFESSIONAL EXPERIENCE
// ======================================================

export async function deleteProfessionalExperience(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const experienceId =
    formData.get("experienceId") as string;

  if (!experienceId) {
    redirect(
      "/dashboard/profile?error=experience_missing_id"
    );
  }

  const { error } = await supabase
    .from("professional_experiences")
    .delete()
    .eq("id", experienceId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error deleting professional experience:",
      error
    );

    redirect(
      "/dashboard/profile?error=experience_delete_failed"
    );
  }

  revalidatePath("/dashboard/profile");

  redirect(
    "/dashboard/profile?success=experience_deleted"
  );
}