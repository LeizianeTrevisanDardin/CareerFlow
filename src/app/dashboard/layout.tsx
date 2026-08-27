import {
  Plus,
  BriefcaseBusiness,
  Target,
  FileCheck2,
  Coins,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardGreeting from "@/components/DashboardGreeting";

import { createClient } from "@/lib/supabase/server";
import { getStatusStyles } from "@/lib/application-status";

export default async function DashboardPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // PROFILE
  // ==========================================

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      profile_completion,
      credits
    `)
    .eq("id", user.id)
    .single();

  const profileCompletion =
    profile?.profile_completion ?? 0;

  const firstName =
    profile?.full_name
      ?.trim()
      .split(" ")[0] ??
    "there";

  const credits =
    profile?.credits ?? 0;

  // ==========================================
  // TOTAL APPLICATIONS
  // ==========================================

  const {
    count: applicationsCount,
  } = await supabase
    .from("applications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  // ==========================================
  // START OF CURRENT WEEK
  // ==========================================

  const startOfWeek =
    new Date();

  startOfWeek.setDate(
    startOfWeek.getDate() -
      startOfWeek.getDay()
  );

  startOfWeek.setHours(
    0,
    0,
    0,
    0
  );

  // ==========================================
  // APPLICATIONS THIS WEEK
  // ==========================================

  const {
    count: applicationsThisWeek,
  } = await supabase
    .from("applications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte(
      "created_at",
      startOfWeek.toISOString()
    );

  const totalApplications =
    applicationsCount ?? 0;

  const weeklyApplications =
    applicationsThisWeek ?? 0;

  // ==========================================
  // RECENT APPLICATIONS
  // ==========================================

  const {
    data: recentApplications,
  } = await supabase
    .from("applications")
    .select(`
      id,
      company_name,
      job_title,
      status,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* ======================================
          GREETING
      ====================================== */}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

        <DashboardGreeting
          name={firstName}
        />

        <Link
          href="/dashboard/applications/new"
          className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Plus className="h-5 w-5" />

          New Application
        </Link>

      </div>

      {/* ======================================
          CAREER PROFILE
      ====================================== */}

      <section className="mt-10 rounded-3xl bg-[#173f4d] p-6 text-white sm:p-8">

        <div className="flex items-start justify-between gap-6">

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-100">
              Your Career Profile
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              You&apos;re almost there.
            </h2>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-emerald-200 text-sm font-bold">
            {profileCompletion}%
          </div>

        </div>

        <div className="mt-8">

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">

            <div
              className="h-full rounded-full bg-emerald-200 transition-all"
              style={{
                width: `${profileCompletion}%`,
              }}
            />

          </div>

        </div>

        <p className="mt-6 max-w-xl text-sm leading-6 text-slate-200">
          Complete your LinkedIn profile and add your career preferences to
          improve your job matches.
        </p>

        <Link
          href="/dashboard/profile"
          className="mt-6 inline-block text-sm font-semibold text-white transition hover:text-emerald-200"
        >
          Continue Profile →
        </Link>

      </section>

      {/* ======================================
          DASHBOARD STATS
      ====================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Applications"
          value={String(
            totalApplications
          )}
          description={`+${weeklyApplications} this week`}
          icon={
            BriefcaseBusiness
          }
        />

        <DashboardCard
          title="Job Matches"
          value="8"
          description="5 new matches"
          icon={Target}
        />

        <DashboardCard
          title="Resume Score"
          value="84%"
          description="Looking good"
          icon={FileCheck2}
        />

        <DashboardCard
          title="Credits"
          value={String(
            credits
          )}
          description="Available credits"
          icon={Coins}
        />

      </div>

      {/* ======================================
          APPLY COPILOT
      ====================================== */}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

          <div className="max-w-2xl">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Apply Copilot
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Prepare your entire application with AI.
                </h2>

              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              Paste a job description and Careerflow will help tailor your
              application for that specific opportunity.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">

              <div>
                ✓ Job Match Score
              </div>

              <div>
                ✓ Tailored Resume
              </div>

              <div>
                ✓ Cover Letter
              </div>

              <div>
                ✓ Interview Preparation
              </div>

            </div>

          </div>

          <div className="flex min-w-[220px] flex-col items-start lg:items-end">

            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              15 credits
            </div>

            <Link
              href="/dashboard/apply"
              className="mt-8 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start Apply Copilot →
            </Link>

          </div>

        </div>

      </section>

      {/* ======================================
          RECENT APPLICATIONS
      ====================================== */}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

        <div className="flex items-center justify-between gap-6">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Applications
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Your latest opportunities
            </h2>

          </div>

          <Link
            href="/dashboard/applications"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all →
          </Link>

        </div>

        <div className="mt-6 space-y-3">

          {recentApplications &&
          recentApplications.length >
            0 ? (

            recentApplications.map(
              (application) => (

                <div
                  key={
                    application.id
                  }
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div>

                    <p className="font-semibold text-slate-900">
                      {
                        application.job_title
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        application.company_name
                      }
                    </p>

                  </div>

                  <div className="flex items-center gap-6">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                        application.status
                      )}`}
                    >
                      {
                        application.status
                      }
                    </span>

                  </div>

                </div>

              )
            )

          ) : (

            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

              <p className="font-semibold text-slate-900">
                No applications yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first application to start tracking opportunities.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}