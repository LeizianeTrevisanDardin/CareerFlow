"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    Target,
    FileText,
    Gauge,
    UserRound,
    FolderOpen,
    Sparkles,
    WandSparkles,
    Mail,
    Wrench,
    Settings,
    CircleHelp,
} from "lucide-react";

import type {
    SidebarItem,
    SidebarSectionProps,
} from "@/types/sidebar";

const overviewItems: SidebarItem [] =[
    {
        label: "Dashboard",
        href:"/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Applications",
        href:"/dashboard/applications",
        icon: BriefcaseBusiness,
    },
    {
        label: "Jobs",
        href:"/dashboard/jobs",
        icon: Target,
    }
];

const profileItems : SidebarItem [] = [
    {
        label: "Resume",
        href:"/dashboard/resume-builder",
        icon: FileText,
    },
    {
        label: "Resume Analyzer",
        href:"/dashboard/resume-analyzer",
        icon: Gauge,
    },
    {
        label: "Linkedin",
        href:"/dashboard/linkedin",
        icon: UserRound,
    },
    {
        label: "Portfolio",
        href:"/dashboard/portfolio",
        icon: FolderOpen,
    },
];

const aiToolItems : SidebarItem [] = [
    {
        label: "Apply Copilot",
        href:"/dashboard/apply",
        icon: Sparkles,
    },
    {
        label: "Job Match",
        href:"/dashboard/job-match",
        icon: WandSparkles,
    },
    {
        label: "Cover Letter",
        href:"/dashboard/cover-letter",
        icon: Mail,
    },
    {
        label: "Career Tools",
        href:"/dashboard/tools",
        icon: Wrench,
    }

];

const accountItems : SidebarItem [] = [
    {
        label: "Settings",
        href:"/dashboard/settings",
        icon: Settings,
    },
    {
        label: "Help Center",
        href:"/dashboard/help",
        icon: CircleHelp,
    }
];

function SidebarSection({
    title,
    items,
    pathname,
}: SidebarSectionProps) {
    return(
        <div className="mb-8">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {title}
            </p>

            <div className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return(
                            <Link 
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                    isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                                >
                                    <Icon className="h-5 w-5"/>

                                    <span>{item.label}</span>      
                                </Link>
                        );
                    })}
                </div>
            </div>
    );
}


    export default function Sidebar(){

        const pathname = usePathname();
    return(
        <aside className="flex min-h-screen w-[280px] flex-col border-r bg-white">
            <div className="flex h-20 items-center px-6">
                <span className="text-xl font-bold text-slate-900">
                    career<span className="text-emerald-600">flow</span>
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
                <SidebarSection
                    title="Overview"
                    items={overviewItems}
                    pathname={pathname}
                />

                <SidebarSection
                    title="Build Your Profile"
                    items={profileItems}
                    pathname={pathname}
                />

                <SidebarSection
                    title="AI Tools"
                    items={aiToolItems}
                    pathname={pathname}
                />

                <SidebarSection
                    title="Account"
                    items={accountItems}
                    pathname={pathname}
                />
             </nav>
         </aside>
    );
}