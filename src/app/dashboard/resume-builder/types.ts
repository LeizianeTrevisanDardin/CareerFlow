export type Experience = {
  company: string;
  jobTitle: string;
  project: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Education = {
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  coursework: string;
};

export type Project = {
  name: string;
  description: string;
  technologies: string;
  bullets: string;
  projectUrl: string;
  githubUrl: string;
};

export type SkillSection = {
  category: string;
  skills: string[];
};

export type ResumeData = {
  id?: string;
  title: string;

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