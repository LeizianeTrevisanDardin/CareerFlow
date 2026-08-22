"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";


// ======================================================
// CREATE APPLICATION
// ======================================================

export async function createApplication(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const companyName = formData.get("companyName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;
  const jobUrl = formData.get("jobUrl") as string;
  const appliedAt = formData.get("appliedAt") as string;
  const notes = formData.get("notes") as string;

  if (!companyName.trim() || !jobTitle.trim()) {
    redirect("/dashboard/applications/new?error=missing_fields");
  }

  const { error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      location: location.trim() || null,
      status,
      job_url: jobUrl.trim() || null,
      applied_at: appliedAt || null,
      notes: notes.trim() || null,
    });

  if (error) {
    console.error("Error creating application:", error);

    redirect(
      "/dashboard/applications/new?error=create_failed"
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");

  redirect("/dashboard/applications?success=created");
}


// ======================================================
// UPDATE APPLICATION
// ======================================================

export async function updateApplication(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const applicationId = formData.get("applicationId") as string;
  const companyName = formData.get("companyName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;
  const jobUrl = formData.get("jobUrl") as string;
  const appliedAt = formData.get("appliedAt") as string;
  const notes = formData.get("notes") as string;

  if (!companyName.trim() || !jobTitle.trim()) {
    redirect(
      `/dashboard/applications/${applicationId}/edit?error=missing_fields`
    );
  }

  const { error } = await supabase
    .from("applications")
    .update({
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      location: location.trim() || null,
      status,
      job_url: jobUrl.trim() || null,
      applied_at: appliedAt || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating application:", error);

    redirect(
      `/dashboard/applications/${applicationId}/edit?error=update_failed`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");

  redirect("/dashboard/applications?success=updated");
}

export async function deleteApplication(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const applicationId = formData.get("applicationId") as string;

  if (!applicationId) {
    redirect("/dashboard/applications?error=missing_id");
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting application:", error);

    redirect("/dashboard/applications?error=delete_failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");

  redirect("/dashboard/applications?success=deleted");
}