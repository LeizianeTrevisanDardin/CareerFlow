export type ResumeSection = {
  title: string;
  lines: string[];
};

export type ParsedResume = {
  name: string;
  contactLines: string[];
  sections: ResumeSection[];
};

const SECTION_ALIASES: Record<string, string> = {
  "PROFESSIONAL SUMMARY": "PROFESSIONAL SUMMARY",
  SUMMARY: "PROFESSIONAL SUMMARY",
  PROFILE: "PROFESSIONAL SUMMARY",

  SKILLS: "SKILLS",
  "TECHNICAL SKILLS": "SKILLS",
  "CORE SKILLS": "SKILLS",
  "CORE TECHNOLOGIES": "SKILLS",

  "PROFESSIONAL EXPERIENCE": "PROFESSIONAL EXPERIENCE",
  "WORK EXPERIENCE": "PROFESSIONAL EXPERIENCE",
  EXPERIENCE: "PROFESSIONAL EXPERIENCE",
  EMPLOYMENT: "PROFESSIONAL EXPERIENCE",

  EDUCATION: "EDUCATION",

  CERTIFICATIONS: "CERTIFICATIONS",
  CERTIFICATES: "CERTIFICATIONS",

  PROJECTS: "PROJECTS",
  "SELECTED PROJECTS": "PROJECTS",

  LANGUAGES: "LANGUAGES",

  "ADDITIONAL INFORMATION": "ADDITIONAL INFORMATION",
};

function cleanLine(value: string) {
  return value
    .replace(/\r/g, "")
    .trim();
}

function normalizeSectionTitle(value: string) {
  const normalized = value
    .replace(/:$/, "")
    .trim()
    .toUpperCase();

  return SECTION_ALIASES[normalized] ?? null;
}

function looksLikeHeading(value: string) {
  const line = value.trim();

  if (!line) {
    return false;
  }

  if (line.length > 60) {
    return false;
  }

  const normalized =
    normalizeSectionTitle(line);

  return Boolean(normalized);
}

export function parseGeneratedResume(
  content: string
): ParsedResume {
  const lines = content
    .split("\n")
    .map(cleanLine);

  const firstContentIndex =
    lines.findIndex(Boolean);

  if (firstContentIndex === -1) {
    return {
      name: "",
      contactLines: [],
      sections: [],
    };
  }

  const name =
    lines[firstContentIndex];

  const contactLines: string[] = [];
  const sections: ResumeSection[] = [];

  let currentSection:
    | ResumeSection
    | null = null;

  for (
    let index = firstContentIndex + 1;
    index < lines.length;
    index++
  ) {
    const line = lines[index];

    if (!line) {
      continue;
    }

    if (looksLikeHeading(line)) {
      const title =
        normalizeSectionTitle(line);

      if (!title) {
        continue;
      }

      currentSection = {
        title,
        lines: [],
      };

      sections.push(currentSection);

      continue;
    }

    if (!currentSection) {
      contactLines.push(line);
      continue;
    }

    currentSection.lines.push(line);
  }

  return {
    name,
    contactLines,
    sections,
  };
}