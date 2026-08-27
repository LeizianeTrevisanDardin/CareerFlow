import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import { generateStandaloneCoverLetter } from "./actions";

import AIActionButton from "@/components/AiAnalyzeButton";
import { createClient } from "@/lib/supabase/server";

export default async function CoverLetterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            AI Tools
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Cover Letter
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Generate a tailored cover letter using one of your saved resumes
            and the job description.
          </p>
        </div>

        {/* MAIN FORM */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <h2 className="text-xl font-bold text-slate-900">
            Create a cover letter
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Choose the resume you want to use and provide the details of the
            position.
          </p>

          <form
            action={generateStandaloneCoverLetter}
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
                    Create and save a resume in Resume Builder before generating
                    a cover letter.
                  </p>
                </div>
              )}
            </div>

            {/* JOB INFO */}

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
                The more complete the job description, the better the
                personalization.
              </p>
            </div>

            {/* SUBMIT */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Cover Letter Generation
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uses 5 credits
                </p>
              </div>

              <div className="mt-8">

              <AIActionButton
                idleText="Generate Cover Letter"
                loadingText="Generating Cover Letter..."
                description="Careerflow is reviewing your resume and the job description to create a tailored cover letter."
              />
            </div>
            </div>

          </form>

        </section>

      </div>
    </div>
  );
}