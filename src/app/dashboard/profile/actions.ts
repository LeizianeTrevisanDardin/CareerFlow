"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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
  const yearsExperience = Number(formData.get("yearsExperience")) || 0;
  const preferredJobTitle = formData.get("preferredJobTitle") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const careerGoal = formData.get("careerGoal") as string;

  const profileFields = [
    fullName,
    jobTitle,
    location,
    yearsExperience > 0 ? yearsExperience : null,
    preferredJobTitle,
    linkedinUrl,
    careerGoal,
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
        profile_completion: profileCompletion,
        })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    redirect("/dashboard/profile?error=update_failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  redirect("/dashboard/profile?success=true");
}