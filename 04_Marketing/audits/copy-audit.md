# Copywriting Audit — Altro Website (Bilingual EN + HE)
Generated: 2026-06-25 | Branch: content-rewriting | Languages: English (default), Hebrew

> **Disclaimer.** Hebrew nuance review requires a native HE copywriter. This audit flags structural, voice-architecture, and parity issues; tonal fluency and idiom polish in Hebrew should be verified by a native speaker before any rewrite ships. Hebrew rewrites in this document are written by a fluent reader, not a native marketing copywriter, and are intended as direction, not final copy.

---

## Executive Summary

Altro's English copy is sharp: candid, specific, ownership-forward. The Hebrew copy is on-brand in structure but drifts in three measurable ways: it leans more abstract/technical, it embeds Latin-script jargon inside Hebrew sentences (⁨APIs⁩, ⁨CRM⁩, ⁨AI⁩), and — most damagingly — its two primary CTAs ("Let's Chatbot", "Let's Connectit") read as broken English to any visitor who doesn't recognize them as an in-joke.

**Top 5 findings:**

1. **P0 — "Let's Chatbot" Hero CTA (HE)** at `src/i18n/translations.js:169`. A literal English phrase appears as the most prominent Hebrew CTA on the site. A footnote ("מודים באשמה, יצאנו קצת גיקים") signals intent, but a non-priming visitor sees broken localization, not voice. Same problem repeats at line 245 with `Let's Connectit` on the contact submit button.
2. **P0 — 7 hardcoded user-facing strings bypass i18n** (Services, Challenges, Outcomes, Contact, ContactModal, App fallback). Hebrew visitors see English in production. Two of those strings (`ContactModal:101-103`) duplicate keys that already exist in the i18n table (`contact.successTitle`, `contact.successBody`), meaning the maintained translations are silently ignored.
3. **P1 — Voice drift EN→HE.** EN is candid and operator-flavored ("It works until it doesn't", "Your team is doing work that should be running itself"). HE substitutes more abstract enterprise phrasing ("מערכות ווב וסוכני AI שנבנים במיוחד עבור האופרציה שלכם"). Not wrong — but flatter than the English, and noticeably more generic-Israeli-B2B.
4. **P1 — Hebrew uses Latin-script acronyms inline.** `⁨APIs⁩`, `⁨CRM⁩`, `⁨AI⁩` appear unbracketed inside Hebrew sentences in Hero, Marquee, Services, FAQ, and Footer. The Unicode isolate marks (`⁨ ⁩`, U+2068/2069) suggest someone tried to fix RTL flipping, but the underlying register choice (English-inside-Hebrew) is the real issue and should be decided deliberately, not left as a tooling artifact.
5. **P2 — No Hebrew display font.** Inter Variable serves both locales. Hebrew Inter is acceptable but not designed for Hebrew typography — headlines render with mismatched weight and rhythm vs. the Latin set. Pair with Heebo / Assistant / Rubik for HE headlines.

---

## P0 — Content Bugs (must fix)

### 1. "Let's Chatbot" — Hero CTA in HE
**File:** `src/i18n/translations.js:169-170`
**Current:**
```
'hero.cta': 'Let\'s Chatbot',
'hero.ctaHint': '*(מודים באשמה, יצאנו קצת גיקים)',
```
**Problem.** The most prominent CTA on the Hebrew home page is English. The footnote frames it as a pun, but a first-time Hebrew visitor doesn't have the priming; they read a broken localization. The pun also doesn't translate — "chatbot" isn't a verb in Hebrew, so the wordplay (chat / let's chat / chatbot) collapses. The contact section repeats the same gag (`Let's Connectit`, line 245) which compounds rather than reinforces it.

**Recommendation.** Decide whether the geek-pun is brand voice or accident. Two clean options:

- **Option A — Keep voice, drop English.** Hebrew rewrite that preserves the candid/playful register:
  ```
  'hero.cta': 'בואו נדבר על מה ששובר אצלכם',
  'hero.ctaHint': 'שיחת היכרות חינם. בלי התחייבות.',
  ```
- **Option B — Keep the pun, but make it work in Hebrew.** A Hebrew geek-pun that doesn't require knowing English:
  ```
  'hero.cta': 'בואו נדבר (כן, גם עם בני אדם)',
  'hero.ctaHint': '*(מודים באשמה, אנחנו גיקים)',
  ```

Same fix pattern applies to `contact.submit` (line 245): replace `Let's Connectit` with `שלחו לנו` or `קדימה, שלחו`.

### 2. Hardcoded user-facing strings — 7 instances bypass i18n

| # | File:Line | Current (EN, hardcoded) | Visible in HE? | Fix |
|---|-----------|-------------------------|----------------|-----|
| 1 | `src/components/Services.jsx:167` | `"Tell us about your challenge"` | Yes (renders EN) | Add key `services.cta.label` → `'תארו לנו את האתגר'` |
| 2 | `src/components/Challenges.jsx:98` | `"Sound like your business? Let's talk."` | Yes | Add key `designed.cta` → `'נשמע מוכר? בואו נדבר.'` |
| 3 | `src/components/Challenges.jsx:100` | `"Tell us what's slowing you down"` | Yes | Add key `designed.ctaLabel` → `'ספרו לנו מה מאט אתכם'` |
| 4 | `src/components/Outcomes.jsx:106` | `"Results from the last 12 months"` | Yes | Add key `outcomes.heading` → `'תוצאות מ-12 החודשים האחרונים'` |
| 5 | `src/components/Outcomes.jsx:108` | `"Real numbers from live deployments…"` | Yes | Add key `outcomes.sub` → `'מספרים אמיתיים מפריסות חיות בייצור.'` |
| 6 | `src/components/Outcomes.jsx:110` | `"Start a project"` | Yes | Reuse existing `floatingCta.text` |
| 7 | `src/components/Contact.jsx:75,93` | `"(required)"` (×2) | Yes | Add key `contact.required` → `'(חובה)'` |
| 8 | `src/components/ContactModal.jsx:101-103` | `"Message sent"` / `"Thanks for reaching out…"` | Yes | **Replace with existing keys** `contact.successTitle` and `contact.successBody` |
| 9 | `src/App.jsx:80` | `"Loading…"` | Yes | Add key `app.loading` → `'טוען…'` |

**Note on #8.** The two ContactModal strings already exist in `translations.js` (lines 105-106 EN, 248-249 HE). The component is hardcoding duplicates that drift from the maintained source. Worst-case scenario: copy team updates HE translations, modal silently keeps showing stale English. Fix is mechanical: import `useT()` and reference the existing keys.

### 3. ContactModal duplicates an i18n key
Already covered in row 8 above, flagged separately because it's a different *class* of bug — not "missing translation" but "translation exists and is ignored." This is the highest-leverage fix in the audit: one component, one diff, removes two stale strings.

---

## Brand Voice Analysis

Drawing on `.claude/skills/design/impeccable/reference/brand.md`'s framing (voice as physical-object words, not category words):

**Altro's voice in three words: candid, operator-fluent, ownership-forward.**

- *Candid* — "It works until it doesn't" (Challenges 01), "This is where most projects fail" (Process 02). The copy admits uncomfortable truths the visitor already knows.
- *Operator-fluent* — "copy-pasting between tools", "pulling the same reports every week", "the process lives in someone's head." Specific to the daily work, not abstract enterprise speak.
- *Ownership-forward* — "You own everything we build: the code, the system, the data" (FAQ 04). "No black boxes, ever."

### Voice consistency scores

Scale: 1 = generic enterprise B2B; 5 = unmistakably Altro.

| Section | EN | HE | Notes |
|---|---|---|---|
| Hero | 5 | 2 | EN names the visitor's situation; HE describes Altro's offering. Different sentence shapes entirely. |
| Marquee | 4 | 3 | HE is fine but "ללא חריגות מהיקף" reads more formal than EN "No Scope Creep". |
| Challenges (designed.*) | 5 | 3 | EN sounds like an operator; HE sounds like a brochure ("שחיקה הזו", "תהליכים יציבים"). |
| Services | 5 | 3 | HE uses Latin acronyms and lapses into formal register ("תוכנות ליבה", "ה'צנרת' הטכנולוגית"). |
| Process | 4 | 4 | Closest parity in the site. HE here is good. |
| Outcomes | n/a (hardcoded) | n/a | Cannot score — bypasses i18n. |
| FAQ | 5 | 4 | HE FAQ is the strongest Hebrew section. Close to EN voice. |
| Footer | 4 | 3 | EN tagline "Built in Israel. Shipped to teams worldwide." is brand-forward; HE "תוכנה מותאמת לצוותים צומחים" loses the geographic frame and the contrast. |
| Contact | 5 | 2 | HE contact CTA is broken English ("Let's Connectit") + a follow-up hint that only makes sense if you read the Hero footnote. |
| Navbar | 4 | 4 | Fine. Standard. |
| Meta | 4 | 3 | HE meta description is solid but title is generic ("פתרונות ווב וAI מותאמים אישית") vs. EN's specific promise ("ship a working automation in 2–4 weeks"). |

**Drift summary.** Hebrew is most on-voice in Process and FAQ. It drifts furthest in Hero and Contact — exactly the two sections that matter most for conversion. The pattern is consistent: Hebrew defaults to *describing the company* where English *names the visitor's pain.* That's a strategic rewrite, not a wording polish.

---

## P1 — Voice & Clarity Issues

### Hero subtitle: EN names the visitor, HE describes the vendor

**File:** `src/i18n/translations.js:24-25 (EN), 167-168 (HE)`

**EN (current):**
> "Your team is doing work that should be running itself."
> "We build the internal tools, automations, and AI workflows that replace the manual work your team repeats every day. Custom-built around how your business actually works."

**HE (current):**
> "מערכות ווב וסוכני ⁨AI⁩ שנבנים במיוחד עבור האופרציה שלכם."
> "אנחנו מתכננים ומפתחים תוכנה מותאמת אישית, אוטומציות חזקות ואינטגרציות קוד שמחברות את כל המערכות שלכם לרשת אחת חלקה ואוטונומית. בלי פשרות של מוצרי מדף, בלי קוד שמתפרק."

**Problem.** EN heading is a sentence *about the visitor*. HE heading is a sentence *about Altro*. EN subtitle leads with "We build… the manual work your team repeats every day" — concrete operator language. HE subtitle leads with "אנחנו מתכננים ומפתחים תוכנה מותאמת אישית, אוטומציות חזקות ואינטגרציות קוד" — three nouns in a row that any agency could write. The closing line "בלי פשרות של מוצרי מדף, בלי קוד שמתפרק" *is* good — keep it.

**Recommended HE rewrite:**
```
'hero.heading': 'הצוות שלכם עושה עבודה שהמערכת הייתה אמורה לעשות.',
'hero.subtitle': 'אנחנו בונים את הכלים הפנימיים, האוטומציות וסוכני ה-AI שמחליפים את העבודה הידנית שהצוות חוזר עליה כל יום. מותאם לאיך שהעסק שלכם באמת עובד. בלי פשרות של מוצרי מדף, בלי קוד שמתפרק.',
```

### Latin acronyms inside Hebrew — decide once, apply everywhere

**Affected lines:** 167, 176, 189, 197, 198, 200, 224, 258.

The current pattern uses Unicode isolate marks `⁨…⁩` around English tokens (`⁨APIs⁩`, `⁨CRM⁩`, `⁨AI⁩`), which prevents bidi flipping but does nothing for register. Three workable policies:

- **Policy A — Industry-standard, keep English.** Acceptable in Israeli B2B tech. Drop the isolate marks where the surrounding text already establishes RTL context (most CSS handles this fine with `dir="rtl"`), use plain `AI`, `CRM`, `API`. Cleaner visually.
- **Policy B — Hebraicize where possible.** `AI` → `בינה מלאכותית` on first mention, `AI` after. `CRM` → `מערכת ניהול לקוחות (CRM)`. More formal, less developer-flavored. Wrong for Altro.
- **Policy C — Status quo with isolate marks.** Only if you have evidence of a real bidi bug on a real font/browser. Otherwise it's noise.

**Recommendation: Policy A.** The audience (10-200 person ops teams in Israel) reads `AI` and `CRM` natively. Strip isolate marks. Saves bytes, simplifies copy.

### Outcomes section — currently hardcoded, also lacks an emotional hook

**File:** `src/components/Outcomes.jsx:106-110` (hardcoded EN)

Once you move it into i18n (P0 fix), use the chance to add the missing voice beat. Current draft text is data-only: "Results from the last 12 months. Real numbers from live deployments." Compare to the Hero promise. Recommend:

**EN:**
```
'outcomes.heading': 'What this actually looks like in production.',
'outcomes.sub': 'Numbers from teams running our work right now. No case-study theater.',
'outcomes.cta': 'Start a project',
```
**HE:**
```
'outcomes.heading': 'איך זה נראה בפועל בייצור.',
'outcomes.sub': 'מספרים מצוותים שמריצים את העבודה שלנו עכשיו. בלי תיאטרון של מקרי בוחן.',
'outcomes.cta': 'התחילו פרויקט',
```

### FAQ — close to parity but HE answer #2 is over-engineered

**File:** `src/i18n/translations.js:81 (EN), 224 (HE)`

EN: "Your data stays in your systems. We connect to them through secure, official APIs — the same way your bank connects to your accounting software. We never store your business data ourselves."

HE: "בטוח לחלוטין. אנחנו עובדים אך ורק דרך ה-⁨APIs⁩ הארגוניים של ספקיות ה-⁨AI⁩ הגדולות. החיבור הזה מבטיח משפטית וטכנולוגית שהדאטא שלכם מוצפן, מבודד, ולעולם לא משמש לאימון המודלים שלהן או נחשף החוצה."

**Problem.** The two answers cover different ground. EN is about connecting to *the client's existing tools* (bank/accounting analogy). HE is about *AI vendors not training on the client's data*. Both are valid concerns, but the HE answer reads like it migrated from a different question. The bank analogy that makes the EN answer land in two seconds is missing in HE.

**Recommended HE rewrite (preserves the EN logic):**
```
'faq.02.a': 'הדאטא שלכם נשאר במערכות שלכם. אנחנו מתחברים אליהן דרך APIs מאובטחים — בדיוק כמו שהבנק שלכם מתחבר לתוכנת ההנהלת חשבונות. אנחנו לא שומרים את המידע העסקי שלכם אצלנו, ולעולם לא משתמשים בו לאימון מודלים.'
```

### Footer tagline — HE loses the geographic frame

**File:** `src/i18n/translations.js:111 (EN), 254 (HE)`

EN: "Built in Israel. Shipped to teams worldwide."
HE: "תוכנה מותאמת לצוותים צומחים."

EN has voice (origin + reach, two-beat rhythm). HE is interchangeable with any Israeli SaaS footer.

**Recommended HE rewrite:**
```
'footer.tagline': 'נבנה בישראל. נשלח לצוותים בכל העולם.',
```

---

## P2 — CTA Effectiveness

Scoring 1-5 across four axes: clarity (does the visitor know what happens next), action verb strength, friction (low = high commitment, high = low commitment), specificity (does it name the action or the outcome).

| Section | EN CTA | HE CTA | Clarity EN/HE | Verb EN/HE | Friction EN/HE | Specificity EN/HE |
|---|---|---|---|---|---|---|
| Hero | "Tell us what's slowing you down" | "Let's Chatbot" | 5 / 1 | 5 / 1 | low / unknown | 5 / 0 |
| Hero hint | "Free first call. No commitment." | "*(מודים באשמה, יצאנו קצת גיקים)" | 5 / 1 | n/a | n/a | 5 / 0 |
| Services | "Sound familiar? Let's figure out what to build first." | "זה קורה גם אצלכם? בואו נבין מה צריך להיבנות." | 4 / 4 | 4 / 4 | low / low | 4 / 4 |
| Challenges | "Tell us what's slowing you down" (hardcoded) | n/a (renders EN) | 5 / 0 | 5 / 0 | low / 0 | 5 / 0 |
| Outcomes | "Start a project" (hardcoded) | n/a (renders EN) | 4 / 0 | 4 / 0 | high / 0 | 3 / 0 |
| FAQ | "Start a free call" | "התחילו שיחה חינם" | 5 / 5 | 5 / 5 | low / low | 5 / 5 |
| Footer | "Start a conversation" | "התחילו פרויקט" | 4 / 3 | 4 / 4 | low / high | 4 / 4 |
| Contact submit | "Send it over" | "Let's Connectit" | 5 / 1 | 5 / 1 | low / unknown | 5 / 0 |
| Floating CTA | "Start a project" | "התחילו פרויקט" | 4 / 4 | 4 / 4 | high / high | 3 / 3 |

**Patterns:**
- HE has two broken-English CTAs in primary positions (Hero + Contact). Highest-leverage fix in the entire site.
- EN footer says "Start a conversation" (low friction), HE footer says "התחילו פרויקט" (high friction — "start a project" implies commitment). Inconsistency. Pick one register and apply both sides.
- FAQ CTA is the strongest pair on the site. Use it as the voice reference for rewriting the others.

---

## Bilingual Side-by-Side Table — Full Section Inventory

Voice score scale: 1 (generic) → 5 (distinct Altro voice).

| Section | Element | EN | HE | V-EN | V-HE | Notes |
|---|---|---|---|---|---|---|
| Hero | Badge | Enterprise Solutions | פתרונות ארגוניים | 2 | 2 | Both generic. Consider dropping or replacing with specific positioning. |
| Hero | Heading | Your team is doing work that should be running itself. | מערכות ווב וסוכני AI שנבנים במיוחד עבור האופרציה שלכם. | 5 | 2 | Different sentence shapes. Rewrite HE (see P1). |
| Hero | Subtitle | We build the internal tools, automations, and AI workflows… | אנחנו מתכננים ומפתחים תוכנה מותאמת אישית… | 5 | 3 | HE leads with three nouns; EN leads with a verb. |
| Hero | CTA | Tell us what's slowing you down | Let's Chatbot | 5 | 1 | P0. |
| Hero | CTA hint | Free first call. No commitment. | *(מודים באשמה, יצאנו קצת גיקים) | 5 | 1 | HE hint is contextless if the CTA isn't the joke. |
| Marquee | 01 | Custom Internal Tools | כלים פנימיים מותאמים | 4 | 4 | OK. |
| Marquee | 02 | 12+ Projects Shipped | מעל 12 פרויקטים שוגרו | 4 | 3 | "שוגרו" (launched/fired) reads slightly martial. Consider "נשלחו". |
| Marquee | 03 | AI Agents | סוכני AI | 4 | 4 | OK. |
| Marquee | 04 | Ship in 4–12 Weeks | משלוח תוך 4–12 שבועות | 5 | 3 | "משלוח" = "shipping/delivery" of a physical package. Use "אספקה" or "מוכן תוך". |
| Marquee | 05 | Process Automations | אוטומציות תהליכים | 4 | 4 | OK. |
| Marquee | 06 | 100% Custom Built | 100% בנוי בהתאמה אישית | 5 | 4 | OK. |
| Marquee | 07 | Internal Webapps | אפליקציות ווב פנימיות | 4 | 4 | OK. |
| Marquee | 08 | No Scope Creep | ללא חריגות מהיקף | 5 | 3 | EN is colloquial industry speak; HE is formal. Consider "בלי הפתעות בהיקף". |
| Challenges | Heading | Sound Familiar? | למי זה מתאים? | 5 | 2 | EN names a feeling; HE names a target. Different mechanics. Recommend "נשמע מוכר?" for HE parity. |
| Challenges | 01 title | Your team keeps doing the same thing manually | תפעול ידני וצווארי בקבוק | 5 | 2 | EN is a sentence about the visitor; HE is a noun phrase. |
| Challenges | 01 text | …It works until it doesn't… | …כשהצוות שורף שעות… שנוטות להישבר… | 5 | 4 | HE is decent here, just less direct. |
| Challenges | 02 title | Your tools don't talk to each other | מערכות מנותקות ומידע אבוד | 5 | 3 | Same nouns-vs-sentence problem. |
| Challenges | 02 text | You use a CRM, a billing system, a spreadsheet… | כשהעסק משתמש בהמון כלים מצוינים (CRM, פיננסים, ניהול)… | 5 | 4 | OK. |
| Challenges | 03 title | Every person does it differently | חוסר אחידות ותהליכים מבוזרים | 5 | 2 | EN sentence vs HE noun phrase. |
| Challenges | 03 text | When the process lives in someone's head instead of the system… | כשאותו תהליך בעסק מתבצע אחרת בכל פעם… | 5 | 4 | HE is fine. |
| Services | Heading | What We Build | מה אנחנו בונים | 4 | 4 | OK. |
| Services | 01 title | Internal Tools That Actually Fit | מערכות ווב מותאמות אישית | 5 | 3 | EN has POV ("Actually Fit"); HE is neutral. |
| Services | 01 text | …no workarounds, no limitations. | …בלי להתפשר על מגבלות של מוצרי מדף גנריים. | 5 | 4 | HE works. |
| Services | 02 title | Automate the Work You Keep Repeating | סוכני AI ואוטומציות תהליכים | 5 | 3 | EN names the visitor's behavior; HE names Altro's products. |
| Services | 02 text | …AI where it helps, reliable code where it counts. | …סוכני AI חכמים שמקבלים החלטות, ועד לאוטומציות קוד יציבות שמנהלות את הדאטא ברקע. | 5 | 4 | HE is solid. |
| Services | 03 title | Connect All Your Tools into One Picture | ארכיטקטורת מידע ואינטגרציות | 5 | 2 | "Architecture and integrations" is enterprise-speak. Recommend "חברו את כל הכלים לתמונה אחת". |
| Services | 03 text | …One source of truth. No copy-pasting. | …מקור מידע אחד, אמין ומסונכרן. | 5 | 4 | HE loses "no copy-pasting" — consider adding "בלי העתק-הדבק". |
| Process | 01 title / dur | Understand / 1–2 sessions | הבנה / 1–2 פגישות | 4 | 4 | OK. |
| Process | 01 text | We map your workflows, bottlenecks, and goals… | אנחנו ממפים את תהליכי העבודה, צווארי הבקבוק והמטרות שלך… | 4 | 4 | Note: HE uses "שלך" (singular) here while every other section uses "שלכם" (plural). Inconsistency. |
| Process | 02 title / dur | Design / ~1 week | עיצוב / כשבוע אחד | 4 | 4 | OK. |
| Process | 02 text | …This is where most projects fail. We make it the foundation. | …כאן רוב הפרויקטים נכשלים. אנחנו הופכים את זה לבסיס. | 5 | 5 | HE matches EN voice exactly. Reference quality. |
| Process | 03 title / dur | Build / 2–10 weeks | בנייה / 2–10 שבועות | 4 | 4 | OK. |
| Process | 03 text | …Edge cases get caught before they reach production. | …מקרי קצה נתפסים לפני שמגיעים לייצור. | 4 | 4 | OK. |
| Process | 04 title / dur | Ship & Support / Ongoing | שיגור ותמיכה / שוטף | 4 | 3 | "שיגור" again — same militarized verb as marquee. Consider "השקה ותמיכה" or "אספקה ותמיכה". |
| Process | 04 text | …Real use surfaces things staging never does. | …שימוש אמיתי מגלה דברים שהסביבת הבדיקות לא מגלה. | 5 | 4 | OK. "סביבת הבדיקות" is fine but slightly formal. |
| FAQ | 01 Q/A | Do we need to replace our existing systems? | מה אם יש לנו כבר מערכות קיימות? | 5 | 4 | OK. |
| FAQ | 02 Q/A | Is our business data safe? | האם המידע העסקי והרגיש שלנו בטוח? | 5 | 3 | Answers diverge in meaning — see P1. |
| FAQ | 03 Q/A | Why not just use off-the-shelf software? | למה לא להשתמש פשוט בתוכנת מדף גנרית? | 5 | 5 | OK. Strong parity. |
| FAQ | 04 Q/A | Will we be dependent on you forever? | אנחנו נהיה תלויים בכם לתמיד? | 5 | 5 | Strong. |
| Footer | Tagline | Built in Israel. Shipped to teams worldwide. | תוכנה מותאמת לצוותים צומחים. | 5 | 2 | See P1. |
| Footer | Copy | © 2026 altro. All rights reserved. | © 2026 altro. כל הזכויות שמורות. | 3 | 3 | Standard. |

---

## Hebrew-Specific Issues

### 1. Latin acronyms inside Hebrew

Already addressed in P1. Pick Policy A (keep `AI`, `CRM`, `API` in Latin, drop isolate marks). The current `⁨…⁩` wrapping looks like an attempt to suppress bidi flipping; modern browsers with `dir="rtl"` set on the root (confirmed at `LanguageContext.jsx:10`) handle acronyms cleanly.

### 2. Inter font for Hebrew

Inter Variable was designed for Latin script. Its Hebrew glyphs are usable but visually thinner and less rhythmically balanced than a Hebrew-first family. Recommend:

- **Heebo** (free, Google Fonts, designed by Oded Ezer specifically to harmonize with Roboto/Inter metrics)
- **Assistant** (free, Google Fonts, broader weight range)
- **Rubik** (free, slightly more rounded, less neutral)

Apply only to HE headlines via `:lang(he) h1, :lang(he) h2 { font-family: 'Heebo', ... }` — keep Inter for body to maintain numeric/code consistency.

### 3. RTL direction

Confirmed set at `src/i18n/LanguageContext.jsx:10` via `document.documentElement.dir = 'rtl'` when locale is HE. Correct.

### 4. Numerals direction

Hebrew uses LTR numerals (Western Arabic digits), which is what the current marquee shows (`12+`, `4–12`, `2–10`). Correct. No fix needed.

### 5. Pluralization & gender

Hebrew has masculine/feminine and dual forms. Current copy consistently uses masculine plural address ("שלכם", "אתם implied"). One inconsistency at `process.01.text` (line 208): "שלך" (singular) instead of "שלכם" (plural) used everywhere else. **Fix:** change `אנחנו רוצים להבין כיצד העסק שלך פועל בפועל לפני שנתכנן משהו` → `אנחנו רוצים להבין איך העסק שלכם באמת עובד לפני שנתכנן משהו` (also drops formal "כיצד"/"בפועל" for plainer parity with EN).

### 6. Date / currency

Not currently displayed anywhere user-facing. If/when added: HE locale should format with `Intl.DateTimeFormat('he-IL')` and `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`.

---

## SEO Copy Layer

### Title tags

| Locale | Title | Length | Score | Notes |
|---|---|---|---|---|
| EN | `altro — ship a working automation in 2–4 weeks` | 49 chars | 5 | Brand + verb + specificity + timeframe. Strong. |
| HE | `altro — פתרונות ווב וAI מותאמים אישית` | ~36 chars | 3 | Generic. No timeframe, no verb, no differentiator. |

**Recommended HE title:**
```
'meta.title': 'altro — אוטומציה עובדת תוך 2–4 שבועות',
```

### Meta descriptions

| Locale | Length | Score | Notes |
|---|---|---|---|
| EN | 152 chars | 5 | Inside 155-160 ideal. Specific audience ("10-200 person ops teams"), specific deliverable, specific timeframe. |
| HE | 137 chars | 4 | Same structure, lands well. Minor: "אספקה תוך 2–4 שבועות" is slightly clinical; consider "מוכן תוך 2–4 שבועות". |

### Heading hierarchy

Verified one H1 per page (Hero heading), section H2s for Challenges / Services / Process / FAQ / Contact / Footer. Standard. No fixes.

### Keyword positioning

- EN H1 doesn't contain primary keyword ("internal tools", "automation", "AI"). Trade-off: voice over SEO. Acceptable.
- HE H1 currently contains "AI" and "אופרציה" — better keyword coverage than EN, but at the cost of voice. After the recommended HE rewrite, you'll lose some keyword density. Compensate by ensuring marquee + first paragraph carry the keywords.

---

## AI Search Copy (LLM citation readiness)

LLMs cite copy that reads as declarative fact with clear scope.

### What's already strong
- FAQ format is ideal for AI answer surfaces. The 4 Q&A pairs map cleanly to "people also ask" patterns and cite well.
- "You own everything we build: the code, the system, the data" — clean, declarative, citation-ready.
- "We connect to them through secure, official APIs — the same way your bank connects to your accounting software" — analogy is highly quotable.

### What's missing
- **No declarative claims with numbers in body copy.** The marquee has "12+ Projects Shipped" but body copy never restates concrete numbers. LLMs need numbers inside grammatical sentences to cite confidently. Recommend adding one number-bearing sentence per major section.
- **No "Altro is…" defining sentence anywhere on the page.** LLMs prefer a clear definitional anchor. Add to footer or About section: "Altro is an Israeli AI freelancing studio. We ship custom internal tools, automations, and AI agents for 10–200 person operations teams." (EN). Mirror in HE.
- **No service description follows the claim + evidence pattern.** Each Service card states what Altro builds but doesn't provide a citable proof point. Consider adding a single "Why this works" sentence per service.

### Schema / structured data
Not audited in this pass — verify FAQPage and Organization schema are emitted in head. Strong leverage for AI citations.

---

## Missing Copy / Gaps

| Gap | Where | Priority |
|---|---|---|
| Testimonials section — referenced in audit brief, no keys in `translations.js` | Site-wide | Verify whether section is removed or copy-pending |
| Case study CTAs — no per-project copy infrastructure | n/a | Future |
| Email signature / transactional email copy | `api/` | Verify Resend templates have HE versions |
| 404 page | `notFound.*` keys exist (lines 140-142, 283-285) | OK — copy present |
| Cookie banner | `cookie.*` keys exist (lines 131-137, 274-280) | OK — but HE "דחה"/"קבל" is brusque; consider "לא תודה"/"מקבל" |
| "Required" field indicator | Hardcoded `(required)` in Contact.jsx | Covered in P0 |
| Empty form-field error messages | Verify component-level | Unknown |
| Loading / submitting state copy | `contact.submitting` exists; `app.loading` does not | Covered in P0 |
| About / Team section | Not present | Strategic — adds AI-citation anchor |
| Pricing / engagement model copy | Not present | Strategic |
| Outcomes section copy | Hardcoded | Covered in P0 |

---

## Quick Wins (≤1 day each)

1. **Fix `ContactModal.jsx:101-103`** — swap hardcoded strings for existing `contact.successTitle` / `contact.successBody` keys. 10-minute fix, removes the duplicate-strings bug class.
2. **Replace `Let's Chatbot` (line 169) and `Let's Connectit` (line 245)** with Hebrew CTAs. One commit. Largest visible voice fix on the site.
3. **Move 7 hardcoded strings to i18n** (Services, Challenges ×2, Outcomes ×3, Contact ×2, App fallback). Mechanical refactor — ~1 hour with the keys provided in the P0 table.
4. **Fix `process.01.text`** singular "שלך" → plural "שלכם" for consistency.
5. **Rewrite HE meta title** for specificity parity with EN.
6. **Rewrite HE footer tagline** to restore geographic + reach framing.
7. **Drop Unicode isolate marks** around `AI`/`CRM`/`API` in HE strings. Single find-replace.
8. **Add Heebo or Assistant** as `:lang(he)` headline font. ~30 minutes including testing.
9. **Add `outcomes.heading` / `outcomes.sub` / `outcomes.cta`** keys with the recommended copy in P1.
10. **Fix marquee verbs** — "משלוח" → "אספקה", "שוגרו" → "נשלחו", "ללא חריגות מהיקף" → "בלי הפתעות בהיקף".

---

## Recommended Rewrite Priority Order

1. **Ship P0 fixes first** — broken English CTAs + hardcoded strings. These are user-facing bugs, not preferences. (1 day)
2. **Rewrite HE Hero (heading + subtitle + CTA + hint)** — single highest-leverage voice fix. (½ day with native-speaker review)
3. **Rewrite HE Challenges card titles** — convert noun phrases to visitor-addressed sentences, matching EN structure. (½ day)
4. **Move Outcomes to i18n with the recommended copy** — one new section's worth of keys, both locales. (½ day)
5. **Polish HE FAQ #2** to match EN logic (bank analogy). (15 min)
6. **Footer tagline rewrite + marquee verb fixes.** (15 min)
7. **HE meta title rewrite.** (5 min)
8. **Typography upgrade** — add Heebo for HE headlines. (½ day with QA)
9. **AI-citation hardening** — add definitional sentence, claim+evidence per service. (1 day)
10. **Native HE copywriter pass** on everything above before shipping. (external, 2-3 days turnaround)

---

## Methodology

**Scope audited:**
- 104 i18n keys (52 EN + 52 HE) in `src/i18n/translations.js`
- 7+ hardcoded user-facing strings across `Services.jsx`, `Challenges.jsx`, `Outcomes.jsx`, `Contact.jsx`, `ContactModal.jsx`, `App.jsx`
- Meta tags (title + description per locale)
- CTA inventory across Hero, Services, Challenges, Outcomes, FAQ, Footer, Floating CTA, Contact
- RTL direction setup at `LanguageContext.jsx:10`
- Brand voice baseline from `.claude/skills/design/impeccable/reference/brand.md`

**Voice scoring approach.**
Scale 1-5, where 1 = "any B2B agency could have written this" and 5 = "could only be Altro." Anchors: EN Hero heading (5), EN FAQ 04 (5), generic enterprise badges (1-2). Hebrew scoring uses the same anchors, applied by a fluent reader.

**Not audited in this pass:**
- Component-level error messages and edge-case states beyond contact form
- Email/transactional copy (Resend templates)
- Admin dashboard copy (internal-only)
- Schema.org structured data (recommend separate SEO audit)
- Image alt text (recommend separate accessibility audit)

**Known limitations:**
1. **No native Hebrew copywriter reviewed this audit.** Structural and parity findings are reliable; tonal recommendations (e.g., "feels more formal") should be validated by a native speaker before shipping.
2. **No analytics data integrated.** CTA effectiveness scores are heuristic, not conversion-tested. A/B test the Hero CTA rewrite before declaring victory.
3. **No competitor copy benchmarking** in this pass. Worth a follow-up specifically on Israeli AI agency landing pages.
4. **Brand voice baseline read once** — assumed stable. If brand voice docs evolve, re-score.

---

*End of audit.*
