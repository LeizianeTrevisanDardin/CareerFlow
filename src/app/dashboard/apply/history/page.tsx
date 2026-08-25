import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function ApplyHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // LOAD ANALYSIS HISTORY
  // ==========================================

  const { data: analyses, error } = await supabase
    .from("job_analyses")
    .select(`
      id,
      company_name,
      job_title,
      match_score,
      status,
      created_at,
      generated_documents (
        id,
        document_type
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading Apply Copilot history:",
      error
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Apply Copilot
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Analysis history
            </h1>

            <p className="mt-2 text-slate-500">
              Review your previous job analyses and generated documents.
            </p>
          </div>

          <Link
            href="/dashboard/apply"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            New Analysis
          </Link>
        </div>

        {/* ======================================
            HISTORY
        ====================================== */}

        <div className="mt-8 space-y-4">
          {analyses && analyses.length > 0 ? (
            analyses.map((analysis) => {
              const hasResume =
                analysis.generated_documents?.some(
                  (document) =>
                    document.document_type === "resume"
                ) ?? false;

              const hasCoverLetter =
                analysis.generated_documents?.some(
                  (document) =>
                    document.document_type === "cover_letter"
                ) ?? false;

              return (
                <div
                  key={analysis.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-6">

                    {/* LEFT SIDE */}

                    <div className="flex-1">

                      {/* Job */}
                            <div>
                            <p className="text-xl font-semibold text-slate-900">
                                {analysis.job_title || "Job Analysis"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {analysis.company_name || "Company not provided"}
                            </p>
                            </div>

                      {/* Analysis info */}
                      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-500">

                        <span>
                          Match Score:{" "}
                          <strong className="text-slate-900">
                            {analysis.match_score ?? "--"}%
                          </strong>
                        </span>

                        <span className="capitalize">
                          Status: {analysis.status}
                        </span>

                        <span>
                          {new Date(
                            analysis.created_at
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* ======================================
                          GENERATED DOCUMENTS STATUS
                      ====================================== */}

                      <div className="mt-4 flex flex-wrap items-center gap-3">

                        {/* Resume */}
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            hasResume
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {hasResume
                            ? "Resume Generated"
                            : "Resume Not generated"}
                        </div>

                        {/* Cover Letter */}
                        <div
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            hasCoverLetter
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                
                          {hasCoverLetter
                            ? "Cover Letter Generated"
                            : "Cover Letter Not generated"}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}

                    <Link
                      href={`/dashboard/apply/${analysis.id}`}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Analysis

                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            /* ======================================
                EMPTY STATE
            ====================================== */

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
       

              <p className="mt-4 font-semibold text-slate-900">
                No analyses yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Start your first Apply Copilot analysis.
              </p>

              <Link
                href="/dashboard/apply"
                className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Start Apply Copilot
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}