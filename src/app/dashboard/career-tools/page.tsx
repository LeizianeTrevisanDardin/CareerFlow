import { redirect } from "next/navigation";

import {
  Calculator,
  CalendarClock,
  Target,
  Bookmark,
  Heart,
  Send,
  Archive,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import SalaryCalculator from "./SalaryCalculator";
import FollowUpPlanner from "./FollowUpPlanner";

export default async function CareerToolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // LOAD JOBS
  // ==========================================

  const {
    data: jobs,
    error,
  } = await supabase
    .from("jobs")
    .select(`
      id,
      status,
      created_at,
      updated_at
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error loading job progress:",
      error
    );
  }

  const allJobs = jobs ?? [];

  const saved = allJobs.filter(
    (job) => job.status === "saved"
  ).length;

  const interested = allJobs.filter(
    (job) => job.status === "interested"
  ).length;

  const applied = allJobs.filter(
    (job) => job.status === "applied"
  ).length;

  const archived = allJobs.filter(
    (job) => job.status === "archived"
  ).length;

  const activeJobs =
    saved + interested + applied;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Career Tools
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Tools for your job search
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Simple tools to help you plan your career,
            understand compensation, and stay organized
            throughout your job search.
          </p>
        </div>

        {/* ======================================
            TOOL OVERVIEW
        ====================================== */}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          <ToolCard
            icon={<Calculator className="h-5 w-5" />}
            title="Salary Calculator"
            description="Compare annual, monthly, and hourly compensation."
          />

          <ToolCard
            icon={<CalendarClock className="h-5 w-5" />}
            title="Follow-up Planner"
            description="Find a good date to follow up after submitting an application."
          />

          <ToolCard
            icon={<Target className="h-5 w-5" />}
            title="Job Search Progress"
            description="See how your saved opportunities are progressing."
          />

        </div>

        {/* ======================================
            JOB SEARCH PROGRESS
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Job Search Progress
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Your opportunities
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                A quick overview of the jobs you&apos;re tracking in Careerflow.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-6 py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Active Jobs
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-800">
                {activeJobs}
              </p>
            </div>

          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <ProgressCard
              icon={<Bookmark className="h-5 w-5" />}
              label="Saved"
              value={saved}
            />

            <ProgressCard
              icon={<Heart className="h-5 w-5" />}
              label="Interested"
              value={interested}
            />

            <ProgressCard
              icon={<Send className="h-5 w-5" />}
              label="Applied"
              value={applied}
            />

            <ProgressCard
              icon={<Archive className="h-5 w-5" />}
              label="Archived"
              value={archived}
            />

          </div>

          {allJobs.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No jobs tracked yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add opportunities to your Jobs page to start tracking your progress.
              </p>
            </div>
          )}

        </section>

        {/* ======================================
            SALARY CALCULATOR
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Calculator className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Compensation
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Salary Calculator
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter a salary to quickly compare annual,
                monthly, bi-weekly, weekly, and hourly pay.
              </p>
            </div>

          </div>

          <div className="mt-7">
            <SalaryCalculator />
          </div>

        </section>

        {/* ======================================
            FOLLOW UP
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CalendarClock className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Applications
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Follow-up Planner
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose when you applied and Careerflow will
                suggest a reasonable follow-up date.
              </p>
            </div>

          </div>

          <div className="mt-7">
            <FollowUpPlanner />
          </div>

        </section>

      </div>
    </div>
  );
}

// ==========================================
// TOOL CARD
// ==========================================

function ToolCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <h2 className="mt-4 font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

// ==========================================
// PROGRESS CARD
// ==========================================

function ProgressCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">

      <div className="text-slate-400">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-500">
        {label}
      </p>

    </div>
  );
}