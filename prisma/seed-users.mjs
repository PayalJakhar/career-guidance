/**
 * Seeds 300 realistic fake users + quiz assessments.
 * Users are generated programmatically across 3 experience levels:
 *   - 90  Freshers    (0–2 yrs,  quiz 25–55%)
 *   - 120 Mid-career  (3–7 yrs,  quiz 45–75%)
 *   - 90  Seniors     (8–15 yrs, quiz 65–90%)
 *
 * Run:  node prisma/seed-users.mjs
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
const db = new PrismaClient();

// ── Name pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Aarav","Aanya","Abhishek","Aditi","Ajay","Akash","Akshay","Amita","Amitabh","Ananya",
  "Anil","Anita","Anjali","Ankur","Anuj","Arjun","Aryan","Asha","Ashish","Ashoka",
  "Bhavna","Chetan","Deepa","Deepak","Divya","Gaurav","Geeta","Harish","Harsha","Heena",
  "Himanshu","Indira","Ishaan","Jaya","Jayesh","Kabir","Kalpana","Karan","Kavya","Kishore",
  "Komal","Kunal","Lakshmi","Lalit","Leela","Madhav","Manisha","Manish","Meena","Mihir",
  "Mira","Mohit","Monika","Mukesh","Namita","Neha","Nikhil","Nilesh","Nisha","Nishant",
  "Pankaj","Payal","Pooja","Pradeep","Pranav","Pratik","Priya","Rahul","Rajesh","Rakesh",
  "Ramesh","Ravi","Rekha","Ritesh","Rohan","Rohit","Ruchi","Sanjay","Sangeeta","Sapna",
  "Sarika","Seema","Shikha","Shilpa","Shruti","Siddharth","Sneha","Sonal","Sunil","Sunita",
  "Suresh","Swati","Tanvi","Tarun","Usha","Varun","Vidya","Vikram","Vinay","Vishal",
];

const LAST_NAMES = [
  "Agarwal","Bose","Chaudhary","Chopra","Desai","Dubey","Ghosh","Gupta","Hegde","Iyer",
  "Jain","Joshi","Kapoor","Khanna","Krishnan","Kumar","Malhotra","Mehta","Menon","Mishra",
  "Nair","Patel","Patil","Pillai","Rao","Reddy","Saxena","Shah","Sharma","Singh",
  "Sinha","Srivastava","Tiwari","Varma","Verma",
];

// ── Role configs per experience level ────────────────────────────────────────
const FRESHER_ROLES = [
  { role: "Intern",            targetRole: "software engineer",      skillPool: ["javascript","python","git","algorithms","html","css"] },
  { role: "Trainee",           targetRole: "frontend developer",     skillPool: ["javascript","react","css","html","typescript"] },
  { role: "Junior Developer",  targetRole: "backend developer",      skillPool: ["python","node.js","sql","git","rest api"] },
  { role: "Junior QA",         targetRole: "qa engineer",            skillPool: ["manual testing","jira","python","api testing"] },
  { role: "Support Engineer",  targetRole: "data analyst",           skillPool: ["sql","excel","python","statistics"] },
  { role: "Fresher",           targetRole: "full stack developer",   skillPool: ["javascript","react","css","html","git"] },
  { role: "Junior Analyst",    targetRole: "business analyst",       skillPool: ["sql","excel","requirements gathering","agile"] },
  { role: "Trainee Dev",       targetRole: "android developer",      skillPool: ["kotlin","java","git","android sdk"] },
  { role: "Intern",            targetRole: "devops engineer",        skillPool: ["linux","docker","git","scripting"] },
  { role: "Junior Dev",        targetRole: "data scientist",         skillPool: ["python","statistics","pandas","sql"] },
];

const MID_ROLES = [
  { role: "Software Engineer",    targetRole: "software engineer",      skillPool: ["javascript","python","git","algorithms","data structures","system design","sql","rest api"] },
  { role: "Frontend Developer",   targetRole: "full stack developer",   skillPool: ["javascript","react","node.js","css","html","typescript","git"] },
  { role: "Backend Developer",    targetRole: "backend developer",      skillPool: ["python","node.js","sql","rest api","databases","docker","microservices"] },
  { role: "Data Analyst",         targetRole: "data scientist",         skillPool: ["python","sql","pandas","numpy","statistics","data visualization"] },
  { role: "QA Engineer",          targetRole: "qa engineer",            skillPool: ["test automation","selenium","manual testing","api testing","jira","ci/cd","python"] },
  { role: "DevOps Engineer",      targetRole: "cloud architect",        skillPool: ["docker","kubernetes","aws","ci/cd","linux","terraform","monitoring"] },
  { role: "ML Engineer",          targetRole: "ml engineer",            skillPool: ["python","machine learning","tensorflow","pytorch","deep learning","mlops"] },
  { role: "Data Engineer",        targetRole: "data engineer",          skillPool: ["python","sql","spark","etl","airflow","data pipelines","cloud"] },
  { role: "Business Analyst",     targetRole: "business analyst",       skillPool: ["sql","excel","requirements gathering","process mapping","agile","stakeholder management"] },
  { role: "Android Developer",    targetRole: "mobile developer",       skillPool: ["kotlin","java","android sdk","rest api","git","firebase"] },
  { role: "UX Designer",          targetRole: "ui/ux designer",         skillPool: ["figma","user research","prototyping","wireframing","accessibility","css"] },
  { role: "Security Analyst",     targetRole: "cybersecurity engineer", skillPool: ["networking","firewalls","siem","vulnerability assessment","linux","python"] },
  { role: "HR Executive",         targetRole: "hr manager",             skillPool: ["recruitment","onboarding","hris","compliance","employee relations"] },
  { role: "Cloud Engineer",       targetRole: "devops engineer",        skillPool: ["aws","docker","terraform","linux","ci/cd","kubernetes"] },
  { role: "iOS Developer",        targetRole: "ios developer",          skillPool: ["swift","xcode","rest api","firebase","core data","git"] },
];

const SENIOR_ROLES = [
  { role: "Senior Engineer",       targetRole: "software engineer",      skillPool: ["javascript","python","git","algorithms","data structures","system design","sql","rest api"] },
  { role: "Lead Data Scientist",   targetRole: "data scientist",         skillPool: ["python","machine learning","statistics","pandas","numpy","sql","data visualization","deep learning"] },
  { role: "Principal Engineer",    targetRole: "cloud architect",        skillPool: ["aws","azure","terraform","kubernetes","networking","security","cost optimization","gcp"] },
  { role: "Senior DevOps",         targetRole: "devops engineer",        skillPool: ["docker","kubernetes","ci/cd","linux","aws","terraform","monitoring","scripting"] },
  { role: "Senior ML Engineer",    targetRole: "ml engineer",            skillPool: ["python","machine learning","deep learning","tensorflow","pytorch","mlops","docker","kubernetes"] },
  { role: "Senior QA Lead",        targetRole: "qa engineer",            skillPool: ["test automation","selenium","manual testing","api testing","jira","ci/cd","python","test planning"] },
  { role: "Senior Data Engineer",  targetRole: "data engineer",          skillPool: ["python","sql","spark","etl","airflow","data pipelines","cloud","kafka"] },
  { role: "Lead Full Stack",       targetRole: "full stack developer",   skillPool: ["javascript","react","node.js","sql","rest api","git","docker","typescript"] },
  { role: "Senior UX Lead",        targetRole: "ui/ux designer",         skillPool: ["figma","user research","prototyping","wireframing","accessibility","css","usability testing","design systems"] },
  { role: "Senior Security Eng",   targetRole: "cybersecurity engineer", skillPool: ["networking","penetration testing","firewalls","siem","vulnerability assessment","python","linux","cryptography"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
let nameIndex = 0;
function nextName(emailPrefix) {
  const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
  const last  = LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length];
  nameIndex++;
  return { name: `${first} ${last}`, email: `seed_${emailPrefix}_${nameIndex}@example.com` };
}

function pickSkills(pool, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, dp = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp));
}

function makeQuestions(scorePct) {
  const numCorrect = Math.round(10 * scorePct / 100);
  return Array.from({ length: 10 }, (_, i) => ({
    question: `Technical question ${i + 1}`,
    answer: "A",
    userAnswer: i < numCorrect ? "A" : "B",
    isCorrect: i < numCorrect,
    explanation: `Explanation for question ${i + 1}`,
  }));
}

function makeAssessments(n, baseScore) {
  return Array.from({ length: n }, (_, i) => {
    const jitter = (Math.random() - 0.5) * 16;
    const score  = Math.min(Math.max(baseScore + jitter + i * 1.2, 10), 100);
    const rounded = Math.round(score * 10) / 10;
    return {
      quizScore: rounded,
      questions: makeQuestions(rounded),
      category: i % 2 === 0 ? "Technical" : "Behavioral",
      improvementTip: rounded < 60 ? "Focus on strengthening core concepts." : null,
    };
  });
}

// ── Build 300 user records ────────────────────────────────────────────────────
function buildUsers() {
  const users = [];

  // 90 Freshers
  for (let i = 0; i < 90; i++) {
    const config = FRESHER_ROLES[i % FRESHER_ROLES.length];
    const { name, email } = nextName("f");
    users.push({
      ...nextName("f"),
      name,
      email,
      role: config.role,
      targetRole: config.targetRole,
      experience: randInt(0, 2),
      skills: pickSkills(config.skillPool, 2, 4),
      numAssessments: randInt(3, 4),
      baseScore: randFloat(25, 55),
    });
  }

  // 120 Mid-career
  for (let i = 0; i < 120; i++) {
    const config = MID_ROLES[i % MID_ROLES.length];
    const { name, email } = nextName("m");
    users.push({
      name,
      email,
      role: config.role,
      targetRole: config.targetRole,
      experience: randInt(3, 7),
      skills: pickSkills(config.skillPool, 4, 6),
      numAssessments: randInt(4, 5),
      baseScore: randFloat(45, 75),
    });
  }

  // 90 Seniors
  for (let i = 0; i < 90; i++) {
    const config = SENIOR_ROLES[i % SENIOR_ROLES.length];
    const { name, email } = nextName("s");
    users.push({
      name,
      email,
      role: config.role,
      targetRole: config.targetRole,
      experience: randInt(8, 15),
      skills: pickSkills(config.skillPool, 6, 8),
      numAssessments: randInt(5, 6),
      baseScore: randFloat(65, 90),
    });
  }

  return users;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Deleting existing seed users...");
  await db.assessment.deleteMany({ where: { user: { email: { startsWith: "seed_" } } } });
  await db.user.deleteMany({ where: { email: { startsWith: "seed_" } } });

  const users = buildUsers();
  console.log(`Inserting ${users.length} seed users...`);
  let count = 0;

  for (const u of users) {
    const user = await db.user.create({
      data: {
        clerkUserId: `seed_clerk_${u.email.replace("seed_", "").replace("@example.com", "")}`,
        email: u.email,
        name: u.name,
        role: u.role,
        targetRole: u.targetRole,
        experience: u.experience,
        skills: u.skills,
        isOnboarded: true,
      },
    });

    for (const a of makeAssessments(u.numAssessments, u.baseScore)) {
      await db.assessment.create({ data: { userId: user.id, ...a } });
    }

    count++;
    process.stdout.write(`\r  ${count}/${users.length} inserted`);
  }

  console.log(`\nDone. ${count} users seeded.`);
}

main().catch(console.error).finally(() => db.$disconnect());
