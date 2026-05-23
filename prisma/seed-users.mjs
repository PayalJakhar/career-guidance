/**
 * Seeds 50 realistic fake users + quiz assessments into the database.
 * Users are split into three experience levels:
 *   - 15 Freshers   (0–2 yrs,  quiz 25–55%)
 *   - 20 Mid-career (3–7 yrs,  quiz 45–75%)
 *   - 15 Seniors    (8–15 yrs, quiz 65–90%)
 *
 * Run:  node prisma/seed-users.mjs
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
const db = new PrismaClient();

// ── Helper: build 10 question objects for a given score % ────────────────────
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

// ── Helper: generate N assessments with slight score progression ─────────────
function makeAssessments(n, baseScore) {
  return Array.from({ length: n }, (_, i) => {
    const jitter = (Math.random() - 0.5) * 18;
    const score = Math.min(Math.max(baseScore + jitter + i * 1.5, 10), 100);
    const rounded = Math.round(score * 10) / 10;
    return {
      quizScore: rounded,
      questions: makeQuestions(rounded),
      category: i % 2 === 0 ? "Technical" : "Behavioral",
      improvementTip: rounded < 60 ? "Focus on strengthening core concepts." : null,
    };
  });
}

// ── 50 user profiles ─────────────────────────────────────────────────────────
const USERS = [
  // ── FRESHERS (15) ───────────────────────────────────────────────────────────
  { name: "Aanya Mehta",     email: "seed_aanya@example.com",    role: "Intern",               targetRole: "frontend developer",  experience: 0, skills: ["html", "css", "javascript"],                              assessments: 3, baseScore: 35 },
  { name: "Rohan Gupta",     email: "seed_rohan@example.com",    role: "Trainee",               targetRole: "software engineer",   experience: 1, skills: ["python", "git"],                                          assessments: 3, baseScore: 40 },
  { name: "Priya Nair",      email: "seed_priya@example.com",    role: "Junior QA",             targetRole: "qa engineer",         experience: 1, skills: ["manual testing", "jira"],                                 assessments: 3, baseScore: 42 },
  { name: "Sahil Verma",     email: "seed_sahil@example.com",    role: "Support Engineer",      targetRole: "backend developer",   experience: 0, skills: ["python", "sql"],                                          assessments: 3, baseScore: 30 },
  { name: "Neha Joshi",      email: "seed_neha@example.com",     role: "Fresher",               targetRole: "data analyst",        experience: 0, skills: ["excel", "sql"],                                           assessments: 3, baseScore: 33 },
  { name: "Karan Singh",     email: "seed_karan@example.com",    role: "Intern",               targetRole: "software engineer",   experience: 1, skills: ["javascript", "html", "git"],                              assessments: 3, baseScore: 38 },
  { name: "Divya Pillai",    email: "seed_divya@example.com",    role: "Junior Dev",            targetRole: "full stack developer",experience: 2, skills: ["javascript", "react", "css"],                             assessments: 4, baseScore: 45 },
  { name: "Arjun Rao",       email: "seed_arjun@example.com",    role: "Trainee",               targetRole: "devops engineer",     experience: 1, skills: ["linux", "git"],                                           assessments: 3, baseScore: 32 },
  { name: "Sneha Kulkarni",  email: "seed_sneha@example.com",    role: "Intern",               targetRole: "data scientist",      experience: 0, skills: ["python", "statistics"],                                   assessments: 3, baseScore: 36 },
  { name: "Vikram Desai",    email: "seed_vikram@example.com",   role: "Junior Developer",      targetRole: "mobile developer",    experience: 2, skills: ["react native", "javascript"],                             assessments: 3, baseScore: 44 },
  { name: "Pooja Iyer",      email: "seed_pooja@example.com",    role: "Fresher",               targetRole: "business analyst",    experience: 0, skills: ["sql", "excel"],                                           assessments: 3, baseScore: 29 },
  { name: "Manish Tiwari",   email: "seed_manish@example.com",   role: "Trainee",               targetRole: "software engineer",   experience: 1, skills: ["java", "git", "algorithms"],                             assessments: 3, baseScore: 41 },
  { name: "Riya Shah",       email: "seed_riya@example.com",     role: "Junior Analyst",        targetRole: "data analyst",        experience: 2, skills: ["python", "excel", "sql"],                                 assessments: 4, baseScore: 48 },
  { name: "Nikhil Bose",     email: "seed_nikhil@example.com",   role: "Intern",               targetRole: "cybersecurity engineer", experience: 0, skills: ["networking", "linux"],                                assessments: 3, baseScore: 31 },
  { name: "Tanya Menon",     email: "seed_tanya@example.com",    role: "Junior Developer",      targetRole: "frontend developer",  experience: 2, skills: ["react", "css", "html", "javascript"],                    assessments: 4, baseScore: 52 },

  // ── MID-CAREER (20) ─────────────────────────────────────────────────────────
  { name: "Amit Sharma",     email: "seed_amit@example.com",     role: "Software Engineer",     targetRole: "full stack developer",experience: 3, skills: ["javascript", "node.js", "sql", "git", "rest api"],        assessments: 4, baseScore: 58 },
  { name: "Kavya Reddy",     email: "seed_kavya@example.com",    role: "Data Analyst",          targetRole: "data scientist",      experience: 4, skills: ["python", "sql", "pandas", "statistics"],                  assessments: 4, baseScore: 62 },
  { name: "Suresh Patel",    email: "seed_suresh@example.com",   role: "QA Engineer",           targetRole: "qa engineer",         experience: 5, skills: ["selenium", "manual testing", "jira", "api testing"],      assessments: 4, baseScore: 65 },
  { name: "Anita Krishnan",  email: "seed_anita@example.com",    role: "Frontend Developer",    targetRole: "full stack developer",experience: 3, skills: ["react", "javascript", "css", "html", "typescript"],       assessments: 4, baseScore: 60 },
  { name: "Rajesh Kumar",    email: "seed_rajesh@example.com",   role: "Backend Developer",     targetRole: "software engineer",   experience: 5, skills: ["python", "sql", "rest api", "docker", "databases"],       assessments: 5, baseScore: 68 },
  { name: "Meena Agarwal",   email: "seed_meena@example.com",    role: "Business Analyst",      targetRole: "product manager",     experience: 4, skills: ["sql", "agile", "stakeholder management", "excel"],        assessments: 4, baseScore: 55 },
  { name: "Deepak Jain",     email: "seed_deepak@example.com",   role: "DevOps Engineer",       targetRole: "cloud architect",     experience: 6, skills: ["docker", "kubernetes", "aws", "ci/cd", "linux"],          assessments: 5, baseScore: 70 },
  { name: "Shreya Ghosh",    email: "seed_shreya@example.com",   role: "ML Engineer",           targetRole: "data scientist",      experience: 4, skills: ["python", "machine learning", "tensorflow", "sql"],         assessments: 4, baseScore: 64 },
  { name: "Prasad Nambiar",  email: "seed_prasad@example.com",   role: "Android Developer",     targetRole: "mobile developer",    experience: 5, skills: ["kotlin", "java", "android sdk", "rest api", "firebase"],  assessments: 4, baseScore: 66 },
  { name: "Lakshmi Varma",   email: "seed_lakshmi@example.com",  role: "UX Designer",           targetRole: "ui/ux designer",      experience: 4, skills: ["figma", "user research", "prototyping", "wireframing"],   assessments: 4, baseScore: 61 },
  { name: "Sanjay Mishra",   email: "seed_sanjay@example.com",   role: "Software Engineer",     targetRole: "backend developer",   experience: 3, skills: ["python", "rest api", "sql", "git", "microservices"],      assessments: 4, baseScore: 57 },
  { name: "Harini Subramanian", email: "seed_harini@example.com",role: "Data Engineer",         targetRole: "ml engineer",         experience: 5, skills: ["python", "sql", "spark", "etl", "airflow"],               assessments: 5, baseScore: 67 },
  { name: "Vinod Choudhary", email: "seed_vinod@example.com",    role: "Project Coordinator",   targetRole: "project manager",     experience: 4, skills: ["agile", "jira", "stakeholder management", "scrum"],        assessments: 4, baseScore: 53 },
  { name: "Swati Saxena",    email: "seed_swati@example.com",    role: "Security Analyst",      targetRole: "cybersecurity engineer", experience: 6, skills: ["networking", "firewalls", "siem", "vulnerability assessment", "linux"], assessments: 5, baseScore: 72 },
  { name: "Ganesh Pillai",   email: "seed_ganesh@example.com",   role: "Frontend Developer",    targetRole: "software engineer",   experience: 3, skills: ["javascript", "react", "typescript", "git", "css"],        assessments: 4, baseScore: 59 },
  { name: "Archana Nair",    email: "seed_archana@example.com",  role: "HR Executive",          targetRole: "hr manager",          experience: 5, skills: ["recruitment", "onboarding", "hris", "compliance"],         assessments: 4, baseScore: 60 },
  { name: "Vivek Pandey",    email: "seed_vivek@example.com",    role: "Cloud Engineer",        targetRole: "devops engineer",     experience: 4, skills: ["aws", "docker", "terraform", "linux", "ci/cd"],            assessments: 4, baseScore: 63 },
  { name: "Padma Venkat",    email: "seed_padma@example.com",    role: "Data Analyst",          targetRole: "data engineer",       experience: 6, skills: ["sql", "python", "etl", "airflow", "spark"],                assessments: 5, baseScore: 69 },
  { name: "Chetan Malhotra", email: "seed_chetan@example.com",   role: "iOS Developer",         targetRole: "ios developer",       experience: 3, skills: ["swift", "xcode", "rest api", "firebase"],                  assessments: 4, baseScore: 56 },
  { name: "Bindiya Kapoor",  email: "seed_bindiya@example.com",  role: "Business Analyst",      targetRole: "business analyst",    experience: 7, skills: ["sql", "excel", "requirements gathering", "process mapping", "agile", "documentation"], assessments: 5, baseScore: 73 },

  // ── SENIORS (15) ────────────────────────────────────────────────────────────
  { name: "Rajeev Nair",     email: "seed_rajeev@example.com",   role: "Senior Engineer",       targetRole: "software engineer",   experience: 10, skills: ["javascript", "python", "git", "algorithms", "data structures", "system design", "sql", "rest api"], assessments: 5, baseScore: 80 },
  { name: "Sunita Rao",      email: "seed_sunita@example.com",   role: "Lead Data Scientist",   targetRole: "data scientist",      experience: 12, skills: ["python", "machine learning", "statistics", "pandas", "numpy", "sql", "data visualization", "deep learning"], assessments: 5, baseScore: 85 },
  { name: "Mohan Krishnaswamy", email: "seed_mohan@example.com", role: "Principal Engineer",    targetRole: "cloud architect",     experience: 14, skills: ["aws", "azure", "terraform", "kubernetes", "networking", "security", "cost optimization"], assessments: 5, baseScore: 83 },
  { name: "Indira Menon",    email: "seed_indira@example.com",   role: "Senior DevOps",         targetRole: "devops engineer",     experience: 9, skills: ["docker", "kubernetes", "ci/cd", "linux", "aws", "terraform", "monitoring"], assessments: 5, baseScore: 78 },
  { name: "Ashok Hegde",     email: "seed_ashok@example.com",    role: "Senior ML Engineer",    targetRole: "ml engineer",         experience: 11, skills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "mlops", "docker"], assessments: 5, baseScore: 82 },
  { name: "Nalini Sharma",   email: "seed_nalini@example.com",   role: "Senior QA Lead",        targetRole: "qa engineer",         experience: 10, skills: ["test automation", "selenium", "manual testing", "api testing", "jira", "ci/cd", "python", "test planning"], assessments: 5, baseScore: 84 },
  { name: "Balaji Iyer",     email: "seed_balaji@example.com",   role: "VP Engineering",        targetRole: "project manager",     experience: 15, skills: ["agile", "scrum", "jira", "stakeholder management", "risk management", "budgeting", "communication"], assessments: 5, baseScore: 79 },
  { name: "Kamala Reddy",    email: "seed_kamala@example.com",   role: "Senior Data Engineer",  targetRole: "data engineer",       experience: 9, skills: ["python", "sql", "spark", "etl", "airflow", "data pipelines", "cloud"], assessments: 5, baseScore: 77 },
  { name: "Prashanth Shetty",email: "seed_prashanth@example.com",role: "Principal Architect",   targetRole: "software engineer",   experience: 13, skills: ["javascript", "python", "git", "system design", "sql", "rest api", "algorithms"], assessments: 5, baseScore: 86 },
  { name: "Usha Pillai",     email: "seed_usha@example.com",     role: "Senior UX Lead",        targetRole: "ui/ux designer",      experience: 10, skills: ["figma", "user research", "prototyping", "wireframing", "accessibility", "css", "usability testing", "design systems"], assessments: 5, baseScore: 81 },
  { name: "Gopal Subramanian", email: "seed_gopal@example.com",  role: "Senior Backend Dev",    targetRole: "backend developer",   experience: 11, skills: ["python", "node.js", "sql", "rest api", "databases", "system design", "docker", "microservices"], assessments: 5, baseScore: 83 },
  { name: "Vijaya Lakshmi",  email: "seed_vijaya@example.com",   role: "Senior HR Manager",     targetRole: "hr manager",          experience: 12, skills: ["recruitment", "employee relations", "performance management", "hris", "onboarding", "compliance", "talent acquisition", "communication"], assessments: 5, baseScore: 80 },
  { name: "Ramamurthy K",    email: "seed_ramamurthy@example.com",role: "Lead Security Eng",    targetRole: "cybersecurity engineer", experience: 10, skills: ["networking", "penetration testing", "firewalls", "siem", "vulnerability assessment", "python", "linux"], assessments: 5, baseScore: 79 },
  { name: "Saraswathi Nair", email: "seed_saraswathi@example.com",role: "Senior Analyst",       targetRole: "business analyst",    experience: 9,  skills: ["sql", "data analysis", "excel", "requirements gathering", "process mapping", "stakeholder management", "agile"], assessments: 5, baseScore: 76 },
  { name: "Dhananjay Patil", email: "seed_dhananjay@example.com",role: "Principal Full Stack",  targetRole: "full stack developer",experience: 12, skills: ["javascript", "react", "node.js", "sql", "rest api", "git", "docker", "typescript"], assessments: 5, baseScore: 87 },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Deleting existing seed users...");
  await db.assessment.deleteMany({
    where: { user: { email: { startsWith: "seed_" } } },
  });
  await db.user.deleteMany({ where: { email: { startsWith: "seed_" } } });

  console.log(`Inserting ${USERS.length} seed users...`);
  let count = 0;

  for (const u of USERS) {
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

    const assessmentData = makeAssessments(u.assessments, u.baseScore);
    for (const a of assessmentData) {
      await db.assessment.create({
        data: { userId: user.id, ...a },
      });
    }

    count++;
    process.stdout.write(`\r  ${count}/${USERS.length} inserted`);
  }

  console.log(`\nDone. ${count} users seeded with assessments.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
