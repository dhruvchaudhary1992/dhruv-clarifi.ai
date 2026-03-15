import { useState } from 'react'
import { submitAudit } from '../api/clarifi'
import { parseReport } from '../utils/parseReport'

const PHASES = [
  'Uploading policy document\u2026',
  'Ingesting policy into knowledge base\u2026',
  'Running AI audit \u2014 this typically takes 2\u20133 minutes\u2026',
  'Generating your report\u2026',
]

export function useAuditSubmit() {
  const [status, setStatus] = useState('idle')   // idle | loading | done | error | background
  const [phase, setPhase] = useState(0)
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(formState) {
    setStatus('loading')
    setPhase(0)
    setReport(null)
    setErrorMsg('')

    // Advance phases at ~45s intervals while n8n processes
    const phaseInterval = setInterval(() => {
      setPhase(p => (p < PHASES.length - 1 ? p + 1 : p))
    }, 45_000)

    try {
      // POST form and wait — n8n holds the connection open until the full report is ready
      const data = await submitAudit(formState)

      clearInterval(phaseInterval)
      setPhase(PHASES.length - 1)

      // n8n returns { success: true, report: "..." }
      const rawReport = data.report || data.output || ''
      if (!rawReport) {
        throw new Error('Report was empty. Check n8n Respond to Webhook output.')
      }

      const parsed = parseReport(rawReport)
      setReport(parsed)
      setStatus('done')

    } catch (err) {
      clearInterval(phaseInterval)
      // AbortError = our 4-min timeout fired — workflow still running, email will arrive
      if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
        setStatus('background')
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    }
  }

  function reset() {
    setStatus('idle')
    setPhase(0)
    setReport(null)
    setErrorMsg('')
  }

  return { status, phase, phases: PHASES, report, errorMsg, submit, reset }
}
