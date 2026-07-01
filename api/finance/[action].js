// Finance suite consolidated router. Actions:
//   config-get / config-set
//   invoices-list / invoice-get / invoice-create / invoice-update / invoice-delete
//   invoice-send / invoice-mark-paid
//   expenses-list / expense-create / expense-update / expense-delete
//   expenses-csv-import
//   expense-parse-receipt   POST { image_base64, mime_type } → draft row
//   categories-list
//   overview / pnl / runway / ai-cost
//   fx-refresh (cron)
//   overdue-check (cron)
//
// Bypass CMO auth only for cron actions when x-vercel-cron header present.

import { createClient } from '@supabase/supabase-js'
import { toUSD, ensureRate } from '../../src/lib/finance/fx.js'
import { parseReceipt } from '../../src/lib/finance/receipt-parser.js'
import { createResendClient } from '../../src/lib/marketing/resend.js'
import { logActivity } from '../../src/lib/cockpit/activity.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CMO_EMAIL = 'ranl.woohoo@gmail.com'

async function authCheck(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user || data.user.email !== CMO_EMAIL) return null
  return data.user
}

// Recompute invoice totals from items + VAT.
async function recomputeInvoice(invoiceId) {
  const { data: items } = await supabase.from('invoice_items').select('amount').eq('invoice_id', invoiceId)
  const subtotal = (items || []).reduce((s, x) => s + Number(x.amount || 0), 0)
  const { data: cfg } = await supabase.from('finance_config').select('vat_pct').eq('id', 1).single()
  const { data: inv } = await supabase.from('invoices').select('currency, issue_date').eq('id', invoiceId).single()
  const vatPct = Number(cfg?.vat_pct || 0)
  const vat = Math.round((subtotal * vatPct) * 10) / 1000 // subtotal*vat_pct/100 with 2dp
  const total = Math.round((subtotal + vat) * 100) / 100
  const conv = await toUSD(supabase, total, inv?.currency || 'USD', inv?.issue_date)
  await supabase.from('invoices').update({
    subtotal, vat, total,
    total_usd: Math.round(conv.amount_usd * 100) / 100,
    fx_rate: conv.fx_rate,
  }).eq('id', invoiceId)
  return { subtotal, vat, total, total_usd: conv.amount_usd }
}

async function nextInvoiceNumber() {
  const { data: cfg } = await supabase.from('finance_config').select('invoice_prefix').eq('id', 1).single()
  const prefix = cfg?.invoice_prefix || 'INV'
  const yr = new Date().getFullYear()
  const { data: last } = await supabase.from('invoices')
    .select('number').ilike('number', `${prefix}-${yr}-%`)
    .order('number', { ascending: false }).limit(1).maybeSingle()
  let seq = 1
  if (last?.number) {
    const m = String(last.number).match(/(\d+)$/)
    if (m) seq = Number(m[1]) + 1
  }
  return `${prefix}-${yr}-${String(seq).padStart(3, '0')}`
}

export default async function handler(req, res) {
  const action = req.query.action
  const isCron = !!req.headers['x-vercel-cron']

  // Cron-only endpoints allowed without CMO auth
  if (isCron && (action === 'fx-refresh' || action === 'overdue-check')) {
    // fall through to action switch below
  } else {
    const user = await authCheck(req)
    if (!user) return res.status(401).json({ error: 'unauthorized' })
    req._user = user
  }
  const user = req._user

  // ── CONFIG ──
  if (action === 'config-get') {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end() }
    const { data, error } = await supabase.from('finance_config').select('*').eq('id', 1).single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ config: data })
  }
  if (action === 'config-set') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { patch } = body || {}
    if (!patch) return res.status(400).json({ error: 'missing_patch' })
    const allowed = ['start_balance_usd', 'base_currency', 'vat_pct', 'invoice_prefix']
    const upd = {}
    for (const k of allowed) if (patch[k] != null) upd[k] = patch[k]
    const { data, error } = await supabase.from('finance_config').update(upd).eq('id', 1).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, config: data })
  }

  // ── CATEGORIES ──
  if (action === 'categories-list') {
    const { data } = await supabase.from('expense_categories').select('*').order('slug')
    return res.status(200).json({ categories: data || [] })
  }

  // ── INVOICES ──
  if (action === 'invoices-list') {
    const status = req.query.status
    let q = supabase.from('invoices').select('*').order('issue_date', { ascending: false }).limit(500)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ invoices: data || [] })
  }
  if (action === 'invoice-get') {
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { data: invoice } = await supabase.from('invoices').select('*').eq('id', id).single()
    if (!invoice) return res.status(404).json({ error: 'not_found' })
    const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('position')
    return res.status(200).json({ invoice, items: items || [] })
  }
  if (action === 'invoice-create') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { deal_id, client_email, client_name, client_company, due_date, currency = 'USD', notes, items = [] } = body || {}
    const number = await nextInvoiceNumber()
    const { data: invoice, error } = await supabase.from('invoices').insert({
      number, deal_id: deal_id || null, client_email, client_name, client_company,
      due_date: due_date || null, currency, notes: notes || null,
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    if (items.length > 0) {
      const rows = items.map((it, i) => ({
        invoice_id: invoice.id,
        description: it.description || '',
        qty: Number(it.qty || 1),
        unit_price: Number(it.unit_price || 0),
        amount: Number(it.qty || 1) * Number(it.unit_price || 0),
        position: i,
      }))
      await supabase.from('invoice_items').insert(rows)
    }
    await recomputeInvoice(invoice.id)
    await logActivity(supabase, { suite: 'finance', actor: user.email, action: 'invoice_created', target: number })
    const { data: final } = await supabase.from('invoices').select('*').eq('id', invoice.id).single()
    return res.status(200).json({ ok: true, invoice: final })
  }
  if (action === 'invoice-update') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { patch, items } = body || {}
    if (patch) {
      const allowed = ['client_email', 'client_name', 'client_company', 'issue_date', 'due_date', 'currency', 'notes', 'status', 'paid_at', 'sent_at']
      const upd = {}
      for (const k of allowed) if (patch[k] !== undefined) upd[k] = patch[k]
      if (Object.keys(upd).length) await supabase.from('invoices').update(upd).eq('id', id)
    }
    if (items) {
      await supabase.from('invoice_items').delete().eq('invoice_id', id)
      if (items.length > 0) {
        const rows = items.map((it, i) => ({
          invoice_id: id, description: it.description || '',
          qty: Number(it.qty || 1), unit_price: Number(it.unit_price || 0),
          amount: Number(it.qty || 1) * Number(it.unit_price || 0), position: i,
        }))
        await supabase.from('invoice_items').insert(rows)
      }
    }
    await recomputeInvoice(id)
    const { data: final } = await supabase.from('invoices').select('*').eq('id', id).single()
    return res.status(200).json({ ok: true, invoice: final })
  }
  if (action === 'invoice-delete') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'missing_id' })
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }
  if (action === 'invoice-send') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { to } = body || {}
    const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single()
    if (!inv) return res.status(404).json({ error: 'not_found' })
    const recipient = to || inv.client_email
    if (!recipient) return res.status(400).json({ error: 'missing_recipient' })
    const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('position')
    const html = renderInvoiceEmailHtml(inv, items || [])
    try {
      const resend = createResendClient()
      await resend.send({
        from: process.env.RESEND_FROM || 'altro <onboarding@resend.dev>',
        to: recipient,
        subject: `Invoice ${inv.number}`,
        html,
        extraTags: [{ name: 'invoice_id', value: id }],
      })
      await supabase.from('invoices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
      await logActivity(supabase, { suite: 'finance', actor: user.email, action: 'invoice_sent', target: inv.number })
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'send_failed', message: String(e?.message || e) })
    }
  }
  if (action === 'invoice-mark-paid') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single()
    if (!inv) return res.status(404).json({ error: 'not_found' })
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    await logActivity(supabase, { suite: 'finance', actor: user.email, action: 'invoice_paid', target: inv.number, meta: { total_usd: inv.total_usd } })
    return res.status(200).json({ ok: true })
  }

  // ── EXPENSES ──
  if (action === 'expenses-list') {
    const from = req.query.from
    const to = req.query.to
    let q = supabase.from('expenses').select('*, expense_categories(slug, label, color)').order('date', { ascending: false }).limit(500)
    if (from) q = q.gte('date', from)
    if (to)   q = q.lte('date', to)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ expenses: data || [] })
  }
  if (action === 'expense-create') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { vendor, description, category_id, amount, currency = 'USD', date, receipt_url, source = 'manual', metadata = {} } = body || {}
    if (!amount) return res.status(400).json({ error: 'missing_amount' })
    const conv = await toUSD(supabase, amount, currency, date)
    const { data, error } = await supabase.from('expenses').insert({
      vendor, description, category_id: category_id || null,
      amount: Number(amount), currency,
      amount_usd: Math.round(conv.amount_usd * 100) / 100, fx_rate: conv.fx_rate,
      date: date || new Date().toISOString().slice(0, 10),
      receipt_url: receipt_url || null, source, metadata,
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await logActivity(supabase, { suite: 'finance', actor: user.email, action: 'expense_added', target: vendor || 'unknown', meta: { amount_usd: data.amount_usd } })
    return res.status(200).json({ ok: true, expense: data })
  }
  if (action === 'expense-update') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { patch } = body || {}
    if (patch.amount != null || patch.currency != null || patch.date != null) {
      const { data: cur } = await supabase.from('expenses').select('*').eq('id', id).single()
      const amount = patch.amount != null ? Number(patch.amount) : Number(cur.amount)
      const currency = patch.currency || cur.currency
      const date = patch.date || cur.date
      const conv = await toUSD(supabase, amount, currency, date)
      patch.amount_usd = Math.round(conv.amount_usd * 100) / 100
      patch.fx_rate = conv.fx_rate
    }
    const { data, error } = await supabase.from('expenses').update(patch).eq('id', id).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, expense: data })
  }
  if (action === 'expense-delete') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    const id = req.query.id
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }
  if (action === 'expense-parse-receipt') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { image_base64, mime_type = 'image/jpeg' } = body || {}
    if (!image_base64) return res.status(400).json({ error: 'missing_image' })
    try {
      const parsed = await parseReceipt(image_base64, mime_type)
      // Resolve category slug to id
      let categoryId = null
      if (parsed.category_guess) {
        const { data: cat } = await supabase.from('expense_categories').select('id').eq('slug', parsed.category_guess).maybeSingle()
        if (cat) categoryId = cat.id
      }
      return res.status(200).json({ ok: true, parsed, category_id: categoryId })
    } catch (e) {
      return res.status(500).json({ error: 'parse_failed', message: String(e?.message || e) })
    }
  }
  if (action === 'expenses-csv-import') {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
    let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    const { rows = [], dry_run = true } = body || {}
    // Expected row: { date, vendor, description, amount, currency, category_slug }
    const preview = []
    const errors = []
    const { data: cats } = await supabase.from('expense_categories').select('id, slug')
    const catMap = new Map((cats || []).map(c => [c.slug, c.id]))

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.amount) { errors.push({ i, error: 'missing_amount' }); continue }
      const currency = r.currency || 'USD'
      const conv = await toUSD(supabase, Number(r.amount), currency, r.date)
      const row = {
        vendor: r.vendor || null, description: r.description || null,
        category_id: catMap.get(r.category_slug) || null,
        amount: Number(r.amount), currency,
        amount_usd: Math.round(conv.amount_usd * 100) / 100, fx_rate: conv.fx_rate,
        date: r.date || new Date().toISOString().slice(0, 10),
        source: 'csv',
      }
      preview.push(row)
    }

    if (dry_run) {
      return res.status(200).json({ ok: true, preview, errors, count: preview.length })
    }
    if (preview.length === 0) return res.status(400).json({ error: 'nothing_to_import', errors })
    const { data, error } = await supabase.from('expenses').insert(preview).select('id')
    if (error) return res.status(500).json({ error: error.message })
    await logActivity(supabase, { suite: 'finance', actor: user.email, action: 'expenses_csv_imported', target: `${data.length} rows` })
    return res.status(200).json({ ok: true, inserted: data.length, errors })
  }

  // ── OVERVIEW ──
  if (action === 'overview') {
    const { data: cfg } = await supabase.from('finance_config').select('*').eq('id', 1).single()
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
    const monthStartISO = monthStart.toISOString().slice(0,10)

    const [{ data: paidInvs }, { data: allPaidInvs }, { data: expMonth }, { data: allExp }, { data: openInvs }] = await Promise.all([
      supabase.from('invoices').select('total_usd, paid_at').eq('status', 'paid').gte('paid_at', monthStart.toISOString()),
      supabase.from('invoices').select('total_usd, paid_at').eq('status', 'paid'),
      supabase.from('expenses').select('amount_usd, date').gte('date', monthStartISO),
      supabase.from('expenses').select('amount_usd, date').gte('date', new Date(Date.now() - 90*86400000).toISOString().slice(0,10)),
      supabase.from('invoices').select('id, total_usd, due_date, status').in('status', ['sent', 'overdue']),
    ])

    const revenueMTD = (paidInvs || []).reduce((s, x) => s + Number(x.total_usd || 0), 0)
    const totalRevenue = (allPaidInvs || []).reduce((s, x) => s + Number(x.total_usd || 0), 0)
    const expensesMTD = (expMonth || []).reduce((s, x) => s + Number(x.amount_usd || 0), 0)
    const expenses90 = (allExp || []).reduce((s, x) => s + Number(x.amount_usd || 0), 0)
    const totalExpenses = expenses90 // last 90d floor; also compute all-time
    const { data: allExpAll } = await supabase.from('expenses').select('amount_usd')
    const totalExpensesAll = (allExpAll || []).reduce((s, x) => s + Number(x.amount_usd || 0), 0)

    const cashOnHand = Number(cfg?.start_balance_usd || 0) + totalRevenue - totalExpensesAll
    const avgMonthlyBurn = expenses90 / 3
    const runwayMonths = avgMonthlyBurn > 0 ? cashOnHand / avgMonthlyBurn : null

    const openInvoicesUsd = (openInvs || []).reduce((s, x) => s + Number(x.total_usd || 0), 0)
    const today = new Date().toISOString().slice(0,10)
    const overdueCount = (openInvs || []).filter(x => x.due_date && x.due_date < today).length

    return res.status(200).json({
      cash_on_hand_usd: Math.round(cashOnHand * 100) / 100,
      revenue_mtd_usd: Math.round(revenueMTD * 100) / 100,
      expenses_mtd_usd: Math.round(expensesMTD * 100) / 100,
      avg_monthly_burn_usd: Math.round(avgMonthlyBurn * 100) / 100,
      runway_months: runwayMonths != null ? Math.round(runwayMonths * 10) / 10 : null,
      open_invoices_usd: Math.round(openInvoicesUsd * 100) / 100,
      overdue_count: overdueCount,
      total_revenue_usd: Math.round(totalRevenue * 100) / 100,
      total_expenses_usd: Math.round(totalExpensesAll * 100) / 100,
      config: cfg || {},
    })
  }

  // ── P&L (Monthly/Quarterly/YTD toggle) ──
  if (action === 'pnl') {
    const period = req.query.period || 'monthly' // monthly|quarterly|ytd
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10)

    const [{ data: invs }, { data: exps }, { data: cats }] = await Promise.all([
      supabase.from('invoices').select('total_usd, paid_at').eq('status', 'paid').gte('paid_at', new Date(yearStart).toISOString()),
      supabase.from('expenses').select('amount_usd, date, category_id, expense_categories(slug, label)').gte('date', yearStart),
      supabase.from('expense_categories').select('id, slug, label'),
    ])

    function bucketKey(dateStr) {
      const d = new Date(dateStr)
      if (period === 'ytd') return 'YTD'
      if (period === 'quarterly') return `Q${Math.floor(d.getMonth()/3)+1} ${d.getFullYear()}`
      return d.toISOString().slice(0, 7) // yyyy-mm
    }

    const buckets = new Set()
    const revenueByBucket = new Map()
    const expensesByCatBucket = new Map() // key: `${catSlug}||${bucket}` → amount

    for (const i of (invs || [])) {
      const k = bucketKey(i.paid_at)
      buckets.add(k)
      revenueByBucket.set(k, (revenueByBucket.get(k) || 0) + Number(i.total_usd || 0))
    }
    for (const e of (exps || [])) {
      const k = bucketKey(e.date)
      buckets.add(k)
      const slug = e.expense_categories?.slug || 'uncategorized'
      const key = `${slug}||${k}`
      expensesByCatBucket.set(key, (expensesByCatBucket.get(key) || 0) + Number(e.amount_usd || 0))
    }

    const bucketList = Array.from(buckets).sort()
    const rows = []
    // Revenue row
    rows.push({
      category: 'Revenue',
      type: 'revenue',
      values: bucketList.map(b => Math.round((revenueByBucket.get(b) || 0) * 100) / 100),
    })
    // Expense rows per category
    for (const c of (cats || [])) {
      rows.push({
        category: c.label,
        slug: c.slug,
        type: 'expense',
        values: bucketList.map(b => Math.round((expensesByCatBucket.get(`${c.slug}||${b}`) || 0) * 100) / 100),
      })
    }
    // Uncategorized
    const uncatValues = bucketList.map(b => Math.round((expensesByCatBucket.get(`uncategorized||${b}`) || 0) * 100) / 100)
    if (uncatValues.some(v => v > 0)) {
      rows.push({ category: 'Uncategorized', slug: 'uncategorized', type: 'expense', values: uncatValues })
    }
    // Net income row
    const netValues = bucketList.map((b, i) => {
      const rev = rows[0].values[i]
      const exp = rows.slice(1).reduce((s, r) => s + r.values[i], 0)
      return Math.round((rev - exp) * 100) / 100
    })
    rows.push({ category: 'Net Income', type: 'net', values: netValues })

    return res.status(200).json({ period, buckets: bucketList, rows })
  }

  // ── RUNWAY ──
  if (action === 'runway') {
    const { data: cfg } = await supabase.from('finance_config').select('*').eq('id', 1).single()
    const start = new Date(); start.setMonth(start.getMonth() - 6)

    const [{ data: paidInvs }, { data: exps }] = await Promise.all([
      supabase.from('invoices').select('total_usd, paid_at').eq('status', 'paid').gte('paid_at', start.toISOString()),
      supabase.from('expenses').select('amount_usd, date').gte('date', start.toISOString().slice(0, 10)),
    ])

    // Bucket by month
    const revenueByMonth = new Map()
    const expensesByMonth = new Map()
    for (const i of (paidInvs || [])) {
      const k = new Date(i.paid_at).toISOString().slice(0, 7)
      revenueByMonth.set(k, (revenueByMonth.get(k) || 0) + Number(i.total_usd || 0))
    }
    for (const e of (exps || [])) {
      const k = new Date(e.date).toISOString().slice(0, 7)
      expensesByMonth.set(k, (expensesByMonth.get(k) || 0) + Number(e.amount_usd || 0))
    }
    const months = Array.from(new Set([...revenueByMonth.keys(), ...expensesByMonth.keys()])).sort()

    // Cash trajectory: start balance + cumulative net per month
    const { data: allPaid } = await supabase.from('invoices').select('total_usd').eq('status', 'paid')
    const { data: allExp } = await supabase.from('expenses').select('amount_usd')
    const totalRev = (allPaid || []).reduce((s, x) => s + Number(x.total_usd || 0), 0)
    const totalExp = (allExp || []).reduce((s, x) => s + Number(x.amount_usd || 0), 0)
    const cashNow = Number(cfg?.start_balance_usd || 0) + totalRev - totalExp

    const trajectory = []
    let runningCash = cashNow - months.reduce((s, m) => s + ((revenueByMonth.get(m) || 0) - (expensesByMonth.get(m) || 0)), 0)
    for (const m of months) {
      const rev = revenueByMonth.get(m) || 0
      const exp = expensesByMonth.get(m) || 0
      runningCash += (rev - exp)
      trajectory.push({ month: m, revenue: Math.round(rev*100)/100, expenses: Math.round(exp*100)/100, cash: Math.round(runningCash*100)/100 })
    }

    // Projection: extrapolate last 3 month avg burn
    const last3 = trajectory.slice(-3)
    const avgBurn = last3.length ? Math.max(0, last3.reduce((s, x) => s + (x.expenses - x.revenue), 0) / last3.length) : 0
    const runwayMonths = avgBurn > 0 ? cashNow / avgBurn : null
    const proj = []
    let projCash = cashNow
    for (let i = 1; i <= 12; i++) {
      projCash -= avgBurn
      const d = new Date(); d.setMonth(d.getMonth() + i)
      proj.push({ month: d.toISOString().slice(0, 7), cash: Math.round(projCash*100)/100, projected: true })
      if (projCash <= 0) break
    }

    return res.status(200).json({
      cash_on_hand: Math.round(cashNow * 100) / 100,
      avg_monthly_burn: Math.round(avgBurn * 100) / 100,
      runway_months: runwayMonths != null ? Math.round(runwayMonths * 10) / 10 : null,
      trajectory,
      projection: proj,
    })
  }

  // ── AI COST rollup by provider ──
  if (action === 'ai-cost') {
    const { data: runs } = await supabase.from('marketing_runs').select('agent_slug, cost_usd, started_at, outputs')
    const byMonth = new Map()
    const byAgent = new Map()
    for (const r of (runs || [])) {
      const month = new Date(r.started_at).toISOString().slice(0,7)
      const slug = r.agent_slug || 'unknown'
      const cost = Number(r.cost_usd || 0)
      const provider = slug.includes('canva') ? 'Canva' :
                       slug.includes('openai') || slug.includes('image') ? 'OpenAI' :
                       slug.includes('hubspot') ? 'HubSpot' : 'Anthropic'
      if (!byMonth.has(month)) byMonth.set(month, {})
      const mo = byMonth.get(month)
      mo[provider] = (mo[provider] || 0) + cost
      if (!byAgent.has(slug)) byAgent.set(slug, 0)
      byAgent.set(slug, byAgent.get(slug) + cost)
    }
    const months = Array.from(byMonth.keys()).sort()
    const providers = ['Anthropic', 'OpenAI', 'Canva', 'HubSpot']
    const byMonthRows = months.map(m => ({ month: m, ...providers.reduce((acc, p) => ({ ...acc, [p]: Math.round((byMonth.get(m)?.[p] || 0) * 100) / 100 }), {}) }))
    const byAgentRows = Array.from(byAgent.entries()).map(([slug, cost]) => ({ agent: slug, cost_usd: Math.round(cost * 100) / 100 })).sort((a, b) => b.cost_usd - a.cost_usd)
    return res.status(200).json({ byMonth: byMonthRows, byAgent: byAgentRows, providers })
  }

  // ── FX REFRESH (cron) ──
  if (action === 'fx-refresh') {
    const row = await ensureRate(supabase)
    return res.status(200).json({ ok: true, rate: row })
  }

  // ── OVERDUE CHECK (cron) ──
  if (action === 'overdue-check') {
    const today = new Date().toISOString().slice(0,10)
    const { data: due } = await supabase.from('invoices')
      .select('id, number, total_usd, due_date, client_email').eq('status', 'sent').lt('due_date', today)
    for (const inv of (due || [])) {
      await supabase.from('invoices').update({ status: 'overdue' }).eq('id', inv.id)
      await logActivity(supabase, { suite: 'finance', actor: 'cron', action: 'invoice_overdue', target: inv.number, meta: { total_usd: inv.total_usd } })
    }
    return res.status(200).json({ ok: true, marked: (due || []).length })
  }

  return res.status(404).json({ error: 'unknown_action' })
}

function renderInvoiceEmailHtml(inv, items) {
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(it.description)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${it.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${Number(it.unit_price).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${Number(it.amount).toFixed(2)}</td>
    </tr>`).join('')
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1f2937;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #3C6E71;padding-bottom:16px;margin-bottom:24px;">
      <div>
        <h1 style="margin:0;font-size:28px;color:#3C6E71;">AltroAI</h1>
        <div style="font-size:12px;color:#6b7280;">altroai.net</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Invoice</div>
        <div style="font-size:20px;font-weight:600;">${esc(inv.number)}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;font-size:13px;">
      <div>
        <div style="color:#6b7280;text-transform:uppercase;font-size:10px;">Bill to</div>
        <div style="font-weight:500;">${esc(inv.client_name || '')}</div>
        <div>${esc(inv.client_company || '')}</div>
        <div>${esc(inv.client_email || '')}</div>
      </div>
      <div style="text-align:right;">
        <div><span style="color:#6b7280;">Issue:</span> ${esc(inv.issue_date)}</div>
        <div><span style="color:#6b7280;">Due:</span> ${esc(inv.due_date || '—')}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr>
        <th style="text-align:left;padding:8px;border-bottom:2px solid #e5e7eb;">Description</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #e5e7eb;">Qty</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #e5e7eb;">Rate</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #e5e7eb;">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;text-align:right;font-size:13px;">
      <div><span style="color:#6b7280;">Subtotal:</span> ${Number(inv.subtotal).toFixed(2)} ${esc(inv.currency)}</div>
      <div><span style="color:#6b7280;">VAT:</span> ${Number(inv.vat).toFixed(2)} ${esc(inv.currency)}</div>
      <div style="font-size:18px;font-weight:600;margin-top:8px;">Total: ${Number(inv.total).toFixed(2)} ${esc(inv.currency)}</div>
    </div>
    ${inv.notes ? `<div style="margin-top:24px;padding:12px;background:#f9fafb;border-radius:6px;font-size:12px;color:#4b5563;"><strong>Notes:</strong> ${esc(inv.notes)}</div>` : ''}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;text-align:center;">
      Altro AI · altroai.net · Reply to this email with questions.
    </div>
  </div>`
}
