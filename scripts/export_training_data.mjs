/**
 * Reads all users (seed + real) from the database and writes training_data.csv.
 *
 * Columns exported:
 *   avg_quiz_score   — average of all the user's quiz scores (feature)
 *   experience_years — years of experience from user profile (feature)
 *   actual_match     — skills_coverage from rule-based cosine similarity (label)
 *
 * skills_coverage is the LABEL only — not a feature — to avoid data leakage.
 * The model's job: predict skill match from quiz performance + experience alone.
 *
 * Run:  node scripts/export_training_data.mjs
 */

import { PrismaClient } from "@prisma/client";
import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();
const db = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Inline role→skills map (mirrors lib/ml/skill-rules.js) ──────────────────
const ROLE_SKILLS = {
  "software engineer":      ["javascript","python","git","algorithms","data structures","system design","sql","rest api"],
  "frontend developer":     ["javascript","react","css","html","typescript","webpack","testing","responsive design"],
  "backend developer":      ["python","node.js","sql","rest api","databases","system design","docker","microservices"],
  "full stack developer":   ["javascript","react","node.js","sql","rest api","git","docker","typescript"],
  "data scientist":         ["python","machine learning","statistics","pandas","numpy","sql","data visualization","deep learning"],
  "data analyst":           ["sql","excel","python","data visualization","tableau","statistics","business intelligence","reporting"],
  "data engineer":          ["python","sql","spark","etl","airflow","data pipelines","cloud","kafka"],
  "ml engineer":            ["python","machine learning","deep learning","tensorflow","pytorch","mlops","docker","kubernetes"],
  "devops engineer":        ["docker","kubernetes","ci/cd","linux","aws","terraform","monitoring","scripting"],
  "qa engineer":            ["test automation","selenium","manual testing","api testing","jira","ci/cd","python","test planning"],
  "product manager":        ["roadmapping","user research","agile","analytics","stakeholder management","sql","wireframing","strategy"],
  "ui/ux designer":         ["figma","user research","prototyping","wireframing","accessibility","css","usability testing","design systems"],
  "cybersecurity engineer": ["networking","penetration testing","firewalls","siem","vulnerability assessment","python","linux","cryptography"],
  "cloud architect":        ["aws","azure","gcp","terraform","kubernetes","networking","security","cost optimization"],
  "business analyst":       ["sql","data analysis","excel","requirements gathering","process mapping","stakeholder management","documentation","agile"],
  "hr manager":             ["recruitment","employee relations","performance management","hris","onboarding","compliance","talent acquisition","communication"],
  "project manager":        ["agile","scrum","jira","stakeholder management","risk management","budgeting","communication","ms project"],
  "mobile developer":       ["react native","flutter","swift","kotlin","rest api","git","firebase","ui/ux"],
  "android developer":      ["kotlin","java","android sdk","rest api","git","sqlite","firebase","ui/ux"],
  "ios developer":          ["swift","objective-c","xcode","rest api","git","core data","firebase","ui/ux"],
};

function findBestMatchingRole(targetRole) {
  const normalized = (targetRole || "").toLowerCase().trim();
  if (ROLE_SKILLS[normalized]) return normalized;
  let best = null, bestScore = 0;
  for (const key of Object.keys(ROLE_SKILLS)) {
    const kw = key.split(" "), tw = normalized.split(" ");
    const overlap = kw.filter(w => tw.some(t => t.includes(w) || w.includes(t))).length;
    const score = overlap / Math.max(kw.length, tw.length);
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return bestScore > 0.3 ? best : null;
}

function computeSkillsCoverage(userSkills, targetRole) {
  const role = findBestMatchingRole(targetRole);
  if (!role) return null;
  const required = ROLE_SKILLS[role];
  const norm = (userSkills || []).map(s => s.toLowerCase().trim());
  const matched = required.filter(r => norm.some(u => u.includes(r) || r.includes(u)));
  return Math.round((matched.length / required.length) * 100);
}

function computeRoleSimilarity(role, targetRole) {
  const roleWords   = (role || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const targetWords = (targetRole || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!roleWords.length || !targetWords.length) return 50;
  const overlap = roleWords.filter(w =>
    targetWords.some(t => t.includes(w) || w.includes(t))
  ).length;
  return Math.round((overlap / Math.max(roleWords.length, targetWords.length)) * 100);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const users = await db.user.findMany({
    where: {
      targetRole: { not: null },
      experience:  { not: null },
    },
    select: {
      skills: true,
      experience: true,
      role: true,
      targetRole: true,
      assessments: {
        select: { quizScore: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  console.log(`Found ${users.length} users with targetRole + experience set.`);

  const rows = [];

  for (const u of users) {
    if (!u.assessments.length) continue;

    const avgQuiz = u.assessments.reduce((s, a) => s + a.quizScore, 0) / u.assessments.length;

    const last3       = u.assessments.slice(-3);
    const recentAvg   = last3.reduce((s, a) => s + a.quizScore, 0) / last3.length;
    const quizzesTaken = u.assessments.length;
    const skillsCount  = (u.skills || []).length;
    const roleSim      = computeRoleSimilarity(u.role, u.targetRole);

    // Label = skills_coverage (independent of quiz — no leakage)
    const actualMatch = computeSkillsCoverage(u.skills, u.targetRole);
    if (actualMatch === null) continue;

    rows.push({
      avg_quiz_score:   Math.round(avgQuiz * 10) / 10,
      experience_years: u.experience,
      quizzes_taken:    quizzesTaken,
      role_similarity:  roleSim,
      actual_match:     actualMatch,
    });
  }

  if (rows.length === 0) {
    console.error("No exportable rows found. Make sure seed users exist (run: node prisma/seed-users.mjs)");
    process.exit(1);
  }

  const outPath = resolve(__dirname, "training_data.csv");
  const stream  = createWriteStream(outPath);
  stream.write("avg_quiz_score,experience_years,quizzes_taken,role_similarity,actual_match\n");
  for (const r of rows) {
    stream.write(`${r.avg_quiz_score},${r.experience_years},${r.quizzes_taken},${r.role_similarity},${r.actual_match}\n`);
  }
  stream.end();

  console.log(`Exported ${rows.length} rows → ${outPath}`);
  console.log("Next step: python3 scripts/train_skill_gap_model.py");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
