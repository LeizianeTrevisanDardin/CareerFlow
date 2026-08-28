import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BriefcaseBusiness,
  FileText,
  PenLine,
  FolderOpen,
} from "lucide-react";

import {
  createManualCoverLetter,
  deleteCoverLetter,
  generateStandaloneCoverLetter,
} from "./actions";

import AIActionButton from "@/components/AiAnalyzeButton";
import { createClient } from "@/lib/supabase/server";

type CoverLetterPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CoverLetterPage({
  searchParams,
}: CoverLetterPageProps) {
  const {
    error: pageError,
    success,
  } = await searchParams;

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
    error: resumesError,
  } = await supabase
    .from("resumes")
    .select(`
      id,
      title,
      job_title,
      updated_at
    `)
    .eq(
      "user_id",
      user.id
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (resumesError) {
    console.error(
      "Error loading resumes:",
      resumesError
    );
  }

  // ==========================================
  // LOAD SAVED COVER LETTERS
  // ==========================================

  const {
    data: savedCoverLetters,
    error: coverLettersError,
  } = await supabase
    .from("cover_letters")
    .select(`
      id,
      job_title,
      company_name,
      status,
      created_at,
      updated_at
    `)
    .eq(
      "user_id",
      user.id
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (coverLettersError) {
    console.error(
      "Error loading saved cover letters:",
      coverLettersError
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            AI Tools
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Cover Letter
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Generate a tailored cover letter with AI or create a professional
            document from your own text.
          </p>
        </div>

        {/* ======================================
            SUCCESS MESSAGES
        ====================================== */}

        {success === "deleted" && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="font-semibold text-emerald-900">
              Cover letter deleted
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              The document was removed successfully.
            </p>
          </div>
        )}

        {/* ======================================
            ERROR MESSAGES
        ====================================== */}

        {pageError ===
          "ai_temporarily_unavailable" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="font-semibold text-amber-900">
              AI is temporarily busy
            </p>

            <p className="mt-1 text-sm text-amber-700">
              The AI service is experiencing high demand. Please wait a moment
              and try generating your cover letter again.
            </p>
          </div>
        )}

        {pageError ===
          "generation_failed" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              We couldn&apos;t generate your cover letter
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please try again in a moment.
            </p>
          </div>
        )}

        {pageError ===
          "manual_save_failed" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              We couldn&apos;t save your cover letter
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please review the document and try again.
            </p>
          </div>
        )}

        {pageError ===
          "manual_content_missing" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              Cover letter text is required
            </p>

            <p className="mt-1 text-sm text-red-700">
              Write or paste your cover letter before creating the document.
            </p>
          </div>
        )}

        {pageError ===
          "insufficient_credits" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="font-semibold text-amber-900">
              Not enough credits
            </p>

            <p className="mt-1 text-sm text-amber-700">
              You need at least 5 credits to generate a cover letter with AI.
            </p>
          </div>
        )}

        {pageError ===
          "rate_limit_exceeded" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="font-semibold text-amber-900">
              Too many requests
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Please wait a moment before generating another cover letter.
            </p>
          </div>
        )}

        {pageError ===
          "delete_failed" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              We couldn&apos;t delete the cover letter
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please try again.
            </p>
          </div>
        )}

        {pageError ===
          "missing_cover_letter" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-900">
              Cover letter not found
            </p>

            <p className="mt-1 text-sm text-red-700">
              Please refresh the page and try again.
            </p>
          </div>
        )}

        {/* ======================================
            SAVED COVER LETTERS
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FolderOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Saved Documents
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your cover letters
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Open a saved cover letter to review, edit or download it again.
              </p>
            </div>

          </div>

          {savedCoverLetters &&
          savedCoverLetters.length >
            0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

              {savedCoverLetters.map(
                (
                  coverLetter
                ) => {
                  const updatedDate =
                    coverLetter.updated_at ??
                    coverLetter.created_at;

                  return (
                    <div
                      key={
                        coverLetter.id
                      }
                      className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="font-semibold text-slate-900">
                            {coverLetter.job_title ||
                              "Cover Letter"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {coverLetter.company_name ||
                              "No company specified"}
                          </p>

                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          {coverLetter.status ||
                            "saved"}
                        </span>

                      </div>

                      <p className="mt-4 text-xs text-slate-400">
                        Updated{" "}
                        {new Date(
                          updatedDate
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month:
                              "short",

                            day:
                              "numeric",

                            year:
                              "numeric",
                          }
                        )}
                      </p>

                      {/* ACTIONS */}

                      <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-4">

                        <Link
                          href={`/dashboard/cover-letter/${coverLetter.id}`}
                          className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                        >
                          Open
                        </Link>

                        <form
                          action={
                            deleteCoverLetter
                          }
                        >
                          <input
                            type="hidden"
                            name="coverLetterId"
                            value={
                              coverLetter.id
                            }
                          />

                          <button
                            type="submit"
                            className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                          >
                            Delete
                          </button>
                        </form>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

              <p className="font-semibold text-slate-800">
                No saved cover letters yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Generate one with AI or create one from your own text below.
              </p>

            </div>
          )}

        </section>

        {/* ======================================
            AI COVER LETTER
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                AI Generation
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Generate a tailored cover letter
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose one of your saved resumes and provide the job details.
                Careerflow will create a personalized cover letter for the role.
              </p>

            </div>

          </div>

          <form
            action={
              generateStandaloneCoverLetter
            }
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

              {resumes &&
              resumes.length >
                0 ? (
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

                    {resumes.map(
                      (
                        resume
                      ) => (
                        <option
                          key={
                            resume.id
                          }
                          value={
                            resume.id
                          }
                        >
                          {resume.title ||
                            "My Resume"}

                          {resume.job_title
                            ? ` — ${resume.job_title}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">

                  <p className="text-sm font-medium text-amber-800">
                    You don&apos;t have a saved resume yet.
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Create and save a resume in Resume Builder before generating
                    a cover letter with AI.
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
                The more complete the job description, the better the
                personalization.
              </p>

            </div>

            {/* AI SUBMIT */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-slate-700">
                  Cover Letter Generation
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uses 5 credits
                </p>

              </div>

              <AIActionButton
                idleText="Generate Cover Letter"
                loadingText="Generating Cover Letter..."
                description="Careerflow is reviewing your resume and the job description to create a tailored cover letter."
              />

            </div>

          </form>

        </section>

        {/* ======================================
            MANUAL COVER LETTER
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <PenLine className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Manual Document
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Create from your own text
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Already have a cover letter? Paste or write your text below and
                Careerflow will save it as a document that you can edit and
                download.
              </p>

            </div>

          </div>

          <form
            action={
              createManualCoverLetter
            }
            className="mt-8 space-y-6"
          >

            {/* MANUAL DETAILS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="manualTitle"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Job title
                </label>

                <input
                  id="manualTitle"
                  name="title"
                  type="text"
                  placeholder="e.g. Front-End Developer"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />

              </div>

              <div>

                <label
                  htmlFor="manualCompany"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company
                </label>

                <input
                  id="manualCompany"
                  name="companyName"
                  type="text"
                  placeholder="e.g. Shopify"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />

              </div>

            </div>

            {/* MANUAL CONTENT */}

            <div>

              <label
                htmlFor="manualContent"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Cover letter text
              </label>

              <textarea
                id="manualContent"
                name="content"
                required
                rows={18}
                placeholder={`Paste or write your cover letter here...

Example:

Dear Hiring Manager,

I am writing to express my interest in...

Sincerely,
Your Name`}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                You will be able to edit the document again after creating it.
              </p>

            </div>

            {/* MANUAL SUBMIT */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-slate-700">
                  Manual Cover Letter
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No AI generation required
                </p>

              </div>

              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Create Document
              </button>

            </div>

          </form>

        </section>

      </div>
    </div>
  );
}