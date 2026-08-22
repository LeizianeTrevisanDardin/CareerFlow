import { createApplication } from "../actions";
import { getStatusStyles } from "@/lib/application-status";

export default function NewApplicationPage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Applications
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          New application
        </h1>

        <p className="mt-2 text-slate-500">
          Add a job opportunity to your application tracker.
        </p>

        <form
            action={createApplication}
            className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-8"
        >
          <div>
            <label
              htmlFor="companyName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Company name
            </label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              placeholder="e.g. Shopify"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="jobTitle"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Job title
            </label>

            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              required
              placeholder="e.g. Front-End Developer"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Calgary, Canada"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue="applied"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
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
            <label
              htmlFor="jobUrl"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Job URL
            </label>

            <input
              id="jobUrl"
              name="jobUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="appliedAt"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Application date
            </label>

            <input
              id="appliedAt"
              name="appliedAt"
              type="date"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Add notes about this opportunity..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Add application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}