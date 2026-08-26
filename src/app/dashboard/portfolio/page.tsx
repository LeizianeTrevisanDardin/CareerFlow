import { redirect } from "next/navigation";

import {
  ExternalLink,
  FolderKanban,
  Search,
  Target,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { runPortfolioAnalysis } from "./actions";

type PortfolioAnalyzerPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function PortfolioAnalyzerPage({
  searchParams,
}: PortfolioAnalyzerPageProps) {
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
            Portfolio Analyzer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Improve your portfolio
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Analyze your professional portfolio and get practical
            recommendations to improve presentation, projects, credibility,
            and recruiter readiness.
          </p>
        </div>

        {/* ======================================
            ERROR MESSAGES
        ====================================== */}

        {error === "insufficient_credits" && (
          <ErrorMessage
            title="Not enough credits"
            message="You need 5 credits to run a portfolio analysis."
          />
        )}

        {error === "rate_limit_exceeded" && (
          <ErrorMessage
            title="Please wait a moment"
            message="You've run several AI analyses in a short period. Please wait about a minute and try again."
          />
        )}

        {error === "invalid_url" && (
          <ErrorMessage
            title="Invalid portfolio URL"
            message="Please enter a valid public portfolio URL."
          />
        )}

        {error === "website_fetch_failed" && (
          <ErrorMessage
            title="We couldn't access this website"
            message="The portfolio website could not be accessed. Try pasting the portfolio content manually instead."
          />
        )}

        {error === "website_content_unavailable" && (
          <ErrorMessage
            title="We couldn't find enough content"
            message="This website may load its content dynamically. Try pasting the portfolio content manually."
          />
        )}

        {error === "portfolio_too_short" && (
          <ErrorMessage
            title="Not enough portfolio information"
            message="Enter a portfolio URL or paste more portfolio content before running the analysis."
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

        {error === "analysis_failed" && (
          <ErrorMessage
            title="We couldn't complete the analysis"
            message="Something went wrong while analyzing the portfolio. Please try again."
          />
        )}

        {error === "invalid_analysis" && (
          <ErrorMessage
            title="We couldn't validate the analysis"
            message="Please try running the portfolio analysis again."
          />
        )}

        {error === "save_failed" && (
          <ErrorMessage
            title="We couldn't save the analysis"
            message="The portfolio analysis could not be saved. Please try again."
          />
        )}

        {error === "analysis_not_found" && (
          <ErrorMessage
            title="Analysis not found"
            message="We couldn't find this portfolio analysis."
          />
        )}

        {/* ======================================
            ANALYZER
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <FolderKanban className="h-5 w-5 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyze your portfolio
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Enter your public portfolio URL or paste the portfolio content
                manually.
              </p>
            </div>

          </div>

          {/* ======================================
              FORM
          ====================================== */}

          <form
            action={runPortfolioAnalysis}
            className="mt-8 space-y-6"
          >

            {/* ======================================
                URL
            ====================================== */}

            <div>
              <label
                htmlFor="portfolioUrl"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Portfolio URL
              </label>

              <div className="relative">

                <ExternalLink className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />

              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                We&apos;ll attempt to analyze the public content of your
                portfolio website directly.
              </p>
            </div>

            {/* ======================================
                OR
            ====================================== */}

            <div className="flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                Or paste portfolio content
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* ======================================
                CONTENT
            ====================================== */}

            <div>
              <label
                htmlFor="portfolioText"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Portfolio content
              </label>

              <textarea
                id="portfolioText"
                name="portfolioText"
                rows={16}
                placeholder={`Paste the main content from your portfolio...

For best results, include:

About / Introduction
Projects
Project descriptions
Technologies used
Case studies
Achievements
Contact information`}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />

              <p className="mt-2 text-xs leading-5 text-slate-400">
                You can use this instead of a URL, or provide additional
                portfolio information that may not be visible on the website.
              </p>
            </div>

            {/* ======================================
                SUBMIT
            ====================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Portfolio Analysis
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uses 5 credits
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Analyze Portfolio
              </button>

            </div>

          </form>

        </section>

        {/* ======================================
            WHAT WE ANALYZE
        ====================================== */}

        <section className="mt-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Portfolio Score
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            What we&apos;ll analyze
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your portfolio will be reviewed across the areas that influence
            recruiter confidence and professional presentation.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <AnalysisCard
              icon={
                <FolderKanban className="h-5 w-5" />
              }
              title="Presentation"
              points="20 points"
              description="Structure, organization, readability, and professional presentation."
            />

            <AnalysisCard
              icon={
                <FolderKanban className="h-5 w-5" />
              }
              title="Projects"
              points="25 points"
              description="Quality of project descriptions, case studies, technologies, and outcomes."
            />

            <AnalysisCard
              icon={
                <Target className="h-5 w-5" />
              }
              title="Clarity"
              points="20 points"
              description="How clearly your specialization, value, and professional direction are communicated."
            />

            <AnalysisCard
              icon={
                <Search className="h-5 w-5" />
              }
              title="Credibility"
              points="15 points"
              description="Evidence of real work, achievements, technologies, and professional capability."
            />

            <AnalysisCard
              icon={
                <Target className="h-5 w-5" />
              }
              title="Recruiter Readiness"
              points="20 points"
              description="How effectively the portfolio supports hiring decisions and recruiter evaluation."
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
                Portfolio Score
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Understand your portfolio
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                You&apos;ll receive an overall score along with strengths,
                improvements, and specific recommendations.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-8 py-5 text-center">

              <p className="text-sm text-slate-400">
                Portfolio Score
              </p>

              <p className="mt-1 text-4xl font-bold text-slate-300">
                --/100
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="Presentation & Structure"
              points="-- / 20"
            />

            <ScoreRow
              label="Projects & Case Studies"
              points="-- / 25"
            />

            <ScoreRow
              label="Clarity & Positioning"
              points="-- / 20"
            />

            <ScoreRow
              label="Credibility & Evidence"
              points="-- / 15"
            />

            <ScoreRow
              label="Recruiter Readiness"
              points="-- / 20"
            />

          </div>

        </section>

      </div>
    </div>
  );
}

/* ======================================================
   ERROR MESSAGE
====================================================== */

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

/* ======================================================
   ANALYSIS CARD
====================================================== */

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

/* ======================================================
   SCORE ROW
====================================================== */

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