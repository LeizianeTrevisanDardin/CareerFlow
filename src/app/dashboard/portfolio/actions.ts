"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import * as cheerio from "cheerio";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { createClient } from "@/lib/supabase/server";
import { gemini } from "@/lib/gemini";

// ======================================================
// PRIVATE NETWORK PROTECTION
// ======================================================

function isPrivateIp(ip: string) {
  // IPv4
  if (ip.startsWith("10.")) {
    return true;
  }

  if (ip.startsWith("127.")) {
    return true;
  }

  if (ip.startsWith("169.254.")) {
    return true;
  }

  if (ip.startsWith("192.168.")) {
    return true;
  }

  const parts =
    ip
      .split(".")
      .map(Number);

  if (
    parts.length === 4 &&
    parts[0] === 172 &&
    parts[1] >= 16 &&
    parts[1] <= 31
  ) {
    return true;
  }

  // IPv6 localhost/private/link-local
  const normalized =
    ip.toLowerCase();

  if (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  ) {
    return true;
  }

  return false;
}

// ======================================================
// VALIDATE PORTFOLIO URL
// ======================================================

async function validatePublicUrl(
  rawUrl: string
) {
  let url: URL;

  try {
    url =
      new URL(rawUrl);
  } catch {
    throw new Error(
      "INVALID_URL"
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "INVALID_URL"
    );
  }

  const hostname =
    url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".local")
  ) {
    throw new Error(
      "PRIVATE_URL"
    );
  }

  // Direct IP
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error(
        "PRIVATE_URL"
      );
    }

    return url;
  }

  // Resolve domain and verify all addresses
  const addresses =
    await lookup(
      hostname,
      {
        all: true,
      }
    );

  if (
    addresses.length === 0
  ) {
    throw new Error(
      "URL_NOT_FOUND"
    );
  }

  for (
    const address of addresses
  ) {
    if (
      isPrivateIp(
        address.address
      )
    ) {
      throw new Error(
        "PRIVATE_URL"
      );
    }
  }

  return url;
}

// ======================================================
// FETCH PORTFOLIO WEBSITE
// ======================================================

async function fetchPortfolioText(
  rawUrl: string
) {
  let currentUrl =
    await validatePublicUrl(
      rawUrl
    );

  // Limit redirects so malicious redirects cannot loop.
  for (
    let redirectCount = 0;
    redirectCount <= 3;
    redirectCount++
  ) {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        10000
      );

    let response: Response;

    try {
      response =
        await fetch(
          currentUrl.toString(),
          {
            method: "GET",

            redirect:
              "manual",

            signal:
              controller.signal,

            headers: {
              "User-Agent":
                "Mozilla/5.0 Careerflow Portfolio Analyzer",

              Accept:
                "text/html,application/xhtml+xml",
            },
          }
        );
    } finally {
      clearTimeout(timeout);
    }

    // ==========================================
    // REDIRECT
    // ==========================================

    if (
      response.status >= 300 &&
      response.status < 400
    ) {
      const location =
        response.headers.get(
          "location"
        );

      if (!location) {
        throw new Error(
          "FETCH_FAILED"
        );
      }

      const redirectedUrl =
        new URL(
          location,
          currentUrl
        );

      currentUrl =
        await validatePublicUrl(
          redirectedUrl.toString()
        );

      continue;
    }

    if (!response.ok) {
      throw new Error(
        "FETCH_FAILED"
      );
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) ?? "";

    if (
      !contentType.includes(
        "text/html"
      )
    ) {
      throw new Error(
        "NOT_HTML"
      );
    }

    // Guard against extremely large pages.
    const contentLength =
      Number(
        response.headers.get(
          "content-length"
        ) ?? 0
      );

    const maxWebsiteSize =
      2 * 1024 * 1024;

    if (
      contentLength >
      maxWebsiteSize
    ) {
      throw new Error(
        "PAGE_TOO_LARGE"
      );
    }

    const html =
      await response.text();

    if (
      html.length >
      maxWebsiteSize
    ) {
      throw new Error(
        "PAGE_TOO_LARGE"
      );
    }

    // ==========================================
    // CLEAN HTML
    // ==========================================

    const $ =
      cheerio.load(html);

    $(
      `
      script,
      style,
      noscript,
      svg,
      iframe,
      canvas,
      form
      `
    ).remove();

    const title =
      $("title")
        .first()
        .text()
        .trim();

    const metaDescription =
      $(
        'meta[name="description"]'
      )
        .attr("content")
        ?.trim() ?? "";

    const bodyText =
      $("body")
        .text()
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    const combined =
      [
        title,
        metaDescription,
        bodyText,
      ]
        .filter(Boolean)
        .join("\n\n");

    if (
      combined.length <
      100
    ) {
      throw new Error(
        "NOT_ENOUGH_CONTENT"
      );
    }

    // Avoid sending massive HTML-derived text to AI.
    return combined.slice(
      0,
      50000
    );
  }

  throw new Error(
    "TOO_MANY_REDIRECTS"
  );
}

// ======================================================
// RUN PORTFOLIO ANALYSIS
// ======================================================

export async function runPortfolioAnalysis(
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

  const portfolioUrl =
    (
      formData.get(
        "portfolioUrl"
      ) as string
    )?.trim() || "";

  const pastedText =
    (
      formData.get(
        "portfolioText"
      ) as string
    )?.trim() || "";

  // ==========================================
  // GET PORTFOLIO CONTENT
  // ==========================================

  let portfolioText =
    pastedText;

  if (portfolioUrl) {
    try {
      const websiteText =
        await fetchPortfolioText(
          portfolioUrl
        );

      // If the user also pasted content,
      // use both sources.
      portfolioText =
        pastedText
          ? `
WEBSITE CONTENT:

${websiteText}

ADDITIONAL CONTENT PROVIDED BY USER:

${pastedText}
`
          : websiteText;
    } catch (error) {
      console.error(
        "Portfolio URL fetch error:",
        error
      );

      // If manual content exists, use it as fallback.
      if (!pastedText) {
        const message =
          error instanceof Error
            ? error.message
            : "";

        if (
          message ===
          "PRIVATE_URL"
        ) {
          redirect(
            "/dashboard/portfolio?error=invalid_url"
          );
        }

        if (
          message ===
          "NOT_ENOUGH_CONTENT"
        ) {
          redirect(
            "/dashboard/portfolio?error=website_content_unavailable"
          );
        }

        redirect(
          "/dashboard/portfolio?error=website_fetch_failed"
        );
      }
    }
  }

  // ==========================================
  // VALIDATE CONTENT
  // ==========================================

  if (
    !portfolioText ||
    portfolioText.length <
      100
  ) {
    redirect(
      "/dashboard/portfolio?error=portfolio_too_short"
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
      "/dashboard/portfolio?error=credits_check_failed"
    );
  }

  if (
    profile.credits < 5
  ) {
    redirect(
      "/dashboard/portfolio?error=insufficient_credits"
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
        "portfolio_analyzer",

      p_limit: 3,

      p_window_seconds:
        60,
    }
  );

  if (rateLimitError) {
    console.error(
      "Portfolio Analyzer rate limit error:",
      rateLimitError
    );

    redirect(
      "/dashboard/portfolio?error=rate_limit_check_failed"
    );
  }

  if (!rateLimitAllowed) {
    redirect(
      "/dashboard/portfolio?error=rate_limit_exceeded"
    );
  }

  // ==========================================
  // GEMINI PROMPT
  // ==========================================

  const prompt = `
You are an expert technical recruiter, portfolio reviewer, hiring manager, and career branding specialist.

Analyze the professional portfolio content below.

IMPORTANT RULES:

- Judge only the content actually available.
- Do not invent projects, employers, technologies, achievements, metrics, education, certifications, or experience.
- If important information is missing, identify it as an improvement instead of assuming it exists.
- Give realistic scores.
- Do not automatically give high scores.
- Evaluate the portfolio from the perspective of a recruiter or hiring manager.
- Focus on clarity, evidence of skills, project quality, credibility, and hiring readiness.
- Recommendations must be specific and actionable.
- The category scores MUST add up exactly to the overall score.
- The overall score must be between 0 and 100.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not include commentary outside the JSON.

SCORING:

Presentation & Structure: maximum 20
Projects & Case Studies: maximum 25
Clarity & Positioning: maximum 20
Credibility & Evidence: maximum 15
Recruiter Readiness: maximum 20

Return exactly:

{
  "overall_score": 0,
  "presentation_score": 0,
  "projects_score": 0,
  "clarity_score": 0,
  "credibility_score": 0,
  "recruiter_score": 0,
  "strengths": [
    "specific strength",
    "specific strength"
  ],
  "improvements": [
    "specific improvement",
    "specific improvement"
  ],
  "recommendations": [
    "specific recommendation",
    "specific recommendation"
  ]
}

PORTFOLIO URL:

${portfolioUrl}

PORTFOLIO CONTENT:

${portfolioText}
`;

  // ==========================================
  // GEMINI
  // ==========================================

  let parsedResult: {
    overall_score: number;
    presentation_score: number;
    projects_score: number;
    clarity_score: number;
    credibility_score: number;
    recruiter_score: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
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
      response.text?.trim() ??
      "";

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
      "Portfolio Analyzer Gemini error:",
      error
    );

    redirect(
      "/dashboard/portfolio?error=analysis_failed"
    );
  }

  // ==========================================
  // VALIDATE SCORES
  // ==========================================

  const total =
    Number(
      parsedResult.presentation_score
    ) +
    Number(
      parsedResult.projects_score
    ) +
    Number(
      parsedResult.clarity_score
    ) +
    Number(
      parsedResult.credibility_score
    ) +
    Number(
      parsedResult.recruiter_score
    );

  const valid =
    Number.isFinite(
      parsedResult.overall_score
    ) &&

    parsedResult.overall_score >=
      0 &&

    parsedResult.overall_score <=
      100 &&

    parsedResult.presentation_score >=
      0 &&

    parsedResult.presentation_score <=
      20 &&

    parsedResult.projects_score >=
      0 &&

    parsedResult.projects_score <=
      25 &&

    parsedResult.clarity_score >=
      0 &&

    parsedResult.clarity_score <=
      20 &&

    parsedResult.credibility_score >=
      0 &&

    parsedResult.credibility_score <=
      15 &&

    parsedResult.recruiter_score >=
      0 &&

    parsedResult.recruiter_score <=
      20 &&

    total ===
      parsedResult.overall_score;

  if (!valid) {
    console.error(
      "Invalid portfolio analysis:",
      parsedResult
    );

    redirect(
      "/dashboard/portfolio?error=invalid_analysis"
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
      "portfolio_analyses"
    )
    .insert({
      user_id:
        user.id,

      portfolio_url:
        portfolioUrl ||
        null,

      portfolio_text:
        portfolioText,

      overall_score:
        parsedResult.overall_score,

      presentation_score:
        parsedResult.presentation_score,

      projects_score:
        parsedResult.projects_score,

      clarity_score:
        parsedResult.clarity_score,

      credibility_score:
        parsedResult.credibility_score,

      recruiter_score:
        parsedResult.recruiter_score,

      strengths:
        parsedResult.strengths,

      improvements:
        parsedResult.improvements,

      recommendations:
        parsedResult.recommendations,

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
      "Error saving portfolio analysis:",
      insertError
    );

    redirect(
      "/dashboard/portfolio?error=save_failed"
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
        "Portfolio Analysis",
    }
  );

  if (creditError) {
    console.error(
      "Error charging Portfolio Analyzer credits:",
      creditError
    );

    redirect(
      `/dashboard/portfolio/${analysis.id}?error=credit_charge_failed`
    );
  }

  if (!creditCharged) {
    redirect(
      `/dashboard/portfolio/${analysis.id}?error=insufficient_credits`
    );
  }

  // ==========================================
  // REFRESH
  // ==========================================

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/dashboard/portfolio"
  );

  redirect(
    `/dashboard/portfolio/${analysis.id}?success=completed`
  );
}