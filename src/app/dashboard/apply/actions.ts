"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { analyzeJobMatch } from "@/lib/job-analysis";
import { gemini } from "@/lib/gemini";


// ======================================================
// CREATE JOB ANALYSIS
// ======================================================

export async function createJobAnalysis(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobDescription =
    formData.get("jobDescription") as string;

  const companyName =
    formData.get("companyName") as string;

  const jobTitle =
    formData.get("jobTitle") as string;

  if (!jobDescription?.trim()) {
    redirect(
      "/dashboard/apply?error=missing_description"
    );
  }

  const { data: analysis, error: analysisError } =
    await supabase
      .from("job_analyses")
      .insert({
        user_id: user.id,
        company_name: companyName?.trim() || null,
        job_title: jobTitle?.trim() || null,
        job_description: jobDescription.trim(),
        status: "pending",
      })
      .select()
      .single();

  if (analysisError || !analysis) {
    console.error(
      "Error creating job analysis:",
      analysisError
    );

    redirect(
      "/dashboard/apply?error=create_failed"
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(`
        job_title,
        preferred_job_title,
        career_goal,
        skills
      `)
      .eq("id", user.id)
      .single();

  if (profileError) {
    console.error(
      "Error loading profile:",
      profileError
    );
  }

  const profileText = `
    ${profile?.job_title ?? ""}
    ${profile?.preferred_job_title ?? ""}
    ${profile?.career_goal ?? ""}
    ${(profile?.skills ?? []).join(" ")}
  `;

  const result = analyzeJobMatch(
    jobDescription.trim(),
    profileText
  );

  const { error: resultError } = await supabase
    .from("job_analysis_results")
    .insert({
      analysis_id: analysis.id,
      user_id: user.id,
      match_score: result.matchScore,
      matched_skills: result.matchedSkills,
      missing_skills: result.missingSkills,
      recommendations: null,
    });

  if (resultError) {
    console.error(
      "Error saving analysis result:",
      resultError
    );
  }

  const { error: updateError } = await supabase
    .from("job_analyses")
    .update({
      match_score: result.matchScore,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", analysis.id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error(
      "Error updating job analysis:",
      updateError
    );
  }

  revalidatePath("/dashboard/apply");

  redirect(
    `/dashboard/apply/${analysis.id}`
  );
}


// ======================================================
// HELPER: FORMAT PROFESSIONAL EXPERIENCES
// ======================================================

function formatProfessionalExperiences(
  experiences:
    | {
        company_name: string;
        job_title: string;
        location: string | null;
        start_date: string | null;
        end_date: string | null;
        is_current: boolean;
        description: string | null;
      }[]
    | null
) {
  if (!experiences || experiences.length === 0) {
    return "No professional experience provided.";
  }

  return experiences
    .map((experience) => {
      const startDate =
        experience.start_date ?? "";

      const endDate =
        experience.is_current
          ? "Present"
          : experience.end_date ?? "";

      return `
Company:
${experience.company_name}

Job Title:
${experience.job_title}

Location:
${experience.location ?? ""}

Period:
${startDate} - ${endDate}

Responsibilities and Achievements:
${experience.description ?? ""}
      `.trim();
    })
    .join("\n\n---\n\n");
}


// ======================================================
// GENERATE TAILORED RESUME WITH GEMINI
// ======================================================

export async function generateTailoredResume(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const analysisId =
    formData.get("analysisId") as string;

  if (!analysisId) {
    redirect("/dashboard/apply");
  }

  // Get job analysis
  const { data: analysis, error: analysisError } =
    await supabase
      .from("job_analyses")
      .select(`
        id,
        company_name,
        job_title,
        job_description,
        match_score
      `)
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

  if (analysisError || !analysis) {
    console.error(
      "Error loading analysis:",
      analysisError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=analysis_not_found`
    );
  }

  // Get match result
  const { data: analysisResult, error: resultError } =
    await supabase
      .from("job_analysis_results")
      .select(`
        match_score,
        matched_skills,
        missing_skills,
        recommendations
      `)
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (resultError) {
    console.error(
      "Error loading analysis result:",
      resultError
    );
  }

  // Get user profile
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(`
        full_name,
        job_title,
        location,
        years_experience,
        preferred_job_title,
        linkedin_url,
        career_goal,
        skills
      `)
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    console.error(
      "Error loading profile:",
      profileError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=profile_not_found`
    );
  }

  // Get professional experience
  const {
    data: experiences,
    error: experiencesError,
  } = await supabase
    .from("professional_experiences")
    .select(`
      company_name,
      job_title,
      location,
      start_date,
      end_date,
      is_current,
      description
    `)
    .eq("user_id", user.id)
    .order("start_date", {
      ascending: false,
    });

  if (experiencesError) {
    console.error(
      "Error loading professional experiences:",
      experiencesError
    );
  }

  const profileSkills =
    Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "";

  const matchedSkills =
    Array.isArray(analysisResult?.matched_skills)
      ? analysisResult.matched_skills.join(", ")
      : "";

  const missingSkills =
    Array.isArray(analysisResult?.missing_skills)
      ? analysisResult.missing_skills.join(", ")
      : "";

  const professionalExperienceText =
    formatProfessionalExperiences(
      experiences
    );

  // Gemini prompt
  const prompt = `
You are a professional resume writer.

Create an ATS-friendly tailored resume for the candidate below.

IMPORTANT RULES:

- Never invent experience, education, employers, dates, certifications, achievements, projects, responsibilities, or skills.
- Only use information explicitly supplied in the candidate profile and professional experience.
- Do not claim the candidate has any skill listed under Missing Skills.
- Highlight real matching skills when relevant to the target position.
- You may improve wording and structure of real responsibilities and achievements.
- Never create responsibilities or achievements that were not provided.
- Preserve the meaning of the candidate's real professional experience.
- Include a PROFESSIONAL EXPERIENCE section whenever professional experience is provided.
- Prioritize professional experiences and responsibilities that are relevant to the target job.
- Keep the resume professional, concise, and ATS-friendly.
- Use plain text formatting.
- Do not use markdown tables.
- Do not use emojis.
- If information is unavailable, omit the section instead of inventing it.


CANDIDATE PROFILE

Name:
${profile.full_name ?? ""}

Current job title:
${profile.job_title ?? ""}

Location:
${profile.location ?? ""}

Years of experience:
${profile.years_experience ?? ""}

Target job title:
${profile.preferred_job_title ?? ""}

Career goal:
${profile.career_goal ?? ""}

Skills:
${profileSkills}

LinkedIn:
${profile.linkedin_url ?? ""}


PROFESSIONAL EXPERIENCE

${professionalExperienceText}


TARGET JOB

Company:
${analysis.company_name ?? ""}

Job title:
${analysis.job_title ?? ""}

Job description:
${analysis.job_description}


JOB MATCH

Match score:
${analysisResult?.match_score ?? analysis.match_score ?? 0}%

Matching skills:
${matchedSkills}

Missing skills:
${missingSkills}


Create the tailored resume now.

Return only the final resume.
`;

  let resumeContent: string;

  try {
    const response =
      await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    resumeContent =
      response.text?.trim() ?? "";
  } catch (error) {
    console.error(
      "Gemini resume generation error:",
      error
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=resume_generation_failed`
    );
  }

  if (!resumeContent) {
    redirect(
      `/dashboard/apply/${analysisId}?error=resume_generation_failed`
    );
  }

  const { error: documentError } =
    await supabase
      .from("generated_documents")
      .upsert(
        {
          user_id: user.id,
          analysis_id: analysisId,
          document_type: "resume",
          content: resumeContent,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "analysis_id,document_type",
        }
      );

  if (documentError) {
    console.error(
      "Error saving generated resume:",
      documentError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=resume_generation_failed`
    );
  }

  revalidatePath(
    `/dashboard/apply/${analysisId}`
  );

  redirect(
    `/dashboard/apply/${analysisId}?success=resume_generated`
  );
}


// ======================================================
// GENERATE COVER LETTER WITH GEMINI
// ======================================================

export async function generateCoverLetter(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const analysisId =
    formData.get("analysisId") as string;

  if (!analysisId) {
    redirect("/dashboard/apply");
  }

  // Get job analysis
  const { data: analysis, error: analysisError } =
    await supabase
      .from("job_analyses")
      .select(`
        id,
        company_name,
        job_title,
        job_description,
        match_score
      `)
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

  if (analysisError || !analysis) {
    console.error(
      "Error loading analysis:",
      analysisError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=analysis_not_found`
    );
  }

  // Get job match
  const {
    data: analysisResult,
    error: resultError,
  } = await supabase
    .from("job_analysis_results")
    .select(`
      matched_skills,
      missing_skills,
      match_score
    `)
    .eq("analysis_id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (resultError) {
    console.error(
      "Error loading analysis result:",
      resultError
    );
  }

  // Get profile
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      job_title,
      location,
      years_experience,
      preferred_job_title,
      career_goal,
      skills
    `)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      "Error loading profile:",
      profileError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=profile_not_found`
    );
  }

  // Get professional experience
  const {
    data: experiences,
    error: experiencesError,
  } = await supabase
    .from("professional_experiences")
    .select(`
      company_name,
      job_title,
      location,
      start_date,
      end_date,
      is_current,
      description
    `)
    .eq("user_id", user.id)
    .order("start_date", {
      ascending: false,
    });

  if (experiencesError) {
    console.error(
      "Error loading professional experiences:",
      experiencesError
    );
  }

  const profileSkills =
    Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "";

  const matchedSkills =
    Array.isArray(analysisResult?.matched_skills)
      ? analysisResult.matched_skills.join(", ")
      : "";

  const missingSkills =
    Array.isArray(analysisResult?.missing_skills)
      ? analysisResult.missing_skills.join(", ")
      : "";

  const professionalExperienceText =
    formatProfessionalExperiences(
      experiences
    );

  // Gemini prompt
  const prompt = `
You are an expert professional cover letter writer.

Write a tailored cover letter for the candidate applying to the job below.

IMPORTANT RULES:

- Never invent experience, employers, education, certifications, projects, achievements, responsibilities, dates, or skills.
- Only use information explicitly provided in the candidate profile and professional experience.
- Never claim the candidate has a skill listed under Missing Skills.
- Highlight genuine matching skills when relevant.
- Use real professional experience to explain why the candidate is relevant to this opportunity.
- You may improve the wording of real responsibilities and achievements, but never invent new ones.
- Do not simply repeat the resume.
- Connect the candidate's actual professional background to the job requirements.
- Keep the letter concise and professional.
- Aim for approximately 250-350 words.
- Use natural professional English.
- Do not use markdown.
- Do not use bullet points.
- Do not use emojis.
- Do not include fake addresses, phone numbers, emails, dates, or hiring manager names.
- If the hiring manager's name is unknown, start with "Dear Hiring Manager,".
- If candidate information is missing, omit it instead of inventing information.


CANDIDATE PROFILE

Name:
${profile.full_name ?? ""}

Current Job Title:
${profile.job_title ?? ""}

Location:
${profile.location ?? ""}

Years of Experience:
${profile.years_experience ?? ""}

Target Job Title:
${profile.preferred_job_title ?? ""}

Career Goal:
${profile.career_goal ?? ""}

Skills:
${profileSkills}


PROFESSIONAL EXPERIENCE

${professionalExperienceText}


TARGET JOB

Company:
${analysis.company_name ?? ""}

Position:
${analysis.job_title ?? ""}

Job Description:
${analysis.job_description}


JOB MATCH INFORMATION

Match Score:
${analysisResult?.match_score ?? analysis.match_score ?? 0}%

Matching Skills:
${matchedSkills}

Missing Skills:
${missingSkills}


Write the final cover letter now.

Return only the cover letter itself.
`;

  let coverLetterContent: string;

  try {
    const response =
      await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    coverLetterContent =
      response.text?.trim() ?? "";
  } catch (error) {
    console.error(
      "Gemini cover letter generation error:",
      error
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=cover_letter_generation_failed`
    );
  }

  if (!coverLetterContent) {
    redirect(
      `/dashboard/apply/${analysisId}?error=cover_letter_generation_failed`
    );
  }

  const { error: documentError } =
    await supabase
      .from("generated_documents")
      .upsert(
        {
          user_id: user.id,
          analysis_id: analysisId,
          document_type:
            "cover_letter",
          content:
            coverLetterContent,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "analysis_id,document_type",
        }
      );

  if (documentError) {
    console.error(
      "Error saving generated cover letter:",
      documentError
    );

    redirect(
      `/dashboard/apply/${analysisId}?error=cover_letter_generation_failed`
    );
  }

  revalidatePath(
    `/dashboard/apply/${analysisId}`
  );

  redirect(
    `/dashboard/apply/${analysisId}?success=cover_letter_generated`
  );
}

export async function deleteGeneratedDocument(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const documentId = formData.get("documentId") as string;
  const analysisId = formData.get("analysisId") as string;

  if (!documentId || !analysisId) {
    redirect("/dashboard/apply");
  }

  const { error } = await supabase
    .from("generated_documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting generated document:", error);

    redirect(
      `/dashboard/apply/${analysisId}?error=document_delete_failed`
    );
  }

  revalidatePath(`/dashboard/apply/${analysisId}`);

  redirect(
    `/dashboard/apply/${analysisId}?success=document_deleted`
  );
}