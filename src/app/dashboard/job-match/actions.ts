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

export async function runJobMatch(
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
      "/dashboard/job-match?error=missing_fields"
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
      "/dashboard/job-match?error=credits_check_failed"
    );
  }

  if (profile.credits < 3) {
    redirect(
      "/dashboard/job-match?error=insufficient_credits"
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
      p_action_type: "job_match",
      p_limit: 3,
      p_window_seconds: 60,
    }
  );

  if (rateLimitError) {
    console.error(
      "Job Match rate limit error:",
      rateLimitError
    );

    redirect(
      "/dashboard/job-match?error=rate_limit_check_failed"
    );
  }

  if (!rateLimitAllowed) {
    redirect(
      "/dashboard/job-match?error=rate_limit_exceeded"
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
      "/dashboard/job-match?error=resume_not_found"
    );
  }

  const resumeSkills =
    Array.isArray(resume.skills)
      ? resume.skills.join(", ")
      : "";

  const experiences: ResumeExperience[] =
  Array.isArray(resume.experiences)
    ? (resume.experiences as ResumeExperience[])
    : [];

const experienceText =
    experiences
        .map((item) => {
        return `
    Company: ${item.company ?? ""}
    Job Title: ${item.jobTitle ?? ""}
    Location: ${item.location ?? ""}
    Period: ${item.startDate ?? ""} - ${
            item.current
            ? "Present"
            : item.endDate ?? ""
        }
    Description:
    ${item.description ?? ""}
        `.trim();
        })
        .join("\n\n");

  // ==========================================
  // PROMPT
  // ==========================================

  const prompt = `
You are an expert recruiter and ATS job-match evaluator.

Compare the candidate resume against the target job.

IMPORTANT RULES:

- Do not invent experience, skills, achievements, education, certifications, or keywords.
- Judge only information actually present in the resume.
- Matching Skills must only include skills clearly present in the resume.
- Missing Skills must only include skills clearly requested by the job but absent from the resume.
- Missing Keywords should contain important ATS terms from the job description that are absent from the resume.
- Give a realistic match score from 0 to 100.
- Experience Match should be one of:
  "Weak"
  "Moderate"
  "Strong"
  "Excellent"
- Recommendations must be specific and actionable.
- Return ONLY valid JSON.
- No markdown.
- No explanation outside the JSON.

Return exactly:

{
  "match_score": 0,
  "matching_skills": [],
  "missing_skills": [],
  "missing_keywords": [],
  "experience_match": "",
  "recommendations": []
}

CANDIDATE RESUME

Name:
${resume.full_name ?? ""}

Current Job Title:
${resume.job_title ?? ""}

Location:
${resume.location ?? ""}

Professional Summary:
${resume.summary ?? ""}

Skills:
${resumeSkills}

Professional Experience:
${experienceText}


TARGET JOB

Job Title:
${jobTitle}

Company:
${companyName ?? ""}

Job Description:
${jobDescription}
`;

  // ==========================================
  // GEMINI
  // ==========================================

  let parsedResult: {
    match_score: number;
    matching_skills: string[];
    missing_skills: string[];
    missing_keywords: string[];
    experience_match: string;
    recommendations: string[];
  };

  try {
    const response =
      await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    const text =
      response.text?.trim() ?? "";

    const cleanedText =
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    parsedResult =
      JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      "Job Match Gemini error:",
      error
    );

    redirect(
      "/dashboard/job-match?error=analysis_failed"
    );
  }

  const validScore =
    Number.isFinite(
      parsedResult.match_score
    ) &&
    parsedResult.match_score >= 0 &&
    parsedResult.match_score <= 100;

  if (!validScore) {
    redirect(
      "/dashboard/job-match?error=invalid_analysis"
    );
  }

  // ==========================================
  // SAVE JOB MATCH
  // ==========================================

  const {
    data: jobMatch,
    error: insertError,
  } = await supabase
    .from("job_matches")
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      job_title: jobTitle,
      company_name:
        companyName || null,
      job_description:
        jobDescription,
      match_score:
        parsedResult.match_score,
      matching_skills:
        parsedResult.matching_skills,
      missing_skills:
        parsedResult.missing_skills,
      missing_keywords:
        parsedResult.missing_keywords,
      experience_match:
        parsedResult.experience_match,
      recommendations:
        parsedResult.recommendations,
      status: "completed",
      updated_at:
        new Date().toISOString(),
    })
    .select("id")
    .single();

  if (
    insertError ||
    !jobMatch
  ) {
    console.error(
      "Error saving Job Match:",
      insertError
    );

    redirect(
      "/dashboard/job-match?error=save_failed"
    );
  }

  // ==========================================
  // CHARGE 3 CREDITS
  // ==========================================

  const {
    data: creditCharged,
    error: creditError,
  } = await supabase.rpc(
    "deduct_user_credits",
    {
      p_amount: 3,
      p_description: "Job Match",
    }
  );

  if (creditError) {
    console.error(
      "Error charging Job Match credits:",
      creditError
    );

    redirect(
      `/dashboard/job-match/${jobMatch.id}?error=credit_charge_failed`
    );
  }

  if (!creditCharged) {
    redirect(
      `/dashboard/job-match/${jobMatch.id}?error=insufficient_credits`
    );
  }

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/job-match"
  );

  redirect(
    `/dashboard/job-match/${jobMatch.id}?success=completed`
  );
}