import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  FileText,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import AIActionButton from "@/components/AiAnalyzeButton";

import { runResumeAnalysis } from "../actions";


export default async function ResumeAnalysisPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: analysis,
    error,
  } = await supabase
    .from("resume_analyses")
    .select(`
      id,
      file_name,
      file_type,
      resume_text,
      overall_score,
      ats_score,
      summary_score,
      experience_score,
      skills_score,
      formatting_score,
      impact_score,
      strengths,
      improvements,
      status,
      created_at
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) {
    redirect(
      "/dashboard/resume-analyzer"
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* ======================================
            BACK
        ====================================== */}

        <Link
          href="/dashboard/resume-analyzer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resume Analyzer
        </Link>

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Resume Analyzer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Resume analysis
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Review your uploaded resume and see how it performs across
            ATS compatibility, content, experience, skills, and impact.
          </p>
        </div>

        {/* ======================================
            FILE INFO
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {analysis.file_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Resume uploaded successfully
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                analysis.status === "completed"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {analysis.status === "uploaded"
                ? "Ready to analyze"
                : analysis.status === "completed"
                  ? "Analysis complete"
                  : analysis.status}
            </span>

          </div>
        </section>

        {/* ======================================
            SCORE
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Resume Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Detailed resume analysis
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Your resume is reviewed across six categories so you can
                understand exactly where it performs well and where it can
                improve.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-8 py-5 text-center">
              <p className="text-sm text-slate-400">
                Overall Score
              </p>

              <p
                className={`mt-1 text-4xl font-bold ${
                  analysis.overall_score !== null
                    ? "text-slate-900"
                    : "text-slate-300"
                }`}
              >
                {analysis.overall_score !== null
                  ? `${analysis.overall_score}/100`
                  : "--/100"}
              </p>
            </div>

          </div>

          {/* SCORE BREAKDOWN */}

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="ATS Compatibility"
              score={analysis.ats_score}
              max={20}
            />

            <ScoreRow
              label="Professional Summary"
              score={analysis.summary_score}
              max={15}
            />

            <ScoreRow
              label="Work Experience"
              score={analysis.experience_score}
              max={25}
            />

            <ScoreRow
              label="Skills"
              score={analysis.skills_score}
              max={15}
            />

            <ScoreRow
              label="Formatting & Structure"
              score={analysis.formatting_score}
              max={15}
            />

            <ScoreRow
              label="Impact & Achievements"
              score={analysis.impact_score}
              max={10}
            />

          </div>

          {/* ======================================
              RUN ANALYSIS
          ====================================== */}

          {analysis.status === "uploaded" && (
            <div className="mt-8">
              <form action={runResumeAnalysis}>
                <input
                  type="hidden"
                  name="analysisId"
                  value={analysis.id}
                />

                <div className="mt-8">
                  <AIActionButton
                    idleText="Run Resume Analysis"
                    loadingText="Analyzing Resume..."
                    description="Careerflow is reviewing your resume for ATS compatibility, experience, skills, formatting, and impact."
                  />
                </div>
              </form>

              <p className="mt-2 text-xs text-slate-400">
                Your resume will be reviewed using AI.
              </p>
            </div>
          )}

          {/* ======================================
              STRENGTHS + IMPROVEMENTS
          ====================================== */}

          {analysis.status === "completed" && (
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

              {/* Strengths */}

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-900">
                  What&apos;s working well
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-800">
                  {Array.isArray(
                    analysis.strengths
                  ) &&
                  analysis.strengths.length >
                    0 ? (
                    analysis.strengths.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex gap-2"
                        >
                          <span className="shrink-0">
                            ✓
                          </span>

                          <span>
                            {item}
                          </span>
                        </li>
                      )
                    )
                  ) : (
                    <li>
                      No strengths provided.
                    </li>
                  )}
                </ul>
              </div>

              {/* Improvements */}

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">
                  Recommended improvements
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {Array.isArray(
                    analysis.improvements
                  ) &&
                  analysis.improvements.length >
                    0 ? (
                    analysis.improvements.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex gap-2"
                        >
                          <span className="shrink-0">
                            •
                          </span>

                          <span>
                            {item}
                          </span>
                        </li>
                      )
                    )
                  ) : (
                    <li>
                      No improvements provided.
                    </li>
                  )}
                </ul>
              </div>

            </div>
          )}

        </section>

        {/* ======================================
            EXTRACTED TEXT
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Extracted Resume
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Resume content
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This is the text Careerflow extracted from your uploaded file.
          </p>

          <div className="mt-6 max-h-[500px] overflow-y-auto rounded-2xl bg-slate-50 p-5 sm:p-6">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
              {analysis.resume_text}
            </pre>
          </div>

        </section>

      </div>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  max,
}: {
  label: string;
  score: number | null;
  max: number;
}) {
  const percentage =
    score !== null
      ? Math.round(
          (score / max) * 100
        )
      : 0;

  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">

      <div className="flex items-center justify-between gap-4">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="shrink-0 text-sm font-semibold text-slate-600">
          {score !== null
            ? `${score} / ${max}`
            : `-- / ${max}`}
        </span>

      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}