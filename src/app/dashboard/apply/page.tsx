import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createJobAnalysis } from "./actions";


export default async function ApplyCopilotPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">

        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Apply Copilot
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Prepare your application with AI
        </h1>

        <p className="mt-2 text-slate-500">
          Paste a job description and Careerflow will help you tailor your
          application.
        </p>


        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">

       <form action={createJobAnalysis}>

          <label className="text-sm font-medium text-slate-700">
            Job description
          </label>

          <textarea
            name="jobDescription"
            rows={10}
            placeholder="Paste the job description here..."
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
          />


          <div className="mt-4 grid grid-cols-2 gap-4">

            <input
              name="companyName"
              placeholder="Company name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />


            <input
              name="jobTitle"
              placeholder="Job title"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />

          </div>


          <button
            type="submit"
            className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Analyze Job →
          </button>

        </form>
        </div>

      </div>
    </div>
  );
}