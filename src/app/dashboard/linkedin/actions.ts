"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import { createClient } from "@/lib/supabase/server";
import { gemini } from "@/lib/gemini";

async function extractPdfText(
  file: File
) {
  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await getDocumentProxy(
      new Uint8Array(
        arrayBuffer
      )
    );

  const {
  text,
} = await extractText(
  pdf,
  {
    mergePages: true,
  }
);

return text.trim();
}

export async function runLinkedinAnalysis(
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

  const profileUrl =
    (
      formData.get(
        "profileUrl"
      ) as string
    )?.trim() || null;

  const pastedProfileText =
    (
      formData.get(
        "profileText"
      ) as string
    )?.trim() || "";

  const profileFile =
    formData.get(
      "profileFile"
    ) as File | null;

  let profileText =
    pastedProfileText;

  let fileName:
    string | null = null;

  // ==========================================
  // PDF
  // ==========================================

  if (
    profileFile &&
    profileFile.size > 0
  ) {
    const isPdf =
      profileFile.type ===
        "application/pdf" ||
      profileFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      redirect(
        "/dashboard/linkedin?error=invalid_file"
      );
    }

    const maxFileSize =
      5 * 1024 * 1024;

    if (
      profileFile.size >
      maxFileSize
    ) {
      redirect(
        "/dashboard/linkedin?error=file_too_large"
      );
    }

    try {
      profileText =
        await extractPdfText(
          profileFile
        );

      fileName =
        profileFile.name;
    } catch (error) {
      console.error(
        "LinkedIn PDF extraction error:",
        error
      );

      redirect(
        "/dashboard/linkedin?error=extract_failed"
      );
    }
  }

  // ==========================================
  // VALIDATE PROFILE CONTENT
  // ==========================================

  if (
    !profileText ||
    profileText.length < 100
  ) {
    redirect(
      "/dashboard/linkedin?error=profile_too_short"
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
      "/dashboard/linkedin?error=credits_check_failed"
    );
  }

  if (
    profile.credits < 5
  ) {
    redirect(
      "/dashboard/linkedin?error=insufficient_credits"
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
        "linkedin_analyzer",

      p_limit: 3,

      p_window_seconds: 60,
    }
  );

  if (rateLimitError) {
    console.error(
      "LinkedIn Analyzer rate limit error:",
      rateLimitError
    );

    redirect(
      "/dashboard/linkedin?error=rate_limit_check_failed"
    );
  }

  if (!rateLimitAllowed) {
    redirect(
      "/dashboard/linkedin?error=rate_limit_exceeded"
    );
  }

  // ==========================================
  // PROMPT
  // ==========================================

  const prompt = `
You are an expert LinkedIn profile reviewer, recruiter, and career branding specialist.

Analyze the LinkedIn profile content below.

IMPORTANT RULES:

- Judge only the content actually provided.
- Do not invent experience, education, certifications, achievements, skills, employers, dates, or responsibilities.
- Give realistic scores.
- Do not give every profile a high score.
- Evaluate clarity, professional positioning, recruiter searchability, credibility, and completeness.
- Suggestions must be specific and actionable.
- Suggested headline must use only information supported by the profile.
- Suggested About section must not invent information.
- The category scores MUST add up exactly to the overall score.
- The overall score must be between 0 and 100.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not include commentary outside the JSON.

SCORING:

Headline: maximum 20
About: maximum 20
Experience: maximum 25
Skills: maximum 20
Keywords & Searchability: maximum 15

Return exactly this structure:

{
  "overall_score": 0,
  "headline_score": 0,
  "about_score": 0,
  "experience_score": 0,
  "skills_score": 0,
  "keyword_score": 0,
  "strengths": [
    "specific strength",
    "specific strength"
  ],
  "improvements": [
    "specific improvement",
    "specific improvement"
  ],
  "suggested_headline": "improved headline",
  "suggested_about": "improved About section"
}

LINKEDIN PROFILE URL:
${profileUrl ?? ""}

LINKEDIN PROFILE CONTENT:

${profileText}
`;

  // ==========================================
  // GEMINI
  // ==========================================

  let parsedResult: {
    overall_score: number;
    headline_score: number;
    about_score: number;
    experience_score: number;
    skills_score: number;
    keyword_score: number;
    strengths: string[];
    improvements: string[];
    suggested_headline: string;
    suggested_about: string;
  };

  try {
    const response =
      await gemini.models.generateContent({
        model:
          "gemini-3.6-flash",

        contents:
          prompt,
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
      "LinkedIn Analyzer Gemini error:",
      error
    );

    redirect(
      "/dashboard/linkedin?error=analysis_failed"
    );
  }

  // ==========================================
  // VALIDATE SCORES
  // ==========================================

  const total =
    Number(
      parsedResult.headline_score
    ) +
    Number(
      parsedResult.about_score
    ) +
    Number(
      parsedResult.experience_score
    ) +
    Number(
      parsedResult.skills_score
    ) +
    Number(
      parsedResult.keyword_score
    );

  const valid =
    Number.isFinite(
      parsedResult.overall_score
    ) &&

    parsedResult.overall_score >=
      0 &&

    parsedResult.overall_score <=
      100 &&

    parsedResult.headline_score >=
      0 &&

    parsedResult.headline_score <=
      20 &&

    parsedResult.about_score >=
      0 &&

    parsedResult.about_score <=
      20 &&

    parsedResult.experience_score >=
      0 &&

    parsedResult.experience_score <=
      25 &&

    parsedResult.skills_score >=
      0 &&

    parsedResult.skills_score <=
      20 &&

    parsedResult.keyword_score >=
      0 &&

    parsedResult.keyword_score <=
      15 &&

    total ===
      parsedResult.overall_score;

  if (!valid) {
    console.error(
      "Invalid LinkedIn analysis:",
      parsedResult
    );

    redirect(
      "/dashboard/linkedin?error=invalid_analysis"
    );
  }

  // ==========================================
  // SAVE ANALYSIS
  // ==========================================

  const {
    data: analysis,
    error: insertError,
  } = await supabase
    .from(
      "linkedin_analyses"
    )
    .insert({
      user_id:
        user.id,

      profile_url:
        profileUrl,

      file_name:
        fileName,

      profile_text:
        profileText,

      overall_score:
        parsedResult.overall_score,

      headline_score:
        parsedResult.headline_score,

      about_score:
        parsedResult.about_score,

      experience_score:
        parsedResult.experience_score,

      skills_score:
        parsedResult.skills_score,

      keyword_score:
        parsedResult.keyword_score,

      strengths:
        parsedResult.strengths,

      improvements:
        parsedResult.improvements,

      suggested_headline:
        parsedResult.suggested_headline,

      suggested_about:
        parsedResult.suggested_about,

      status:
        "completed",

      updated_at:
        new Date().toISOString(),
    })
    .select("id")
    .single();

  if (
    insertError ||
    !analysis
  ) {
    console.error(
      "Error saving LinkedIn analysis:",
      insertError
    );

    redirect(
      "/dashboard/linkedin?error=save_failed"
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
        "LinkedIn Analysis",
    }
  );

  if (creditError) {
    console.error(
      "Error charging LinkedIn Analyzer credits:",
      creditError
    );

    redirect(
      `/dashboard/linkedin/${analysis.id}?error=credit_charge_failed`
    );
  }

  if (!creditCharged) {
    redirect(
      `/dashboard/linkedin/${analysis.id}?error=insufficient_credits`
    );
  }

  // ==========================================
  // REFRESH
  // ==========================================

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/linkedin"
  );

  redirect(
    `/dashboard/linkedin/${analysis.id}?success=completed`
  );
}