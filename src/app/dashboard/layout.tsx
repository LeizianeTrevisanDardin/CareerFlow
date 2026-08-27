import { redirect } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      job_title,
      credits
    `)
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    "CareerFlow User";

  const email =
    user.email || "";

  const jobTitle =
    profile?.job_title ||
    "Complete your profile";

  const credits =
    profile?.credits ?? 0;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <Sidebar />

      {/* ======================================
          MAIN AREA
      ====================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}

        <Header
          fullName={fullName}
          email={email}
          jobTitle={jobTitle}
          credits={credits}
        />

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
}