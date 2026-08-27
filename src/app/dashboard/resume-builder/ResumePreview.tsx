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

        {/* ======================================
            HEADER
        ====================================== */}

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

        {/* ======================================
            CONTACT INFORMATION
        ====================================== */}

        <ContactRow
          location={location}
          phone={phone}
          email={email}
          linkedin={linkedin}
          github={github}
          portfolio={portfolio}
        />

        {/* ======================================
            PROFESSIONAL SUMMARY
        ====================================== */}

        {summary && (
          <ResumeSection title="Professional Summary">
            <p className="text-sm leading-6 text-slate-700">
              {summary}
            </p>
          </ResumeSection>
        )}

        {/* ======================================
            TECHNICAL SKILLS
        ====================================== */}

        {skillSections.some(
          (section) =>
            section.category.trim() ||
            section.skills.length > 0
        ) && (
          <ResumeSection title="Technical Skills">
            <div className="space-y-3">
              {skillSections.map(
                (
                  section,
                  index
                ) => {
                  if (
                    !section.category.trim() &&
                    section.skills.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                    >
                      {section.category && (
                        <p className="text-sm font-semibold text-slate-900">
                          {section.category}
                        </p>
                      )}

                      {section.skills.length >
                        0 && (
                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {section.skills.join(
                            ", "
                          )}
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </ResumeSection>
        )}

        {/* ======================================
            PROFESSIONAL EXPERIENCE
        ====================================== */}

        {experiences.some(
          (experience) =>
            experience.company ||
            experience.jobTitle ||
            experience.project ||
            experience.description
        ) && (
          <ResumeSection title="Professional Experience">
            <div className="space-y-6">

              {experiences.map(
                (
                  experience,
                  index
                ) => {
                  if (
                    !experience.company &&
                    !experience.jobTitle &&
                    !experience.project &&
                    !experience.description
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                    >

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
                              .filter(
                                Boolean
                              )
                              .join(
                                " · "
                              )}
                          </p>

                        </div>

                        {(experience.startDate ||
                          experience.endDate ||
                          experience.current) && (
                          <p className="shrink-0 text-sm text-slate-500">
                            {formatDateRange(
                              experience.startDate,
                              experience.endDate,
                              experience.current
                            )}
                          </p>
                        )}

                      </div>

                      {experience.description && (
                        <BulletList
                          text={
                            experience.description
                          }
                        />
                      )}

                    </div>
                  );
                }
              )}

            </div>
          </ResumeSection>
        )}

        {/* ======================================
            EDUCATION
        ====================================== */}

        {education.some(
          (item) =>
            item.school ||
            item.degree ||
            item.coursework
        ) && (
          <ResumeSection title="Education">
            <div className="space-y-6">

              {education.map(
                (
                  item,
                  index
                ) => {
                  if (
                    !item.school &&
                    !item.degree &&
                    !item.coursework
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                    >

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
                            {formatDateRange(
                              item.startDate,
                              item.endDate,
                              item.current
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
                }
              )}

            </div>
          </ResumeSection>
        )}

        {/* ======================================
            PROJECTS
        ====================================== */}

        {projects.some(
          (project) =>
            project.name ||
            project.description ||
            project.bullets
        ) && (
          <ResumeSection title="Projects">
            <div className="space-y-6">

              {projects.map(
                (
                  project,
                  index
                ) => {
                  if (
                    !project.name &&
                    !project.description &&
                    !project.bullets
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                    >

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
                          text={
                            project.bullets
                          }
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
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">

                          {project.projectUrl && (
                            <a
                              href={normalizeUrl(
                                project.projectUrl
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-600 transition hover:text-emerald-700 hover:underline"
                            >
                              Live Project
                            </a>
                          )}

                          {project.projectUrl &&
                            project.githubUrl && (
                              <span className="text-slate-400">
                                |
                              </span>
                            )}

                          {project.githubUrl && (
                            <a
                              href={normalizeUrl(
                                project.githubUrl
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-600 transition hover:text-emerald-700 hover:underline"
                            >
                              GitHub
                            </a>
                          )}

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          </ResumeSection>
        )}

        {/* ======================================
            ADDITIONAL QUALIFICATIONS
        ====================================== */}

        {additionalQualifications.length >
          0 && (
          <ResumeSection title="Additional Qualifications">

            <ul className="space-y-2 text-sm leading-6 text-slate-700">

              {additionalQualifications.map(
                (
                  item,
                  index
                ) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-2"
                  >
                    <span>
                      •
                    </span>

                    <span>
                      {item}
                    </span>
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

// ======================================================
// CONTACT ROW
// ======================================================

function ContactRow({
  location,
  phone,
  email,
  linkedin,
  github,
  portfolio,
}: {
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
}) {
  const hasPreviousBeforePhone =
    Boolean(
      location
    );

  const hasPreviousBeforeEmail =
    Boolean(
      location ||
      phone
    );

  const hasPreviousBeforeLinkedin =
    Boolean(
      location ||
      phone ||
      email
    );

  const hasPreviousBeforeGithub =
    Boolean(
      location ||
      phone ||
      email ||
      linkedin
    );

  const hasPreviousBeforePortfolio =
    Boolean(
      location ||
      phone ||
      email ||
      linkedin ||
      github
    );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">

      {location && (
        <span>
          {location}
        </span>
      )}

      {phone && (
        <>
          {hasPreviousBeforePhone && (
            <Separator />
          )}

          <a
            href={`tel:${cleanPhoneForLink(
              phone
            )}`}
            className="transition hover:text-emerald-700 hover:underline"
          >
            {phone}
          </a>
        </>
      )}

      {email && (
        <>
          {hasPreviousBeforeEmail && (
            <Separator />
          )}

          <a
            href={`mailto:${email}`}
            className="transition hover:text-emerald-700 hover:underline"
          >
            {email}
          </a>
        </>
      )}

      {linkedin && (
        <>
          {hasPreviousBeforeLinkedin && (
            <Separator />
          )}

          <a
            href={normalizeUrl(
              linkedin
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 transition hover:text-emerald-700 hover:underline"
          >
            LinkedIn
          </a>
        </>
      )}

      {github && (
        <>
          {hasPreviousBeforeGithub && (
            <Separator />
          )}

          <a
            href={normalizeUrl(
              github
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 transition hover:text-emerald-700 hover:underline"
          >
            GitHub
          </a>
        </>
      )}

      {portfolio && (
        <>
          {hasPreviousBeforePortfolio && (
            <Separator />
          )}

          <a
            href={normalizeUrl(
              portfolio
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 transition hover:text-emerald-700 hover:underline"
          >
            Portfolio
          </a>
        </>
      )}

    </div>
  );
}

function Separator() {
  return (
    <span
      aria-hidden="true"
      className="text-slate-300"
    >
      |
    </span>
  );
}

// ======================================================
// RESUME SECTION
// ======================================================

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

// ======================================================
// BULLET LIST
// ======================================================

function BulletList({
  text,
}: {
  text: string;
}) {
  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line
            .trim()
            .replace(
              /^[-•*]\s*/,
              ""
            )
      )
      .filter(Boolean);

  return (
    <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-700">

      {lines.map(
        (
          line,
          index
        ) => (
          <li
            key={`${line}-${index}`}
            className="flex gap-2"
          >
            <span>
              •
            </span>

            <span>
              {line}
            </span>
          </li>
        )
      )}

    </ul>
  );
}

// ======================================================
// URL HELPERS
// ======================================================

function normalizeUrl(
  value: string
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith(
      "http://"
    ) ||
    trimmed.startsWith(
      "https://"
    )
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function cleanPhoneForLink(
  value: string
) {
  return value.replace(
    /[^\d+]/g,
    ""
  );
}

// ======================================================
// DATE HELPERS
// ======================================================

function formatDateRange(
  startDate: string,
  endDate: string,
  current: boolean
) {
  const start =
    formatMonth(
      startDate
    );

  const end =
    current
      ? "Present"
      : formatMonth(
          endDate
        );

  if (
    start &&
    end
  ) {
    return `${start} – ${end}`;
  }

  return (
    start ||
    end
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
  ] = value.split(
    "-"
  );

  const date =
    new Date(
      Number(
        year
      ),
      Number(
        month
      ) - 1,
      1
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      year:
        "numeric",
    }
  ).format(
    date
  );
}