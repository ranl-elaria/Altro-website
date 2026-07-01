// 15 curated prompts adapted from Anthropic Prompt Library
// (https://docs.anthropic.com/en/prompt-library) for AltroAI use cases.
// Each: title, body_md (system/prompt), doc_type='prompt', tags, meta.category, meta.variables

export const SEED_PROMPTS = [
  {
    title: 'Extract structured data from raw text',
    tags: ['extraction', 'data'],
    meta: { category: 'analysis', variables: ['input_text'] },
    body_md: `# Extract structured data

Extract structured fields from raw text. Return only valid JSON.

**Variables:**
- \`{{input_text}}\`

**Prompt:**

You extract structured data. Given text, output JSON matching this schema:
\`\`\`json
{"entities": [{"name": string, "type": string, "value": string}], "summary": string}
\`\`\`

Text:
{{input_text}}

Output ONLY JSON. No prose.`,
  },
  {
    title: 'Summarize long content into 3 bullets',
    tags: ['summarization'],
    meta: { category: 'summarization', variables: ['content'] },
    body_md: `# 3-bullet summary

Summarize any long content into exactly 3 sharp bullets.

**Prompt:**

Summarize the following in exactly 3 bullets. Each bullet ≤ 20 words. No hype, no filler.

Content:
{{content}}

Output only the 3 bullets.`,
  },
  {
    title: 'B2B cold email — direct, no fluff',
    tags: ['sales', 'outbound', 'email'],
    meta: { category: 'sales', variables: ['recipient_name', 'company', 'pain_point'] },
    body_md: `# B2B cold email

Write a cold outreach email that respects the reader's time.

**Prompt:**

Write a 4-sentence cold email to {{recipient_name}} at {{company}}.

Rules:
- Reference specific pain: {{pain_point}}
- One concrete AltroAI capability that addresses it
- End with a soft ask (15-min chat, not a demo)
- No "I hope this finds you well". No "Just following up". No em-dashes.

Voice: direct, technically credible, zero hype.`,
  },
  {
    title: 'Marketing hook A/B variants',
    tags: ['marketing', 'copy', 'variants'],
    meta: { category: 'marketing', variables: ['product', 'audience', 'angle'] },
    body_md: `# Marketing hook variants

Generate 5 wildly different marketing hooks.

**Prompt:**

Generate 5 marketing hooks for {{product}}, targeting {{audience}}.

Angle to lean into: {{angle}}

Each hook must be:
- ≤ 90 characters
- Meaningfully different (not word swaps)
- Vary approach: direct / curiosity / data / emotional / contrarian

Output JSON: [{"hook": string, "approach": string}]`,
  },
  {
    title: 'ICP scoring for inbound lead',
    tags: ['sales', 'icp', 'scoring'],
    meta: { category: 'sales', variables: ['lead_facts'] },
    body_md: `# ICP scoring

Score an inbound lead 0-100 against ICP.

**Prompt:**

Score this lead against AltroAI ICP:
- B2B (not individuals/agencies)
- Company 10+ employees OR shows automation/AI intent
- Decision-maker proxy (founder/CTO/COO/VP)
- Israeli or English-speaking markets

Lead facts:
{{lead_facts}}

Output JSON: {"score": int, "reasoning": "one line"}. Score brackets: 75+ strong, 50-74 promising, <50 weak.`,
  },
  {
    title: 'Turn meeting note into SOP',
    tags: ['knowledge', 'sop'],
    meta: { category: 'knowledge', variables: ['meeting_note'] },
    body_md: `# Meeting → SOP

Convert a raw meeting note into a structured SOP.

**Prompt:**

Convert this meeting note into a Standard Operating Procedure.

Meeting note:
{{meeting_note}}

Output markdown:
# {SOP title}
## Purpose
## Prerequisites
## Steps (numbered)
## Common pitfalls
## Owner`,
  },
  {
    title: 'Extract action items from transcript',
    tags: ['extraction', 'meetings'],
    meta: { category: 'analysis', variables: ['transcript'] },
    body_md: `# Action items

Extract crisp, assignable action items from a call transcript.

**Prompt:**

Read this transcript and extract action items.

Transcript:
{{transcript}}

Rules:
- Each action starts with a verb
- Assign owner if mentioned
- Include due date if inferable

Output JSON: [{"action": string, "owner": string|null, "due": string|null}]`,
  },
  {
    title: 'AI slop detector (24 patterns)',
    tags: ['quality', 'review'],
    meta: { category: 'review', variables: ['content'] },
    body_md: `# AI slop detector

Detect AI-writing tells in text.

**Prompt:**

Review the following text for AI-slop signals:
- Em-dash overuse
- "It's not just X, it's Y" tricolons
- Generic openers ("In today's fast-paced...")
- "Delve", "leverage", "unlock the power of"
- Vague hype ("game-changer", "revolutionary")
- Passive/hedge language

Content:
{{content}}

Output JSON: {"score": 0-100 (higher = more human), "issues": [{"pattern": string, "excerpt": string}], "rewrite_suggestions": [...]}`,
  },
  {
    title: 'Competitor page analysis',
    tags: ['marketing', 'competitive'],
    meta: { category: 'marketing', variables: ['competitor_url', 'raw_html'] },
    body_md: `# Competitor analysis

Analyze a competitor page and extract insights.

**Prompt:**

Competitor: {{competitor_url}}

Raw page content:
{{raw_html}}

Extract:
- Value prop (one sentence)
- Target audience
- Key features listed
- Pricing signals
- Weaknesses / gaps we can exploit

Output structured JSON.`,
  },
  {
    title: 'Deal proposal (AltroAI voice)',
    tags: ['sales', 'proposal'],
    meta: { category: 'sales', variables: ['deal_name', 'contact', 'need', 'value_usd'] },
    body_md: `# Deal proposal

Write a proposal in AltroAI voice.

**Prompt:**

Deal: {{deal_name}}
Contact: {{contact}}
Need: {{need}}
Value: ${'${{value_usd}}'}

Write 250-word proposal. Structure:
# Deal name
## What you need
## Our approach (bullets)
## Why AltroAI (2-3 sentences)
## Investment
## Next step (concrete CTA)

Voice: practical, direct, results-driven. No em-dashes.`,
  },
  {
    title: 'Interview 5-Whys root cause',
    tags: ['analysis', 'debugging'],
    meta: { category: 'analysis', variables: ['problem'] },
    body_md: `# 5-Whys

Drive to root cause with iterative "why".

**Prompt:**

Problem: {{problem}}

Ask "why" five times, each answering the prior. End with a root cause statement + one concrete counter-measure.`,
  },
  {
    title: 'Weekly business review',
    tags: ['analytics', 'weekly'],
    meta: { category: 'analytics', variables: ['data_json'] },
    body_md: `# Weekly review

Turn raw weekly metrics into a founder-ready review.

**Prompt:**

Data:
{{data_json}}

Output markdown:
## What went well
## What underperformed (with why)
## Anomalies worth investigating
## Next-week focus (3 items max)

No fluff. Numbers first.`,
  },
  {
    title: 'Translate to Hebrew (business register)',
    tags: ['translation', 'hebrew'],
    meta: { category: 'translation', variables: ['english_text'] },
    body_md: `# EN → HE business

Translate English to Hebrew in a professional B2B register.

**Prompt:**

Translate to Hebrew. Register: professional, direct, technical if the source is technical.

English:
{{english_text}}

Output Hebrew only.`,
  },
  {
    title: 'Explain code for a non-technical stakeholder',
    tags: ['explain', 'code'],
    meta: { category: 'explain', variables: ['code'] },
    body_md: `# Explain code

Explain code plainly.

**Prompt:**

Explain this code to a non-technical stakeholder. What does it do? What does it enable? Skip syntax.

Code:
{{code}}

3 paragraphs max.`,
  },
  {
    title: 'Feature spec skeleton',
    tags: ['product', 'spec'],
    meta: { category: 'product', variables: ['feature_name', 'user_problem'] },
    body_md: `# Feature spec

Draft a lightweight feature spec.

**Prompt:**

Feature: {{feature_name}}
Problem: {{user_problem}}

Output markdown:
# {feature_name}
## Problem
## Success criteria (measurable)
## Non-goals
## Approach (high level, one paragraph)
## Milestones (bulleted)
## Risks`,
  },
]
