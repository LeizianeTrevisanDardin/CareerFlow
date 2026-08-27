"use client";

import {
  useState,
} from "react";

import {
  saveResume,
} from "./actions";

import {
  downloadResumePdf,
} from "./resume-pdf";

import ResumePreview from "./ResumePreview";

import type {
  Education,
  Experience,
  Project,
  ResumeData,
  SkillSection,
} from "./types";

// ======================================================
// PROPS
// ======================================================

type ResumeBuilderClientProps = {
  initialResume?: {
    id: string;
    title: string;

    full_name:
      string | null;

    job_title:
      string | null;

    location:
      string | null;

    email:
      string | null;

    phone:
      string | null;

    linkedin:
      string | null;

    github:
      string | null;

    portfolio:
      string | null;

    summary:
      string | null;

    skills:
      string[];

    skill_sections:
      SkillSection[];

    experiences:
      Experience[];

    education:
      Education[];

    projects:
      Project[];

    additional_qualifications:
      string[];
  } | null;
};

// ======================================================
// COMPONENT
// ======================================================

export default function ResumeBuilderClient({
  initialResume,
}: ResumeBuilderClientProps) {

  // ====================================================
  // BASIC INFORMATION
  // ====================================================

  const [
    title,
    setTitle,
  ] = useState(
    initialResume?.title ??
      "My Resume"
  );

  const [
    fullName,
    setFullName,
  ] = useState(
    initialResume?.full_name ??
      ""
  );

  const [
    jobTitle,
    setJobTitle,
  ] = useState(
    initialResume?.job_title ??
      ""
  );

  const [
    location,
    setLocation,
  ] = useState(
    initialResume?.location ??
      ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    initialResume?.email ??
      ""
  );

  const [
    phone,
    setPhone,
  ] = useState(
    initialResume?.phone ??
      ""
  );

  const [
    linkedin,
    setLinkedin,
  ] = useState(
    initialResume?.linkedin ??
      ""
  );

  const [
    github,
    setGithub,
  ] = useState(
    initialResume?.github ??
      ""
  );

  const [
    portfolio,
    setPortfolio,
  ] = useState(
    initialResume?.portfolio ??
      ""
  );

  const [
    summary,
    setSummary,
  ] = useState(
    initialResume?.summary ??
      ""
  );

  // ====================================================
  // SKILLS
  // ====================================================

  const [
    skillSections,
    setSkillSections,
  ] =
    useState<SkillSection[]>(
      initialResume
        ?.skill_sections
        ?.length
        ? initialResume.skill_sections
        : [
            {
              category:
                "",
              skills:
                [],
            },
          ]
    );

  // ====================================================
  // EXPERIENCES
  // ====================================================

  const [
    experiences,
    setExperiences,
  ] =
    useState<Experience[]>(
      initialResume
        ?.experiences
        ?.length
        ? initialResume.experiences.map(
            (
              experience
            ) => ({
              ...experience,

              project:
                experience.project ??
                "",
            })
          )
        : [
            {
              company:
                "",

              jobTitle:
                "",

              project:
                "",

              location:
                "",

              startDate:
                "",

              endDate:
                "",

              current:
                false,

              description:
                "",
            },
          ]
    );

  // ====================================================
  // EDUCATION
  // ====================================================

  const [
    education,
    setEducation,
  ] =
    useState<Education[]>(
      initialResume
        ?.education
        ?.length
        ? initialResume.education
        : [
            {
              school:
                "",

              degree:
                "",

              location:
                "",

              startDate:
                "",

              endDate:
                "",

              current:
                false,

              coursework:
                "",
            },
          ]
    );

  // ====================================================
  // PROJECTS
  // ====================================================

  const [
    projects,
    setProjects,
  ] =
    useState<Project[]>(
      initialResume
        ?.projects
        ?.length
        ? initialResume.projects
        : [
            {
              name:
                "",

              description:
                "",

              technologies:
                "",

              bullets:
                "",

              projectUrl:
                "",

              githubUrl:
                "",
            },
          ]
    );

  // ====================================================
  // ADDITIONAL QUALIFICATIONS
  // ====================================================

  const [
    additionalQualifications,
    setAdditionalQualifications,
  ] = useState(
    initialResume
      ?.additional_qualifications
      ?.join("\n") ??
      ""
  );

  // ====================================================
  // DERIVED DATA
  // ====================================================

  const parsedAdditionalQualifications =
    additionalQualifications
      .split("\n")
      .map(
        (item) =>
          item
            .replace(
              /^[-•*]\s*/,
              ""
            )
            .trim()
      )
      .filter(Boolean);

  const legacySkills =
    skillSections
      .flatMap(
        (section) =>
          section.skills
      )
      .filter(Boolean);

  // ====================================================
  // SKILL FUNCTIONS
  // ====================================================

  function updateSkillCategory(
    index: number,
    value: string
  ) {
    setSkillSections(
      (current) =>
        current.map(
          (
            section,
            sectionIndex
          ) =>
            sectionIndex ===
            index
              ? {
                  ...section,

                  category:
                    value,
                }
              : section
        )
    );
  }

  function updateSkillValues(
    index: number,
    value: string
  ) {
    const skills =
      value
        .split(",")
        .map(
          (skill) =>
            skill.trim()
        )
        .filter(Boolean);

    setSkillSections(
      (current) =>
        current.map(
          (
            section,
            sectionIndex
          ) =>
            sectionIndex ===
            index
              ? {
                  ...section,

                  skills,
                }
              : section
        )
    );
  }

  function addSkillSection() {
    setSkillSections(
      (current) => [
        ...current,

        {
          category:
            "",

          skills:
            [],
        },
      ]
    );
  }

  function removeSkillSection(
    index: number
  ) {
    setSkillSections(
      (current) =>
        current.filter(
          (
            _,
            sectionIndex
          ) =>
            sectionIndex !==
            index
        )
    );
  }

  // ====================================================
  // EXPERIENCE FUNCTIONS
  // ====================================================

  function updateExperience(
    index: number,
    field:
      keyof Experience,
    value:
      string | boolean
  ) {
    setExperiences(
      (current) =>
        current.map(
          (
            experience,
            experienceIndex
          ) =>
            experienceIndex ===
            index
              ? {
                  ...experience,

                  [field]:
                    value,
                }
              : experience
        )
    );
  }

  function addExperience() {
    setExperiences(
      (current) => [
        ...current,

        {
          company:
            "",

          jobTitle:
            "",

          project:
            "",

          location:
            "",

          startDate:
            "",

          endDate:
            "",

          current:
            false,

          description:
            "",
        },
      ]
    );
  }

  function removeExperience(
    index: number
  ) {
    setExperiences(
      (current) =>
        current.filter(
          (
            _,
            experienceIndex
          ) =>
            experienceIndex !==
            index
        )
    );
  }

  // ====================================================
  // EDUCATION FUNCTIONS
  // ====================================================

  function updateEducation(
    index: number,
    field:
      keyof Education,
    value:
      string | boolean
  ) {
    setEducation(
      (current) =>
        current.map(
          (
            item,
            educationIndex
          ) =>
            educationIndex ===
            index
              ? {
                  ...item,

                  [field]:
                    value,
                }
              : item
        )
    );
  }

  function addEducation() {
    setEducation(
      (current) => [
        ...current,

        {
          school:
            "",

          degree:
            "",

          location:
            "",

          startDate:
            "",

          endDate:
            "",

          current:
            false,

          coursework:
            "",
        },
      ]
    );
  }

  function removeEducation(
    index: number
  ) {
    setEducation(
      (current) =>
        current.filter(
          (
            _,
            educationIndex
          ) =>
            educationIndex !==
            index
        )
    );
  }

  // ====================================================
  // PROJECT FUNCTIONS
  // ====================================================

  function updateProject(
    index: number,
    field:
      keyof Project,
    value: string
  ) {
    setProjects(
      (current) =>
        current.map(
          (
            project,
            projectIndex
          ) =>
            projectIndex ===
            index
              ? {
                  ...project,

                  [field]:
                    value,
                }
              : project
        )
    );
  }

  function addProject() {
    setProjects(
      (current) => [
        ...current,

        {
          name:
            "",

          description:
            "",

          technologies:
            "",

          bullets:
            "",

          projectUrl:
            "",

          githubUrl:
            "",
        },
      ]
    );
  }

  function removeProject(
    index: number
  ) {
    setProjects(
      (current) =>
        current.filter(
          (
            _,
            projectIndex
          ) =>
            projectIndex !==
            index
        )
    );
  }

  // ====================================================
  // DOWNLOAD PDF
  // ====================================================

  function handleDownloadPdf() {
    const resumeData:
      ResumeData = {
      id:
        initialResume?.id,

      title,

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

      additionalQualifications:
        parsedAdditionalQualifications,
    };

    downloadResumePdf(
      resumeData
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="w-full max-w-7xl">

        {/* ====================================
            HEADER
        ==================================== */}

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
            onClick={
              handleDownloadPdf
            }
            className="w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Download PDF
          </button>

        </div>

        {/* ====================================
            MAIN GRID
        ==================================== */}

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

          {/* ==================================
              LEFT SIDE
          ================================== */}

          <div className="space-y-6">

            {/* ==================================
                RESUME DETAILS
            ================================== */}

            <Section>

              <SectionHeader
                title="Resume details"
                description="Give this resume a name so you can identify it later."
              />

              <div className="mt-5">

                <Field
                  label="Resume name"
                  value={title}
                  onChange={
                    setTitle
                  }
                  placeholder="e.g. Software Developer Resume"
                />

              </div>

            </Section>

            {/* ==================================
                PERSONAL INFORMATION
            ================================== */}

            <Section>

              <SectionHeader
                title="Personal information"
                description="Add your contact and professional profile information."
              />

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field
                  label="Full name"
                  value={
                    fullName
                  }
                  onChange={
                    setFullName
                  }
                  placeholder="Your full name"
                />

                <Field
                  label="Job title"
                  value={
                    jobTitle
                  }
                  onChange={
                    setJobTitle
                  }
                  placeholder="e.g. Software Developer"
                />

                <Field
                  label="Location"
                  value={
                    location
                  }
                  onChange={
                    setLocation
                  }
                  placeholder="e.g. Calgary, AB"
                />

                <Field
                  label="Email"
                  value={
                    email
                  }
                  onChange={
                    setEmail
                  }
                  placeholder="you@email.com"
                  type="email"
                />

                <Field
                  label="Phone"
                  value={
                    phone
                  }
                  onChange={
                    setPhone
                  }
                  placeholder="+1 403..."
                />

                <Field
                  label="LinkedIn"
                  value={
                    linkedin
                  }
                  onChange={
                    setLinkedin
                  }
                  placeholder="linkedin.com/in/..."
                />

                <Field
                  label="GitHub"
                  value={
                    github
                  }
                  onChange={
                    setGithub
                  }
                  placeholder="github.com/..."
                />

                <Field
                  label="Portfolio"
                  value={
                    portfolio
                  }
                  onChange={
                    setPortfolio
                  }
                  placeholder="yourportfolio.com"
                />

              </div>

            </Section>

            {/* ==================================
                SUMMARY
            ================================== */}

            <Section>

              <SectionHeader
                title="Professional summary"
                description="Write a concise introduction highlighting your experience and strengths."
              />

              <textarea
                value={
                  summary
                }
                onChange={(
                  event
                ) =>
                  setSummary(
                    event.target
                      .value
                  )
                }
                rows={7}
                placeholder="Write a short summary of your professional background..."
                className="mt-5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
              />

            </Section>

            {/* ==================================
                TECHNICAL SKILLS
            ================================== */}

            <Section>

              <SectionHeaderWithButton
                title="Technical skills"
                description="Organize your skills into categories to improve readability."
                buttonText="Add category"
                onClick={
                  addSkillSection
                }
              />

              <div className="mt-6 space-y-5">

                {skillSections.map(
                  (
                    section,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <Field
                        label="Category"
                        value={
                          section.category
                        }
                        onChange={(
                          value
                        ) =>
                          updateSkillCategory(
                            index,
                            value
                          )
                        }
                        placeholder="e.g. Scripting & Programming"
                      />

                      <div className="mt-4">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Skills
                        </label>

                        <input
                          value={
                            section.skills.join(
                              ", "
                            )
                          }
                          onChange={(
                            event
                          ) =>
                            updateSkillValues(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="PowerShell, C#, Java, TypeScript"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Separate skills with commas.
                        </p>

                      </div>

                      {skillSections.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            removeSkillSection(
                              index
                            )
                          }
                          className="mt-4 text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove category
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </Section>

            {/* ==================================
                EXPERIENCE
            ================================== */}

            <Section>

              <SectionHeaderWithButton
                title="Professional experience"
                description="Add your most relevant work experience."
                buttonText="Add experience"
                onClick={
                  addExperience
                }
              />

              <div className="mt-6 space-y-6">

                {experiences.map(
                  (
                    experience,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Field
                          label="Company / Organization"
                          value={
                            experience.company
                          }
                          onChange={(
                            value
                          ) =>
                            updateExperience(
                              index,
                              "company",
                              value
                            )
                          }
                          placeholder="Company or organization"
                        />

                        <Field
                          label="Job title"
                          value={
                            experience.jobTitle
                          }
                          onChange={(
                            value
                          ) =>
                            updateExperience(
                              index,
                              "jobTitle",
                              value
                            )
                          }
                          placeholder="Your role"
                        />

                        <Field
                          label="Project / Initiative"
                          value={
                            experience.project
                          }
                          onChange={(
                            value
                          ) =>
                            updateExperience(
                              index,
                              "project",
                              value
                            )
                          }
                          placeholder="e.g. Financial Web Application"
                        />

                        <Field
                          label="Location"
                          value={
                            experience.location
                          }
                          onChange={(
                            value
                          ) =>
                            updateExperience(
                              index,
                              "location",
                              value
                            )
                          }
                          placeholder="City, Country or Remote"
                        />

                        <Field
                          label="Start date"
                          value={
                            experience.startDate
                          }
                          onChange={(
                            value
                          ) =>
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
                          onChange={(
                            value
                          ) =>
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

                      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">

                        <input
                          type="checkbox"
                          checked={
                            experience.current
                          }
                          onChange={(
                            event
                          ) =>
                            updateExperience(
                              index,
                              "current",
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        I currently work here

                      </label>

                      <div className="mt-4">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Responsibilities & achievements
                        </label>

                        <textarea
                          value={
                            experience.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateExperience(
                              index,
                              "description",
                              event
                                .target
                                .value
                            )
                          }
                          rows={7}
                          placeholder={`Add one achievement per line.\n- Developed...\n- Collaborated...\n- Improved...`}
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Use one responsibility or achievement per line.
                        </p>

                      </div>

                      {experiences.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            removeExperience(
                              index
                            )
                          }
                          className="mt-4 text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove experience
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </Section>

            {/* ==================================
                EDUCATION
            ================================== */}

            <Section>

              <SectionHeaderWithButton
                title="Education"
                description="Add your degree, diploma, certification, or relevant education."
                buttonText="Add education"
                onClick={
                  addEducation
                }
              />

              <div className="mt-6 space-y-6">

                {education.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Field
                          label="School"
                          value={
                            item.school
                          }
                          onChange={(
                            value
                          ) =>
                            updateEducation(
                              index,
                              "school",
                              value
                            )
                          }
                          placeholder="School or institution"
                        />

                        <Field
                          label="Program / Degree"
                          value={
                            item.degree
                          }
                          onChange={(
                            value
                          ) =>
                            updateEducation(
                              index,
                              "degree",
                              value
                            )
                          }
                          placeholder="e.g. Software Development Diploma"
                        />

                        <Field
                          label="Location"
                          value={
                            item.location
                          }
                          onChange={(
                            value
                          ) =>
                            updateEducation(
                              index,
                              "location",
                              value
                            )
                          }
                          placeholder="e.g. Calgary, AB"
                        />

                        <div />

                        <Field
                          label="Start date"
                          value={
                            item.startDate
                          }
                          onChange={(
                            value
                          ) =>
                            updateEducation(
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
                            item.endDate
                          }
                          onChange={(
                            value
                          ) =>
                            updateEducation(
                              index,
                              "endDate",
                              value
                            )
                          }
                          type="month"
                          disabled={
                            item.current
                          }
                        />

                      </div>

                      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">

                        <input
                          type="checkbox"
                          checked={
                            item.current
                          }
                          onChange={(
                            event
                          ) =>
                            updateEducation(
                              index,
                              "current",
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        I currently study here

                      </label>

                      <div className="mt-4">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Relevant coursework
                        </label>

                        <textarea
                          value={
                            item.coursework
                          }
                          onChange={(
                            event
                          ) =>
                            updateEducation(
                              index,
                              "coursework",
                              event
                                .target
                                .value
                            )
                          }
                          rows={4}
                          placeholder="Object-Oriented Programming, Databases, Cloud Technologies..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
                        />

                      </div>

                      {education.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            removeEducation(
                              index
                            )
                          }
                          className="mt-4 text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove education
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </Section>

            {/* ==================================
                PROJECTS
            ================================== */}

            <Section>

              <SectionHeaderWithButton
                title="Projects"
                description="Showcase technical, academic, personal, or professional projects."
                buttonText="Add project"
                onClick={
                  addProject
                }
              />

              <div className="mt-6 space-y-6">

                {projects.map(
                  (
                    project,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <Field
                        label="Project name"
                        value={
                          project.name
                        }
                        onChange={(
                          value
                        ) =>
                          updateProject(
                            index,
                            "name",
                            value
                          )
                        }
                        placeholder="e.g. CareerFlow"
                      />

                      <div className="mt-4">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Short description
                        </label>

                        <textarea
                          value={
                            project.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateProject(
                              index,
                              "description",
                              event
                                .target
                                .value
                            )
                          }
                          rows={3}
                          placeholder="Briefly explain the project and its purpose..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
                        />

                      </div>

                      <div className="mt-4">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Highlights
                        </label>

                        <textarea
                          value={
                            project.bullets
                          }
                          onChange={(
                            event
                          ) =>
                            updateProject(
                              index,
                              "bullets",
                              event
                                .target
                                .value
                            )
                          }
                          rows={6}
                          placeholder={`One achievement per line.\n- Built authentication...\n- Integrated database...\n- Implemented AI analysis...`}
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
                        />

                      </div>

                      <div className="mt-4">

                        <Field
                          label="Technologies"
                          value={
                            project.technologies
                          }
                          onChange={(
                            value
                          ) =>
                            updateProject(
                              index,
                              "technologies",
                              value
                            )
                          }
                          placeholder="React, Next.js, TypeScript, Supabase"
                        />

                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Field
                          label="Project URL"
                          value={
                            project.projectUrl
                          }
                          onChange={(
                            value
                          ) =>
                            updateProject(
                              index,
                              "projectUrl",
                              value
                            )
                          }
                          placeholder="https://..."
                        />

                        <Field
                          label="GitHub URL"
                          value={
                            project.githubUrl
                          }
                          onChange={(
                            value
                          ) =>
                            updateProject(
                              index,
                              "githubUrl",
                              value
                            )
                          }
                          placeholder="https://github.com/..."
                        />

                      </div>

                      {projects.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            removeProject(
                              index
                            )
                          }
                          className="mt-4 text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove project
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </Section>

            {/* ==================================
                ADDITIONAL QUALIFICATIONS
            ================================== */}

            <Section>

              <SectionHeader
                title="Additional qualifications"
                description="Add strengths, soft skills, certifications, or other relevant qualifications."
              />

              <textarea
                value={
                  additionalQualifications
                }
                onChange={(
                  event
                ) =>
                  setAdditionalQualifications(
                    event
                      .target
                      .value
                  )
                }
                rows={7}
                placeholder={`Add one qualification per line.\nStrong analytical and technical problem-solving skills\nCustomer-service focused\nStrong organizational and time-management skills`}
                className="mt-5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500"
              />

              <p className="mt-2 text-xs text-slate-400">
                Add one qualification per line.
              </p>

            </Section>

            {/* ==================================
                SAVE
            ================================== */}

            <form
              action={
                saveResume
              }
            >

              <input
                type="hidden"
                name="resumeId"
                value={
                  initialResume?.id ??
                  ""
                }
              />

              <input
                type="hidden"
                name="title"
                value={
                  title
                }
              />

              <input
                type="hidden"
                name="fullName"
                value={
                  fullName
                }
              />

              <input
                type="hidden"
                name="jobTitle"
                value={
                  jobTitle
                }
              />

              <input
                type="hidden"
                name="location"
                value={
                  location
                }
              />

              <input
                type="hidden"
                name="email"
                value={
                  email
                }
              />

              <input
                type="hidden"
                name="phone"
                value={
                  phone
                }
              />

              <input
                type="hidden"
                name="linkedin"
                value={
                  linkedin
                }
              />

              <input
                type="hidden"
                name="github"
                value={
                  github
                }
              />

              <input
                type="hidden"
                name="portfolio"
                value={
                  portfolio
                }
              />

              <input
                type="hidden"
                name="summary"
                value={
                  summary
                }
              />

              {/* Legacy skills */}
              <input
                type="hidden"
                name="skills"
                value={JSON.stringify(
                  legacySkills
                )}
              />

              <input
                type="hidden"
                name="skillSections"
                value={JSON.stringify(
                  skillSections
                )}
              />

              <input
                type="hidden"
                name="experiences"
                value={JSON.stringify(
                  experiences
                )}
              />

              <input
                type="hidden"
                name="education"
                value={JSON.stringify(
                  education
                )}
              />

              <input
                type="hidden"
                name="projects"
                value={JSON.stringify(
                  projects
                )}
              />

              <input
                type="hidden"
                name="additionalQualifications"
                value={JSON.stringify(
                  parsedAdditionalQualifications
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

          {/* ==================================
              RIGHT SIDE - PREVIEW
          ================================== */}

          <div className="xl:sticky xl:top-6 xl:self-start">

            <ResumePreview
              fullName={
                fullName
              }
              jobTitle={
                jobTitle
              }
              location={
                location
              }
              email={
                email
              }
              phone={
                phone
              }
              linkedin={
                linkedin
              }
              github={
                github
              }
              portfolio={
                portfolio
              }
              summary={
                summary
              }
              skillSections={
                skillSections
              }
              experiences={
                experiences
              }
              education={
                education
              }
              projects={
                projects
              }
              additionalQualifications={
                parsedAdditionalQualifications
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// SECTION
// ======================================================

function Section({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      {children}
    </section>
  );
}

// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

    </div>
  );
}

// ======================================================
// SECTION HEADER + BUTTON
// ======================================================

function SectionHeaderWithButton({
  title,
  description,
  buttonText,
  onClick,
}: {
  title: string;
  description?: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <SectionHeader
        title={
          title
        }
        description={
          description
        }
      />

      <button
        type="button"
        onClick={
          onClick
        }
        className="w-fit shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {buttonText}
      </button>

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

  onChange:
    (value: string) =>
      void;

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
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        disabled={
          disabled
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
      />

    </div>
  );
}