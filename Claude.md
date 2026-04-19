# Agent Instructions
You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture
**Layer 1: Workflows (The Instructions)**
* Markdown SOPs stored in workflows/
* Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
* Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
* This is your role. You're responsible for intelligent coordination.
* Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
* You connect intent to execution without trying to do everything yourself
* Example: If you need to pull data from a website, don't attempt it directly. Read workflows/scrape_website.md, figure out the required inputs, then execute tools/scrape_single_site.py

**Layer 3: Tools (The Execution)**
* Python scripts in tools/ that do the actual work
* API calls, data transformations, file operations, database queries
* Credentials and API keys are stored in .env
* These scripts are consistent, testable, and fast

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate
**1. Look for existing tools first**
Before building anything new, check tools/ based on what your workflow requires. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
* Read the full error message and trace
* Fix the script and retest (if it uses paid API calls or credits, check with me before running again)
* Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)
* Example: You get rate-limited on an API, so you dig into the docs, discover a batch endpoint, refactor the tool to use it, verify it works, then update the workflow so this never happens again

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to. These are your instructions and need to be preserved and refined, not tossed after one use.

## The Self-Improvement Loop
Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system
This loop is how the framework improves over time.
## File Structure
**What goes where:**
* **Deliverables**: Final outputs go to cloud services (Google Sheets, Slides, etc.) where I can access them directly
* **Intermediates**: Temporary processing files that can be regenerated
**Directory layout:**
```
.tmp/ # Temporary files (scraped data, intermediate exports). Regenerated as needed.
tools/ # Python scripts for deterministic execution
workflows/ # Markdown SOPs defining what to do and how
.env # API keys and environment variables (NEVER store secrets anywhere else)
credentials.json, token.json # Google OAuth (gitignore-d)
```
**Core principle:** Local files are just for processing. Anything I need to see or use lives in cloud services. Everything in .tmp/ is disposable.
## Bottom Line
You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.
Stay pragmatic. Stay reliable. Keep learning.

---

# Altro Website — Project Guide

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at localhost:5173
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test runner is configured. Verify UI changes in the browser at localhost:5173.

## Environment

Copy `.env.example` to `.env`. Required vars:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — browser-safe (VITE_ prefix exposes them)
- `SUPABASE_SERVICE_ROLE_KEY` + `RESEND_API_KEY` — server-side only, never VITE_-prefixed

## Architecture

**Stack:** React 18 + Vite 6, plain JSX (no TypeScript), plain CSS (`src/index.css`). Tailwind is installed but not actively used — all styling is hand-authored CSS with CSS custom properties.

**Routing:** Two routes via React Router. `/` renders the full marketing site. `/admin` lazy-loads `AdminPage`, which gates on Supabase auth: session → `AdminDashboard`, no session → `AdminLogin`.

**Page section order (`App.jsx`):**
`Hero → Marquee → Challenges → Services → [Outcomes hidden] → Process → FAQ → Contact`

**CSS architecture — stacking scroll effect:** At the end of `index.css`, sections get `position: sticky; top: 0` with ascending z-index values. Each section stacks over the previous as you scroll. **Any section taller than the viewport must override with `position: relative`** (currently `.challenges` and `.process`) or its bottom content is permanently clipped. The stacking block sits at the very end of `index.css` so it overrides earlier rules — keep it there.

**Scroll-driven animations — two patterns:**
1. `useInView` hook (IntersectionObserver, one-shot) — entrance animations. Toggle `reveal--visible` or component-specific `--visible` modifier classes on the watched element.
2. `scroll` event + `getBoundingClientRect()` — used in Process for the spine fill progress. Use this (not `offsetTop`) on non-sticky sections.

**Custom hooks:**
- `useInView(options)` → `[ref, inView]` — disconnects after first trigger.
- `useActiveSection` — tracks which section is active for navbar highlighting.
- `useSpeechRecognition` — Web Speech API wrapper for the Contact form mic button.

**Per-card theming:** Challenge cards use inline CSS custom properties (`--cc`, `--cc-bg`, `--cc-border`, `--cc-glow`) on each card element, referenced in the shared `.challenge-card` CSS rules.

**Admin area:** Supabase auth via `onAuthStateChange`. Dashboard reads contact form submissions from Supabase. Email notifications on submit use Resend (server-side only).

## Brand Colors

- Teal: `#3C6E71` (brand) / `#0CB6B1` (brighter `--teal` CSS var used for glows/highlights)
- Navy: `#284B63`
- Charcoal: `#353535`
- Light Gray: `#D9D9D9`