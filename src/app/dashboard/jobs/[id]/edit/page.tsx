import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  DollarSign,
  Link as LinkIcon,
  MapPin,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { updateJob } from "../../actions";

type EditJobPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditJobPage({
  params,
  searchParams,
}: EditJobPageProps) {
  const { id } =
    await params;

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

  const {
    data: job,
    error: jobError,
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
      status
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (
    jobError ||
    !job
  ) {
    redirect(
      "/dashboard/jobs"
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">

        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="mt-6">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Jobs
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Edit job
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Update the opportunity details and application status.
          </p>

        </div>

        {error === "missing_fields" && (
          <ErrorMessage
            title="Job title is required"
            message="Please enter a job title."
          />
        )}

        {error === "invalid_status" && (
          <ErrorMessage
            title="Invalid status"
            message="Please select a valid job status."
          />
        )}

        {error === "update_failed" && (
          <ErrorMessage
            title="We couldn't update this job"
            message="Please try again."
          />
        )}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <form
            action={updateJob}
            className="space-y-6"
          >

            <input
              type="hidden"
              name="jobId"
              value={job.id}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

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
                    defaultValue={
                      job.job_title
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500"
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

                <div className="relative">

                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    defaultValue={
                      job.company_name ?? ""
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500"
                  />

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location
                </label>

                <div className="relative">

                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={
                      job.location ?? ""
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500"
                  />

                </div>

              </div>

              <div>

                <label
                  htmlFor="salary"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Salary
                </label>

                <div className="relative">

                  <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="salary"
                    name="salary"
                    type="text"
                    defaultValue={
                      job.salary ?? ""
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500"
                  />

                </div>

              </div>

            </div>

            <div>

              <label
                htmlFor="jobUrl"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Job URL
              </label>

              <div className="relative">

                <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="jobUrl"
                  name="jobUrl"
                  type="url"
                  defaultValue={
                    job.job_url ?? ""
                  }
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500"
                />

              </div>

            </div>

            <div>

              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={
                  job.status
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
              >
                <option value="saved">
                  Saved
                </option>

                <option value="interested">
                  Interested
                </option>

                <option value="applied">
                  Applied
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>

            </div>

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
                rows={14}
                defaultValue={
                  job.job_description ?? ""
                }
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-6 outline-none transition focus:border-emerald-500"
              />

            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              <Link
                href="/dashboard/jobs"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Update Job
              </button>

            </div>

          </form>

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

      <p className="mt-1 text-sm text-red-700">
        {message}
      </p>

    </div>
  );
}