import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function JobMatchResultPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

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
    data: match,
    error,
  } = await supabase
    .from("job_matches")
    .select(`
      id,
      job_title,
      company_name,
      job_description,
      match_score,
      matching_skills,
      missing_skills,
      missing_keywords,
      experience_match,
      recommendations,
      status,
      created_at
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (
    error ||
    !match
  ) {
    redirect(
      "/dashboard/job-match"
    );
  }

  const matchingSkills =
    Array.isArray(
      match.matching_skills
    )
      ? match.matching_skills
      : [];

  const missingSkills =
    Array.isArray(
      match.missing_skills
    )
      ? match.missing_skills
      : [];

  const missingKeywords =
    Array.isArray(
      match.missing_keywords
    )
      ? match.missing_keywords
      : [];

  const recommendations =
    Array.isArray(
      match.recommendations
    )
      ? match.recommendations
      : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        <Link
          href="/dashboard/job-match"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job Match
        </Link>

        {/* HEADER */}

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Job Match
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {match.job_title}
          </h1>

          {match.company_name && (
            <p className="mt-2 text-lg text-slate-500">
              {match.company_name}
            </p>
          )}
        </div>

        {/* MATCH SCORE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Match Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Resume compatibility
              </h2>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-8 py-5 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Overall Match
              </p>

              <p className="mt-1 text-4xl font-bold text-emerald-800">
                {match.match_score ?? "--"}%
              </p>
            </div>

          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{
                width: `${
                  match.match_score ?? 0
                }%`,
              }}
            />
          </div>

        </section>

        {/* SKILLS */}

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

          <section className="rounded-3xl border border-slate-200 bg-white p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Matching Skills
            </h2>

            <div className="mt-5 space-y-3">

              {matchingSkills.length > 0 ? (
                matchingSkills.map(
                  (
                    skill: string
                  ) => (
                    <div
                      key={skill}
                      className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3"
                    >
                      <Check className="h-4 w-4 text-emerald-700" />

                      <span className="text-sm font-medium text-emerald-800">
                        {skill}
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500">
                  No matching skills identified.
                </p>
              )}

            </div>

          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Missing Skills
            </h2>

            <div className="mt-5 space-y-3">

              {missingSkills.length > 0 ? (
                missingSkills.map(
                  (
                    skill: string
                  ) => (
                    <div
                      key={skill}
                      className="rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {skill}
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500">
                  No major missing skills identified.
                </p>
              )}

            </div>

          </section>

        </div>

        {/* EXPERIENCE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Experience
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Experience Match
          </h2>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {match.experience_match ||
              "Not available"}
          </p>

        </section>

        {/* KEYWORDS */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-bold text-slate-900">
            Missing Keywords
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">

            {missingKeywords.length >
            0 ? (
              missingKeywords.map(
                (
                  keyword: string
                ) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                  >
                    {keyword}
                  </span>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No important missing keywords identified.
              </p>
            )}

          </div>

        </section>

        {/* RECOMMENDATIONS */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-bold text-slate-900">
            Recommendations
          </h2>

          <div className="mt-5 space-y-3">

            {recommendations.length >
            0 ? (
              recommendations.map(
                (
                  recommendation: string,
                  index: number
                ) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <p className="text-sm leading-6 text-slate-700">
                      {recommendation}
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

        {/* JOB DESCRIPTION */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-bold text-slate-900">
            Job Description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {match.job_description}
          </p>

        </section>

      </div>
    </div>
  );
}