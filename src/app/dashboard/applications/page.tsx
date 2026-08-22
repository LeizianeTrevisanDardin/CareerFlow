import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { deleteApplication } from "./actions";

import DeleteApplicationButton from "@/components/DeleteApplicationButton";

function getStatusStyles(status: string) {
  switch (status) {
    case "saved":
      return "bg-slate-100 text-slate-700";

    case "applied":
      return "bg-emerald-50 text-emerald-700";

    case "interview":
      return "bg-blue-50 text-blue-700";

    case "offer":
      return "bg-green-100 text-green-800";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  const { success, error: searchError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select(`
      id,
      company_name,
      job_title,
      location,
      status,
      applied_at,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading applications:", error);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Applications
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Track your applications
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your job opportunities organized in one place.
          </p>
        </div>

        <Link
          href="/dashboard/applications/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Plus className="h-5 w-5" />
          New Application
        </Link>
      </div>

      {/* Success messages */}
      {success === "created" && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">
            Application added successfully.
          </p>
        </div>
      )}

      {success === "updated" && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-700">
            Application updated successfully.
          </p>
        </div>
      )}

      {success === "deleted" && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">
            Application deleted successfully.
          </p>
        </div>
      )}

      {/* Error message */}
      {searchError === "delete_failed" && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            We couldn&apos;t delete the application. Please try again.
          </p>
        </div>
      )}

      {/* Applications */}
      <div className="mt-8 space-y-4">
        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"
            >
              {/* Application info */}
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {application.job_title}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  {application.company_name}
                </p>

                {application.location && (
                  <p className="mt-1 text-sm text-slate-400">
                    {application.location}
                  </p>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-6">
                {/* Date */}
                <div className="text-right">
                  {application.applied_at && (
                    <>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(
                          application.applied_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>

                      <p className="text-xs text-slate-400">
                        Application date
                      </p>
                    </>
                  )}
                </div>

                {/* Status */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/applications/${application.id}/edit`}
                    title="Edit application"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <DeleteApplicationButton
                    applicationId={application.id}
                    deleteAction={deleteApplication}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">
              No applications yet.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your first opportunity to start tracking your job search.
            </p>

            <Link
              href="/dashboard/applications/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add application
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}