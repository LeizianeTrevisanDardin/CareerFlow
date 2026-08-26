"use client";

import { useMemo, useState } from "react";

import { saveResume } from "./actions";
import { jsPDF } from "jspdf";

export type Experience = {
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

type ResumeBuilderClientProps = {
  initialResume?: {
    id: string;
    title: string;
    full_name: string | null;
    job_title: string | null;
    location: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    summary: string | null;
    skills: string[];
    experiences: Experience[];
  } | null;
};

export default function ResumeBuilderClient({
  initialResume,
}: ResumeBuilderClientProps) {
  const [fullName, setFullName] = useState(
    initialResume?.full_name ?? ""
  );

  const [jobTitle, setJobTitle] = useState(
    initialResume?.job_title ?? ""
  );

  const [location, setLocation] = useState(
    initialResume?.location ?? ""
  );

  const [email, setEmail] = useState(
    initialResume?.email ?? ""
  );

  const [phone, setPhone] = useState(
    initialResume?.phone ?? ""
  );

  const [linkedin, setLinkedin] = useState(
    initialResume?.linkedin ?? ""
  );

  const [summary, setSummary] = useState(
    initialResume?.summary ?? ""
  );

  const [skills, setSkills] = useState(
    initialResume?.skills?.join(", ") ?? ""
  );

  const [experiences, setExperiences] =
    useState<Experience[]>(
      initialResume?.experiences?.length
        ? initialResume.experiences
        : [
            {
              company: "",
              jobTitle: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            },
          ]
    );

  const parsedSkills = useMemo(() => {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }, [skills]);

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string | boolean
  ) {
    setExperiences((current) =>
      current.map(
        (experience, experienceIndex) =>
          experienceIndex === index
            ? {
                ...experience,
                [field]: value,
              }
            : experience
      )
    );
  }

  function addExperience() {
    setExperiences((current) => [
      ...current,
      {
        company: "",
        jobTitle: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  }

  function removeExperience(
    index: number
  ) {
    setExperiences((current) =>
      current.filter(
        (_, experienceIndex) =>
          experienceIndex !== index
      )
    );
  }

  function handleDownloadPdf() {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const leftMargin = 48;
  const rightMargin = 48;
  const topMargin = 48;
  const bottomMargin = 48;

  const usableWidth =
    pageWidth -
    leftMargin -
    rightMargin;

  let currentY = topMargin;

  function addPageIfNeeded(
    requiredHeight: number
  ) {
    if (
      currentY +
        requiredHeight >
      pageHeight -
        bottomMargin
    ) {
      pdf.addPage();

      currentY = topMargin;
    }
  }

  function addSectionTitle(
    title: string
  ) {
    addPageIfNeeded(35);

    currentY += 10;

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10.5);

    pdf.text(
      title.toUpperCase(),
      leftMargin,
      currentY
    );

    currentY += 6;

    pdf.setDrawColor(
      210,
      214,
      220
    );

    pdf.setLineWidth(0.6);

    pdf.line(
      leftMargin,
      currentY,
      pageWidth - rightMargin,
      currentY
    );

    currentY += 15;
  }

  function addParagraph(
    text: string,
    options?: {
      bold?: boolean;
      bullet?: boolean;
      fontSize?: number;
    }
  ) {
    if (!text.trim()) {
      return;
    }

    const bullet =
      options?.bullet ?? false;

    const cleanText =
      bullet
        ? `• ${text}`
        : text;

    pdf.setFont(
      "helvetica",
      options?.bold
        ? "bold"
        : "normal"
    );

    pdf.setFontSize(
      options?.fontSize ?? 9.5
    );

    const wrapped =
      pdf.splitTextToSize(
        cleanText,
        bullet
          ? usableWidth - 12
          : usableWidth
      );

    const lineHeight = 13.5;

    const height =
      wrapped.length *
      lineHeight;

    addPageIfNeeded(
      height + 5
    );

    pdf.text(
      wrapped,
      bullet
        ? leftMargin + 10
        : leftMargin,
      currentY
    );

    currentY +=
      height + 4;
  }

  // ======================================
  // NAME
  // ======================================

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(19);

  pdf.text(
    fullName || "Your Name",
    leftMargin,
    currentY
  );

  currentY += 24;

  // ======================================
  // JOB TITLE
  // ======================================

  if (jobTitle) {
    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10.5);

    pdf.text(
      jobTitle,
      leftMargin,
      currentY
    );

    currentY += 15;
  }

  // ======================================
  // CONTACT
  // ======================================

  const contactParts = [
    location,
    email,
    phone,
    linkedin,
  ].filter(Boolean);

  if (
    contactParts.length > 0
  ) {
    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9);

    const contactText =
      contactParts.join(" | ");

    const wrapped =
      pdf.splitTextToSize(
        contactText,
        usableWidth
      );

    pdf.text(
      wrapped,
      leftMargin,
      currentY
    );

    currentY +=
      wrapped.length * 12;
  }

  currentY += 8;

  // ======================================
  // SUMMARY
  // ======================================

  if (summary.trim()) {
    addSectionTitle(
      "Professional Summary"
    );

    addParagraph(summary);
  }

  // ======================================
  // SKILLS
  // ======================================

  if (
    parsedSkills.length > 0
  ) {
    addSectionTitle("Skills");

    parsedSkills.forEach(
      (skill) => {
        addParagraph(
          skill,
          {
            bullet: true,
          }
        );
      }
    );
  }

  // ======================================
  // EXPERIENCE
  // ======================================

  const validExperiences =
    experiences.filter(
      (experience) =>
        experience.company ||
        experience.jobTitle ||
        experience.description
    );

  if (
    validExperiences.length >
    0
  ) {
    addSectionTitle(
      "Professional Experience"
    );

    validExperiences.forEach(
      (experience) => {
        addPageIfNeeded(45);

        const roleLine =
          [
            experience.jobTitle,
            experience.company,
          ]
            .filter(Boolean)
            .join(" - ");

        if (roleLine) {
          addParagraph(
            roleLine,
            {
              bold: true,
              fontSize: 10,
            }
          );
        }

        const locationAndDate = [
          experience.location,
          [
            experience.startDate,
            experience.current
              ? "Present"
              : experience.endDate,
          ]
            .filter(Boolean)
            .join(" - "),
        ]
          .filter(Boolean)
          .join(" | ");

        if (
          locationAndDate
        ) {
          addParagraph(
            locationAndDate,
            {
              fontSize: 9,
            }
          );
        }

        const descriptionLines =
          experience.description
            .split("\n")
            .map((line) =>
              line.trim()
            )
            .filter(Boolean);

        descriptionLines.forEach(
          (line) => {
            const cleaned =
              line.replace(
                /^[-•*]\s*/,
                ""
              );

            addParagraph(
              cleaned,
              {
                bullet: true,
              }
            );
          }
        );

        currentY += 6;
      }
    );
  }

  // ======================================
  // FILE NAME
  // ======================================

  const safeName =
    (
      fullName ||
      "resume"
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  pdf.save(
    `${safeName || "resume"}.pdf`
  );
}

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Resume Builder
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Build your resume
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Create a clean, ATS-friendly resume and preview it as you build.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Download PDF
          </button>

        </div>
        {/* MAIN GRID */}

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

          {/* ======================================
              LEFT SIDE
          ====================================== */}

          <div className="space-y-6">

            {/* PERSONAL INFORMATION */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Personal information
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your full name"
                />

                <Field
                  label="Job title"
                  value={jobTitle}
                  onChange={setJobTitle}
                  placeholder="e.g. Software Developer"
                />

                <Field
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="e.g. Calgary, Canada"
                />

                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@email.com"
                  type="email"
                />

                <Field
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+1 403..."
                />

                <Field
                  label="LinkedIn"
                  value={linkedin}
                  onChange={setLinkedin}
                  placeholder="linkedin.com/in/..."
                />

              </div>
            </section>

            {/* PROFESSIONAL SUMMARY */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Professional summary
              </h2>

              <textarea
                value={summary}
                onChange={(event) =>
                  setSummary(
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Write a short summary of your professional background..."
                className="mt-5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </section>

            {/* SKILLS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Skills
              </h2>

              <input
                value={skills}
                onChange={(event) =>
                  setSkills(
                    event.target.value
                  )
                }
                placeholder="React, TypeScript, Next.js, Git"
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate skills with commas.
              </p>
            </section>

            {/* PROFESSIONAL EXPERIENCE */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Professional experience
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add your most relevant work experience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addExperience}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Add experience
                </button>

              </div>

              <div className="mt-6 space-y-6">

                {experiences.map(
                  (experience, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Field
                          label="Company"
                          value={
                            experience.company
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "company",
                              value
                            )
                          }
                          placeholder="Company name"
                        />

                        <Field
                          label="Job title"
                          value={
                            experience.jobTitle
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "jobTitle",
                              value
                            )
                          }
                          placeholder="Your role"
                        />

                        <Field
                          label="Location"
                          value={
                            experience.location
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "location",
                              value
                            )
                          }
                          placeholder="City, Country"
                        />

                        <div className="grid grid-cols-2 gap-3">

                          <Field
                            label="Start date"
                            value={
                              experience.startDate
                            }
                            onChange={(value) =>
                              updateExperience(
                                index,
                                "startDate",
                                value
                              )
                            }
                            type="month"
                          />

                          <Field
                            label="End date"
                            value={
                              experience.endDate
                            }
                            onChange={(value) =>
                              updateExperience(
                                index,
                                "endDate",
                                value
                              )
                            }
                            type="month"
                            disabled={
                              experience.current
                            }
                          />

                        </div>

                      </div>

                      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">

                        <input
                          type="checkbox"
                          checked={
                            experience.current
                          }
                          onChange={(event) =>
                            updateExperience(
                              index,
                              "current",
                              event.target.checked
                            )
                          }
                        />

                        I currently work here
                      </label>

                      <textarea
                        value={
                          experience.description
                        }
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe your responsibilities and achievements..."
                        className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                      />

                      {experiences.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeExperience(
                              index
                            )
                          }
                          className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove experience
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>
            </section>

            {/* ======================================
                SAVE RESUME
            ====================================== */}

            <form action={saveResume}>

              <input
                type="hidden"
                name="resumeId"
                value={
                  initialResume?.id ?? ""
                }
              />

              <input
                type="hidden"
                name="fullName"
                value={fullName}
              />

              <input
                type="hidden"
                name="jobTitle"
                value={jobTitle}
              />

              <input
                type="hidden"
                name="location"
                value={location}
              />

              <input
                type="hidden"
                name="email"
                value={email}
              />

              <input
                type="hidden"
                name="phone"
                value={phone}
              />

              <input
                type="hidden"
                name="linkedin"
                value={linkedin}
              />

              <input
                type="hidden"
                name="summary"
                value={summary}
              />

              <input
                type="hidden"
                name="skills"
                value={JSON.stringify(
                  parsedSkills
                )}
              />

              <input
                type="hidden"
                name="experiences"
                value={JSON.stringify(
                  experiences
                )}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {initialResume
                  ? "Save Changes"
                  : "Save Resume"}
              </button>

            </form>

          </div>

          {/* ======================================
              RIGHT SIDE - PREVIEW
          ====================================== */}

          <div className="xl:sticky xl:top-6 xl:self-start">

            <div className="rounded-3xl border border-slate-200 bg-slate-100 p-3 sm:p-5">

              <div className="mx-auto min-h-[900px] w-full max-w-[850px] bg-white px-6 py-8 shadow-sm sm:px-10 lg:px-12 lg:py-12">

                {/* NAME */}

                {fullName ? (
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    {fullName}
                  </h1>
                ) : (
                  <h1 className="text-3xl font-bold text-slate-300">
                    Your Name
                  </h1>
                )}

                {/* JOB TITLE */}

                {jobTitle && (
                  <p className="mt-2 text-base font-medium text-slate-700">
                    {jobTitle}
                  </p>
                )}

                {/* CONTACT */}

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">

                  {location && (
                    <span>
                      {location}
                    </span>
                  )}

                  {email && (
                    <span>
                      {email}
                    </span>
                  )}

                  {phone && (
                    <span>
                      {phone}
                    </span>
                  )}

                  {linkedin && (
                    <span>
                      {linkedin}
                    </span>
                  )}

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

                {parsedSkills.length >
                  0 && (
                  <ResumeSection title="Skills">

                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-700">

                      {parsedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </ResumeSection>
                )}

                {/* EXPERIENCE */}

                {experiences.some(
                  (experience) =>
                    experience.company ||
                    experience.jobTitle ||
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
                                      {
                                        experience.jobTitle
                                      }
                                    </p>
                                  )}

                                  <p className="text-sm text-slate-600">
                                    {[
                                      experience.company,
                                      experience.location,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </p>

                                </div>

                                {(experience.startDate ||
                                  experience.endDate ||
                                  experience.current) && (
                                  <p className="text-sm text-slate-500">

                                    {
                                      experience.startDate
                                    }

                                    {experience.startDate
                                      ? " – "
                                      : ""}

                                    {experience.current
                                      ? "Present"
                                      : experience.endDate}

                                  </p>
                                )}

                              </div>

                              {experience.description && (
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {
                                    experience.description
                                  }
                                </p>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>

                  </ResumeSection>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}


// ======================================================
// FIELD
// ======================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
      />

    </div>
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