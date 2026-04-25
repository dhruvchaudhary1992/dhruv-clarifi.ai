import { extractPdfText } from '../utils/extractPdfText'

export async function submitAudit(formState) {
  // Extract PDF text in the browser (avoids Vercel 4.5MB body limit)
  let policy_text = ''
  if (formState.pdfFile) {
    policy_text = await extractPdfText(formState.pdfFile)
  }

  const payload = {
    email: formState.email,
    full_name: formState.fullName || '',
    city: formState.city || '',
    weight: String(formState.weight || ''),
    height: String(formState.height || ''),
    planned_procedure: formState.procedure || '',
    hospital_name: formState.hospital || '',
    policy_text,
  }

  // 90-second timeout — Vercel function finishes in 30-40s
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), 90_000)

  let res
  try {
    res = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(tid)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `Audit request failed (${res.status})`
    try {
      const j = JSON.parse(text)
      if (j.error) msg = j.error
    } catch {}
    throw new Error(msg)
  }

  return res.json()
}
