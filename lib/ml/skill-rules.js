const ROLE_SKILLS = {
  "software engineer": ["javascript", "python", "git", "algorithms", "data structures", "system design", "sql", "rest api"],
  "frontend developer": ["javascript", "react", "css", "html", "typescript", "webpack", "testing", "responsive design"],
  "backend developer": ["python", "node.js", "sql", "rest api", "databases", "system design", "docker", "microservices"],
  "full stack developer": ["javascript", "react", "node.js", "sql", "rest api", "git", "docker", "typescript"],
  "data scientist": ["python", "machine learning", "statistics", "pandas", "numpy", "sql", "data visualization", "deep learning"],
  "data analyst": ["sql", "excel", "python", "data visualization", "tableau", "statistics", "business intelligence", "reporting"],
  "data engineer": ["python", "sql", "spark", "etl", "airflow", "data pipelines", "cloud", "kafka"],
  "ml engineer": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "mlops", "docker", "kubernetes"],
  "devops engineer": ["docker", "kubernetes", "ci/cd", "linux", "aws", "terraform", "monitoring", "scripting"],
  "qa engineer": ["test automation", "selenium", "manual testing", "api testing", "jira", "ci/cd", "python", "test planning"],
  "product manager": ["roadmapping", "user research", "agile", "analytics", "stakeholder management", "sql", "wireframing", "strategy"],
  "ui/ux designer": ["figma", "user research", "prototyping", "wireframing", "accessibility", "css", "usability testing", "design systems"],
  "cybersecurity engineer": ["networking", "penetration testing", "firewalls", "siem", "vulnerability assessment", "python", "linux", "cryptography"],
  "cloud architect": ["aws", "azure", "gcp", "terraform", "kubernetes", "networking", "security", "cost optimization"],
  "business analyst": ["sql", "data analysis", "excel", "requirements gathering", "process mapping", "stakeholder management", "documentation", "agile"],
  "hr manager": ["recruitment", "employee relations", "performance management", "hris", "onboarding", "compliance", "talent acquisition", "communication"],
  "project manager": ["agile", "scrum", "jira", "stakeholder management", "risk management", "budgeting", "communication", "ms project"],
  "mobile developer": ["react native", "flutter", "swift", "kotlin", "rest api", "git", "firebase", "ui/ux"],
  "android developer": ["kotlin", "java", "android sdk", "rest api", "git", "sqlite", "firebase", "ui/ux"],
  "ios developer": ["swift", "objective-c", "xcode", "rest api", "git", "core data", "firebase", "ui/ux"],
};

function normalizeRole(role) {
  return (role || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function findBestMatchingRole(targetRole) {
  const normalized = normalizeRole(targetRole);
  if (ROLE_SKILLS[normalized]) return normalized;

  let bestMatch = null;
  let bestScore = 0;
  for (const key of Object.keys(ROLE_SKILLS)) {
    const keyWords = key.split(" ");
    const targetWords = normalized.split(" ");
    const overlap = keyWords.filter((w) =>
      targetWords.some((tw) => tw.includes(w) || w.includes(tw))
    ).length;
    const score = overlap / Math.max(keyWords.length, targetWords.length);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  return bestScore > 0.3 ? bestMatch : null;
}

export function computeRuleBasedGap(userSkills = [], targetRole = "") {
  const matchedRole = findBestMatchingRole(targetRole);
  if (!matchedRole) {
    return {
      matchedRole: null,
      requiredSkills: [],
      matchedSkills: [],
      missingSkills: [],
      similarityScore: 0,
    };
  }

  const required = ROLE_SKILLS[matchedRole];
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());

  const matchedSkills = required.filter((req) =>
    normalizedUser.some((us) => us.includes(req) || req.includes(us))
  );
  const missingSkills = required.filter(
    (req) => !normalizedUser.some((us) => us.includes(req) || req.includes(us))
  );

  const similarityScore =
    required.length > 0
      ? Math.round((matchedSkills.length / required.length) * 100)
      : 0;

  return { matchedRole, requiredSkills: required, matchedSkills, missingSkills, similarityScore };
}
