import { redirect } from "next/navigation";

import {
  FileText,
  Mail,
  CheckCircle2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  generateTailoredResume,
  generateCoverLetter,
  deleteGeneratedDocument,
} from "../actions";

import GeneratedDocumentActions from "@/components/apply/GeneratedDocumentActions";
import RateLimitNotice from "@/components/apply/RateLimitNotice";
import ResumePreview from "@/components/apply/ResumePreview";
import CoverLetterPreview from "@/components/apply/CoverLetterPreview";

export default async function ApplyResultPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;

  const { error: pageError } =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // USER CREDITS
  // ==========================================

  const { data: creditProfile } =
    await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

  const credits =
    creditProfile?.credits ?? 0;

  const canGenerateResume =
    credits >= 10;

  const canGenerateCoverLetter =
    credits >= 5;

  const isRateLimited =
    pageError === "rate_limit_exceeded";

  // ==========================================
  // JOB ANALYSIS
  // ==========================================

  const {
    data: analysis,
    error,
  } = await supabase
    .from("job_analyses")
    .select(`
      id,
      company_name,
      job_title,
      job_description,
      status,
      match_score,
      ai_summary
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) {
    redirect("/dashboard/apply");
  }

  // ==========================================
  // ANALYSIS RESULT
  // ==========================================

  const { data: result } =
    await supabase
      .from("job_analysis_results")
      .select(`
        match_score,
        matched_skills,
        missing_skills,
        recommendations
      `)
      .eq("analysis_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

  // ==========================================
  // GENERATED RESUME
  // ==========================================

  const {
    data: generatedResume,
  } = await supabase
    .from("generated_documents")
    .select(`
      id,
      content,
      created_at
    `)
    .eq("analysis_id", id)
    .eq("user_id", user.id)
    .eq("document_type", "resume")
    .maybeSingle();

  // ==========================================
  // GENERATED COVER LETTER
  // ==========================================

  const {
    data: generatedCoverLetter,
  } = await supabase
    .from("generated_documents")
    .select(`
      id,
      content,
      created_at
    `)
    .eq("analysis_id", id)
    .eq("user_id", user.id)
    .eq("document_type", "cover_letter")
    .maybeSingle();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Apply Copilot
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          {analysis.job_title || "Job Analysis"}
        </h1>

        <p className="mt-2 text-base text-slate-500 sm:text-lg">
          {analysis.company_name || "Company"}
        </p>

        {/* ======================================
            CREDIT ERRORS
        ====================================== */}

        {pageError === "insufficient_credits" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="font-semibold text-amber-900">
              Not enough credits
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Your current balance is {credits} credits. A tailored resume
              costs 10 credits and a cover letter costs 5 credits.
            </p>
          </div>
        )}

        {pageError === "credits_check_failed" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              We couldn&apos;t verify your credits
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please try again.
            </p>
          </div>
        )}

        {/* ======================================
            RATE LIMIT
        ====================================== */}

        {pageError === "rate_limit_exceeded" && (
          <RateLimitNotice seconds={60} />
        )}

        {pageError === "rate_limit_check_failed" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              We couldn&apos;t verify the generation limit
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please try again.
            </p>
          </div>
        )}

        {/* ======================================
            ANALYSIS STATUS
        ====================================== */}

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">
            Analysis Ready
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Your job match analysis has been created.
          </p>
        </div>

        {/* ======================================
            STATS
        ====================================== */}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">

          {/* Match Score */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-400">
              Match Score
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {result?.match_score ??
                analysis.match_score ??
                "--"}
              %
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Based on your profile
            </p>
          </div>

          {/* Resume Status */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-400">
              Resume
            </p>

            <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900">
              <FileText className="h-5 w-5 text-emerald-700" />

              {generatedResume
                ? "Generated"
                : "Not generated"}
            </div>

            {generatedResume && (
              <p className="mt-2 text-sm text-emerald-700">
                Ready to review
              </p>
            )}
          </div>

          {/* Cover Letter Status */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-400">
              Cover Letter
            </p>

            <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900">
              <Mail className="h-5 w-5 text-emerald-700" />

              {generatedCoverLetter
                ? "Generated"
                : "Not generated"}
            </div>

            {generatedCoverLetter && (
              <p className="mt-2 text-sm text-emerald-700">
                Ready to review
              </p>
            )}
          </div>
        </div>

        {/* ======================================
            JOB DESCRIPTION
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Job Description
          </h2>

          <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
            {analysis.job_description}
          </p>
        </section>

        {/* ======================================
            SKILLS ANALYSIS
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            Skills Analysis
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Matching Skills */}

            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-900">
                Matching Skills
              </p>

              <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                {result?.matched_skills &&
                result.matched_skills.length > 0 ? (
                  result.matched_skills.map(
                    (skill: string) => (
                      <li key={skill}>
                        ✓ {skill}
                      </li>
                    )
                  )
                ) : (
                  <li>
                    No matching skills found yet.
                  </li>
                )}
              </ul>
            </div>

            {/* Missing Skills */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                Skills To Improve
              </p>

              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {result?.missing_skills &&
                result.missing_skills.length > 0 ? (
                  result.missing_skills.map(
                    (skill: string) => (
                      <li key={skill}>
                        • {skill}
                      </li>
                    )
                  )
                ) : (
                  <li>
                    No missing skills identified.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {result?.recommendations && (
            <div className="mt-5 rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">
                Recommendations
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {result.recommendations}
              </p>
            </div>
          )}
        </section>

        {/* ======================================
            GENERATED RESUME
        ====================================== */}

        {generatedResume && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  Tailored Resume
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Generated resume
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <GeneratedDocumentActions
                  content={generatedResume.content}
                  fileName={`${
                    analysis.job_title || "tailored"
                  }-resume`}
                  documentType="resume"
                />

                <form action={deleteGeneratedDocument}>
                  <input
                    type="hidden"
                    name="documentId"
                    value={generatedResume.id}
                  />

                  <input
                    type="hidden"
                    name="analysisId"
                    value={analysis.id}
                  />

                  <button
                    type="submit"
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Generated
                </span>

              </div>
            </div>

            {/* RESUME PREVIEW */}

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4 lg:p-6">
              <ResumePreview
                content={generatedResume.content}
              />
            </div>

          </section>
        )}

        {/* ======================================
            GENERATED COVER LETTER
        ====================================== */}

        {generatedCoverLetter && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  Cover Letter
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Generated cover letter
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <GeneratedDocumentActions
                  content={generatedCoverLetter.content}
                  fileName={`${
                    analysis.job_title || "job"
                  }-cover-letter`}
                  documentType="cover_letter"
                />

                <form action={deleteGeneratedDocument}>
                  <input
                    type="hidden"
                    name="documentId"
                    value={generatedCoverLetter.id}
                  />

                  <input
                    type="hidden"
                    name="analysisId"
                    value={analysis.id}
                  />

                  <button
                    type="submit"
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Generated
                </span>

              </div>
            </div>

            {/* COVER LETTER PREVIEW */}

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4 lg:p-6">
              <CoverLetterPreview
                content={generatedCoverLetter.content}
              />
            </div>

          </section>
        )}

        {/* ======================================
            GENERATION ACTIONS
        ====================================== */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">

          {/* Resume */}

          <form action={generateTailoredResume}>
            <input
              type="hidden"
              name="analysisId"
              value={analysis.id}
            />

            <button
              type="submit"
              disabled={
                !canGenerateResume ||
                isRateLimited
              }
              className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                canGenerateResume &&
                !isRateLimited
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {isRateLimited
                ? "Try again shortly"
                : generatedResume
                  ? "Regenerate Resume · 10 credits"
                  : "Generate Resume · 10 credits"}
            </button>
          </form>

          {/* Cover Letter */}

          <form action={generateCoverLetter}>
            <input
              type="hidden"
              name="analysisId"
              value={analysis.id}
            />

            <button
              type="submit"
              disabled={
                !canGenerateCoverLetter ||
                isRateLimited
              }
              className={`w-full rounded-xl border px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                canGenerateCoverLetter &&
                !isRateLimited
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              {isRateLimited
                ? "Try again shortly"
                : generatedCoverLetter
                  ? "Regenerate Cover Letter · 5 credits"
                  : "Generate Cover Letter · 5 credits"}
            </button>
          </form>

        </div>

        {/* ======================================
            CURRENT BALANCE
        ====================================== */}

        <p className="mt-3 text-xs text-slate-400">
          Current balance: {credits} credits
        </p>

      </div>
    </div>
  );
}