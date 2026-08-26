import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function LinkedinAnalysisResultPage({
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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: analysis,
    error,
  } = await supabase
    .from("linkedin_analyses")
    .select(`
      id,
      profile_url,
      file_name,
      overall_score,
      headline_score,
      about_score,
      experience_score,
      skills_score,
      keyword_score,
      strengths,
      improvements,
      suggested_headline,
      suggested_about,
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
    redirect(
      "/dashboard/linkedin"
    );
  }

  const strengths =
    Array.isArray(
      analysis.strengths
    )
      ? analysis.strengths
      : [];

  const improvements =
    Array.isArray(
      analysis.improvements
    )
      ? analysis.improvements
      : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* BACK */}

        <Link
          href="/dashboard/linkedin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to LinkedIn Analyzer
        </Link>

        {/* HEADER */}

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            LinkedIn Analyzer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            LinkedIn profile analysis
          </h1>

          <p className="mt-2 text-slate-500">
            Review your score and recommendations.
          </p>
        </div>

        {/* SCORE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Profile Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Overall LinkedIn quality
              </h2>
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

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="Headline"
              score={analysis.headline_score}
              max={20}
            />

            <ScoreRow
              label="About"
              score={analysis.about_score}
              max={20}
            />

            <ScoreRow
              label="Experience"
              score={analysis.experience_score}
              max={25}
            />

            <ScoreRow
              label="Skills"
              score={analysis.skills_score}
              max={20}
            />

            <ScoreRow
              label="Keywords & Searchability"
              score={analysis.keyword_score}
              max={15}
            />

          </div>

        </section>

        {/* STRENGTHS + IMPROVEMENTS */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <section className="rounded-3xl border border-slate-200 bg-white p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Strengths
            </h2>

            <div className="mt-5 space-y-3">

              {strengths.length > 0 ? (
                strengths.map(
                  (
                    item: string,
                    index: number
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="rounded-xl bg-emerald-50 px-4 py-3"
                    >
                      <p className="text-sm leading-6 text-emerald-800">
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Improvements
            </h2>

            <div className="mt-5 space-y-3">

              {improvements.length > 0 ? (
                improvements.map(
                  (
                    item: string,
                    index: number
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm leading-6 text-slate-700">
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

        {/* SUGGESTED HEADLINE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Suggested Headline
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Improved headline
          </h2>

          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            {analysis.suggested_headline ||
              "No suggested headline available."}
          </p>

        </section>

        {/* SUGGESTED ABOUT */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Suggested About
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Improved About section
          </h2>

          <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
            {analysis.suggested_about ||
              "No suggested About section available."}
          </p>

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