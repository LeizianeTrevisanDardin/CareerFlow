import { redirect } from "next/navigation";
import { BriefcaseBusiness, FileText} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { runJobMatch } from "./actions";

import AIActionButton from "@/components/AiAnalyzeButton";

export default async function JobMatchPage({
    searchParams,
    }: {
    searchParams: Promise<{
        error?: string;
    }>;
    }) {
    const { error: pageError } =
        await searchParams;

    const supabase =
        await createClient();
    const {
    data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
        redirect("/login");
        }
    
    

  // ==========================================
  // LOAD SAVED RESUMES
  // ==========================================

  const {
    data: resumes,
    error,
  } = await supabase
    .from("resumes")
    .select(`
      id,
      title,
      job_title,
      updated_at
    `)
    .eq("user_id", user.id)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading resumes:",
      error
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">

        {pageError === "insufficient_credits" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="font-semibold text-amber-900">
                Not enough credits
                </p>

                <p className="mt-1 text-sm text-amber-700">
                You need 3 credits to run a Job Match analysis.
                </p>
            </div>
            )}

            {pageError === "rate_limit_exceeded" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="font-semibold text-amber-900">
                Please wait a moment
                </p>

                <p className="mt-1 text-sm text-amber-700">
                You&apos;ve run several AI analyses in a short period.
                Please try again in about a minute.
                </p>
            </div>
            )}

            {pageError === "analysis_failed" && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="font-semibold text-red-900">
                We couldn&apos;t complete the analysis
                </p>

                <p className="mt-1 text-sm text-red-700">
                Please try again.
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
            HEADER
        ====================================== */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            AI Tools
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Job Match
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Compare your resume with a job description and discover how well
            your experience and skills match the role.
          </p>
        </div>

        {/* ======================================
            MAIN CARD
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyze your match
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Select one of your saved resumes and paste the job description
                you want to compare it with.
              </p>
            </div>

          </div>

          {/* ======================================
              FORM
          ====================================== */}

          <form
            action={runJobMatch}
            className="mt-8 space-y-6"
          >

            {/* RESUME */}

            <div>
              <label
                htmlFor="resumeId"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Resume
              </label>

              {resumes && resumes.length > 0 ? (
                <div className="relative">

                  <FileText className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    id="resumeId"
                    name="resumeId"
                    required
                    defaultValue=""
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select a resume
                    </option>

                    {resumes.map((resume) => (
                      <option
                        key={resume.id}
                        value={resume.id}
                      >
                        {resume.title || "My Resume"}
                        {resume.job_title
                          ? ` — ${resume.job_title}`
                          : ""}
                      </option>
                    ))}
                  </select>

                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">
                    You don&apos;t have a saved resume yet.
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Create and save a resume in Resume Builder before running a
                    Job Match.
                  </p>
                </div>
              )}
            </div>

            {/* JOB INFORMATION */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Job title
                </label>

                <div className="relative">

                  <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    required
                    placeholder="e.g. Front-End Developer"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                  />

                </div>
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company
                </label>

                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="e.g. Shopify"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />
              </div>

            </div>

            {/* JOB DESCRIPTION */}

            <div>
              <label
                htmlFor="jobDescription"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Job description
              </label>

              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={12}
                placeholder="Paste the complete job description here..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                For better results, paste the complete job description,
                including requirements and qualifications.
              </p>
            </div>

            {/* SUBMIT */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Job Match Analysis
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uses 3 credits
                </p>
              </div>

              <div className="mt-8">
              <AIActionButton
                idleText="Analyze Match"
                loadingText="Analyzing Match..."
                description="Careerflow is comparing your resume with the job description to evaluate skills, experience, ATS keywords, missing requirements, and overall job compatibility."
                disabled={!resumes || resumes.length === 0}
              />
              </div>

            </div>

          </form>

        </section>

        {/* ======================================
            WHAT YOU GET
        ====================================== */}

        <section className="mt-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Analysis
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            What you&apos;ll get
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ResultCard
              title="Match Score"
              description="See your overall compatibility score for the position."
            />

            <ResultCard
              title="Matching Skills"
              description="Identify the skills in your resume that match the role."
            />

            <ResultCard
              title="Missing Skills"
              description="Discover important skills requested by the employer."
            />

            <ResultCard
              title="Missing Keywords"
              description="Find relevant ATS keywords missing from your resume."
            />

            <ResultCard
              title="Experience Match"
              description="Understand how your experience aligns with the position."
            />

            <ResultCard
              title="Recommendations"
              description="Get actionable suggestions to improve your application."
            />

          </div>

        </section>

      </div>
    </div>
  );
}

function ResultCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}