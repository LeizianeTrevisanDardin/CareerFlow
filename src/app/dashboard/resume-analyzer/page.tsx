import { redirect } from "next/navigation";
import {
  FileText,
  Upload,
  CheckCircle2,
} from "lucide-react";

import { uploadResumeForAnalysis } from "./actions";

import { createClient } from "@/lib/supabase/server";

export default async function ResumeAnalyzerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">

        {/* HEADER */}

        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Resume Analyzer
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Improve your resume
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Upload your resume and get a detailed analysis of its content,
          structure, skills, and ATS compatibility.
        </p>

        {/* UPLOAD */}

        <form
          action={uploadResumeForAnalysis}
          className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Upload className="h-5 w-5 text-slate-600" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Upload your resume
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Upload a PDF or DOCX file to begin your analysis.
          </p>

          <input
            id="resumeFile"
            name="resumeFile"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            className="mx-auto mt-6 block max-w-full text-sm text-slate-500
              file:mr-4 file:rounded-xl file:border-0
              file:bg-emerald-700 file:px-5 file:py-3
              file:text-sm file:font-semibold file:text-white
              hover:file:bg-emerald-800"
          />

          <button
            type="submit"
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Analyze Resume
          </button>

          <p className="mt-3 text-xs text-slate-400">
            PDF or DOCX · Max 5 MB
          </p>
        </form>

        {/* WHAT WE ANALYZE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Resume Score
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              What we&apos;ll analyze
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your resume will be reviewed across several areas that
              influence recruiter readability and ATS performance.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <AnalysisCard
              title="ATS Compatibility"
              description="Structure, readability, and compatibility with applicant tracking systems."
            />

            <AnalysisCard
              title="Professional Summary"
              description="Clarity, positioning, and relevance of your professional profile."
            />

            <AnalysisCard
              title="Work Experience"
              description="Quality of responsibilities, achievements, and experience descriptions."
            />

            <AnalysisCard
              title="Skills"
              description="Strength and relevance of technical and professional skills."
            />

            <AnalysisCard
              title="Formatting"
              description="Consistency, organization, readability, and resume structure."
            />

            <AnalysisCard
              title="Impact"
              description="Use of measurable achievements and results-driven language."
            />

          </div>
        </section>

        {/* SCORE PREVIEW */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Detailed Analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Understand your score
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Instead of showing only a single number, Careerflow will
                explain what is working and what can be improved.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-8 py-5 text-center">
              <p className="text-sm text-slate-400">
                Resume Score
              </p>

              <p className="mt-1 text-4xl font-bold text-slate-300">
                --/100
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-3">

            <ScoreRow
              label="ATS Compatibility"
              points="-- / 20"
            />

            <ScoreRow
              label="Professional Summary"
              points="-- / 15"
            />

            <ScoreRow
              label="Work Experience"
              points="-- / 25"
            />

            <ScoreRow
              label="Skills"
              points="-- / 15"
            />

            <ScoreRow
              label="Formatting & Structure"
              points="-- / 15"
            />

            <ScoreRow
              label="Impact & Achievements"
              points="-- / 10"
            />

          </div>
        </section>

      </div>
    </div>
  );
}

function AnalysisCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <CheckCircle2 className="h-5 w-5 text-emerald-700" />

      <p className="mt-4 font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ScoreRow({
  label,
  points,
}: {
  label: string;
  points: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-400">
        {points}
      </span>
    </div>
  );
}