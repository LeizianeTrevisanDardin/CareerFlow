import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
        full_name,
        job_title,
        location,
        years_experience,
        preferred_job_title,
        linkedin_url,
        career_goal
        `)
    .eq("id", user.id)
    .single();
  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Build your career profile
        </h1>

        <p className="mt-2 text-slate-500">
          Tell Careerflow about your experience and goals so we can personalize
          your job matches and AI tools.
        </p>

        {success === "true" && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">
                Profile updated successfully.
                </p>
            </div>
            )}

            {error === "update_failed" && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                We couldn&apos;t update your profile. Please try again.
                </p>
            </div>
            )}

        <form
            action={updateProfile}
            className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-8"
            >
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>

            <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />
          </div>

          <div>
            <label
              htmlFor="jobTitle"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Current job title
            </label>

            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              defaultValue={profile?.job_title ?? ""}
              placeholder="e.g. Software Developer"
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
                defaultValue={profile?.location ?? ""}
                placeholder="e.g. Calgary, Canada"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="yearsExperience"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Years of experience
              </label>

              <input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                defaultValue={profile?.years_experience ?? ""}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />
            </div>
          </div>

          <div>
            <label
              htmlFor="preferredJobTitle"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Target job title
            </label>

           <input
            id="preferredJobTitle"
            name="preferredJobTitle"
            type="text"
            defaultValue={profile?.preferred_job_title ?? ""}
            placeholder="e.g. Front-End Developer"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="linkedinUrl"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              LinkedIn URL
            </label>

           <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={profile?.linkedin_url ?? ""}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="careerGoal"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Career goal
            </label>

            <textarea
              id="careerGoal"
              name="careerGoal"
              rows={4}
              defaultValue={profile?.career_goal ?? ""}
              placeholder="Tell us what kind of opportunity you're looking for..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Save profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}