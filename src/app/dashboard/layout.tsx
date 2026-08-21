import {
  Bell,
  Search,
  LayoutDashboard,
  BriefcaseBusiness,
  Target,
} from "lucide-react";

import Header from "@/components/dashboard/Header";


import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";

const overviewItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: BriefcaseBusiness,
  },
  {
    label: "Jobs",
    href: "/dashboard/jobs",
    icon: Target,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
            

      <main className="flex flex-1 flex-col">
       <Header />

        {children}
      </main>
    </div>
  );
}