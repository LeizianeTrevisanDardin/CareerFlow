import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ResumeBuilderClient, {
  type Experience,
} from "./ResumeBuilderClient";

import { deleteResume } from "./actions";

type ResumeBuilderPageProps = {
  searchParams: Promise<{
    resume?: string;
    success?: string;
    error?: string;
  }>;
};

export default async function ResumeBuilderPage({
  searchParams,
}: ResumeBuilderPageProps) {
  const {
    resume: resumeId,
    success,
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
  // LOAD SAVED RESUMES
  // ==========================================

  const {
    data: savedResumes,
    error: savedResumesError,
  } = await supabase
    .from("resumes")
    .select(`
      id,
      title,
      job_title,
      updated_at
    `)
    .eq("user_id", user.id)
    .order("updated_at", {
      ascending: false,
    });

  if (savedResumesError) {
    console.error(
      "Error loading saved resumes:",
      savedResumesError
    );
  }

  // ==========================================
  // LOAD SELECTED RESUME
  // ==========================================

  let selectedResume: {
    id: string;
    title: string;
    full_name: string | null;
    job_title: string | null;
    location: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    summary: string | null;
    skills: string[];
    experiences: Experience[];
  } | null = null;

  if (resumeId) {
    const {
      data,
      error,
    } = await supabase
      .from("resumes")
      .select(`
        id,
        title,
        full_name,
        job_title,
        location,
        email,
        phone,
        linkedin,
        summary,
        skills,
        experiences
      `)
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(
        "Error loading selected resume:",
        error
      );
    }

    if (data) {
      selectedResume = {
        id: data.id,

        title:
          data.title ??
          "My Resume",

        full_name:
          data.full_name ?? null,

        job_title:
          data.job_title ?? null,

        location:
          data.location ?? null,

        email:
          data.email ?? null,

        phone:
          data.phone ?? null,

        linkedin:
          data.linkedin ?? null,

        summary:
          data.summary ?? null,

        skills:
          Array.isArray(data.skills)
            ? (data.skills as string[])
            : [],

        experiences:
          Array.isArray(
            data.experiences
          )
            ? (data.experiences as Experience[])
            : [],
      };
    }
  }

  return (
    <div>
      {/* ======================================
          SAVED RESUMES
      ====================================== */}

      <div className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="w-full max-w-7xl">

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                  Saved Resumes
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Your resumes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Open a saved resume to continue editing.
                </p>
              </div>

              <Link
                href="/dashboard/resume-builder"
                className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                New Resume
              </Link>

            </div>

            {/* ======================================
                SUCCESS MESSAGES
            ====================================== */}

            {success === "saved" && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">
                  Resume saved successfully.
                </p>
              </div>
            )}

            {success === "deleted" && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">
                  Resume deleted successfully.
                </p>
              </div>
            )}

            {/* ======================================
                SAVED RESUMES LIST
            ====================================== */}

            {savedResumes &&
            savedResumes.length > 0 ? (
              <div className="mt-5 max-h-[420px] overflow-y-auto pr-2">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

                  {savedResumes.map(
                    (resume) => (
                      <div
                        key={resume.id}
                        className={`rounded-2xl border p-4 transition ${
                          resume.id === resumeId
                            ? "border-emerald-300 bg-emerald-50/50"
                            : "border-slate-200"
                        }`}
                      >

                        {/* RESUME INFO */}

                        <Link
                          href={`/dashboard/resume-builder?resume=${resume.id}`}
                          className="block"
                        >
                          <p className="font-semibold text-slate-900">
                            {resume.title ||
                              "My Resume"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {resume.job_title ||
                              "No job title"}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
                            Updated{" "}
                            {new Date(
                              resume.updated_at
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month:
                                  "short",
                                day:
                                  "numeric",
                                year:
                                  "numeric",
                              }
                            )}
                          </p>
                        </Link>

                        {/* ACTIONS */}

                        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">

                          <Link
                            href={`/dashboard/resume-builder?resume=${resume.id}`}
                            className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                          >
                            Open
                          </Link>

                          <form
                            action={
                              deleteResume
                            }
                          >
                            <input
                              type="hidden"
                              name="resumeId"
                              value={
                                resume.id
                              }
                            />

                            <button
                              type="submit"
                              className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                            >
                              Delete
                            </button>
                          </form>

                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  You haven&apos;t saved any resumes yet.
                </p>

              </div>
            )}

          </section>

        </div>
      </div>

      {/* ======================================
          RESUME BUILDER
      ====================================== */}

      <ResumeBuilderClient
        key={
          selectedResume?.id ??
          "new-resume"
        }
        initialResume={
          selectedResume
        }
      />

    </div>
  );
}