"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { createClient } from "@/lib/supabase/server";
import { gemini } from "@/lib/gemini";


// ======================================================
// EXTRACT RESUME TEXT
// ======================================================

async function extractResumeText(file: File) {
  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const fileName =
    file.name.toLowerCase();

  // PDF
  if (fileName.endsWith(".pdf")) {
    const parser =
      new PDFParse({
        data: buffer,
      });

    const result =
      await parser.getText();

    await parser.destroy();

    return result.text.trim();
  }

  // DOCX
  if (fileName.endsWith(".docx")) {
    const result =
      await mammoth.extractRawText({
        buffer,
      });

    return result.value.trim();
  }

  throw new Error(
    "Unsupported file type"
  );
}


// ======================================================
// UPLOAD RESUME
// ======================================================

export async function uploadResumeForAnalysis(
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

  const resumeFile =
    formData.get(
      "resumeFile"
    ) as File | null;

  if (
    !resumeFile ||
    resumeFile.size === 0
  ) {
    redirect(
      "/dashboard/resume-analyzer?error=missing_file"
    );
  }

  // ======================================================
  // VALIDATE FILE TYPE
  // ======================================================

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    !allowedTypes.includes(
      resumeFile.type
    )
  ) {
    redirect(
      "/dashboard/resume-analyzer?error=invalid_file"
    );
  }

  // ======================================================
  // VALIDATE FILE SIZE
  // ======================================================

  const maxFileSize =
    5 * 1024 * 1024;

  if (
    resumeFile.size >
    maxFileSize
  ) {
    redirect(
      "/dashboard/resume-analyzer?error=file_too_large"
    );
  }

  // ======================================================
  // EXTRACT TEXT
  // ======================================================

  let resumeText = "";

  try {
    resumeText =
      await extractResumeText(
        resumeFile
      );
  } catch (error) {
    console.error(
      "Resume extraction error:",
      error
    );

    redirect(
      "/dashboard/resume-analyzer?error=extract_failed"
    );
  }

  if (
    !resumeText ||
    resumeText.length < 50
  ) {
    redirect(
      "/dashboard/resume-analyzer?error=no_text_found"
    );
  }

  // ======================================================
  // CREATE ANALYSIS
  // ======================================================

  const {
    data: analysis,
    error: insertError,
  } = await supabase
    .from("resume_analyses")
    .insert({
      user_id: user.id,
      file_name:
        resumeFile.name,
      file_type:
        resumeFile.type,
      resume_text:
        resumeText,
      status: "uploaded",
    })
    .select("id")
    .single();

  if (
    insertError ||
    !analysis
  ) {
    console.error(
      "Error creating resume analysis:",
      insertError
    );

    redirect(
      "/dashboard/resume-analyzer?error=create_failed"
    );
  }

  revalidatePath(
    "/dashboard/resume-analyzer"
  );

  redirect(
    `/dashboard/resume-analyzer/${analysis.id}`
  );
}


// ======================================================
// RUN RESUME ANALYSIS
// COST: 5 CREDITS
// RATE LIMIT: 3 AI GENERATIONS / 60 SECONDS
// ======================================================

export async function runResumeAnalysis(
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

  const analysisId =
    formData.get(
      "analysisId"
    ) as string;

  if (!analysisId) {
    redirect(
      "/dashboard/resume-analyzer"
    );
  }

  // ======================================================
  // CHECK CREDITS
  // ======================================================

  const {
    data: creditProfile,
    error: creditProfileError,
  } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (
    creditProfileError ||
    !creditProfile
  ) {
    console.error(
      "Error loading user credits:",
      creditProfileError
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=credits_check_failed`
    );
  }

  if (
    creditProfile.credits < 5
  ) {
    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=insufficient_credits`
    );
  }

  // ======================================================
  // RATE LIMIT
  // ======================================================

  const {
    data: rateLimitAllowed,
    error: rateLimitError,
  } = await supabase.rpc(
    "check_ai_rate_limit",
    {
      p_action_type:
        "resume_analyzer",
      p_limit: 3,
      p_window_seconds: 60,
    }
  );

  if (rateLimitError) {
    console.error(
      "Resume Analyzer rate limit error:",
      rateLimitError
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=rate_limit_check_failed`
    );
  }

  if (!rateLimitAllowed) {
    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=rate_limit_exceeded`
    );
  }

  // ======================================================
  // LOAD ANALYSIS
  // ======================================================

  const {
    data: analysis,
    error: analysisError,
  } = await supabase
    .from("resume_analyses")
    .select(`
      id,
      resume_text,
      status
    `)
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (
    analysisError ||
    !analysis
  ) {
    redirect(
      "/dashboard/resume-analyzer?error=analysis_not_found"
    );
  }

  if (!analysis.resume_text) {
    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=no_text_found`
    );
  }

  // ======================================================
  // PROMPT
  // ======================================================

  const prompt = `
You are an expert resume reviewer and ATS specialist.

Analyze the resume below and return a structured evaluation.

IMPORTANT RULES:

- Do not invent information that is not present in the resume.
- Judge only the content that is actually provided.
- Be practical and specific.
- Give realistic scores.
- Do not give every resume a high score.
- Reward measurable achievements, clear structure, relevant skills, and strong experience descriptions.
- Penalize vague statements, weak formatting, missing sections, lack of measurable results, and poor ATS readability.
- The category scores MUST add up exactly to the overall score.
- The overall score must be between 0 and 100.

SCORING:

ATS Compatibility: maximum 20
Professional Summary: maximum 15
Work Experience: maximum 25
Skills: maximum 15
Formatting & Structure: maximum 15
Impact & Achievements: maximum 10

Return ONLY valid JSON in exactly this format:

{
  "overall_score": 0,
  "ats_score": 0,
  "summary_score": 0,
  "experience_score": 0,
  "skills_score": 0,
  "formatting_score": 0,
  "impact_score": 0,
  "strengths": [
    "specific strength",
    "specific strength"
  ],
  "improvements": [
    "specific improvement",
    "specific improvement"
  ]
}

RESUME:

${analysis.resume_text}
`;

  // ======================================================
  // GEMINI
  // ======================================================

  let parsedResult: {
    overall_score: number;
    ats_score: number;
    summary_score: number;
    experience_score: number;
    skills_score: number;
    formatting_score: number;
    impact_score: number;
    strengths: string[];
    improvements: string[];
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
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    parsedResult =
      JSON.parse(
        cleanedText
      );
  } catch (error) {
    console.error(
      "Resume analysis generation error:",
      error
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=analysis_failed`
    );
  }

  // ======================================================
  // VALIDATE RESULT
  // ======================================================

  const scores = [
    parsedResult.ats_score,
    parsedResult.summary_score,
    parsedResult.experience_score,
    parsedResult.skills_score,
    parsedResult.formatting_score,
    parsedResult.impact_score,
  ];

  const calculatedTotal =
    scores.reduce(
      (sum, score) =>
        sum +
        Number(score || 0),
      0
    );

  const valid =
    parsedResult.overall_score >= 0 &&
    parsedResult.overall_score <= 100 &&

    parsedResult.ats_score >= 0 &&
    parsedResult.ats_score <= 20 &&

    parsedResult.summary_score >= 0 &&
    parsedResult.summary_score <= 15 &&

    parsedResult.experience_score >= 0 &&
    parsedResult.experience_score <= 25 &&

    parsedResult.skills_score >= 0 &&
    parsedResult.skills_score <= 15 &&

    parsedResult.formatting_score >= 0 &&
    parsedResult.formatting_score <= 15 &&

    parsedResult.impact_score >= 0 &&
    parsedResult.impact_score <= 10 &&

    calculatedTotal ===
      parsedResult.overall_score;

  if (!valid) {
    console.error(
      "Invalid resume analysis result:",
      parsedResult
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=invalid_analysis`
    );
  }

  // ======================================================
  // SAVE RESULT
  // ======================================================

  const {
    error: updateError,
  } = await supabase
    .from("resume_analyses")
    .update({
      overall_score:
        parsedResult.overall_score,

      ats_score:
        parsedResult.ats_score,

      summary_score:
        parsedResult.summary_score,

      experience_score:
        parsedResult.experience_score,

      skills_score:
        parsedResult.skills_score,

      formatting_score:
        parsedResult.formatting_score,

      impact_score:
        parsedResult.impact_score,

      strengths:
        parsedResult.strengths,

      improvements:
        parsedResult.improvements,

      status: "completed",

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error(
      "Error saving resume analysis:",
      updateError
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=save_failed`
    );
  }

  // ======================================================
  // CHARGE 5 CREDITS
  // ======================================================

  const {
    data: creditCharged,
    error: creditError,
  } = await supabase.rpc(
    "deduct_user_credits",
    {
      p_amount: 5,
      p_description:
        "Resume Analysis",
    }
  );

  if (creditError) {
    console.error(
      "Error charging Resume Analyzer credits:",
      creditError
    );

    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=credit_charge_failed`
    );
  }

  if (!creditCharged) {
    redirect(
      `/dashboard/resume-analyzer/${analysisId}?error=insufficient_credits`
    );
  }

  // ======================================================
  // REFRESH
  // ======================================================

  revalidatePath(
    `/dashboard/resume-analyzer/${analysisId}`
  );

  revalidatePath(
    "/dashboard/resume-analyzer"
  );

  revalidatePath(
    "/dashboard"
  );

  redirect(
    `/dashboard/resume-analyzer/${analysisId}?success=analysis_completed`
  );
}