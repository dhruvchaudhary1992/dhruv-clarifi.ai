const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL

/**
 * Submits the audit form to the n8n webhook and waits for the full report.
 * n8n's "Respond to Webhook" node fires at the end of the pipeline (~2-3 min),
 * returning { success: true, report: "..." }.
 */
export async function submitAudit(formState) {
  const fd = new FormData()
  fd.append('full_name', formState.fullName || '')
  fd.append('email', formState.email)
  fd.append('city', formState.city)
  fd.append('weight', String(formState.weight))
  fd.append('height', String(formState.height))
  fd.append('planned_procedure', formState.procedure || '')
  fd.append('hospital_name', formState.hospital || '')
  // Binary field name MUST be Policy_Document — n8n Extract from File2 reads this
  fd.append('Policy_Document', formState.pdfFile)

  // 10-minute timeout — n8n holds the connection open until Respond to Webhook fires.
  // Pipeline (PDF ingest + AI agent + email) can take 4-7 min on complex policies.
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), 10 * 60 * 1000)

  let res
  try {
    res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: fd,
      signal: controller.signal,
      // Do NOT set Content-Type — browser sets multipart boundary automatically
    })
  } finally {
    clearTimeout(tid)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Audit request failed (${res.status})${text ? ': ' + text : ''}`)
  }

  const text = await res.text()
  if (!text || !text.trim()) {
    throw new Error('n8n returned an empty response. Make sure the v7 workflow is imported and active.')
  }

  return JSON.parse(text)
}
