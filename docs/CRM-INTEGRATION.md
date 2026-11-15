# Website → Altro Operations

Implementation: save the enquiry and separate phone in `submissions`, then POST JSON to `/api/integrations/website-leads`. Server-only `Authorization: Bearer <token>`. Both sides validate lengths, mandatory name/email/message, UUID, source `altroai.net`, timestamp. Optional fields are null. Payload maps `id` → `external_id`, `created_at` → `submitted_at`, `attribution.landing_path` → `page_path`, and includes company, phone and attribution.

CRM returns 201 for new, 200 for duplicate, both `{accepted:true,external_id,contact_id,duplicate}` after persistence (cloud adapter commits before response). Permanent receipts in the CRM workspace survive deletion of contacts. Distinct enquiries from the same email remain distinct contacts. No outgoing mail/Slack/routine is initiated by the CRM intake.

401/403/422 and other non-transient 4xx stop delivery. 408/409/425/429/5xx, timeout and invalid acknowledgements retry. Generic 409 is NOT an acknowledgement (the cloud adapter uses it for storage revision conflicts). Eight attempts maximum. Last error stores only a code, never response bodies or secrets. Five-minute leases and atomic attempt compare-and-set prevent overlapping workers from claiming the same attempt. Crash after acceptance is safe: duplicate UUID returns the original receipt. Existing submission rows are not backfilled or forwarded.

## Activation

1. Apply the new `website_crm_delivery` migration to the correct website Supabase project **before deploying the new submit handler**. Migration has not been applied to a live database by this task.
2. Deploy CRM code including `website-leads.cjs` and the updated server. For the existing cloud packaging flow, the package manifest now includes that module. Use a durable reachable HTTPS CRM origin, not localhost or the redesign lab.
3. Set `WEBSITE_LEADS_TOKEN` on CRM; set the identical random secret (at least 32 characters) as website `CRM_LEADS_TOKEN`. Set website `CRM_LEADS_URL` to the complete HTTPS endpoint, e.g. `https://<crm-host>/api/integrations/website-leads`. Never use a VITE_ prefix. Set website `CRON_SECRET` for Vercel's cron authorization.
4. Deploy website code. `/api/crm-retry` is a protected GET scheduled daily at 04:00 UTC; at most ten pending rows per invocation (four-second timeout per send). Daily scheduling avoids a new paid queue dependency; it can take multiple days to drain a backlog. Increase worker cadence/batch only with matching platform limits. Unconfigured CRM leaves enquiries pending without consuming attempts.
5. With an explicitly synthetic enquiry, verify persistence, CRM receipt, duplicate acknowledgement and the website `crm_status`. Also verify retry after a transient failure. This live smoke check has not run.

Inspect queue through the existing privileged database tools: group by `crm_status`, inspect `crm_attempts`, `crm_last_error`, `crm_next_attempt_at`. After fixing configuration/data, deliberately reset a chosen failed row to `crm_status='pending', crm_attempts=0, crm_last_error=null, crm_next_attempt_at=now()`; retain its UUID. Do not bulk reset or backfill old enquiries without review. A saved website enquiry still succeeds when CRM delivery fails.

## Scope and checks

No live deployment, database migration, secrets, external messages or real submissions are performed as part of this code change. Unit/HTTP checks use synthetic in-memory or temporary storage. End-to-end Supabase behavior still requires the activation check above. Browser double submission still creates distinct UUIDs; this contract deduplicates delivery retries only. Existing HubSpot/email/sales integrations remain best-effort; this queue covers only Altro Operations.

Runnable code checks: website `node --experimental-vm-modules tests/crm-integration.mjs`; CRM `node tests/website-intake.cjs` and `npm test`. These do not contact live services.
