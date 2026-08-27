import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import JobStatusSelect from "@/components/JobStatusSelect";

import {
  deleteJob,
  updateJobStatus,
} from "./actions";

type JobsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    status?: string;
  }>;
};

export default async function JobsPage({
  searchParams,
}: JobsPageProps) {
  const {
    success,
    error,
    status,
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
  // LOAD JOBS
  // ==========================================

  const {
    data: jobs,
    error: jobsError,
  } = await supabase
    .from("jobs")
    .select(`
      id,
      job_title,
      company_name,
      location,
      job_url,
      salary,
      job_description,
      status,
      created_at,
      updated_at
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (jobsError) {
    console.error(
      "Error loading jobs:",
      jobsError
    );
  }

  // ==========================================
  // FILTERS
  // ==========================================

  const validStatuses = [
    "saved",
    "interested",
    "applied",
    "archived",
  ];

  const activeStatus =
    status &&
    validStatuses.includes(status)
      ? status
      : "all";

  const allJobs =
    jobs ?? [];

  const filteredJobs =
    activeStatus === "all"
      ? allJobs
      : allJobs.filter(
          (job) =>
            job.status === activeStatus
        );

  const counts = {
    all: allJobs.length,

    saved: allJobs.filter(
      (job) =>
        job.status === "saved"
    ).length,

    interested: allJobs.filter(
      (job) =>
        job.status === "interested"
    ).length,

    applied: allJobs.filter(
      (job) =>
        job.status === "applied"
    ).length,

    archived: allJobs.filter(
      (job) =>
        job.status === "archived"
    ).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* HEADER */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Opportunities
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Jobs
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Save job opportunities and keep track of the roles you&apos;re interested in.
            </p>
          </div>

          <Link
            href="/dashboard/jobs/new"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </Link>

        </div>

        {/* MESSAGES */}

        {success === "job_created" && (
          <Message
            type="success"
            title="Job saved"
            message="The job opportunity was added successfully."
          />
        )}

        {success === "job_deleted" && (
          <Message
            type="success"
            title="Job deleted"
            message="The job opportunity was removed."
          />
        )}

        {success === "job_updated" && (
          <Message
            type="success"
            title="Job updated"
            message="The job opportunity was updated successfully."
          />
        )}

        {success === "status_updated" && (
          <Message
            type="success"
            title="Status updated"
            message="The job status was updated successfully."
          />
        )}

        {error === "delete_failed" && (
          <Message
            type="error"
            title="We couldn't delete this job"
            message="Please try again."
          />
        )}

        {error === "status_update_failed" && (
          <Message
            type="error"
            title="We couldn't update the job status"
            message="Please try again."
          />
        )}

        {error === "invalid_status" && (
          <Message
            type="error"
            title="Invalid status"
            message="Please select a valid job status."
          />
        )}

        {/* STATUS FILTERS */}

        {allJobs.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">

            <StatusFilter
              label="All"
              value="all"
              count={counts.all}
              activeStatus={activeStatus}
            />

            <StatusFilter
              label="Saved"
              value="saved"
              count={counts.saved}
              activeStatus={activeStatus}
            />

            <StatusFilter
              label="Interested"
              value="interested"
              count={counts.interested}
              activeStatus={activeStatus}
            />

            <StatusFilter
              label="Applied"
              value="applied"
              count={counts.applied}
              activeStatus={activeStatus}
            />

            <StatusFilter
              label="Archived"
              value="archived"
              count={counts.archived}
              activeStatus={activeStatus}
            />

          </div>
        )}

        {/* JOB LIST */}

        {filteredJobs.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5">

            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                      <BriefcaseBusiness className="h-5 w-5 text-emerald-700" />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold text-slate-900">
                          {job.job_title}
                        </h2>

                        <StatusBadge
                          status={job.status}
                        />

                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                        {job.company_name && (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            {job.company_name}
                          </span>
                        )}

                        {job.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        )}

                        {job.salary && (
                          <span>
                            {job.salary}
                          </span>
                        )}

                      </div>

                      {job.job_description && (
                        <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-slate-600">
                          {job.job_description}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* EDIT + DELETE */}

                  <div className="flex shrink-0 flex-wrap gap-2">

                    <Link
                      href={`/dashboard/jobs/${job.id}/edit`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                    <form action={deleteJob}>

                      <input
                        type="hidden"
                        name="jobId"
                        value={job.id}
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                    </form>

                  </div>

                </div>

                {/* JOB ACTIONS */}

                <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">

                  <Link
                    href={`/dashboard/job-match?jobId=${job.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Run Job Match
                  </Link>

                  <Link
                    href={`/dashboard/apply?jobId=${job.id}`}
                    className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Prepare Application
                  </Link>

                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Job
                    </a>
                  )}

                  {/* STATUS SELECT */}
                  <form
                      action={updateJobStatus}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input
                        type="hidden"
                        name="jobId"
                        value={job.id}
                      />

                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Status
                        </p>

                        <JobStatusSelect
                          defaultValue={
                            job.status as
                              | "saved"
                              | "interested"
                              | "applied"
                              | "archived"
                          }
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Update Status
                      </button>
                    </form>

                </div>

              </article>
            ))}

          </div>
        ) : allJobs.length > 0 ? (

          <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <BriefcaseBusiness className="h-5 w-5 text-slate-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No jobs in this category
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don&apos;t currently have any jobs with this status.
            </p>

            <Link
              href="/dashboard/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View All Jobs
            </Link>

          </section>

        ) : (

          <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <BriefcaseBusiness className="h-5 w-5 text-slate-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No saved jobs yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save job opportunities here so you can compare them with your resume
              and prepare tailored applications.
            </p>

            <Link
              href="/dashboard/jobs/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add Your First Job
            </Link>

          </section>
        )}

      </div>
    </div>
  );
}

// ==========================================
// STATUS FILTER
// ==========================================

function StatusFilter({
  label,
  value,
  count,
  activeStatus,
}: {
  label: string;
  value: string;
  count: number;
  activeStatus: string;
}) {
  const active =
    activeStatus === value;

  const href =
    value === "all"
      ? "/dashboard/jobs"
      : `/dashboard/jobs?status=${value}`;

  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}

      <span
        className={`ml-2 ${
          active
            ? "text-slate-300"
            : "text-slate-400"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const label =
    status === "interested"
      ? "Interested"
      : status === "applied"
        ? "Applied"
        : status === "archived"
          ? "Archived"
          : "Saved";

  const style =
    status === "applied"
      ? "bg-blue-50 text-blue-700"
      : status === "interested"
        ? "bg-amber-50 text-amber-700"
        : status === "archived"
          ? "bg-slate-100 text-slate-500"
          : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

// ==========================================
// MESSAGE
// ==========================================

function Message({
  type,
  title,
  message,
}: {
  type: "success" | "error";
  title: string;
  message: string;
}) {
  const isSuccess =
    type === "success";

  return (
    <div
      className={`mt-6 rounded-2xl border px-5 py-4 ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`font-semibold ${
          isSuccess
            ? "text-emerald-900"
            : "text-red-900"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-1 text-sm ${
          isSuccess
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {message}
      </p>
    </div>
  );
}