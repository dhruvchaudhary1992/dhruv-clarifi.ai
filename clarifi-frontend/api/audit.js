import OpenAI from 'openai'
import nodemailer from 'nodemailer'

// ─── Thesaurus ────────────────────────────────────────────────────────────────

const THESAURUS = {
  'piles': 'Hemorrhoidectomy', 'hemorrhoid': 'Hemorrhoidectomy',
  'fissure': 'Sphincterotomy', 'fistula': 'Fistulectomy',
  'kidney stone': 'Lithotripsy', 'cataract': 'Phacoemulsification',
  'hernia': 'Hernioplasty', 'appendix': 'Appendectomy',
  'gallbladder': 'Cholecystectomy', 'gall bladder': 'Cholecystectomy',
  'gall stone': 'Cholecystectomy', 'knee replacement': 'Total Knee Arthroplasty',
  'heart bypass': 'Coronary Artery Bypass Grafting',
  'bypass surgery': 'Coronary Artery Bypass Grafting',
  'open heart': 'Coronary Artery Bypass Grafting',
  'stent': 'PTCA (Coronary Angioplasty)', 'angioplasty': 'PTCA (Coronary Angioplasty)',
  'uterus removal': 'Hysterectomy', 'uterus surgery': 'Hysterectomy',
  'hip replacement': 'Total Hip Arthroplasty',
  'liver transplant': 'Liver Transplantation',
  'kidney transplant': 'Renal Transplantation',
}

// ─── Procedure cost dataset ────────────────────────────────────────────────────

const PROCEDURES = [
  { name: 'Hemorrhoidectomy', aliases: ['piles','hemorrhoid','fissure','fistula','anal surgery'], t1: 65000, t2: 52000, t3: 39000, rsi: 300000 },
  { name: 'Coronary Artery Bypass Grafting', aliases: ['cabg','heart bypass','bypass surgery','open heart'], t1: 570000, t2: 456000, t3: 342000, rsi: 1000000 },
  { name: 'Total Knee Replacement', aliases: ['knee surgery','knee replacement','tkr','total knee arthroplasty'], t1: 285000, t2: 228000, t3: 171000, rsi: 500000 },
  { name: 'Cataract Surgery', aliases: ['cataract','eye surgery','phaco','lens replacement','motibindu'], t1: 57000, t2: 45600, t3: 34200, rsi: 100000 },
  { name: 'Appendectomy', aliases: ['appendix','appendicitis','appendix removal'], t1: 68400, t2: 54720, t3: 41040, rsi: 100000 },
  { name: 'Angioplasty', aliases: ['stent','heart stent','ptca','angio'], t1: 228000, t2: 182400, t3: 136800, rsi: 300000 },
  { name: 'Hysterectomy', aliases: ['uterus removal','uterus surgery','womb removal'], t1: 114000, t2: 91200, t3: 68400, rsi: 200000 },
  { name: 'Total Hip Replacement', aliases: ['hip replacement','hip surgery','thr'], t1: 342000, t2: 273600, t3: 205200, rsi: 500000 },
  { name: 'Hernia Repair', aliases: ['hernia','hydrocele','hernioplasty'], t1: 57000, t2: 45600, t3: 34200, rsi: 100000 },
  { name: 'Cholecystectomy', aliases: ['gallbladder','gall bladder','gall stone','cholecystectomy','gb stone'], t1: 91200, t2: 72960, t3: 54720, rsi: 100000 },
  { name: 'Prostatectomy', aliases: ['prostate','prostrate','bph','urology surgery'], t1: 171000, t2: 136800, t3: 102600, rsi: 200000 },
  { name: 'Cesarean Section', aliases: ['c-section','c section','lscs','delivery surgery'], t1: 114000, t2: 91200, t3: 68400, rsi: 200000 },
  { name: 'Kidney Stone Removal', aliases: ['kidney stone','lithotripsy','pcnl','rirs','stone removal'], t1: 79800, t2: 63840, t3: 47880, rsi: 100000 },
  { name: 'Liver Transplant', aliases: ['liver transplant','liver donor','liver failure'], t1: 2850000, t2: 2280000, t3: 1710000, rsi: 3000000 },
  { name: 'Kidney Transplant', aliases: ['kidney transplant','renal transplant','kidney failure'], t1: 1140000, t2: 912000, t3: 684000, rsi: 1500000 },
  { name: 'Heart Valve Replacement', aliases: ['valve surgery','heart valve','mitral valve','avr','mvr'], t1: 570000, t2: 456000, t3: 342000, rsi: 1000000 },
  { name: 'Spinal Fusion', aliases: ['spine surgery','back surgery','slip disc','spinal fusion','vertebra'], t1: 456000, t2: 364800, t3: 273600, rsi: 500000 },
  { name: 'Mastectomy', aliases: ['breast removal','breast surgery','mastectomy','breast cancer surgery'], t1: 228000, t2: 182400, t3: 136800, rsi: 300000 },
  { name: 'Thyroidectomy', aliases: ['thyroid surgery','thyroid removal','goitre'], t1: 91200, t2: 72960, t3: 54720, rsi: 100000 },
  { name: 'Tonsillectomy', aliases: ['tonsils','tonsil removal','throat surgery'], t1: 45600, t2: 36480, t3: 27360, rsi: 100000 },
  { name: 'Brain Tumor Surgery', aliases: ['brain surgery','brain tumor','craniotomy','head surgery'], t1: 570000, t2: 456000, t3: 342000, rsi: 1000000 },
]

const TIER1 = ['mumbai','delhi','bangalore','bengaluru','chennai','hyderabad','kolkata','pune','ahmedabad']
const TIER2 = ['jaipur','lucknow','surat','nagpur','chandigarh','coimbatore','indore','kochi','patna']

// ─── Pure-JS tool functions ────────────────────────────────────────────────────

function normalizeProcedure(term) {
  if (!term) return null
  const lower = term.toLowerCase()
  for (const [key, val] of Object.entries(THESAURUS)) {
    if (lower.includes(key)) return val
  }
  return term
}

function calcBMI(weight, height) {
  if (!weight || !height || isNaN(weight) || isNaN(height) || height === 0) return null
  const bmi = weight / (height * height)
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  return { bmi: bmi.toFixed(2), category: cat }
}

function calcCost(procedure, city) {
  if (!procedure) return null
  const lower = procedure.toLowerCase().replace(/\s+/g, '')
  const match = PROCEDURES.find(p =>
    lower.includes(p.name.toLowerCase().replace(/\s+/g, '')) ||
    p.aliases.some(a => lower.includes(a.toLowerCase().replace(/\s+/g, '')))
  )
  if (!match) return null
  const cityLower = (city || '').toLowerCase()
  const cost = TIER1.includes(cityLower) ? match.t1 : TIER2.includes(cityLower) ? match.t2 : match.t1
  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Mumbai (default)'
  return { procedure: match.name, cost, rsi: match.rsi, city: cityLabel }
}

function assessRisk(bmiCategory, procedure) {
  let level = 'Low'
  let note = 'Standard pre-operative protocols apply.'
  const highRisk = ['arthroplasty','cholecystectomy','cabg','bypass','transplant','brain tumor','spinal fusion','heart valve','valve replacement']
  if (highRisk.some(t => (procedure || '').toLowerCase().includes(t))) {
    level = 'High'
    note = 'Major surgical procedure. Inpatient care required; verify ICU availability.'
  } else if ((bmiCategory || '').includes('Obese')) {
    level = 'High'
    note = 'Elevated perioperative risk due to obesity. Full cardiac and respiratory evaluation required.'
  } else if ((bmiCategory || '').includes('Overweight')) {
    level = 'Moderate'
    note = 'Monitor respiratory and cardiac vitals due to elevated BMI.'
  }
  return { level, note }
}

// ─── Optional: Google Sheets hospital lookup ───────────────────────────────────

async function lookupHospital(hospitalName, insurer) {
  if (!hospitalName || !insurer || !process.env.GOOGLE_SHEETS_API_KEY) return null
  try {
    const sheetId = '1M8y8IDDW6RK4YHQFNvBTVXfrHZdoRaZuSzOT7Q-LaoM'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:B?key=${process.env.GOOGLE_SHEETS_API_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const rows = (data.values || []).slice(1) // skip header row
    const insurerKey = insurer.toLowerCase().split(' ')[0]
    const found = rows.some(row =>
      row[0]?.toLowerCase().includes(hospitalName.toLowerCase()) &&
      row[1]?.toLowerCase().includes(insurerKey)
    )
    return found ? 'Network' : 'Non-Network'
  } catch { return null }
}

// ─── Optional: SerpAPI claim process search ────────────────────────────────────

async function searchClaimProcess(query) {
  if (!query || !process.env.SERP_API_KEY) return null
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}&num=3`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return (data.organic_results || [])
      .slice(0, 3)
      .map(r => `${r.title}: ${r.snippet}`)
      .join('\n') || null
  } catch { return null }
}

// ─── PDF generation via PDFShift ──────────────────────────────────────────────

async function generatePDF(html) {
  const key = process.env.PDFSHIFT_API_KEY
  if (!key) throw new Error('PDFSHIFT_API_KEY not set')
  const res = await fetch('https://api.pdfshift.io/v3/convert/chromium', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(key + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source: html, filename: 'Clarifi_Audit_Report.pdf', sandbox: false }),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.status)
    throw new Error(`PDFShift error: ${msg}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

// ─── Email via Gmail SMTP ──────────────────────────────────────────────────────

async function sendAuditEmail(to, name, pdfBuffer) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[audit] Email env vars not set — skipping email')
    return
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })
  await transporter.sendMail({
    from: `"Clarifi Sentinel" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Surgical Insurance Audit Report – Action Required',
    html: `<div style="font-family:Arial;font-size:14px;color:#333;line-height:1.6;">
      <h2 style="color:#1f4e79;">Surgical Insurance Audit Completed</h2>
      <p>Dear ${name || 'Valued Member'},</p>
      <p>Your surgical insurance audit has been completed. Please find the full PDF report attached.</p>
      <br><p>Regards,<br><strong>Sentinel Surgical Audit System</strong></p>
    </div>`,
    attachments: [{
      filename: 'Clarifi_Audit_Report.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  })
}

// ─── Report HTML builder (matches n8n "format for report" node) ───────────────

function buildReportHTML(text, d) {
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function textToHtml(raw) {
    if (!raw) return ''
    const lines = raw.split('\n')
    let out = '', inList = false
    for (const line of lines) {
      const t = line.trim()
      if (!t) { if (inList) { out += '</ul>'; inList = false } continue }
      const isBullet = /^[-•*]\s/.test(t) || /^\d+[.)]\s/.test(t)
      if (isBullet) {
        if (!inList) { out += "<ul style='padding-left:18px;margin:6px 0;'>"; inList = true }
        const content = t.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, '')
        out += "<li style='margin:4px 0;color:#475569;'>" + esc(content) + '</li>'
      } else {
        if (inList) { out += '</ul>'; inList = false }
        const ci = t.indexOf(':')
        if (ci > 0 && ci < 45 && ci < t.length - 1) {
          out += "<div style='margin:6px 0;'><span style='font-weight:bold;color:#1e293b;'>" +
            esc(t.slice(0, ci)) + ":</span> <span style='color:#475569;'>" +
            esc(t.slice(ci + 1).trim()) + '</span></div>'
        } else {
          out += "<p style='margin:6px 0;color:#475569;'>" + esc(t) + '</p>'
        }
      }
    }
    if (inList) out += '</ul>'
    return out
  }

  const titles = ['Policy Overview', 'Hospital Network Status', 'Estimated Cost',
    'Clinical Risk Assessment', 'Claim Process Guidance', 'Regulatory Safeguards', 'Recommended Next Steps']
  const colors = ['#1e40af', '#065f46', '#92400e', '#7f1d1d', '#1e3a8a', '#4c1d95', '#14532d']
  const lights = ['#eff6ff', '#ecfdf5', '#fffbeb', '#fef2f2', '#eff6ff', '#f5f3ff', '#f0fdf4']

  function parseSection(raw, idx) {
    const start = raw.indexOf(titles[idx])
    if (start === -1) return null
    const nl = raw.indexOf('\n', start)
    if (nl === -1) return ''
    let end = raw.length
    for (let j = idx + 1; j < titles.length; j++) {
      const ni = raw.indexOf(titles[j], nl)
      if (ni !== -1 && ni < end) end = ni
    }
    return raw.slice(nl + 1, end).trim()
  }

  const name = (d.full_name || '').trim() || d.email || 'Valued Member'
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const metaParts = []
  if (d.planned_procedure) metaParts.push(
    "<div style='background:rgba(255,255,255,0.18);border-radius:8px;padding:8px 14px;'>" +
    "<div style='font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;'>Procedure</div>" +
    "<div style='font-size:12px;font-weight:bold;margin-top:2px;'>" + esc(d.planned_procedure) + "</div></div>")
  if (d.hospital_name) metaParts.push(
    "<div style='background:rgba(255,255,255,0.18);border-radius:8px;padding:8px 14px;'>" +
    "<div style='font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;'>Hospital</div>" +
    "<div style='font-size:12px;font-weight:bold;margin-top:2px;'>" + esc(d.hospital_name) + "</div></div>")

  const cards = titles.map((title, i) => {
    const content = parseSection(text, i)
    if (content === null) return ''
    return "<div style='background:white;border-radius:10px;margin-bottom:18px;border-left:5px solid " + colors[i] +
      ";box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;'>" +
      "<div style='background:" + lights[i] + ";padding:10px 20px;border-bottom:1px solid #e2e8f0;'>" +
      "<span style='font-size:10px;font-weight:bold;color:" + colors[i] + ";letter-spacing:2px;text-transform:uppercase;margin-right:10px;'>SECTION " + (i + 1) + "</span>" +
      "<span style='font-size:13px;font-weight:bold;color:" + colors[i] + ";'>" + title + "</span></div>" +
      "<div style='padding:14px 20px;font-size:12px;line-height:1.8;'>" + textToHtml(content) + "</div></div>"
  }).join('')

  return "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Surgical Insurance Audit Report</title>" +
    "<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;}</style></head><body>" +
    "<div style='background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);color:white;padding:36px 48px 28px;'>" +
    "<div style='font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;opacity:0.75;margin-bottom:8px;'>CLARIFI · Sentinel AI Audit System</div>" +
    "<div style='font-size:24px;font-weight:bold;'>Surgical Insurance Audit Report</div>" +
    "<div style='font-size:11px;opacity:0.7;margin-top:6px;'>AI-generated analysis based on submitted policy and procedure details</div>" +
    "<div style='display:flex;gap:12px;margin-top:18px;flex-wrap:wrap;'>" +
    "<div style='background:rgba(255,255,255,0.18);border-radius:8px;padding:8px 14px;'><div style='font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;'>Prepared For</div><div style='font-size:12px;font-weight:bold;margin-top:2px;'>" + esc(name) + "</div></div>" +
    "<div style='background:rgba(255,255,255,0.18);border-radius:8px;padding:8px 14px;'><div style='font-size:10px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;'>Date</div><div style='font-size:12px;font-weight:bold;margin-top:2px;'>" + esc(date) + "</div></div>" +
    metaParts.join('') + "</div></div>" +
    "<div style='padding:28px 48px;'>" + cards + "</div>" +
    "<div style='background:white;border-top:1px solid #e2e8f0;padding:18px 48px;text-align:center;font-size:11px;color:#94a3b8;'>" +
    "<div style='font-weight:bold;color:#64748b;margin-bottom:3px;'>Clarifi · Sentinel Insurance Auditor</div>" +
    "<div style='font-style:italic;'>This report is for informational purposes only. All costs in INR (₹). Regulatory: IRDAI 2024.</div>" +
    "</div></body></html>"
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an autonomous Sentinel Insurance Auditor.
Generate a clean, professional 7-section surgical insurance audit report using ONLY the data provided.
Never fabricate values. If data is unavailable, write "Not available in retrieved extract."

MANDATORY OUTPUT FORMAT:

1⃣ Policy Overview
Insurer:
Policy Status:
Coverage: (max 3 bullets)
Waiting Period:
Pre-Existing Disease Clause:

2⃣ Hospital Network Status
Hospital Name:
Network Classification: (Network / Non-Network)
Zone:

3⃣ Estimated Cost
City:
Estimated Cost Range:
Recommended Sum Insured:

4⃣ Clinical Risk Assessment
Procedure:
BMI Category:
Risk Level:
Key Consideration: (1 sentence max)

5⃣ Claim Process Guidance
Claim Mode: (Cashless / Reimbursement)
Key Documents Required:
Process Summary: (max 3 bullets)
Expected Timeline:

6⃣ Regulatory Safeguards
Source: IRDAI 2024
Exact Clause: (quote verbatim from IRDAI rules provided)
Practical Meaning: (max 2 sentences)

7⃣ Recommended Next Steps
(Exactly 3 one-line actionable steps — must align with the Network Classification determined above)

Rules:
- Executive tone. No markdown. No asterisks. No tool names.
- Max 900 words total.
- Recommendations in section 7 MUST match hospital network classification — never contradict it.`

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { email, full_name, city, weight, height, planned_procedure, hospital_name, policy_text } = req.body

    if (!email || !policy_text) {
      return res.status(400).json({ error: 'email and policy_text are required' })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Step 1: Deterministic results (instant, no API calls)
    const formalProcedure = normalizeProcedure(planned_procedure)
    const bmi = calcBMI(parseFloat(weight), parseFloat(height))
    const cost = calcCost(formalProcedure || planned_procedure, city)
    const risk = assessRisk(bmi?.category, formalProcedure)

    // Step 2: Extract insurer name from policy text
    let insurer = null
    try {
      const insurerRes = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{
          role: 'user',
          content: `From this insurance policy text, extract only the insurance company brand name (e.g. "Max Bupa", "HDFC Ergo", "Star Health", "Niva Bupa"). Return only the brand name, nothing else.\n\n${policy_text.slice(0, 1500)}`,
        }],
        max_tokens: 15,
        temperature: 0,
      })
      insurer = insurerRes.choices[0].message.content?.trim() || null
    } catch (e) {
      console.warn('[audit] Insurer extraction failed:', e.message)
    }

    // Step 3: Hospital lookup (depends on insurer), then claim search (depends on network status)
    const hospitalStatus = await lookupHospital(hospital_name, insurer)
    const isNetwork = hospitalStatus === 'Network'
    const claimQuery = insurer
      ? (isNetwork
          ? `cashless preauthorization process ${insurer} India hospital`
          : `reimbursement claim documents non-network hospital ${insurer} India`)
      : null
    const claimInfo = await searchClaimProcess(claimQuery)

    // Step 4: Build context string for the prompt
    const contextLines = []
    if (bmi) contextLines.push(`BMI: ${bmi.bmi} (${bmi.category})`)
    if (formalProcedure && formalProcedure !== planned_procedure)
      contextLines.push(`Normalized Procedure: ${formalProcedure}`)
    if (cost)
      contextLines.push(`Estimated Cost: ₹${cost.cost.toLocaleString('en-IN')} in ${cost.city} | Recommended Sum Insured: ₹${cost.rsi.toLocaleString('en-IN')}`)
    if (risk)
      contextLines.push(`Surgical Risk: ${risk.level} — ${risk.note}`)
    if (insurer)
      contextLines.push(`Insurance Provider (extracted from policy): ${insurer}`)
    if (hospitalStatus)
      contextLines.push(`Hospital Network Status: ${hospitalStatus}`)
    if (claimInfo)
      contextLines.push(`Claim Process Reference:\n${claimInfo}`)

    const userPrompt = `PATIENT DETAILS:
Name: ${full_name || 'Not provided'} | Email: ${email}
City: ${city || 'Not provided'} | Weight: ${weight || 'N/A'}kg | Height: ${height || 'N/A'}m
Planned Procedure: ${planned_procedure || 'Not provided'}
Hospital: ${hospital_name || 'Not provided'}

COMPUTED TOOL RESULTS:
${contextLines.length ? contextLines.join('\n') : 'No additional computed data.'}

POLICY DOCUMENT TEXT (extracted):
${policy_text.slice(0, 12000)}

IRDAI 2024 REGULATIONS (quote verbatim in section 6):
- Cashless pre-authorization must be granted within 1 hour of receiving request
- Discharge authorization must be issued within 3 hours of request
- 60-month (5-year) moratorium period from policy inception date
- Pre-Existing Disease (PED) waiting period capped at maximum 36 months
- Insurers cannot retrospectively deny cashless claims after the discharge summary is issued

Generate the full 7-section SURGICAL INSURANCE AUDIT REPORT now.`

    // Step 5: Single OpenAI call → full report (~10-20s)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1600,
      temperature: 0.1,
    })
    const report = completion.choices[0].message.content

    // Step 6: Generate PDF (~5-10s)
    let pdfBuffer = null
    try {
      const html = buildReportHTML(report, { full_name, planned_procedure, hospital_name, email })
      pdfBuffer = await generatePDF(html)
    } catch (e) {
      console.warn('[audit] PDF generation failed:', e.message)
    }

    // Step 7: Send email (non-blocking on failure)
    if (pdfBuffer) {
      sendAuditEmail(email, full_name, pdfBuffer).catch(e =>
        console.warn('[audit] Email send failed:', e.message)
      )
    }

    return res.status(200).json({ success: true, report })

  } catch (err) {
    console.error('[audit]', err)
    return res.status(500).json({ error: err.message || 'Audit failed. Please try again.' })
  }
}
