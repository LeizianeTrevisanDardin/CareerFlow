import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import CoverLetterPreview from "@/components/apply/CoverLetterPreview";
import GeneratedDocumentActions from "@/components/apply/GeneratedDocumentActions";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";

export default async function CoverLetterResultPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: coverLetter,
    error,
  } = await supabase
    .from("cover_letters")
    .select(`
      id,
      resume_id,
      job_title,
      company_name,
      job_description,
      content,
      status,
      created_at
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !coverLetter) {
    redirect("/dashboard/cover-letter");
  }

  if (!coverLetter.content) {
    redirect(
      "/dashboard/cover-letter?error=content_not_found"
    );
  }

  const safeJobTitle =
    coverLetter.job_title ||
    "cover-letter";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* BACK */}

        <Link
          href="/dashboard/cover-letter"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cover Letter
        </Link>

        {/* HEADER */}

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Cover Letter
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {coverLetter.job_title ||
              "Generated Cover Letter"}
          </h1>

          {coverLetter.company_name && (
            <p className="mt-2 text-lg text-slate-500">
              {coverLetter.company_name}
            </p>
          )}
        </div>

        {/* STATUS */}

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="font-semibold text-emerald-900">
            Cover letter ready
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Your tailored cover letter has been generated successfully.
          </p>
        </section>

        {/* DOCUMENT */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Generated Document
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Cover letter
              </h2>
            </div>

            <GeneratedDocumentActions
              content={coverLetter.content}
              fileName={`${safeJobTitle}-cover-letter`}
              documentType="cover_letter"
            />

          </div>

          {/* PREVIEW */}

          <div className="mt-6">
            <CoverLetterEditor
              coverLetterId={
                coverLetter.id
              }
              content={
                coverLetter.content
              }
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4 lg:p-6">
            <CoverLetterPreview
              content={
                coverLetter.content
              }
            />
          </div>

        </section>

        {/* JOB DESCRIPTION */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Target Job
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Job description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {coverLetter.job_description}
          </p>
        </section>

      </div>
    </div>
  );
}