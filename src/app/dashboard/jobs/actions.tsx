"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// ==========================================
// CREATE JOB
// ==========================================

export async function createJob(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobTitle = String(
    formData.get("jobTitle") || ""
  ).trim();

  const companyName = String(
    formData.get("companyName") || ""
  ).trim();

  const location = String(
    formData.get("location") || ""
  ).trim();

  const jobUrl = String(
    formData.get("jobUrl") || ""
  ).trim();

  const salary = String(
    formData.get("salary") || ""
  ).trim();

  const jobDescription = String(
    formData.get("jobDescription") || ""
  ).trim();

  if (!jobTitle) {
    redirect(
      "/dashboard/jobs/new?error=missing_job_title"
    );
  }

  const { error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      job_title: jobTitle,
      company_name: companyName || null,
      location: location || null,
      job_url: jobUrl || null,
      salary: salary || null,
      job_description: jobDescription || null,
      status: "saved",
    });

  if (error) {
    console.error(
      "Error creating job:",
      error
    );

    redirect(
      "/dashboard/jobs/new?error=create_failed"
    );
  }

  revalidatePath("/dashboard/jobs");

  redirect(
    "/dashboard/jobs?success=job_created"
  );
}

// ==========================================
// UPDATE JOB
// ==========================================

export async function updateJob(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobId = String(
    formData.get("jobId") || ""
  ).trim();

  const jobTitle = String(
    formData.get("jobTitle") || ""
  ).trim();

  const companyName = String(
    formData.get("companyName") || ""
  ).trim();

  const location = String(
    formData.get("location") || ""
  ).trim();

  const jobUrl = String(
    formData.get("jobUrl") || ""
  ).trim();

  const salary = String(
    formData.get("salary") || ""
  ).trim();

  const jobDescription = String(
    formData.get("jobDescription") || ""
  ).trim();

  const status = String(
    formData.get("status") || "saved"
  ).trim();

  const allowedStatuses = [
    "saved",
    "interested",
    "applied",
    "archived",
  ];

  if (
    !jobId ||
    !jobTitle
  ) {
    redirect(
      `/dashboard/jobs/${jobId}/edit?error=missing_fields`
    );
  }

  if (
    !allowedStatuses.includes(status)
  ) {
    redirect(
      `/dashboard/jobs/${jobId}/edit?error=invalid_status`
    );
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      job_title: jobTitle,
      company_name: companyName || null,
      location: location || null,
      job_url: jobUrl || null,
      salary: salary || null,
      job_description: jobDescription || null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error updating job:",
      error
    );

    redirect(
      `/dashboard/jobs/${jobId}/edit?error=update_failed`
    );
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath(
    `/dashboard/jobs/${jobId}/edit`
  );

  redirect(
    "/dashboard/jobs?success=job_updated"
  );
}

// ==========================================
// UPDATE JOB STATUS
// ==========================================

export async function updateJobStatus(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobId = String(
    formData.get("jobId") || ""
  ).trim();

  const status = String(
    formData.get("status") || ""
  ).trim();

  const allowedStatuses = [
    "saved",
    "interested",
    "applied",
    "archived",
  ];

  if (
    !jobId ||
    !allowedStatuses.includes(status)
  ) {
    redirect(
      "/dashboard/jobs?error=invalid_status"
    );
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error updating job status:",
      error
    );

    redirect(
      "/dashboard/jobs?error=status_update_failed"
    );
  }

  revalidatePath("/dashboard/jobs");

  redirect(
    "/dashboard/jobs?success=status_updated"
  );
}

// ==========================================
// DELETE JOB
// ==========================================

export async function deleteJob(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobId = String(
    formData.get("jobId") || ""
  ).trim();

  if (!jobId) {
    redirect("/dashboard/jobs");
  }

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error deleting job:",
      error
    );

    redirect(
      "/dashboard/jobs?error=delete_failed"
    );
  }

  revalidatePath("/dashboard/jobs");

  redirect(
    "/dashboard/jobs?success=job_deleted"
  );
}