import { redirect } from "next/navigation";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
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

  const { data: profile, error: profileError }= await supabase
  .from ("profiles")
  .select("full_name, job_title, credits, profile_completion")
  .eq("id", user.id)
  .single();

  if(profileError)
    console.error("Error loading profile:", profileError);


  return (
    <div className="flex min-h-screen bg-[#f6f8f9] text-slate-900">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <Header 
          fullName={
            profile?.full_name ??
            user.user_metadata.full_name ??
            "Careerflow user"
          }
          email={user.email ?? ""}
          jobTitle={profile?.job_title ?? "Complete your profile"}
          credits={profile?.credits ?? 0}
        />

        {children}
      </main>
    </div>
  );
}