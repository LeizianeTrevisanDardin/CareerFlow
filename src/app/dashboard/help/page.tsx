import Link from "next/link";

import {
  BookOpen,
  Bot,
  CircleHelp,
  CreditCard,
  FileSearch,
  FileText,
  Link as LinkIcon,
  LockKeyhole,
  Mail,
  SearchCheck,
} from "lucide-react";

const helpSections = [
  {
    title: "Getting Started",
    description:
      "Learn the basics of Careerflow and how to get the most from your account.",
    icon: BookOpen,
    questions: [
      {
        question: "How do I get started?",
        answer:
          "Start by creating or saving a resume in Resume Builder. Once your resume is available, you can use it across Careerflow tools such as Resume Analyzer, Apply Copilot, Job Match, and Cover Letter.",
      },
      {
        question: "Do I need a saved resume?",
        answer:
          "Some Careerflow tools require a saved resume because they use your existing experience, skills, and professional information to generate personalized results.",
      },
    ],
  },
  {
    title: "Credits & Billing",
    description:
      "Understand how credits work across Careerflow.",
    icon: CreditCard,
    questions: [
      {
        question: "What are Careerflow credits?",
        answer:
          "Credits are used when you run AI-powered tools. Different tools may use different amounts of credits depending on the type of analysis or generation.",
      },
      {
        question: "When are credits charged?",
        answer:
          "Credits are charged when an AI-powered action is successfully generated. The required credit amount is displayed before you run a tool.",
      },
      {
        question: "Where can I see my credits?",
        answer:
          "Your current credit balance is displayed in the dashboard and in Settings under Billing & Credits.",
      },
    ],
  },
  {
    title: "Resume Tools",
    description:
      "Create, improve, and analyze your professional resume.",
    icon: FileText,
    questions: [
      {
        question: "What is Resume Builder?",
        answer:
          "Resume Builder lets you create and save resumes directly in Careerflow. Saved resumes can also be used by other Careerflow tools.",
      },
      {
        question: "What does Resume Analyzer do?",
        answer:
          "Resume Analyzer reviews your resume and provides feedback on areas such as structure, content, skills, experience, and overall resume quality.",
      },
      {
        question: "Does Careerflow invent experience?",
        answer:
          "Careerflow is designed to work with the information provided in your resume. AI tools are instructed not to invent employers, experience, skills, certifications, or achievements.",
      },
    ],
  },
  {
    title: "Apply Copilot",
    description:
      "Use your resume and a job description to prepare a stronger application.",
    icon: Bot,
    questions: [
      {
        question: "What does Apply Copilot do?",
        answer:
          "Apply Copilot uses your saved resume and the target job description to help prepare tailored application content based on your actual professional background.",
      },
      {
        question: "Should I review generated content?",
        answer:
          "Yes. AI-generated application content should always be reviewed before you submit it to an employer.",
      },
    ],
  },
  {
    title: "Job Match",
    description:
      "Compare your resume with a specific job opportunity.",
    icon: SearchCheck,
    questions: [
      {
        question: "How does Job Match work?",
        answer:
          "Select a saved resume and provide the job description. Careerflow compares them and provides a match score, matching skills, missing skills, missing keywords, experience alignment, and recommendations.",
      },
      {
        question: "Does a high score guarantee an interview?",
        answer:
          "No. The score is an informational assessment designed to help you identify alignment and potential improvements. Hiring decisions depend on many factors outside Careerflow.",
      },
    ],
  },
  {
    title: "Cover Letter",
    description:
      "Generate a cover letter based on your real resume information.",
    icon: Mail,
    questions: [
      {
        question: "How is my cover letter generated?",
        answer:
          "Careerflow combines information from your selected saved resume with the job title, company, and job description you provide.",
      },
      {
        question: "Should I customize the generated letter?",
        answer:
          "Yes. Review the final letter and make any personal adjustments you want before submitting it.",
      },
    ],
  },
  {
    
        title: "LinkedIn Analyzer",
        description:
            "Improve the content and recruiter visibility of your LinkedIn profile.",
        icon: LinkIcon,
        questions: [

      {
        question: "What can LinkedIn Analyzer review?",
        answer:
          "LinkedIn Analyzer evaluates profile information such as your headline, About section, experience, skills, keywords, and search visibility based on the content you provide.",
      },
      {
        question: "Can I upload my LinkedIn profile?",
        answer:
          "You can use the supported input options available in LinkedIn Analyzer to provide your profile information for analysis.",
      },
    ],
  },
  {
    title: "Portfolio Analyzer",
    description:
      "Review your professional portfolio and project presentation.",
    icon: FileSearch,
    questions: [
      {
        question: "Can Careerflow analyze my portfolio website?",
        answer:
          "Yes. Portfolio Analyzer can attempt to analyze supported public portfolio URLs. You can also paste portfolio content manually.",
      },
      {
        question: "What does Portfolio Analyzer evaluate?",
        answer:
          "It reviews areas such as presentation, project descriptions, professional positioning, credibility, and recruiter readiness.",
      },
    ],
  },
  {
    title: "Account & Security",
    description:
      "Manage your password, account information, and account deletion.",
    icon: LockKeyhole,
    questions: [
      {
        question: "How do I reset my password?",
        answer:
          "Open Settings and select Reset Password. Careerflow will send password reset instructions to the email associated with your account.",
      },
      {
        question: "Can I permanently delete my account?",
        answer:
          "Yes. Open Settings and go to the Danger Zone. You must confirm the deletion before Careerflow permanently removes your account and associated data.",
      },
      {
        question: "Can account deletion be undone?",
        answer:
          "No. Account deletion is permanent, so make sure you no longer need your saved information before confirming.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Support
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Help Center
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Find answers about Careerflow tools, credits, resumes,
            applications, and account management.
          </p>
        </div>

        {/* HERO */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <CircleHelp className="h-6 w-6 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                How can we help?
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Browse the topics below to learn how Careerflow works and
                get answers to common questions.
              </p>
            </div>
          </div>

        </section>

        {/* HELP SECTIONS */}

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {helpSections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      {section.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {section.description}
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {section.questions.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-slate-800">
                        <div className="flex items-center justify-between gap-4">

                          <span>
                            {item.question}
                          </span>

                          <span className="text-lg font-normal text-slate-400 transition group-open:rotate-45">
                            +
                          </span>

                        </div>
                      </summary>

                      <div className="border-t border-slate-200 px-4 py-4">
                        <p className="text-sm leading-6 text-slate-600">
                          {item.answer}
                        </p>
                      </div>

                    </details>
                  ))}

                </div>

              </section>
            );
          })}

        </div>

        {/* CONTACT */}

        <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-slate-400">
                Still need help?
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Need more assistance?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                If you couldn&apos;t find the answer you were looking for,
                contact our support team.
              </p>
            </div>

            <Link
              href="mailto:support@careerflow.com"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>

          </div>

        </section>

        {/* QUICK LINKS */}

        <section className="mt-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Quick Links
          </p>

          <div className="mt-4 flex flex-wrap gap-3">

            <QuickLink
              href="/dashboard/resume-builder"
              label="Resume Builder"
            />

            <QuickLink
              href="/dashboard/resume-analyzer"
              label="Resume Analyzer"
            />

            <QuickLink
              href="/dashboard/apply"
              label="Apply Copilot"
            />

            <QuickLink
              href="/dashboard/job-match"
              label="Job Match"
            />

            <QuickLink
              href="/dashboard/settings"
              label="Account Settings"
            />

          </div>

        </section>

      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
    >
      {label}
    </Link>
  );
}