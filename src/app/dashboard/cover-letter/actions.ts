"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { gemini } from "@/lib/gemini";

type ResumeExperience = {
  company?: string;
  jobTitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
};

export async function generateStandaloneCoverLetter(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resumeId =
    formData.get("resumeId") as string;

  const jobTitle =
    (formData.get("jobTitle") as string)?.trim();

  const companyName =
    (formData.get("companyName") as string)?.trim();

  const jobDescription =
    (formData.get("jobDescription") as string)?.trim();

  if (
    !resumeId ||
    !jobTitle ||
    !jobDescription
  ) {
    redirect(
      "/dashboard/cover-letter?error=missing_fields"
    );
  }

  // ==========================================
  // CHECK CREDITS
  // ==========================================

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile
  ) {
    redirect(
      "/dashboard/cover-letter?error=credits_check_failed"
    );
  }

  if (profile.credits < 5) {
    redirect(
      "/dashboard/cover-letter?error=insufficient_credits"
    );
  }

  // ==========================================
  // RATE LIMIT
  // ==========================================

  const {
    data: rateLimitAllowed,
    error: rateLimitError,
  } = await supabase.rpc(
    "check_ai_rate_limit",
    {
      p_action_type:
        "standalone_cover_letter",
      p_limit: 3,
      p_window_seconds: 60,
    }
  );

  if (rateLimitError) {
    console.error(
      "Cover Letter rate limit error:",
      rateLimitError
    );

    redirect(
      "/dashboard/cover-letter?error=rate_limit_check_failed"
    );
  }

  if (!rateLimitAllowed) {
    redirect(
      "/dashboard/cover-letter?error=rate_limit_exceeded"
    );
  }

  // ==========================================
  // LOAD RESUME
  // ==========================================

  const {
    data: resume,
    error: resumeError,
  } = await supabase
    .from("resumes")
    .select(`
      id,
      full_name,
      job_title,
      location,
      email,
      phone,
      linkedin,
      summary,
      skills,
      experiences
    `)
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (
    resumeError ||
    !resume
  ) {
    redirect(
      "/dashboard/cover-letter?error=resume_not_found"
    );
  }

  const resumeSkills =
    Array.isArray(resume.skills)
      ? (resume.skills as string[]).join(", ")
      : "";

  const experiences: ResumeExperience[] =
    Array.isArray(
      resume.experiences
    )
      ? (resume.experiences as ResumeExperience[])
      : [];

  const experienceText =
    experiences
      .map((item) => {
        return `
Company:
${item.company ?? ""}

Job Title:
${item.jobTitle ?? ""}

Location:
${item.location ?? ""}

Period:
${item.startDate ?? ""} - ${
          item.current
            ? "Present"
            : item.endDate ?? ""
        }

Description:
${item.description ?? ""}
        `.trim();
      })
      .join("\n\n---\n\n");

  // ==========================================
  // PROMPT
  // ==========================================

  const prompt = `
You are an expert professional cover letter writer.

Write a tailored cover letter for the candidate applying to the job below.

IMPORTANT RULES:

- Never invent experience, employers, education, certifications, projects, achievements, responsibilities, dates, or skills.
- Only use information explicitly present in the saved resume.
- Do not claim the candidate has skills that are not present in the resume.
- Use real professional experience to explain why the candidate is relevant.
- Improve wording when useful, but never invent accomplishments.
- Keep the letter concise and professional.
- Aim for approximately 250-350 words.
- Use natural professional English.
- Do not use markdown.
- Do not use bullet points.
- Do not use emojis.

- Use plain text formatting.
- Do not use tables.
- Do not use columns.
- Do not use icons or decorative symbols.
- Do not use headers or footers.
- Keep the structure simple and easy to parse.
- Use standard section spacing.

- Do not invent a hiring manager name.
- Do not invent a street address.
- Do not invent a date.
- Do not invent information that is missing.

FORMAT:

Start with the candidate's full name.

On the following lines include, when available:
- location
- email
- phone
- LinkedIn

Add a blank line.

Then begin:

Dear Hiring Manager,

Write the body of the cover letter.

Finish with:

Sincerely,
Candidate Name


CANDIDATE

Name:
${resume.full_name ?? ""}

Current Job Title:
${resume.job_title ?? ""}

Location:
${resume.location ?? ""}

Email:
${resume.email ?? ""}

Phone:
${resume.phone ?? ""}

LinkedIn:
${resume.linkedin ?? ""}

Professional Summary:
${resume.summary ?? ""}

Skills:
${resumeSkills}


PROFESSIONAL EXPERIENCE

${experienceText}


TARGET JOB

Job Title:
${jobTitle}

Company:
${companyName ?? ""}

Job Description:
${jobDescription}


Write the final cover letter now.

Return only the cover letter itself.
`;

  // ==========================================
// GEMINI
// ==========================================

let content = "";

const MAX_RETRIES = 3;

for (
  let attempt = 1;
  attempt <= MAX_RETRIES;
  attempt++
) {
  try {
    const response =
      await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    content =
      response.text?.trim() ?? "";

    if (content) {
      break;
    }
  } catch (error) {
    console.error(
      `Standalone cover letter Gemini error - attempt ${attempt}:`,
      error
    );

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error
        ? Number(
            (
              error as {
                status?: number;
              }
            ).status
          )
        : undefined;

    const isTemporaryError =
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504;

    if (
      !isTemporaryError ||
      attempt === MAX_RETRIES
    ) {
      redirect(
        isTemporaryError
          ? "/dashboard/cover-letter?error=ai_temporarily_unavailable"
          : "/dashboard/cover-letter?error=generation_failed"
      );
    }

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          attempt * 1000
        )
    );
  }
}

if (!content) {
  redirect(
    "/dashboard/cover-letter?error=generation_failed"
  );
}

  // ==========================================
  // SAVE COVER LETTER
  // ==========================================

  const {
    data: coverLetter,
    error: insertError,
  } = await supabase
    .from("cover_letters")
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      job_title: jobTitle,
      company_name:
        companyName || null,
      job_description:
        jobDescription,
      content,
      status: "completed",
      updated_at:
        new Date().toISOString(),
    })
    .select("id")
    .single();

  if (
    insertError ||
    !coverLetter
  ) {
    console.error(
      "Error saving cover letter:",
      insertError
    );

    redirect(
      "/dashboard/cover-letter?error=save_failed"
    );
  }

  // ==========================================
  // CHARGE 5 CREDITS
  // ==========================================

  const {
    data: creditCharged,
    error: creditError,
  } = await supabase.rpc(
    "deduct_user_credits",
    {
      p_amount: 5,
      p_description:
        "Standalone Cover Letter",
    }
  );

  if (creditError) {
    console.error(
      "Error charging Cover Letter credits:",
      creditError
    );

    redirect(
      `/dashboard/cover-letter/${coverLetter.id}?error=credit_charge_failed`
    );
  }

  if (!creditCharged) {
    redirect(
      `/dashboard/cover-letter/${coverLetter.id}?error=insufficient_credits`
    );
  }

  // ==========================================
  // REFRESH + REDIRECT
  // ==========================================

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/cover-letter"
  );

  redirect(
    `/dashboard/cover-letter/${coverLetter.id}?success=generated`
  );
}
export async function updateCoverLetterContent(
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

  const coverLetterId =
    String(
      formData.get("coverLetterId") || ""
    ).trim();

  const content =
    String(
      formData.get("content") || ""
    ).trim();

  if (
    !coverLetterId ||
    !content
  ) {
    redirect(
      `/dashboard/cover-letter/${coverLetterId}?error=missing_content`
    );
  }

  const {
    error,
  } = await supabase
    .from("cover_letters")
    .update({
      content,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      coverLetterId
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    console.error(
      "Error updating cover letter:",
      error
    );

    redirect(
      `/dashboard/cover-letter/${coverLetterId}?error=update_failed`
    );
  }

  revalidatePath(
    `/dashboard/cover-letter/${coverLetterId}`
  );

  redirect(
    `/dashboard/cover-letter/${coverLetterId}?success=updated`
  );
}
export async function createManualCoverLetter(
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

  const title =
    String(
      formData.get("title") || ""
    ).trim();

  const companyName =
    String(
      formData.get("companyName") || ""
    ).trim();

  const content =
    String(
      formData.get("content") || ""
    ).trim();

  if (!content) {
    redirect(
      "/dashboard/cover-letter?error=manual_content_missing"
    );
  }

  const {
    data: coverLetter,
    error,
  } = await supabase
    .from("cover_letters")
    .insert({
      user_id:
        user.id,

      resume_id:
        null,

      job_title:
        title || "Cover Letter",

      company_name:
        companyName || null,

      job_description:
        null,

      content,

      status:
        "completed",

      updated_at:
        new Date().toISOString(),
    })
    .select(
      "id"
    )
    .single();

  if (
    error ||
    !coverLetter
  ) {
    console.error(
      "Error creating manual cover letter:",
      error
    );

    redirect(
      "/dashboard/cover-letter?error=manual_save_failed"
    );
  }

  revalidatePath(
    "/dashboard/cover-letter"
  );

  redirect(
    `/dashboard/cover-letter/${coverLetter.id}?success=created`
  );
}

export async function deleteCoverLetter(
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

  const coverLetterId =
    String(
      formData.get("coverLetterId") || ""
    ).trim();

  if (!coverLetterId) {
    redirect(
      "/dashboard/cover-letter?error=missing_cover_letter"
    );
  }

  const {
    error,
  } = await supabase
    .from("cover_letters")
    .delete()
    .eq(
      "id",
      coverLetterId
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    console.error(
      "Error deleting cover letter:",
      error
    );

    redirect(
      "/dashboard/cover-letter?error=delete_failed"
    );
  }

  revalidatePath(
    "/dashboard/cover-letter"
  );

  redirect(
    "/dashboard/cover-letter?success=deleted"
  );
}