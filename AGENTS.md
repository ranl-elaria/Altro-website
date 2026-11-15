# AGENTS.md

Behavioral guidelines and project context for consistent, high-quality development on the Altro AI Website (altroai.net).

**Principle:** Minimize code, maximize clarity. Touch only what's asked. Surface assumptions before implementing.

---

## ⚡ Quick Navigation

- **[Behavioral Guidelines](#behavioral-guidelines)** — How to work on this codebase
- **[Project Context](#project-context)** — What this is, why it exists
- **[Tech Stack](#tech-stack)** — Frameworks, libraries, deployment
- **[Project Structure](#project-structure)** — Directories and what lives in each
- **[Coding Standards](#coding-standards)** — Patterns, naming, component structure
- **[Workflows](#workflows)** — How to add features, deploy, debug
- **[File Index](#file-index)** — All critical files mapped (auto-updated)

---

## Behavioral Guidelines

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- Present multiple interpretations if they exist—don't pick silently.
- Point out simpler approaches. Push back when warranted.
- If confused, stop. Name what's unclear.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" unless requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer call this overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if different.
- Mention unrelated dead code—don't delete it.

Your changes create orphans? Remove them. Pre-existing dead code? Leave it.

**The test:** Every changed line traces to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → Write tests for invalid inputs, make them pass
- "Fix the bug" → Write test reproducing it, make it pass
- "Refactor X" → Ensure tests pass before and after

For multi-step work, state a brief plan with verification checks:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong criteria → independent loops. Weak criteria ("make it work") → constant clarification.

---

## Project Context

**Altro AI** is an Israeli AI freelancing agency focused on automations and web applications. This website is the public face: landing page, case studies, contact, admin dashboard for managing projects and proposals.

**Current state** (as of June 2026):
- Main site live, design system consolidated
- Admin dashboard with XPlace freelance project integration
- Contact modal replaces anchor scrolling
- Video background component created but not yet wired
- Active branch: `content-rewriting`

**Key business context:**
- B2B focused: targeting companies needing AI automation/web solutions
- Admin dashboard: internal tool for managing projects and generating proposals via XPlace
- Design-first approach: motion, typography, and color tokens recently consolidated

---

## Tech Stack

| Layer | Technology | Why | Version |
|-------|-----------|-----|---------|
| **Build** | Vite | Fast dev server, optimized builds | 6.3.1 |
| **UI Framework** | React | Component library, familiar ecosystem | 18.3.1 |
| **Styling** | TailwindCSS + Vite plugin | Utility-first, fast dev experience | 4.2.2 |
| **Animation** | Framer Motion + Motion | Production-grade motion, gesture handling | 12.38.0 / 12.40.0 |
| **Routing** | React Router | Client-side navigation | 7.14.0 |
| **Backend** | Supabase + Resend | Auth, DB, email service | ^2.103.0 / 6.10.0 |
| **Deployment** | Vercel | Zero-config, automatic deploys | N/A |

**Optional tools:**
- `motion-v`: Advanced motion patterns
- `supabase` CLI: Local dev, migrations

---

## Project Structure

```
Altro Website/
├── src/                          # React source code
│   ├── components/               # React components (Hero, Footer, Modal, etc.)
│   │   └── illustrations/        # SVG/visual components
│   ├── pages/                    # Page-level components (routed via App.jsx)
│   ├── hooks/                    # Custom React hooks
│   ├── context/                  # Context providers (state management)
│   ├── lib/                      # Utility functions, API helpers, configs
│   ├── i18n/                     # Internationalization / language files
│   ├── App.jsx                   # Root component, router setup
│   └── main.jsx                  # React DOM render entry
│
├── public/                       # Static assets (favicon, images, etc.)
├── api/                          # Serverless API routes (if any)
├── supabase/                     # Supabase migrations, schema, policies
├── stripe/                       # Stripe webhook handlers / configs
├── vercel/                       # Vercel deployment config
├── workflows/                    # GitHub Actions / CI-CD workflows
│
├── 01_research/                  # Research docs, notes, planning, research skills
├── 02_planning/                  # Feature planning, PRD docs, planning skills
├── 03_Design/                    # Design files, design tokens, Figma specs, Design skills
├── 04_Marketing/                 # Marketing assets, copy, analytics, marketing skills
├── 05_coding/                    # Dev notes, bug tracking, technical docs, coding skills
│
├── tools/                        # Build scripts, utilities
├── framer/                       # Framer prototypes (if any)
├── superpowers/                  # Custom tools / scripts
│
├── AGENTS.md                     # This file
├── plan.md                       # Planning template and framework before working
├── vite.config.js                # Vite build config
├── tailwind.config.js            # Tailwind design tokens
├── package.json                  # Dependencies
└── .Codex/                      # Codex settings, plugins, memory
```

**Key directories explained:**

| Dir | Purpose | When to touch |
|-----|---------|--------------|
| `src/components/` | Reusable UI components | Adding UI features, fixing layouts |
| `src/lib/` | Shared logic, API calls, helpers | Adding new API integrations, utilities |
| `src/context/` | Global state (theme, auth, etc.) | Managing app-wide state |
| `03_Design/` | Color tokens, typography, motion specs | Implementing design changes |
| `supabase/` | Database schema, migrations, policies | Adding DB features, auth rules |
| `workflows/` | GitHub Actions CI/CD | Changing deploy or test behavior |

---

## Coding Standards

### Component Structure

```jsx
// File: src/components/MyComponent.jsx
// ESM module, exported as named export (also default for convenience)

import { motion } from 'framer-motion';
import { Button } from './Button'; // Local imports first
import { useCustomHook } from '../hooks'; // Then hooks
import { apiHelper } from '../lib/api'; // Then utils

// Component (PascalCase)
export default function MyComponent({ prop1, prop2 }) {
  // Hooks at top
  const [state, setState] = useState(null);
  const customValue = useCustomHook();

  // Event handlers
  const handleClick = () => {
    // handler logic
  };

  // Render
  return (
    <motion.div /* Framer Motion for transitions */>
      {/* JSX content */}
    </motion.div>
  );
}
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `Hero`, `ContactModal`, `AdminDashboard` |
| Functions | camelCase | `handleSubmit`, `calculateTotal` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Booleans | `is*`, `has*`, `can*` | `isLoading`, `hasError`, `canSubmit` |
| Handlers | `handle*` | `handleClick`, `handleChange` |
| CSS classes | kebab-case (Tailwind) | `text-white`, `bg-slate-900` |

### Component Patterns

- **Container vs Presentational:** Containers handle logic, pass data down. Presentational components render props.
- **Controlled Components:** Use React state for form inputs; don't rely on DOM state.
- **Framer Motion:** Use `motion.*` components for animations. Avoid CSS-only animations (harder to coordinate).
- **Lazy Loading:** Use React.lazy() for code-split pages; wrap with Suspense.

### State Management

- **Local state:** useState for component-level state.
- **Shared state:** React Context (already in place) for theme, auth, modals.
- **External data:** Supabase queries in hooks or effects.

---

## Workflows

### Adding a New Feature

1. **Plan** → Read plan.md framework, identify scope & dependencies
2. **Create branch** → `git checkout -b feature/short-name`
3. **Build component** → Add to `src/components/`, follow structure above
4. **Integrate** → Wire into App.jsx router or parent component
5. **Test** → Start dev server (`npm run dev`), verify UI in browser
6. **Update docs** → Add new file to [File Index](#file-index) if critical
7. **Commit** → Clear message, reference task
8. **PR** → Link to issue, describe changes and testing

### Deploying

- **Staging:** Merge to `develop` (auto-deploys to preview)
- **Production:** Merge to `main` (auto-deploys via Vercel)
- **Manual preview:** `npm run build && npm run preview`

### Adding Database Features

1. Create migration: `supabase migration new feature_name`
2. Write SQL in `supabase/migrations/`
3. Apply locally: `supabase db push`
4. Update TypeScript types if needed
5. Add RLS policies in Supabase dashboard

### Debugging

- **Dev server:** `npm run dev` (port 5173 by default)
- **Build issues:** Check `vite.config.js`, clear `.vite/` cache
- **Styling:** Check `tailwind.config.js` for token definitions
- **Animations:** Use Framer Motion DevTools in browser
- **Database:** Supabase dashboard → SQL editor for direct queries

---

## File Index

**Last updated:** 2026-06-25 | Auto-updated when new critical files added

### Critical Files (Always keep in sync)

| File | Purpose | Last touched |
|------|---------|--------------|
| `src/App.jsx` | Router, main layout, global wiring | 2026-06-24 |
| `src/components/Hero.jsx` | Landing page hero section | 2026-06-24 |
| `src/components/ContactModal.jsx` | Contact form modal | 2026-06-24 |
| `src/components/AdminDashboard.jsx` | Admin interface for projects | 2026-06-18 |
| `src/lib/` | API helpers, utilities, shared logic | ongoing |
| `src/context/` | Auth context, theme context, modals | 2026-06-24 |
| `tailwind.config.js` | Color tokens, design system | 2026-06-24 |
| `supabase/migrations/` | Database schema, RLS policies | ongoing |
| `.Codex/skills/` | All project skills (design, coding, workflow, marketing) | 2026-06-25 |
| `04_Marketing/audits/` | UI/UX, copy, SEO audit reports | 2026-06-25 |

| `src/lib/sales/crm-delivery.js` | Authenticated CRM delivery, lease and retry classification | 2026-11-15 |
| `api/crm-retry.js` | Protected daily CRM retry worker | 2026-11-15 |

### Component Inventory

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| Hero | `src/components/Hero.jsx` | Landing page hero | ✅ Active |
| Footer | `src/components/Footer.jsx` | Site footer | ✅ Active |
| ContactModal | `src/components/ContactModal.jsx` | Contact form overlay | ✅ Active |
| Challenges | `src/components/Challenges.jsx` | Solutions showcase | ✅ Active |
| FAQ | `src/components/FAQ.jsx` | FAQ section | ✅ Active |
| AdminDashboard | `src/components/AdminDashboard.jsx` | Admin panel | ✅ Active |
| VideoBackground | `src/components/VideoBackground.jsx` | Full-page video | 🚧 Created, not wired |
| FloatingCTA | `src/components/FloatingCTA.jsx` | Sticky CTA button | ✅ Active |

### Config Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Build pipeline |
| `tailwind.config.js` | Design tokens & theme |
| `package.json` | Dependencies |
| `.vercel/` | Deployment config |
| `.github/workflows/` | CI/CD pipelines |

### Directories to Know

| Path | Purpose |
|------|---------|
| `03_Design/` | Design specs, tokens, motion library |
| `05_coding/` | Dev notes, bugs, tech decisions |
| `supabase/` | Database migrations, RLS policies |
| `.Codex/` | Codex settings, memory, hooks |

---

## How to Update This File

When **adding new critical files** or **changing project structure:**

1. Update the relevant section (File Index, Project Structure, etc.)
2. Commit with message: `docs: update AGENTS.md — [what changed]`
3. Keep descriptions under ~50 words per entry
4. Keep File Index ordered by importance, not alphabetically

**Note:** This file is the source of truth. If you notice it's stale, it should be updated immediately, not silently worked around.

---

**Last verified:** 2026-06-25 | Next review: After major structural changes
