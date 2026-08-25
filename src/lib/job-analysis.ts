type SkillDefinition = {
  name: string;
  aliases: string[];
};

const SKILLS: SkillDefinition[] = [
  {
    name: "JavaScript",
    aliases: ["javascript", "js"],
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts"],
  },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
  },
  {
    name: "Next.js",
    aliases: ["next.js", "nextjs", "next js"],
  },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node js"],
  },
  {
    name: "HTML",
    aliases: ["html", "html5"],
  },
  {
    name: "CSS",
    aliases: ["css", "css3"],
  },
  {
    name: "Tailwind CSS",
    aliases: ["tailwind", "tailwind css", "tailwindcss"],
  },
  {
    name: "Python",
    aliases: ["python"],
  },
  {
    name: "Java",
    aliases: ["java"],
  },
  {
    name: "C#",
    aliases: ["c#", "c sharp"],
  },
  {
    name: "C++",
    aliases: ["c++", "cpp"],
  },
  {
    name: "SQL",
    aliases: ["sql"],
  },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres"],
  },
  {
    name: "Supabase",
    aliases: ["supabase"],
  },
  {
    name: "Firebase",
    aliases: ["firebase"],
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
  },
  {
    name: "Azure",
    aliases: ["azure", "microsoft azure"],
  },
  {
    name: "Docker",
    aliases: ["docker"],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
  },
  {
    name: "Git",
    aliases: ["git"],
  },
  {
    name: "GitHub",
    aliases: ["github"],
  },
  {
    name: "REST API",
    aliases: ["rest api", "restful api", "restful"],
  },
  {
    name: "GraphQL",
    aliases: ["graphql"],
  },
  {
    name: "CI/CD",
    aliases: ["ci/cd", "ci cd", "continuous integration"],
  },
  {
    name: "Jest",
    aliases: ["jest"],
  },
  {
    name: "Testing",
    aliases: [
      "testing",
      "unit testing",
      "integration testing",
      "automated testing",
    ],
  },
];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsSkill(text: string, alias: string) {
  const escapedAlias = escapeRegExp(alias.toLowerCase());

  /*
   * We don't use \b here because skills such as
   * C++, C# and Next.js contain special characters.
   *
   * Instead, we make sure the skill isn't surrounded
   * by letters or numbers.
   */
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedAlias}($|[^a-z0-9])`,
    "i"
  );

  return pattern.test(text);
}

function findSkills(text: string) {
  const normalizedText = normalizeText(text);

  return SKILLS.filter((skill) =>
    skill.aliases.some((alias) =>
      containsSkill(normalizedText, alias)
    )
  ).map((skill) => skill.name);
}

export function analyzeJobMatch(
  jobDescription: string,
  profileText: string
) {
  const requiredSkills = findSkills(jobDescription);
  const profileSkills = findSkills(profileText);

  const matchedSkills = requiredSkills.filter((skill) =>
    profileSkills.includes(skill)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !profileSkills.includes(skill)
  );

  const matchScore =
    requiredSkills.length > 0
      ? Math.round(
          (matchedSkills.length / requiredSkills.length) * 100
        )
      : 0;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
  };
}