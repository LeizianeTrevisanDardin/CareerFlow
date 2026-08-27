import type {
  Education,
  Experience,
  Project,
  SkillSection,
} from "./types";

type ResumePreviewProps = {
  fullName: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skillSections: SkillSection[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  additionalQualifications: string[];
};

export default function ResumePreview({
  fullName,
  jobTitle,
  location,
  email,
  phone,
  linkedin,
  github,
  portfolio,
  summary,
  skillSections,
  experiences,
  education,
  projects,
  additionalQualifications,
}: ResumePreviewProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto min-h-[900px] w-full max-w-[850px] bg-white px-6 py-8 shadow-sm sm:px-10 lg:px-12 lg:py-12">

        {/* HEADER */}

        {fullName ? (
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {fullName}
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-slate-300">
            Your Name
          </h1>
        )}

        {jobTitle && (
          <p className="mt-2 text-base font-medium text-slate-700">
            {jobTitle}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
          {location && <span>{location}</span>}
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {linkedin && <span>{linkedin}</span>}
          {github && <span>{github}</span>}
          {portfolio && <span>{portfolio}</span>}
        </div>

        {/* SUMMARY */}

        {summary && (
          <ResumeSection title="Professional Summary">
            <p className="text-sm leading-6 text-slate-700">
              {summary}
            </p>
          </ResumeSection>
        )}

        {/* SKILLS */}

        {skillSections.some(
          (section) =>
            section.category.trim() ||
            section.skills.length > 0
        ) && (
          <ResumeSection title="Technical Skills">
            <div className="space-y-3">
              {skillSections.map((section, index) => {
                if (
                  !section.category.trim() &&
                  section.skills.length === 0
                ) {
                  return null;
                }

                return (
                  <div key={index}>
                    {section.category && (
                      <p className="text-sm font-semibold text-slate-900">
                        {section.category}
                      </p>
                    )}

                    {section.skills.length > 0 && (
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {section.skills.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ResumeSection>
        )}

        {/* EXPERIENCE */}

        {experiences.some(
          (experience) =>
            experience.company ||
            experience.jobTitle ||
            experience.project ||
            experience.description
        ) && (
          <ResumeSection title="Professional Experience">
            <div className="space-y-6">
              {experiences.map((experience, index) => {
                if (
                  !experience.company &&
                  !experience.jobTitle &&
                  !experience.project &&
                  !experience.description
                ) {
                  return null;
                }

                return (
                  <div key={index}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        {experience.jobTitle && (
                          <p className="font-semibold text-slate-900">
                            {experience.jobTitle}
                          </p>
                        )}

                        <p className="text-sm text-slate-600">
                          {[
                            experience.company,
                            experience.project,
                            experience.location,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>

                      {(experience.startDate ||
                        experience.endDate ||
                        experience.current) && (
                        <p className="shrink-0 text-sm text-slate-500">
                          {formatMonth(
                            experience.startDate
                          )}

                          {experience.startDate
                            ? " – "
                            : ""}

                          {experience.current
                            ? "Present"
                            : formatMonth(
                                experience.endDate
                              )}
                        </p>
                      )}

                    </div>

                    {experience.description && (
                      <BulletList
                        text={experience.description}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ResumeSection>
        )}

        {/* EDUCATION */}

        {education.some(
          (item) =>
            item.school ||
            item.degree ||
            item.coursework
        ) && (
          <ResumeSection title="Education">
            <div className="space-y-6">
              {education.map((item, index) => {
                if (
                  !item.school &&
                  !item.degree &&
                  !item.coursework
                ) {
                  return null;
                }

                return (
                  <div key={index}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        {item.school && (
                          <p className="font-semibold text-slate-900">
                            {item.school}
                          </p>
                        )}

                        {item.degree && (
                          <p className="text-sm text-slate-700">
                            {item.degree}
                          </p>
                        )}

                        {item.location && (
                          <p className="text-sm text-slate-500">
                            {item.location}
                          </p>
                        )}
                      </div>

                      {(item.startDate ||
                        item.endDate ||
                        item.current) && (
                        <p className="shrink-0 text-sm text-slate-500">
                          {formatMonth(
                            item.startDate
                          )}

                          {item.startDate
                            ? " – "
                            : ""}

                          {item.current
                            ? "Present"
                            : formatMonth(
                                item.endDate
                              )}
                        </p>
                      )}

                    </div>

                    {item.coursework && (
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        <span className="font-semibold">
                          Relevant coursework:
                        </span>{" "}
                        {item.coursework}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ResumeSection>
        )}

        {/* PROJECTS */}

        {projects.some(
          (project) =>
            project.name ||
            project.description ||
            project.bullets
        ) && (
          <ResumeSection title="Projects">
            <div className="space-y-6">
              {projects.map((project, index) => {
                if (
                  !project.name &&
                  !project.description &&
                  !project.bullets
                ) {
                  return null;
                }

                return (
                  <div key={index}>
                    {project.name && (
                      <p className="font-semibold text-slate-900">
                        {project.name}
                      </p>
                    )}

                    {project.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {project.description}
                      </p>
                    )}

                    {project.bullets && (
                      <BulletList
                        text={project.bullets}
                      />
                    )}

                    {project.technologies && (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">
                          Technologies:
                        </span>{" "}
                        {project.technologies}
                      </p>
                    )}

                    {(project.projectUrl ||
                      project.githubUrl) && (
                      <p className="mt-2 text-sm text-slate-500">
                        {[
                          project.projectUrl,
                          project.githubUrl,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ResumeSection>
        )}

        {/* ADDITIONAL QUALIFICATIONS */}

        {additionalQualifications.length >
          0 && (
          <ResumeSection title="Additional Qualifications">
            <ul className="space-y-2 text-sm leading-6 text-slate-700">
              {additionalQualifications.map(
                (item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-2"
                  >
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </ResumeSection>
        )}

      </div>
    </div>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="border-b border-slate-300 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-950">
          {title}
        </h2>
      </div>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}

function BulletList({
  text,
}: {
  text: string;
}) {
  const lines = text
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^[-•*]\s*/, "")
    )
    .filter(Boolean);

  return (
    <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
      {lines.map((line, index) => (
        <li
          key={`${line}-${index}`}
          className="flex gap-2"
        >
          <span>•</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function formatMonth(
  value: string
) {
  if (!value) {
    return "";
  }

  const [
    year,
    month,
  ] = value.split("-");

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  ).format(date);
}