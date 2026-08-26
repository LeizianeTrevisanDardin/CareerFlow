import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Target,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type PortfolioResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PortfolioResultPage({
  params,
}: PortfolioResultPageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // LOAD ANALYSIS
  // ==========================================

  const {
    data: analysis,
    error,
  } = await supabase
    .from("portfolio_analyses")
    .select(`
      id,
      portfolio_url,
      overall_score,
      presentation_score,
      projects_score,
      clarity_score,
      credibility_score,
      recruiter_score,
      strengths,
      improvements,
      recommendations,
      status,
      created_at
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (
    error ||
    !analysis
  ) {
    console.error(
      "Error loading portfolio analysis:",
      error
    );

    redirect(
      "/dashboard/portfolio?error=analysis_not_found"
    );
  }

  const strengths: string[] =
    Array.isArray(
      analysis.strengths
    )
      ? analysis.strengths
      : [];

  const improvements: string[] =
    Array.isArray(
      analysis.improvements
    )
      ? analysis.improvements
      : [];

  const recommendations: string[] =
    Array.isArray(
      analysis.recommendations
    )
      ? analysis.recommendations
      : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* ======================================
            BACK
        ====================================== */}

        <Link
          href="/dashboard/portfolio"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Portfolio Analyzer
        </Link>

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mt-6">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Portfolio Analyzer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Portfolio analysis
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Review your portfolio score, strengths, improvements,
            and recommendations.
          </p>

          {analysis.portfolio_url && (
            <a
              href={analysis.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <ExternalLink className="h-4 w-4" />

              View portfolio
            </a>
          )}

        </div>

        {/* ======================================
            OVERALL SCORE
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Portfolio Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Overall portfolio quality
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Your score is based on presentation, projects,
                positioning, credibility, and recruiter readiness.
              </p>

            </div>

            <div className="rounded-2xl bg-emerald-50 px-8 py-5 text-center">

              <p className="text-sm font-medium text-emerald-700">
                Overall Score
              </p>

              <p className="mt-1 text-4xl font-bold text-emerald-800">
                {analysis.overall_score ?? "--"}/100
              </p>

            </div>

          </div>

          {/* SCORE BREAKDOWN */}

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="Presentation & Structure"
              score={analysis.presentation_score}
              max={20}
            />

            <ScoreRow
              label="Projects & Case Studies"
              score={analysis.projects_score}
              max={25}
            />

            <ScoreRow
              label="Clarity & Positioning"
              score={analysis.clarity_score}
              max={20}
            />

            <ScoreRow
              label="Credibility & Evidence"
              score={analysis.credibility_score}
              max={15}
            />

            <ScoreRow
              label="Recruiter Readiness"
              score={analysis.recruiter_score}
              max={20}
            />

          </div>

        </section>

        {/* ======================================
            STRENGTHS + IMPROVEMENTS
        ====================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* STRENGTHS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  What&apos;s working
                </p>

                <h2 className="text-xl font-bold text-slate-900">
                  Strengths
                </h2>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              {strengths.length > 0 ? (
                strengths.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-xl bg-emerald-50 px-4 py-3"
                    >
                      <p className="text-sm leading-6 text-emerald-900">
                        {item}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500">
                  No strengths available.
                </p>
              )}

            </div>

          </section>

          {/* IMPROVEMENTS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Target className="h-5 w-5 text-amber-700" />
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  What to improve
                </p>

                <h2 className="text-xl font-bold text-slate-900">
                  Improvements
                </h2>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              {improvements.length > 0 ? (
                improvements.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-xl bg-amber-50 px-4 py-3"
                    >
                      <p className="text-sm leading-6 text-amber-900">
                        {item}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500">
                  No improvements available.
                </p>
              )}

            </div>

          </section>

        </div>

        {/* ======================================
            RECOMMENDATIONS
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Lightbulb className="h-5 w-5 text-slate-700" />
            </div>

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Action Plan
              </p>

              <h2 className="text-xl font-bold text-slate-900">
                Recommendations
              </h2>

            </div>

          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Focus on these changes to make your portfolio stronger
            for recruiters and hiring managers.
          </p>

          <div className="mt-6 space-y-3">

            {recommendations.length > 0 ? (
              recommendations.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex gap-4 rounded-2xl bg-slate-50 p-4"
                  >

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-slate-700">
                      {item}
                    </p>

                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No recommendations available.
              </p>
            )}

          </div>

        </section>

        {/* ======================================
            NEW ANALYSIS
        ====================================== */}

        <div className="mt-8 flex justify-end">

          <Link
            href="/dashboard/portfolio"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Analyze Another Portfolio
          </Link>

        </div>

      </div>
    </div>
  );
}

// ======================================================
// SCORE ROW
// ======================================================

function ScoreRow({
  label,
  score,
  max,
}: {
  label: string;
  score: number | null;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-500">
        {score !== null
          ? `${score} / ${max}`
          : `-- / ${max}`}
      </span>

    </div>
  );
}