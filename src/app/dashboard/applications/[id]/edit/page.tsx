import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateApplication } from "../../actions";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: application } = await supabase
    .from("applications")
    .select(`
      id,
      company_name,
      job_title,
      location,
      job_url,
      status,
      applied_at,
      notes
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!application) {
    redirect("/dashboard/applications");
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Applications
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Edit application
        </h1>

        <form
          action={updateApplication}
          className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-8"
        >
          <input
            type="hidden"
            name="applicationId"
            value={application.id}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Company name
            </label>

            <input
              name="companyName"
              type="text"
              required
              defaultValue={application.company_name}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Job title
            </label>

            <input
              name="jobTitle"
              type="text"
              required
              defaultValue={application.job_title}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                name="location"
                type="text"
                defaultValue={application.location ?? ""}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                defaultValue={application.status}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Job URL
            </label>

            <input
              name="jobUrl"
              type="url"
              defaultValue={application.job_url ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Application date
            </label>

            <input
              name="appliedAt"
              type="date"
              defaultValue={application.applied_at ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              name="notes"
              rows={4}
              defaultValue={application.notes ?? ""}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}