import { redirect } from "next/navigation";

import {
  Sparkles,
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

export default async function ApplyResultPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // JOB ANALYSIS
  // ==========================================

  const { data: analysis, error } = await supabase
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

  const { data: result } = await supabase
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

  const { data: generatedResume } = await supabase
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

  const { data: generatedCoverLetter } = await supabase
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
    <div className="p-8">
      <div className="max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Apply Copilot
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          {analysis.job_title || "Job Analysis"}
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          {analysis.company_name || "Company"}
        </p>

        {/* ======================================
            ANALYSIS STATUS
        ====================================== */}

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-emerald-900">
              Analysis Ready
            </p>

            <p className="text-sm text-emerald-700">
              Your job match analysis has been created.
            </p>
          </div>
        </div>

        {/* ======================================
            STATS
        ====================================== */}

        <div className="mt-8 grid grid-cols-3 gap-5">

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

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Job Description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {analysis.job_description}
          </p>
        </section>

        {/* ======================================
            SKILLS ANALYSIS
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />

            Skills Analysis
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4">

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

          {/* Recommendations */}

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
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  Tailored Resume
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Generated resume
                </h2>
              </div>

              <div className="flex items-center gap-2">

                {/* Copy + Download */}

                <GeneratedDocumentActions
                  content={generatedResume.content}
                  fileName={`${
                    analysis.job_title || "tailored"
                  }-resume`}
                />

                {/* Delete */}

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

            <div className="mt-6 rounded-2xl bg-slate-50 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {generatedResume.content}
              </pre>
            </div>
          </section>
        )}

        {/* ======================================
            GENERATED COVER LETTER
        ====================================== */}

        {generatedCoverLetter && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  Cover Letter
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Generated cover letter
                </h2>
              </div>

              <div className="flex items-center gap-2">

                {/* Copy + Download */}

                <GeneratedDocumentActions
                  content={generatedCoverLetter.content}
                  fileName={`${
                    analysis.job_title || "job"
                  }-cover-letter`}
                />

                {/* Delete */}

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

            <div className="mt-6 rounded-2xl bg-slate-50 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {generatedCoverLetter.content}
              </pre>
            </div>
          </section>
        )}

        {/* ======================================
            ACTIONS
        ====================================== */}

        <div className="mt-8 flex gap-4">

          {/* Resume */}

          <form action={generateTailoredResume}>
            <input
              type="hidden"
              name="analysisId"
              value={analysis.id}
            />

            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              {generatedResume
                ? "Regenerate Resume →"
                : "Generate Tailored Resume →"}
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
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {generatedCoverLetter
                ? "Regenerate Cover Letter →"
                : "Generate Cover Letter →"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}