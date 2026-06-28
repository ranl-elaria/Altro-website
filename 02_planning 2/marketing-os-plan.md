# Marketing OS — Implementation Plan

**Owner:** Ran Levim (CMO + dev)
**Branch:** `feature/marketing-os`
**Started:** 2026-06-27
**Status:** Planning approved, ready to build

---

## 1. Problem Statement

```
Problem: CMO has no centralized surface to plan, execute, log, and measure AltroAI marketing.
         Skills/agents run ad-hoc in terminal. Brand assets scattered. No funnel viz. No campaign archive.
Impact:  CMO operating manually; campaign quality + speed capped by tool-switching.
         Cannot prove marketing ROI without unified data layer.
Constraints: Stack frozen (React+Supabase+Vercel+Resend). No paid Trigger.dev yet.
             Free analytics only. Single CMO user. Vercel 60s function limit.
```

## 2. Scope

### IN SCOPE (v1)
- [ ] New "Marketing" parent tab in AdminDashboard with 7 sub-tabs
- [ ] Self-built website analytics (replace Plausible)
- [ ] Funnel visualization (7 stages, live data)
- [ ] Agent runner with SSE streaming + cost tracking + audit log
- [ ] Campaign flow (10-step wizard, inline approvals)
- [ ] Canva OAuth + asset browser (mirrors brand kit taxonomy)
- [ ] Google Drive OAuth + `AltroAI/Marketing/` auto-created
- [ ] HubSpot OAuth + lead-stage sync (Apollo enriches)
- [ ] Competitor research (auto-discover + weekly cron)
- [ ] OAuth marketplace for 8 providers
- [ ] Slack/email notifications on long agent runs (>30s)
- [ ] Publish-on-demand to social with hard guardrail (never auto-post)

### OUT OF SCOPE (v1)
- Multi-user marketing seats (single CMO only)
- Trigger.dev migration (deferred; runner abstracted for future swap)
- Session replay / heatmaps
- A/B testing infra (Meta handles this natively)
- Auto-publishing on schedule (explicitly forbidden per CMO directive)

## 3. Success Criteria

```
✅ CMO can run any of 25+ marketing skills from admin UI with one click
✅ Funnel viz shows live data from Plausible-replacement + HubSpot + Resend
✅ Campaign flow takes brief → approved assets in Drive+Canva in <60min
✅ Every agent run logged: inputs, outputs, cost_usd, duration, status
✅ Slack DM fires when runs >30s complete
✅ Publish button requires explicit modal confirm; agent code CANNOT call publish()
✅ Weekly competitor refresh runs Sundays 06:00 UTC; latest snapshots visible in /competitors
✅ Canva folder structure: AltroAI/{01_Logos...07_Campaigns/{date}_{slug}}
✅ Drive mirror at AltroAI/Marketing/ with same structure
```

## 4. Technical Approach

### 4.1 Architecture
```
┌─ Browser (React admin) ──────────────────────────────────────┐
│  /admin → Marketing parent tab → 7 sub-routes                │
│  - track.js script sends pageview events                     │
│  - SSE listener for agent run streaming                      │
└──────────────────────────────────────────────────────────────┘
            │                              │
            ▼ POST                         ▼ GET (SSE)
┌─ Vercel Serverless ──────────────────────────────────────────┐
│  /api/marketing/agents/run      → spawns Claude Agent SDK    │
│  /api/marketing/agents/stream   → SSE bridge                 │
│  /api/marketing/canva/*         → proxy to Canva MCP         │
│  /api/marketing/drive/*         → Google Drive API           │
│  /api/marketing/oauth/[prov]    → OAuth handshake            │
│  /api/marketing/publish/[prov]  → guarded publish (token req)│
│  /api/marketing/cron/*          → Vercel Cron jobs           │
│  /api/track.js                  → analytics event ingest     │
└──────────────────────────────────────────────────────────────┘
            │
            ▼
┌─ Supabase ──────────────────────────────────────────────────┐
│  Tables: analytics_events, marketing_runs, marketing_campaigns│
│          marketing_integrations (encrypted tokens via Vault) │
│          marketing_competitors, marketing_assets             │
│          hubspot_sync_state                                  │
│  RLS: CMO email match only                                   │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Agent runner abstraction (for future Trigger.dev swap)
```js
// src/lib/marketing/runner.js
export const runner = {
  run: async (skillSlug, inputs, { onChunk }) => { /* Claude SDK now */ },
  status: async (runId) => { /* poll */ },
};
// Later: swap implementation, keep signature → no UI changes.
```

### 4.3 Publish guardrail (CRITICAL)
- `publish()` API routes require header `x-cmo-confirm: <signed-jwt>`.
- JWT signed only by UI button click (frontend → `/api/marketing/confirm-token`).
- Token expires in 60s, single-use, scoped to `{provider, asset_id}`.
- Agent code has no access to JWT signer. Hard architectural separation.

### 4.4 Self-built analytics
```js
// public/track.js (loaded in index.html)
(function() {
  const send = (event, props) => navigator.sendBeacon('/api/track',
    JSON.stringify({ event, props, path: location.pathname,
                     ref: document.referrer, sid: getSid(), ts: Date.now() }));
  send('pageview');
  window.altroTrack = send; // expose for custom events
  // SPA route change hook
  const push = history.pushState;
  history.pushState = function() { push.apply(this, arguments); send('pageview'); };
})();
```
Bot filter: UA regex blocklist server-side. GDPR: consent banner before script loads.

### 4.5 Campaign flow state machine
```
INTAKE → INSPIRE → BRAND_PULL → CONCEPTS(pick) → COPY(edit) →
VISUALS(pick) → POLISH(accept) → TIMING → STAGE → PUBLISH_READY →
[PUBLISHED|DRAFTED] → ARCHIVE → MEASURE
```
Each transition writes to `marketing_campaigns.state` + appends to `state_history` jsonb.

## 5. Files That Will Change / Be Created

### New files
```
supabase/migrations/
  20260627_01_analytics_events.sql
  20260627_02_marketing_runs.sql
  20260627_03_marketing_campaigns.sql
  20260627_04_marketing_integrations.sql
  20260627_05_marketing_competitors.sql
  20260627_06_marketing_assets.sql
  20260627_07_hubspot_sync_state.sql

src/pages/admin/marketing/
  MarketingLayout.jsx       # parent tab shell with sub-nav
  Dashboard.jsx             # funnel viz
  Campaigns.jsx             # list + new campaign wizard
  CampaignWizard.jsx        # 10-step flow
  Agents.jsx                # skill runner + history
  Brand.jsx                 # Canva browser
  Competitors.jsx           # auto-discovered + weekly snapshots
  Integrations.jsx          # OAuth marketplace
  Logs.jsx                  # marketing_runs audit table

src/lib/marketing/
  runner.js                 # agent execution abstraction
  funnel.js                 # query builders for 7 stages
  hubspot.js                # CRM client
  apollo.js                 # enrichment client
  canva.js                  # MCP proxy
  drive.js                  # Drive client
  publish-token.js          # JWT signer (server-only)
  skills-registry.js        # maps sub-tab → skill list

api/marketing/
  agents/run.js
  agents/stream.js          # SSE
  agents/status.js
  canva/[...path].js
  drive/[...path].js
  oauth/[provider].js
  publish/[provider].js     # JWT-guarded
  confirm-token.js          # mints publish JWT
  cron/competitors-weekly.js
  cron/funnel-refresh.js    # hourly metric pull

api/track.js                # analytics ingest

public/track.js             # client analytics script

vercel.json                 # add cron entries
```

### Modified files
```
src/components/AdminDashboard.jsx   # add Marketing parent tab
src/App.jsx                          # add /admin/marketing/* routes
index.html                           # add track.js + consent banner
.env.example                         # new env vars
```

### Env vars (Vercel)
```
HUBSPOT_API_KEY
APOLLO_API_KEY
CANVA_CLIENT_ID, CANVA_CLIENT_SECRET
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
META_APP_ID, META_APP_SECRET
LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
MAILCHIMP_API_KEY (optional)
BUFFER_CLIENT_ID, BUFFER_CLIENT_SECRET
NOTION_CLIENT_ID, NOTION_CLIENT_SECRET
SLACK_BOT_TOKEN (existing)
ANTHROPIC_API_KEY (existing)
PUBLISH_JWT_SECRET
SUPABASE_VAULT_KEY
```

## 6. Build Order (phased)

**Phase 0 — Foundation (week 1)**
1. All 7 migrations → verify in Supabase dashboard
2. Marketing parent tab + 7 empty sub-routes → verify nav works
3. Self-built analytics: `api/track.js` + `public/track.js` + consent banner → verify events land in Supabase

**Phase 1 — Agent runner (week 1-2)**
4. `runner.js` abstraction + `/api/marketing/agents/run` SSE
5. Agents.jsx UI: skill picker, input form, live output, history table
6. Cost tracking from Anthropic SDK response
7. Slack notify on >30s runs (existing MCP)

**Phase 2 — Funnel + integrations (week 2-3)**
8. HubSpot OAuth + lead sync → funnel stages 3-7
9. Apollo enrichment wired to HubSpot contacts
10. Resend webhook → email open/click events
11. Dashboard.jsx funnel viz (7 stages, live)

**Phase 3 — Brand + Canva + Drive (week 3-4)**
12. Google OAuth + create `AltroAI/Marketing/` tree
13. Canva OAuth + asset browser
14. Brand.jsx: inline previews, folder nav, search

**Phase 4 — Campaign wizard (week 4-5)**
15. CampaignWizard.jsx — 10 steps, state machine
16. Publish guardrail: JWT mint + verify
17. Inline approvals at each step
18. Archive to Drive + Canva on completion

**Phase 5 — Competitors + marketplace (week 5-6)**
19. Auto-discover competitors (LLM seeded from AltroAI ICP)
20. Weekly cron: Meta Ad Library scrape (`ads-spy`) + LinkedIn + site snapshot
21. Competitors.jsx browser
22. Integrations.jsx OAuth marketplace (8 providers)

**Phase 6 — Polish + measure (week 6)**
23. Logs.jsx audit table with filters
24. Campaign MEASURE step: pull post-launch metrics back
25. End-to-end test: run full campaign flow start to finish

## 7. Validation Checklist

```
Code Quality:
- [ ] No hardcoded secrets, all via env
- [ ] RLS on every new table
- [ ] OAuth tokens encrypted (Supabase Vault)
- [ ] Publish JWT cannot be minted by agent code (architectural test)

Functional:
- [ ] Funnel viz shows non-zero data within 24h of deploy
- [ ] Run any 5 skills successfully via Agents.jsx
- [ ] Complete one full campaign INTAKE→ARCHIVE
- [ ] Weekly cron fires; competitor snapshots stored
- [ ] Slack DM received on long run

Security:
- [ ] Cannot publish without UI confirm click (try via curl with stale token → 403)
- [ ] Consent banner blocks analytics until accepted
- [ ] HubSpot/Canva/Drive scopes minimal

Visual:
- [ ] Matches existing AdminDashboard design system
- [ ] Mobile-responsive (CMO uses iPad)
```

## 8. Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Vercel 60s function limit | SSE keeps connection alive; long runs use background pattern (cron-poll) |
| HubSpot 100req/10s limit | Batch sync, exponential backoff, cache reads 5min |
| Canva API quota unknown | Cache asset list 1h, lazy-load thumbnails |
| OAuth token leaks | Supabase Vault encryption, never log tokens, rotate on UI action |
| Agent bypasses publish guardrail | Publish API in separate Vercel function with stricter env access, JWT secret not in agent runner env |
| Self-built analytics undercounts | Add server-side validation, compare to Vercel logs weekly |

## 9. Open Items (post-MVP)

- Trigger.dev migration when paid tier acquired
- Multi-seat marketing (when team grows)
- A/B testing dashboard if Meta native insufficient
- LinkedIn organic post scheduling (currently API-restricted for non-partners)

---

**Next action:** confirm plan → start Phase 0 migrations.
