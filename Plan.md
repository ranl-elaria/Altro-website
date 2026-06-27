# plan.md

Framework for planning work before execution. Use this template to think through scope, dependencies, and success criteria. Validate output before starting.

---

## Planning Template

Fill out each section **before** you start coding. This ensures clarity and reduces rework.

### 1. Problem Statement
**What are we solving? Why?**

```
Problem: [One sentence describing the issue or request]
Impact: [Who benefits? What breaks if we don't fix this?]
Constraints: [Budget, timeline, dependencies, scope limits]
```

**Example:**
```
Problem: Contact form submissions don't work in the modal
Impact: Potential customers can't reach us; sales loses leads
Constraints: Must stay visual consistent, non-blocking (no redirect)
```

### 2. Scope Definition
**What's in scope? What's explicitly out?**

```
IN SCOPE:
- [ ] Item 1
- [ ] Item 2

OUT OF SCOPE:
- Item X (why: reason)
- Item Y (why: reason)
```

**Example:**
```
IN SCOPE:
- [ ] Fix form validation
- [ ] Add success/error messages
- [ ] Test on mobile

OUT OF SCOPE:
- Email confirmation (requires new DB table)
- Analytics tracking (separate project)
```

### 3. Success Criteria
**How do we know it's done? Be specific and testable.**

```
✅ Acceptance Criteria:
- [ ] Forms submit without errors
- [ ] Users see confirmation message
- [ ] Works on Chrome, Safari, Mobile
- [ ] No new console errors
```

**Example:**
```
✅ For contact modal fix:
- [ ] Submit button calls API successfully
- [ ] Form clears after success
- [ ] Error message shows on failure
- [ ] Mobile viewport still works
- [ ] No layout shift on submit
```

### 4. Technical Approach
**How will we solve this? What's the implementation strategy?**

```
Option A: [Approach 1]
Pros: [benefits]
Cons: [tradeoffs]

Option B: [Approach 2]
Pros: [benefits]
Cons: [tradeoffs]

CHOSEN: Option [X] because [reason]
```

**Example:**
```
Option A: Add validation in component state
Pros: Simple, contained logic
Cons: Duplicates validation rules elsewhere

Option B: Create shared validation hook
Pros: Reusable, DRY
Cons: Extra abstraction overhead

CHOSEN: Option A (validation already exists in ContactForm, just wire modal to use it)
```

### 5. Files That Will Change
**Map out every file you'll touch. Helps catch dependencies.**

```
Changes:
- [ ] src/components/ContactModal.jsx (wire form handler)
- [ ] src/lib/api.js (add submit endpoint if missing)
- [ ] src/context/ModalContext.jsx (reset form on close)

New files:
- [ ] None

Dependencies:
- ContactForm component (already exists)
- Supabase endpoint (already exists)
```

### 6. Validation Checklist
**Before you call your work done, verify these.**

```
Code Quality:
- [ ] No console errors/warnings
- [ ] Follows coding standards (CLAUDE.md)
- [ ] No dead code or orphaned imports

Testing:
- [ ] Happy path works (valid input → success)
- [ ] Error path works (invalid input → error message)
- [ ] Edge cases handled (empty fields, network timeout, etc.)
- [ ] Mobile viewport tested
- [ ] Keyboard navigation works (accessibility)

Visual:
- [ ] Design tokens used (no hardcoded colors)
- [ ] Consistent with site theme
- [ ] No layout shift or janky animations
- [ ] Responsive on mobile/tablet/desktop

Git:
- [ ] Commit message is clear
- [ ] Only changed files related to task (no cleanup)
- [ ] No debug code left in
```

### 7. Related Skills
**Quick-link to tools that help with this work.**

| Skill | When to use | Example |
|-------|-----------|---------|
| `/design-taste-frontend` | Adding new UI components or redesigning sections | New landing page hero, contact form styling |
| `/simplify` | After implementing, review code for efficiency | Refactor ContactForm to remove duplication |
| `/update-config` | Configuring hooks or environment variables | Add new env var for API endpoint |
| `/caveman:caveman-review` | Quick code review before PR | Review ContactModal changes |
| `/loop` | Polling/monitoring during deploys or testing | Check deploy status after merge to main |

**Other common skills for this project:**
- `/review` — Full PR review (before merging to main)
- `/ultrareview` — Multi-agent code review (optional, expensive)

---

## Example: Complete Plan

**Task:** Fix contact form in modal

**1. Problem Statement**
```
Problem: Contact form in modal doesn't submit
Impact: Users can't reach sales; we lose inquiries
Constraints: Non-blocking, must stay in modal, 2-hour window
```

**2. Scope**
```
IN SCOPE:
- [ ] Debug why form submission fails
- [ ] Wire up API call if missing
- [ ] Add success/error feedback

OUT OF SCOPE:
- Email verification (new feature)
- Analytics (separate)
```

**3. Success Criteria**
```
✅ Form submits and sends email
✅ User sees "Thanks! We'll be in touch" message
✅ Form clears after submit
✅ Error message shows if submission fails
✅ Works on mobile (iOS + Android)
```

**4. Technical Approach**
```
CHOSEN: Wire ContactForm component to existing Resend API
- ContactForm already has validation
- Resend endpoint exists in src/lib/api.js
- Modal context can reset form on close
- No new dependencies needed
```

**5. Files That Will Change**
```
- [ ] src/components/ContactModal.jsx (import ContactForm, wire handler)
- [ ] src/lib/api.js (verify sendEmail exists, debug if needed)
- [ ] src/context/ModalContext.jsx (reset form on close event)
```

**6. Validation Before PR**
```
☑ Happy path: Submit valid form → API success → message shows
☑ Error path: Network error → error message shown
☑ Edge: Empty fields → validation error (not submit)
☑ Mobile: Tested on iPhone, form still visible, keyboard doesn't crush layout
☑ Accessibility: Form inputs have labels, button is keyboard-focusable
☑ No console errors
```

**7. Resources**
```
CLAUDE.md → Component Structure, Workflows
ContactForm.jsx → Existing implementation
/simplify → Review code before PR
/caveman:caveman-review → Quick review of changes
```

---

## How to Use This

**For each new task/feature:**

1. **Plan first** → Fill out sections 1–5 above
2. **Identify files** → Section 5 tells you scope
3. **Build** → Touch only those files
4. **Validate** → Run through section 6 checklist
5. **PR** → Commit and request review

**For complex tasks:**
- Section 4 (Technical Approach) is your decision-making checkpoint
- If multiple valid approaches exist, pick the simplest one first
- Document tradeoffs in the plan, not in code

**For quick tasks:**
- Sections 1–3 are minimal (problem, scope, criteria)
- Sections 4–7 can be brief or skipped for trivial fixes
- Always do validation (section 6) before calling it done

**When stuck:**
- Review section 4 (are you overcomplicating?)
- Re-read section 3 (did scope creep?)
- Check section 5 (are you touching files you shouldn't?)

---

## Integration with CLAUDE.md

- **CLAUDE.md** = behavioral guidelines, project context, tech stack
- **plan.md** = planning template for specific work

Use them together:
- `plan.md`: "Here's my approach for this feature"
- `CLAUDE.md`: "Here's how we write code and structure components"

---

**Created:** 2026-06-25 | **Last updated:** 2026-06-25
