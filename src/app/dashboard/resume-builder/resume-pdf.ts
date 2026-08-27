import { jsPDF } from "jspdf";

import type {
  ResumeData,
} from "./types";

export function downloadResumePdf(
  resume: ResumeData
) {
  const pdf =
    new jsPDF({
      orientation:
        "portrait",
      unit:
        "pt",
      format:
        "letter",
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

  let y =
    topMargin;

  function ensureSpace(
    requiredHeight: number
  ) {
    if (
      y +
        requiredHeight >
      pageHeight -
        bottomMargin
    ) {
      pdf.addPage();
      y =
        topMargin;
    }
  }

  function resetText() {
    pdf.setCharSpace(0);
    pdf.setTextColor(
      15,
      23,
      42
    );
  }

  function addSectionTitle(
    title: string
  ) {
    ensureSpace(34);

    y += 8;

    resetText();

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10);

    pdf.text(
      title.toUpperCase(),
      leftMargin,
      y,
      {
        align:
          "left",
      }
    );

    y += 6;

    pdf.setDrawColor(
      203,
      213,
      225
    );

    pdf.setLineWidth(0.6);

    pdf.line(
      leftMargin,
      y,
      pageWidth -
        rightMargin,
      y
    );

    y += 15;
  }

  function addText(
    text: string,
    options?: {
      bold?: boolean;
      fontSize?: number;
      indent?: number;
      spacingAfter?: number;
    }
  ) {
    const clean =
      normalizeText(text);

    if (!clean) {
      return;
    }

    const indent =
      options?.indent ?? 0;

    resetText();

    pdf.setFont(
      "helvetica",
      options?.bold
        ? "bold"
        : "normal"
    );

    pdf.setFontSize(
      options?.fontSize ??
        9.5
    );

    const wrapped =
      pdf.splitTextToSize(
        clean,
        usableWidth -
          indent
      );

    const lineHeight =
      13;

    const height =
      wrapped.length *
      lineHeight;

    ensureSpace(
      height + 6
    );

    pdf.text(
      wrapped,
      leftMargin +
        indent,
      y,
      {
        align:
          "left",
      }
    );

    y +=
      height +
      (options?.spacingAfter ??
        3);
  }

  function addBullet(
    text: string
  ) {
    const clean =
      normalizeText(
        text.replace(
          /^[-•*]\s*/,
          ""
        )
      );

    if (!clean) {
      return;
    }

    const textIndent =
      13;

    resetText();

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      9.5
    );

    const wrapped =
      pdf.splitTextToSize(
        clean,
        usableWidth -
          textIndent
      );

    const lineHeight =
      13;

    const height =
      wrapped.length *
      lineHeight;

    ensureSpace(
      height + 4
    );

    pdf.setFillColor(
      15,
      23,
      42
    );

    pdf.circle(
      leftMargin + 3,
      y - 3,
      1.3,
      "F"
    );

    pdf.text(
      wrapped,
      leftMargin +
        textIndent,
      y,
      {
        align:
          "left",
      }
    );

    y +=
      height + 2;
  }

  // ==========================================
  // HEADER
  // ==========================================

  resetText();

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(19);

  pdf.text(
    normalizeText(
      resume.fullName ||
        "Your Name"
    ),
    leftMargin,
    y
  );

  y += 24;

  if (
    resume.jobTitle
  ) {
    addText(
      resume.jobTitle,
      {
        fontSize: 11,
        spacingAfter: 1,
      }
    );
  }

  const contact =
    [
      resume.location,
      resume.email,
      resume.phone,
      resume.linkedin,
      resume.github,
      resume.portfolio,
    ]
      .filter(Boolean)
      .join(" | ");

  if (contact) {
    addText(
      contact,
      {
        fontSize: 8.8,
        spacingAfter: 4,
      }
    );
  }

  // ==========================================
  // SUMMARY
  // ==========================================

  if (
    resume.summary.trim()
  ) {
    addSectionTitle(
      "Professional Summary"
    );

    addText(
      resume.summary
    );
  }

  // ==========================================
  // SKILLS
  // ==========================================

  const validSkillSections =
    resume.skillSections.filter(
      (section) =>
        section.category.trim() ||
        section.skills.length >
          0
    );

  if (
    validSkillSections.length >
    0
  ) {
    addSectionTitle(
      "Technical Skills"
    );

    validSkillSections.forEach(
      (section) => {
        if (
          section.category
        ) {
          addText(
            section.category,
            {
              bold: true,
              fontSize: 9.2,
              spacingAfter: 1,
            }
          );
        }

        if (
          section.skills.length >
          0
        ) {
          addText(
            section.skills.join(
              ", "
            ),
            {
              fontSize: 9,
              spacingAfter: 6,
            }
          );
        }
      }
    );
  }

  // ==========================================
  // EXPERIENCE
  // ==========================================

  const validExperiences =
    resume.experiences.filter(
      (experience) =>
        experience.company ||
        experience.jobTitle ||
        experience.project ||
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
        ensureSpace(55);

        if (
          experience.jobTitle
        ) {
          addText(
            experience.jobTitle,
            {
              bold: true,
              fontSize: 10,
              spacingAfter: 1,
            }
          );
        }

        const companyLine =
          [
            experience.company,
            experience.project,
            experience.location,
          ]
            .filter(Boolean)
            .join(" · ");

        if (companyLine) {
          addText(
            companyLine,
            {
              fontSize: 9,
              spacingAfter: 1,
            }
          );
        }

        const dateLine =
          formatDateRange(
            experience.startDate,
            experience.endDate,
            experience.current
          );

        if (dateLine) {
          addText(
            dateLine,
            {
              fontSize: 8.8,
              spacingAfter: 5,
            }
          );
        }

        const lines =
          experience.description
            .split("\n")
            .map((line) =>
              line.trim()
            )
            .filter(Boolean);

        lines.forEach(
          addBullet
        );

        y += 5;
      }
    );
  }

  // ==========================================
  // EDUCATION
  // ==========================================

  const validEducation =
    resume.education.filter(
      (item) =>
        item.school ||
        item.degree ||
        item.coursework
    );

  if (
    validEducation.length >
    0
  ) {
    addSectionTitle(
      "Education"
    );

    validEducation.forEach(
      (item) => {
        ensureSpace(45);

        if (item.school) {
          addText(
            item.school,
            {
              bold: true,
              fontSize: 10,
              spacingAfter: 1,
            }
          );
        }

        if (item.degree) {
          addText(
            item.degree,
            {
              fontSize: 9.2,
              spacingAfter: 1,
            }
          );
        }

        if (item.location) {
          addText(
            item.location,
            {
              fontSize: 8.8,
              spacingAfter: 1,
            }
          );
        }

        const dateLine =
          formatDateRange(
            item.startDate,
            item.endDate,
            item.current
          );

        if (dateLine) {
          addText(
            dateLine,
            {
              fontSize: 8.8,
              spacingAfter: 3,
            }
          );
        }

        if (
          item.coursework
        ) {
          addText(
            `Relevant coursework: ${item.coursework}`,
            {
              fontSize: 9,
              spacingAfter: 6,
            }
          );
        }
      }
    );
  }

  // ==========================================
  // PROJECTS
  // ==========================================

  const validProjects =
    resume.projects.filter(
      (project) =>
        project.name ||
        project.description ||
        project.bullets
    );

  if (
    validProjects.length >
    0
  ) {
    addSectionTitle(
      "Projects"
    );

    validProjects.forEach(
      (project) => {
        ensureSpace(50);

        if (project.name) {
          addText(
            project.name,
            {
              bold: true,
              fontSize: 10,
              spacingAfter: 1,
            }
          );
        }

        if (
          project.description
        ) {
          addText(
            project.description,
            {
              fontSize: 9.2,
              spacingAfter: 3,
            }
          );
        }

        const lines =
          project.bullets
            .split("\n")
            .map((line) =>
              line.trim()
            )
            .filter(Boolean);

        lines.forEach(
          addBullet
        );

        if (
          project.technologies
        ) {
          addText(
            `Technologies: ${project.technologies}`,
            {
              fontSize: 9,
              spacingAfter: 2,
            }
          );
        }

        const links =
          [
            project.projectUrl,
            project.githubUrl,
          ]
            .filter(Boolean)
            .join(" | ");

        if (links) {
          addText(
            links,
            {
              fontSize: 8.5,
              spacingAfter: 6,
            }
          );
        }
      }
    );
  }

  // ==========================================
  // ADDITIONAL QUALIFICATIONS
  // ==========================================

  if (
    resume.additionalQualifications
      .length > 0
  ) {
    addSectionTitle(
      "Additional Qualifications"
    );

    resume.additionalQualifications
      .filter(Boolean)
      .forEach(
        addBullet
      );
  }

  // ==========================================
  // SAVE
  // ==========================================

  const safeName =
    (
      resume.fullName ||
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

function normalizeText(
  value: string
) {
  return value
    .replace(
      /\u00A0/g,
      " "
    )
    .replace(
      /[\u2018\u2019]/g,
      "'"
    )
    .replace(
      /[\u201C\u201D]/g,
      '"'
    )
    .replace(
      /[\u2013\u2014]/g,
      "-"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

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
    !start &&
    !end
  ) {
    return "";
  }

  if (
    start &&
    end
  ) {
    return `${start} - ${end}`;
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
      month:
        "short",
      year:
        "numeric",
    }
  ).format(date);
}