import { useState } from 'react'
import { submitAudit } from '../api/clarifi'
import { parseReport } from '../utils/parseReport'

// Phase labels shown during loading
const PHASES = [
  'Uploading policy document\u2026',
  'Ingesting policy into knowledge base\u2026',
  'Running AI audit \u2014 this can take 3\u20136 minutes\u2026',
  'Generating your report\u2026',
]

// How long to stay on each phase before advancing (ms)
const PHASE_DURATIONS = [8_000, 20_000, 300_000, Infinity]

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

    // Schedule phase advances based on per-phase durations
    const timers = []
    let elapsed = 0
    for (let i = 1; i < PHASES.length; i++) {
      elapsed += PHASE_DURATIONS[i - 1]
      if (PHASE_DURATIONS[i - 1] === Infinity) break
      const idx = i
      timers.push(setTimeout(() => setPhase(idx), elapsed))
    }
    const clearTimers = () => timers.forEach(clearTimeout)

    try {
      // POST form and wait — n8n holds the connection open until the full report is ready
      const data = await submitAudit(formState)

      clearTimers()
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
      clearTimers()
      // AbortError = our 10-min timeout fired — workflow still running, email will arrive
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
