# Career Guidance — Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Authentication — Clerk](#5-authentication--clerk)
6. [Feature Modules](#6-feature-modules)
   - 6.1 [Landing Page](#61-landing-page)
   - 6.2 [Onboarding](#62-onboarding)
   - 6.3 [Welcome Form (Extended Profile)](#63-welcome-form-extended-profile)
   - 6.4 [Industry Insights Dashboard](#64-industry-insights-dashboard)
   - 6.5 [AI Resume Builder](#65-ai-resume-builder)
   - 6.6 [AI Cover Letter Generator](#66-ai-cover-letter-generator)
   - 6.7 [Interview Prep & Quiz](#67-interview-prep--quiz)
   - 6.8 [Skill Gap Analysis](#68-skill-gap-analysis)
   - 6.9 [Career Chatbot](#69-career-chatbot)
7. [Server Actions (actions/)](#7-server-actions-actions)
8. [Background Jobs — Inngest](#8-background-jobs--inngest)
9. [API Routes](#9-api-routes)
10. [Routing Map](#10-routing-map)
11. [Key Libraries & Their Roles](#11-key-libraries--their-roles)
12. [Git Commit History](#12-git-commit-history)
13. [Environment Variables Required](#13-environment-variables-required)
14. [Data Flow Diagrams](#14-data-flow-diagrams)

---

## 1. Project Overview

**Career Guidance** (internal name: `ai-career-coach`) is a full-stack AI-powered career acceleration platform built with **Next.js 16**. It helps professionals at every stage of their career journey by combining personalized industry data with Google Gemini AI to generate resumes, cover letters, interview quizzes, skill gap analyses, and live chatbot coaching.

**Core value proposition:**
- Industry-specific insights auto-refreshed every week via background jobs
- AI that writes and improves resumes & cover letters in seconds
- Interactive interview prep quizzes tailored to the user's skills and industry
- Skill gap radar chart comparing current role vs. target role
- Floating career chatbot available on every page

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 + tailwindcss-animate |
| UI Components | shadcn/ui (Radix UI primitives) |
| Authentication | Clerk (`@clerk/nextjs`) |
| Database ORM | Prisma v6 |
| Database | PostgreSQL |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Background Jobs | Inngest v3 |
| Charts | Recharts v2 |
| Forms | React Hook Form + Zod validation |
| Markdown editor | `@uiw/react-md-editor` |
| PDF export | `html2pdf.js` |
| Notifications | Sonner (toast) |
| Icons | Lucide React |
| Date utils | date-fns v4 |

---

## 3. Folder Structure

```
career-guidance/
├── actions/                  # Next.js Server Actions (called from client)
│   ├── careerChatbot.js      # Gemini chatbot logic
│   ├── cover-letter.js       # Cover letter CRUD + AI generation
│   ├── dashboard.js          # Fetch industry insights for dashboard
│   ├── interview.js          # Quiz generation + result saving
│   ├── resume.js             # Resume save/get + AI improve
│   └── user.js               # User create/update (onboarding)
│
├── app/
│   ├── (auth)/               # Auth layout group (Clerk sign-in/sign-up)
│   │   ├── sign-in/          # Clerk sign-in page
│   │   └── sign-up/          # Clerk sign-up page
│   │
│   ├── (main)/               # Protected app pages (require login)
│   │   ├── layout.jsx        # Main layout: header + chatbot + children
│   │   ├── dashboard/        # Industry Insights dashboard
│   │   ├── onboarding/       # First-time industry selection form
│   │   ├── welcome-form/     # Extended profile (role, city, target)
│   │   ├── welcome/          # Welcome page after sign-up
│   │   ├── resume/           # Resume builder
│   │   ├── ai-cover-letter/  # Cover letter list, new, and preview
│   │   ├── interview/        # Interview prep + quiz
│   │   └── skillgap/         # Skill gap radar analysis
│   │
│   ├── (public)/             # Public pages (no auth)
│   │   └── LandingPage.jsx
│   │
│   ├── api/
│   │   └── inngest/
│   │       ├── route.js      # Inngest event handler
│   │       └── skillgap/     # GET /api/skillgap — AI skill gap endpoint
│   │
│   ├── lib/
│   │   ├── helper.js         # Markdown helper utilities
│   │   └── schema.js         # Zod validation schemas (onboarding, resume, etc.)
│   │
│   ├── globals.css           # Global CSS + custom animations
│   ├── layout.js             # Root layout (ClerkProvider, ThemeProvider)
│   ├── not-found.jsx         # 404 page
│   └── page.js               # Root page → renders LandingPage
│
├── components/
│   ├── career-chatbot.jsx    # Floating chatbot UI component
│   ├── header.jsx            # Navigation header
│   ├── hero.jsx              # Hero section for landing page
│   ├── theme-provider.jsx    # next-themes wrapper
│   └── ui/                   # shadcn/ui primitive components
│       ├── accordion.jsx
│       ├── alert-dialog.jsx
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── progress.jsx
│       ├── radio-group.jsx
│       ├── select.jsx
│       ├── sonner.jsx
│       ├── tabs.jsx
│       └── textarea.jsx
│
├── data/
│   ├── faqs.js               # FAQ data for landing page
│   ├── features.js           # Feature cards data
│   ├── howItWorks.js         # Step-by-step process data
│   ├── industries.js         # Industry + sub-industry list
│   └── testimonial.js        # Testimonial data
│
├── hooks/
│   └── use-fetch.js          # Custom hook: async fetch with loading/error state
│
├── lib/
│   ├── checkUser.js          # Sync Clerk user into Prisma DB on login
│   ├── inngest/
│   │   ├── client.js         # Inngest client initialization
│   │   └── function.js       # Weekly industry insights cron job
│   ├── prisma.js             # Prisma client singleton
│   └── utils.js              # Tailwind class merge utility (clsx + twMerge)
│
├── prisma/
│   ├── schema.prisma         # Full database schema
│   └── migrations/           # All DB migration SQL files
│
├── public/
│   ├── banner.jpeg, banner2.jpeg, banner3.jpeg
│   ├── bot.webp              # Chatbot avatar image
│   ├── logo.png
│   └── images/features/      # Feature section images
│
├── middleware.js             # Clerk auth middleware (protects routes)
├── next.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## 4. Database Schema (Prisma)

The database is **PostgreSQL**, managed via **Prisma ORM**.

### User
Stores every authenticated user. Synced from Clerk on first login via `lib/checkUser.js`.

| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| clerkUserId | String (unique) | Links to Clerk auth |
| email | String (unique) | |
| name | String? | |
| imageUrl | String? | Profile picture |
| industry | String? | e.g. `"tech-software-development"` |
| state | String? | Set in welcome-form |
| city | String? | Set in welcome-form |
| role | String? | Current job role |
| experience | Int? | Years of experience |
| targetRole | String? | Career goal role |
| targetLevel | String? | Entry / Mid / Senior |
| isOnboarded | Boolean | `false` until onboarding done |
| bio | String? | Professional bio |
| skills | String[] | Array of skills |

**Relations:** has many `Assessment`, has one `Resume`, has many `CoverLetter`, belongs to one `IndustryInsight`

### Assessment
Stores results from interview prep quizzes.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| userId | String | FK → User |
| quizScore | Float | Overall % score |
| questions | Json[] | `{question, answer, userAnswer, isCorrect, explanation}` |
| category | String | Always `"Technical"` currently |
| improvementTip | String? | AI-generated tip for wrong answers |

### Resume
One resume per user (upserted on save).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| userId | String (unique) | FK → User (one-to-one) |
| content | String (Text) | Markdown content |
| atsScore | Float? | ATS score (reserved) |
| feedback | String? | AI feedback (reserved) |

### CoverLetter
Multiple cover letters per user.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| userId | String | FK → User |
| content | String | Markdown letter |
| jobDescription | String? | Pasted JD |
| companyName | String | Target company |
| jobTitle | String | Target position |
| status | String | `"draft"` or `"completed"` |

### IndustryInsight
Cached AI-generated industry data, refreshed weekly.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| industry | String (unique) | e.g. `"tech-software-development"` |
| salaryRanges | Json[] | `{role, min, max, median, location}` |
| growthRate | Float | % growth |
| demandLevel | String | `"High"` / `"Medium"` / `"Low"` |
| topSkills | String[] | In-demand skills |
| marketOutlook | String | `"Positive"` / `"Neutral"` / `"Negative"` |
| keyTrends | String[] | Current market trends |
| recommendedSkills | String[] | Skills to learn |
| lastUpdated | DateTime | |
| nextUpdate | DateTime | Scheduled next refresh |

---

## 5. Authentication — Clerk

- **Provider:** `ClerkProvider` wraps the entire app in `app/layout.js`
- **Middleware:** `middleware.js` uses `clerkMiddleware()` to protect all `(main)` routes
- **Sign In / Sign Up:** Located at `app/(auth)/sign-in` and `app/(auth)/sign-up` using Clerk's hosted components
- **User Sync:** `lib/checkUser.js` is called on every protected page load. It finds or creates a `User` row in Postgres using the Clerk `userId`, ensuring the DB always stays in sync with Clerk.
- **Theme:** Uses `@clerk/themes` dark appearance package

---

## 6. Feature Modules

### 6.1 Landing Page

**File:** `app/(public)/LandingPage.jsx`, `app/page.js`

The public homepage visible to everyone (logged in or not). Sections:

1. **Hero** — `components/hero.jsx` — tagline, call-to-action button linking to `/dashboard`
2. **Features** — 4 feature cards with icons and descriptions (data from `data/features.js`)
3. **Stats** — 50+ Industries · 1000+ Questions · 95% Success Rate · 24/7 AI Support
4. **How It Works** — 4-step process (data from `data/howItWorks.js`)
5. **Testimonials** — 3 user testimonial cards with avatars (data from `data/testimonial.js`)
6. **FAQ** — Accordion-style FAQ (data from `data/faqs.js`)
7. **CTA** — Gradient banner with animated "Start Your Journey Today" button

**Images used:** `public/images/features/` (ai-career, industry, interview, resume PNGs)

---

### 6.2 Onboarding

**Files:**
- `app/(main)/onboarding/page.jsx`
- `app/(main)/onboarding/_components/onboarding-form.jsx`
- `actions/user.js` → `updateUser()`

**When triggered:** After sign-up, if `user.isOnboarded === false`, the main layout redirects to `/onboarding`.

**What the form collects:**
- Industry (dropdown — from `data/industries.js`)
- Sub-industry / Specialization (dynamic sub-list based on selected industry)
- Years of experience (number input)
- Skills (comma-separated text input)
- Professional bio (textarea)

**On submit:**
1. Formats industry as `"industryId-subIndustry-slug"` (e.g. `"tech-software-development"`)
2. Calls `updateUser()` server action
3. Upserts `IndustryInsight` row for this industry if it doesn't exist yet
4. Sets `isOnboarded = true` on the User
5. Redirects to `/dashboard`

**Validation:** Zod schema via `app/lib/schema.js` → `onboardingSchema`

---

### 6.3 Welcome Form (Extended Profile)

**File:** `app/(main)/welcome-form/page.jsx`

A secondary profile completion form that collects career-specific data needed for the Skill Gap feature:

- **Name** and **Email** — pre-filled from Clerk (read-only)
- **State** — dropdown (Karnataka, Maharashtra, TamilNadu, Delhi)
- **City** — dependent dropdown (populated by selected state)
- **Current Role** — dropdown (Software Engineer, Frontend, Backend, Full Stack, AI, ML, Data Scientist, DevOps, QA, Other)
- **Years of Experience** — dropdown (0, 0–1, 1–3, 3–5, 5+)
- **Target Role** — dropdown (Software Engineer, Full Stack, Backend, Data Scientist, AI Engineer)
- **Target Level** — dropdown (Entry, Mid, Senior)

On submit → calls `completeProfile()` server action → saves `state`, `city`, `role`, `experience`, `targetRole`, `targetLevel` to User → redirects to home.

---

### 6.4 Industry Insights Dashboard

**Files:**
- `app/(main)/dashboard/page.jsx`
- `app/(main)/dashboard/_component/dashboard-view.jsx`
- `actions/dashboard.js` → `getIndustryInsights()`

**What it shows:**
The dashboard reads the cached `IndustryInsight` row for the logged-in user's industry and displays:

| Card | Color Scheme | What it shows |
|---|---|---|
| Market Outlook | Green/Amber/Red gradient | Positive / Neutral / Negative with trending icon |
| Industry Growth | Blue gradient | Growth % + Progress bar |
| Demand Level | Green/Amber/Red gradient | High / Medium / Low with 3-segment bar |
| Top Skills | Violet gradient | Skill tags with pill badges |

Below the stat cards:
- **Salary Range Bar Chart** (Recharts BarChart) — Min, Median, Max salaries per role in $K
- **Key Industry Trends** — numbered list with primary-colored index circles
- **Recommended Skills** — colorful pill badges (teal, blue, violet rotating colors)
- **Meta badges** — "Updated dd/MM/yyyy" and "Refresh in X days"

**Color logic:** `getDemandLevelStyle()` and `getMarketOutlookInfo()` return card classes + icon colors based on the value level — this was **redesigned** in the most recent commit to use colorful gradient cards instead of plain cards.

---

### 6.5 AI Resume Builder

**Files:**
- `app/(main)/resume/page.jsx`
- `app/(main)/resume/_components/resume-builder.jsx`
- `app/(main)/resume/_components/entry-form.jsx`
- `actions/resume.js`

**Features:**
- Full markdown-based resume editor using `@uiw/react-md-editor`
- Sections: Contact Info, Summary, Skills, Work Experience, Education, Projects
- Each work/education/project entry has an **"Improve with AI"** button
  - Calls `improveWithAI({ current, type })` server action
  - Sends the current text to Gemini with a prompt to make it more impactful, quantifiable, and keyword-rich
  - Streams the improved version back into the form field
- **Save** button → `saveResume(content)` → upserts to `Resume` table
- **Download as PDF** → uses `html2pdf.js` to export the rendered markdown preview

---

### 6.6 AI Cover Letter Generator

**Files:**
- `app/(main)/ai-cover-letter/page.jsx` — list of all cover letters
- `app/(main)/ai-cover-letter/new/page.jsx` — generate new letter
- `app/(main)/ai-cover-letter/[id]/page.jsx` — view a specific letter
- `app/(main)/ai-cover-letter/_components/cover-letter-generator.jsx`
- `app/(main)/ai-cover-letter/_components/cover-letter-list.jsx`
- `app/(main)/ai-cover-letter/_components/cover-letter-preview.jsx`
- `actions/cover-letter.js`

**User flow:**
1. User goes to `/ai-cover-letter/new`
2. Fills in: Company Name, Job Title, Job Description
3. Clicks Generate → calls `generateCoverLetter(data)` server action
4. Gemini writes a professional cover letter in markdown format (max 400 words, proper business letter structure)
5. Letter is saved to `CoverLetter` table with status `"completed"`
6. User is shown a markdown preview
7. All past letters listed at `/ai-cover-letter` with delete option

**Server actions available:**
- `generateCoverLetter(data)` — AI generation + DB save
- `getCoverLetters()` — fetch all letters for user
- `getCoverLetter(id)` — fetch single letter
- `deleteCoverLetter(id)` — delete a letter

---

### 6.7 Interview Prep & Quiz

**Files:**
- `app/(main)/interview/page.jsx` — overview + stats
- `app/(main)/interview/mock/page.jsx` — take a quiz
- `app/(main)/interview/_components/quiz.jsx` — quiz question UI
- `app/(main)/interview/_components/quiz-result.jsx` — results screen
- `app/(main)/interview/_components/quiz-list.jsx` — past quiz history
- `app/(main)/interview/_components/stats-cards.jsx` — performance summary cards
- `app/(main)/interview/_components/performace-chart.jsx` — score trend chart
- `actions/interview.js`

**User flow:**
1. User navigates to `/interview/mock`
2. `generateQuiz()` server action calls Gemini:
   - Reads user's `industry` and `skills` from DB
   - Asks Gemini for 10 multiple-choice technical questions specific to those skills
   - Returns `{questions: [{question, options[4], correctAnswer, explanation}]}`
3. User answers each question (radio buttons)
4. On submit → `saveQuizResult(questions, answers, score)`:
   - Calculates which answers were wrong
   - If any wrong answers: calls Gemini again to generate a 1-2 sentence improvement tip
   - Saves full `Assessment` record to DB
5. Results screen shows: score, per-question breakdown, improvement tip
6. Back on `/interview` main page: stat cards (avg score, total quizzes, best score, areas to improve) and a line chart of score history over time

---

### 6.8 Skill Gap Analysis

**Files:**
- `app/(main)/skillgap/page.jsx` — full UI
- `app/api/inngest/skillgap/route.js` — GET API endpoint

**User flow:**
1. User visits `/skillgap`
2. Page calls `GET /api/skillgap`
3. API reads `role`, `experience`, `targetRole`, `targetLevel` from the User DB record
4. Calls Gemini 2.5 Flash with a detailed prompt to produce a JSON skill gap analysis:
   - `radarData` — array of skills with `yourLevel` (0–10) and `targetLevel` (0–10)
   - `skillsToDevelop` — skills with gap + reason
   - `strengths` — existing strong skills with description
   - `learningRoadmap` — phased learning plan with resources
   - `summary` — 2–3 sentence AI summary
5. UI renders:
   - **Radar Chart** (Recharts RadarChart) comparing your skill levels vs target role requirements in blue/green overlapping areas
   - **Skills to Develop** — orange-dot list with name + reason
   - **Your Strengths** — green-dot list with name + description
   - **Recommended Learning Path** — numbered phases with resource pills
   - **AI Summary** — highlighted card with the AI narrative

**Prerequisites:** User must have completed the Welcome Form (role and targetRole required). If missing, a "Complete Profile" prompt is shown.

---

### 6.9 Career Chatbot

**Files:**
- `components/career-chatbot.jsx` — floating UI component
- `actions/careerChatbot.js` — Gemini server action

**UI behaviour:**
- A **floating bot icon** (`/public/bot.webp`) appears fixed at bottom-right on every page inside `(main)/layout.jsx`
- A "Wanna chat" animated bubble hovers above it when the chat is closed
- Clicking the icon opens a chat window (320×420px, light blue background)
- Chat window has a primary-colored header showing "Career Bot — Online"
- Messages are displayed as chat bubbles (user = primary/right-aligned, AI = white/left-aligned)
- Input bar has rounded pill styling with Enter key support

**AI behaviour (`careerChatbot.js`):**
- Uses Gemini 2.5 Flash
- Prompt enforces strict rules:
  - Only career-related questions answered
  - All answers structured as bullet points
  - No paragraphs, max 1 emoji
  - Non-career questions get: "I can help only with career-related questions."
- Greetings (hi, hello, hey, etc.) are handled client-side without calling Gemini — instant polite reply

---

## 7. Server Actions (actions/)

All files use `"use server"` directive — they run on the server and are called directly from client components.

| File | Exports | Description |
|---|---|---|
| `user.js` | `updateUser()`, `getUserOnboardingStatus()` | Onboarding form submission; checks isOnboarded |
| `dashboard.js` | `getIndustryInsights()` | Fetches IndustryInsight row for user's industry |
| `resume.js` | `saveResume()`, `getResume()`, `improveWithAI()` | Resume CRUD + AI improvement |
| `cover-letter.js` | `generateCoverLetter()`, `getCoverLetters()`, `getCoverLetter()`, `deleteCoverLetter()` | Full cover letter lifecycle |
| `interview.js` | `generateQuiz()`, `saveQuizResult()`, `getAssessments()` | Quiz generation + result persistence |
| `careerChatbot.js` | `careerChat(message)` | Single-message Gemini chatbot call |

---

## 8. Background Jobs — Inngest

**Files:**
- `lib/inngest/client.js` — initializes the Inngest client
- `lib/inngest/function.js` — defines the cron function
- `app/api/inngest/route.js` — serves the Inngest webhook endpoint

**Function: `generateIndustryInsights`**
- **Schedule:** Every Sunday at midnight (`cron: "0 0 * * 0"`)
- **What it does:**
  1. Fetches all distinct `industry` values from `IndustryInsight` table
  2. For each industry, calls Gemini with a detailed prompt to get fresh JSON data (salaryRanges, growthRate, demandLevel, topSkills, marketOutlook, keyTrends, recommendedSkills)
  3. Updates the `IndustryInsight` row with new data
  4. Sets `lastUpdated = now` and `nextUpdate = now + 7 days`

This ensures the dashboard always shows relevant, up-to-date industry data without any manual intervention.

---

## 9. API Routes

| Route | Method | Description |
|---|---|---|
| `/api/inngest` | GET/POST | Inngest event handler (serves all Inngest functions) |
| `/api/inngest/skillgap` | GET | AI skill gap analysis for the logged-in user |

---

## 10. Routing Map

```
/                          → Landing Page (public)
/sign-in                   → Clerk sign-in
/sign-up                   → Clerk sign-up

/onboarding                → Industry + skills form (first login)
/welcome-form              → Extended profile (role, city, target)
/welcome                   → Welcome page

/dashboard                 → Industry Insights (main home after onboarding)
/resume                    → AI Resume Builder
/ai-cover-letter           → Cover letter list
/ai-cover-letter/new       → Generate new cover letter
/ai-cover-letter/[id]      → View a specific cover letter
/interview                 → Interview prep overview
/interview/mock            → Take an AI-generated quiz
/skillgap                  → Skill Gap radar analysis
```

---

## 11. Key Libraries & Their Roles

| Library | Role in project |
|---|---|
| `@clerk/nextjs` | Full auth (sign in, sign up, session, middleware, server-side userId) |
| `@google/generative-ai` | All AI features — quiz, resume improvement, cover letter, chatbot, skill gap, industry insights |
| `prisma` + `@prisma/client` | Type-safe DB access to PostgreSQL |
| `inngest` | Weekly background job to refresh industry data |
| `recharts` | Bar chart (salary), Line chart (quiz scores), Radar chart (skill gap) |
| `react-hook-form` + `zod` | Form validation (onboarding, resume entries) |
| `@uiw/react-md-editor` | Markdown editor + preview for resume builder |
| `html2pdf.js` | Client-side PDF export of resume |
| `sonner` | Toast notifications throughout the app |
| `next-themes` | Dark/light theme toggle |
| `date-fns` | Formatting dates in dashboard (last updated, next refresh distance) |
| `lucide-react` | All icons throughout the UI |
| `react-spinners` | Loading spinners |
| `react-markdown` | Renders markdown content in cover letter preview |

---

## 12. Git Commit History

| Commit | Message | What Changed |
|---|---|---|
| `c30df40` | Merge pull request #1 | Merged redesigned dashboard into main |
| `6813088` | Redesign Industry Insights dashboard with colorful card layout | **Your latest work** — replaced plain cards with color-coded gradient stat cards (emerald/blue/amber/violet/red based on value), custom tooltip for salary chart, colored skill pills, numbered trend list |
| `fff2af5` | Initial commit with my changes | Added skill gap feature, welcome form, career chatbot (bot.webp floating icon), updated schema with role/targetRole/targetLevel/state/city fields, added skillgap API route |
| `0f0d29b` | Update README.md | README updates |
| `d83c7a1` | Initial commit | Base project setup |
| `75fa24a` | Update README.md | — |
| `2b5ccba` | refactoring | Code cleanup |
| `7f1ae7b` | how it works | Landing page "How It Works" section |
| `47d8b5e` | improvements | UI improvements |
| `9e34ec1` | alignment changes | Layout alignment fixes |
| `64e3f8a` | padding bottom | Spacing fixes |
| `e823723` | fix markdown | Markdown rendering fix |
| `45cb12b` | fix hero section | Hero section fix |
| `a114060` | update package | Dependency updates |
| `9e103bd` | update faqs | FAQ data updates |
| `0c688de` | interview prep, resume and cover letter | Interview, Resume, Cover Letter features added |
| `68a7307` | Landing Page | Initial landing page |
| `aeb0e42` | Update README.md | — |
| `4ff63ed` | Initialise new app | Next.js app initialization |
| `c4ed352` | Initial commit from Create Next App | create-next-app scaffold |

---

## 13. Environment Variables Required

Create a `.env` file at the project root with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Google Gemini AI
GEMINI_API_KEY=AIza...

# Inngest (background jobs)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

---

## 14. Data Flow Diagrams

### New User Sign-Up Flow

```
User signs up (Clerk)
       ↓
middleware.js checks auth
       ↓
lib/checkUser.js → creates User row in Postgres (clerkUserId, email, name)
       ↓
isOnboarded = false → redirect to /onboarding
       ↓
User fills: industry, subIndustry, experience, skills, bio
       ↓
actions/user.js → updateUser() → saves to DB + upserts IndustryInsight
       ↓
isOnboarded = true → redirect to /welcome-form
       ↓
User fills: state, city, currentRole, experience, targetRole, targetLevel
       ↓
actions/CompleteProfile → saves to User row
       ↓
Redirect to /dashboard
```

### Dashboard Data Flow

```
User visits /dashboard
       ↓
actions/dashboard.js → getIndustryInsights()
       ↓
Reads IndustryInsight row (pre-cached by Inngest background job)
       ↓
DashboardView renders:
  - 4 stat cards (Market Outlook, Growth, Demand, Top Skills)
  - Salary bar chart
  - Key Trends list
  - Recommended Skills pills
```

### AI Quiz Flow

```
User visits /interview/mock
       ↓
generateQuiz() server action
       ↓
Reads user.industry + user.skills from DB
       ↓
Gemini 2.5 Flash → 10 MCQ questions (JSON)
       ↓
User answers all questions
       ↓
saveQuizResult(questions, answers, score)
       ↓
If wrong answers → Gemini generates improvementTip
       ↓
Assessment saved to DB
       ↓
Results shown + history chart updated
```

### Skill Gap Flow

```
User visits /skillgap
       ↓
Client fetches GET /api/inngest/skillgap
       ↓
API reads user.role + user.targetRole + user.experience from DB
       ↓
Gemini 2.5 Flash → JSON with radarData, skillsToDevelop, strengths, learningRoadmap, summary
       ↓
UI renders Radar chart + cards + roadmap
```

### Weekly Industry Insights Refresh (Inngest)

```
Every Sunday midnight (cron)
       ↓
generateIndustryInsights() fires
       ↓
Fetches all industries from IndustryInsight table
       ↓
For each industry: Gemini generates fresh salary/trends/skills data
       ↓
Updates IndustryInsight row + sets nextUpdate = now + 7 days
       ↓
Dashboard shows fresh data next visit
```

---

*Documentation generated: 2026-05-28*
