import { redirect } from "next/navigation";

import {
  Link as LinkIcon,
  Search,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import AIActionButton from "@/components/AiAnalyzeButton";

import { createClient } from "@/lib/supabase/server";
import { runLinkedinAnalysis } from "./actions";

type LinkedinAnalyzerPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LinkedinAnalyzerPage({
  searchParams,
}: LinkedinAnalyzerPageProps) {
  const { error } =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            LinkedIn Analyzer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Improve your LinkedIn profile
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Analyze your LinkedIn profile and discover ways to improve your
            headline, About section, experience, skills, and search visibility.
          </p>
        </div>

        {/* ======================================
            ERROR MESSAGES
        ====================================== */}

        {error === "insufficient_credits" && (
          <ErrorMessage
            title="Not enough credits"
            message="You need 5 credits to run a LinkedIn profile analysis."
          />
        )}

        {error === "rate_limit_exceeded" && (
          <ErrorMessage
            title="Please wait a moment"
            message="You've run several AI analyses in a short period. Please wait about a minute before trying again."
          />
        )}

        {error === "extract_failed" && (
          <ErrorMessage
            title="We couldn't read this PDF"
            message="Please try another LinkedIn PDF or paste your profile content instead."
          />
        )}

        {error === "file_too_large" && (
          <ErrorMessage
            title="PDF is too large"
            message="Please upload a PDF smaller than 5 MB."
          />
        )}

        {error === "invalid_file" && (
          <ErrorMessage
            title="Invalid file"
            message="Please upload a valid PDF file."
          />
        )}

        {error === "profile_too_short" && (
          <ErrorMessage
            title="Not enough profile information"
            message="Please upload a more complete LinkedIn PDF or paste more profile content."
          />
        )}

        {error === "analysis_failed" && (
          <ErrorMessage
            title="We couldn't complete the analysis"
            message="Something went wrong while analyzing your LinkedIn profile. Please try again."
          />
        )}

        {error === "invalid_analysis" && (
          <ErrorMessage
            title="We couldn't validate the analysis"
            message="Please try running the LinkedIn analysis again."
          />
        )}

        {error === "save_failed" && (
          <ErrorMessage
            title="We couldn't save the analysis"
            message="Your analysis could not be saved. Please try again."
          />
        )}

        {error === "credits_check_failed" && (
          <ErrorMessage
            title="We couldn't verify your credits"
            message="Please try again in a moment."
          />
        )}

        {error === "rate_limit_check_failed" && (
          <ErrorMessage
            title="We couldn't verify the generation limit"
            message="Please try again in a moment."
          />
        )}

        {/* ======================================
            ANALYZER
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <LinkIcon className="h-5 w-5 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyze your profile
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload a LinkedIn PDF or paste your profile content. You can
                also include your LinkedIn URL for reference.
              </p>
            </div>

          </div>

          {/* ======================================
              FORM
          ====================================== */}

          <form
            action={runLinkedinAnalysis}
            className="mt-8 space-y-6"
          >

            {/* LINKEDIN URL */}

            <div>
              <label
                htmlFor="profileUrl"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                LinkedIn profile URL

                <span className="ml-1 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                id="profileUrl"
                name="profileUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                The URL is saved for reference. The analysis uses the PDF or
                profile content you provide.
              </p>
            </div>

            {/* PDF UPLOAD */}

            <div>
              <label
                htmlFor="profileFile"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Upload LinkedIn PDF
              </label>

              <input
                id="profileFile"
                name="profileFile"
                type="file"
                accept=".pdf,application/pdf"
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                PDF only · Maximum file size 5 MB
              </p>
            </div>

            {/* OR */}

            <div className="flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                Or paste profile content
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* PROFILE TEXT */}

            <div>
              <label
                htmlFor="profileText"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                LinkedIn profile content
              </label>

              <textarea
                id="profileText"
                name="profileText"
                rows={14}
                placeholder={`Paste your LinkedIn profile here...

For best results, include:

Headline
About
Experience
Skills
Education
Certifications`}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Upload a PDF or paste your profile content. You don&apos;t need
                to provide both.
              </p>
            </div>

           {/* ======================================
              SUBMIT
              ====================================== */}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    LinkedIn Profile Analysis
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Uses 5 credits
                  </p>
                </div>

             <div className="mt-6 py-3">
              <AIActionButton
                idleText="Analyze LinkedIn"
                loadingText="Analyzing LinkedIn..."
               description="Careerflow is analyzing your LinkedIn profile for headline quality, professional summary, experience, skills, keywords, and search visibility."
              />
            </div>

              </div>
            </form>
        </section>

        {/* ======================================
            WHAT WE ANALYZE
        ====================================== */}

        <section className="mt-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Profile Score
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            What we&apos;ll analyze
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your profile will be evaluated across the areas that influence
            recruiter discovery and profile quality.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <AnalysisCard
              icon={
                <UserRound className="h-5 w-5" />
              }
              title="Headline"
              points="20 points"
              description="Clarity, positioning, specialization, and professional value."
            />

            <AnalysisCard
              icon={
                <UserRound className="h-5 w-5" />
              }
              title="About"
              points="20 points"
              description="Professional story, clarity, credibility, and positioning."
            />

            <AnalysisCard
              icon={
                <Target className="h-5 w-5" />
              }
              title="Experience"
              points="25 points"
              description="Responsibilities, achievements, impact, and career progression."
            />

            <AnalysisCard
              icon={
                <Sparkles className="h-5 w-5" />
              }
              title="Skills"
              points="20 points"
              description="Relevant technical and professional skills represented in the profile."
            />

            <AnalysisCard
              icon={
                <Search className="h-5 w-5" />
              }
              title="Searchability"
              points="15 points"
              description="Keywords that can help recruiters discover your profile."
            />

          </div>

        </section>

        {/* ======================================
            SCORE PREVIEW
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                LinkedIn Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Understand your profile
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                You&apos;ll receive an overall score along with specific
                recommendations for improving your profile.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-8 py-5 text-center">

              <p className="text-sm text-slate-400">
                Profile Score
              </p>

              <p className="mt-1 text-4xl font-bold text-slate-300">
                --/100
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="Headline"
              points="-- / 20"
            />

            <ScoreRow
              label="About"
              points="-- / 20"
            />

            <ScoreRow
              label="Experience"
              points="-- / 25"
            />

            <ScoreRow
              label="Skills"
              points="-- / 20"
            />

            <ScoreRow
              label="Keywords & Searchability"
              points="-- / 15"
            />

          </div>

        </section>

      </div>
    </div>
  );
}

function ErrorMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

      <p className="font-semibold text-red-900">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-red-700">
        {message}
      </p>

    </div>
  );
}

function AnalysisCard({
  icon,
  title,
  points,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  points: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">

        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <span className="text-xs font-medium text-slate-400">
          {points}
        </span>

      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function ScoreRow({
  label,
  points,
}: {
  label: string;
  points: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-400">
        {points}
      </span>

    </div>
  );
}