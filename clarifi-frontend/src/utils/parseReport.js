/**
 * Parses the agent's structured text report into named sections.
 * The agent uses emoji number headers: 1️⃣ Policy Overview, 2️⃣ Hospital Network Status, etc.
 */
export function parseReport(raw) {
  if (!raw || typeof raw !== 'string') return null

  // Split on emoji section numbers (1️⃣ through 7️⃣)
  const sectionRegex = /(?=\d️⃣)/g
  const blocks = raw.split(sectionRegex).filter(Boolean)

  const labelMap = {
    'Policy Overview': 'policyOverview',
    'Hospital Network Status': 'hospitalStatus',
    'Estimated Cost': 'estimatedCost',
    'Clinical Risk Assessment': 'riskAssessment',
    'Claim Process Guidance': 'claimGuidance',
    'Regulatory Safeguards': 'regulatorySafeguards',
    'Recommended Next Steps': 'nextSteps',
  }

  const sections = {}
  for (const block of blocks) {
    for (const [label, key] of Object.entries(labelMap)) {
      if (block.includes(label)) {
        // Strip the header line (e.g. "1️⃣ Policy Overview\n") from content
        sections[key] = block.replace(/^\d️⃣[^\n]*\n/, '').trim()
        break
      }
    }
  }

  // Derive display flags from section text
  const risk = sections.riskAssessment || ''
  const riskLevel = /\bHigh\b/i.test(risk) ? 'high'
    : /\bModerate\b/i.test(risk) ? 'moderate'
    : 'low'

  const claim = sections.claimGuidance || ''
  const claimMode = /\bCashless\b/i.test(claim) ? 'cashless' : 'reimbursement'

  const hosp = sections.hospitalStatus || ''
  const isNetworkHospital = /\bNetwork\b/i.test(hosp) && !/\bNon-Network\b/i.test(hosp)

  return { sections, riskLevel, claimMode, isNetworkHospital, raw }
}

/** Format INR with Indian locale (e.g. ₹5,70,000) */
export function fmtINR(value) {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  if (isNaN(num)) return value
  return '₹' + num.toLocaleString('en-IN')
}
