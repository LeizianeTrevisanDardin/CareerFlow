import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  updateProfile,
  createProfessionalExperience,
  updateProfessionalExperience,
  deleteProfessionalExperience,
} from "./actions";

import ExperienceCard from "@/components/profile/ExperienceCard";

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

  // ==========================================
  // PROFILE
  // ==========================================

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      full_name,
      job_title,
      location,
      years_experience,
      preferred_job_title,
      linkedin_url,
      career_goal,
      skills
    `)
    .eq("id", user.id)
    .single();

  // ==========================================
  // PROFESSIONAL EXPERIENCES
  // ==========================================

  const { data: experiences, error: experiencesError } =
    await supabase
      .from("professional_experiences")
      .select(`
        id,
        company_name,
        job_title,
        location,
        start_date,
        end_date,
        is_current,
        description,
        created_at
      `)
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

  if (experiencesError) {
    console.error(
      "Error loading professional experiences:",
      experiencesError
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Build your career profile
        </h1>

        <p className="mt-2 text-slate-500">
          Tell Careerflow about your experience and goals so we can
          personalize your job matches and AI tools.
        </p>

        {/* ======================================
            SUCCESS MESSAGES
        ====================================== */}

        {success === "true" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">
              Profile updated successfully.
            </p>
          </div>
        )}

        {success === "experience_created" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">
              Professional experience added successfully.
            </p>
          </div>
        )}

        {success === "experience_updated" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">
              Professional experience updated successfully.
            </p>
          </div>
        )}

        {success === "experience_deleted" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">
              Professional experience deleted successfully.
            </p>
          </div>
        )}

        {/* ======================================
            ERROR MESSAGES
        ====================================== */}

        {error === "update_failed" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              We couldn&apos;t update your profile. Please try again.
            </p>
          </div>
        )}

        {error === "experience_missing_fields" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              Company name and job title are required.
            </p>
          </div>
        )}

        {error === "experience_create_failed" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              We couldn&apos;t add your professional experience.
            </p>
          </div>
        )}

        {error === "experience_update_failed" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              We couldn&apos;t update this professional experience.
            </p>
          </div>
        )}

        {error === "experience_delete_failed" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              We couldn&apos;t delete this professional experience.
            </p>
          </div>
        )}

        {/* ======================================
            PROFILE FORM
        ====================================== */}

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
              htmlFor="skills"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Skills
            </label>

            <input
              id="skills"
              name="skills"
              type="text"
              defaultValue={profile?.skills?.join(", ") ?? ""}
              placeholder="e.g. React, TypeScript, Next.js, Git"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Separate skills with commas.
            </p>
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

        {/* ======================================
            PROFESSIONAL EXPERIENCE
        ====================================== */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Professional Experience
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Your work experience
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your previous and current roles so Careerflow can create
              better resumes and cover letters.
            </p>
          </div>

          {/* ======================================
              EXISTING EXPERIENCES
          ====================================== */}

          <div className="mt-6 space-y-4">
            {experiences && experiences.length > 0 ? (
              experiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  updateAction={updateProfessionalExperience}
                  deleteAction={deleteProfessionalExperience}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
                <p className="font-semibold text-slate-900">
                  No professional experience added yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first role below.
                </p>
              </div>
            )}
          </div>

          {/* ======================================
              ADD EXPERIENCE
          ====================================== */}

          <form
            action={createProfessionalExperience}
            className="mt-8 space-y-5 border-t border-slate-200 pt-8"
          >
            <h3 className="text-lg font-bold text-slate-900">
              Add experience
            </h3>

            <div className="grid grid-cols-2 gap-4">
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
                  htmlFor="experienceJobTitle"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Job title
                </label>

                <input
                  id="experienceJobTitle"
                  name="experienceJobTitle"
                  type="text"
                  required
                  placeholder="e.g. Front-End Developer"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="experienceLocation"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Location
              </label>

              <input
                id="experienceLocation"
                name="experienceLocation"
                type="text"
                placeholder="e.g. Calgary, Canada"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start date
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  End date
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                name="isCurrent"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
              />

              I currently work here
            </label>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Responsibilities and achievements
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder={`e.g.
Built reusable React components
Integrated REST APIs
Improved application performance`}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Add experience
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}