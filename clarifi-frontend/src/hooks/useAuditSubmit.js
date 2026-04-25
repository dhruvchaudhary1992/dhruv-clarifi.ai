import { useState } from 'react'
import { submitAudit } from '../api/clarifi'
import { parseReport } from '../utils/parseReport'

const PHASES = [
  'Extracting text from your policy PDF…',
  'Analysing policy coverage and benefits…',
  'Running AI audit — this takes about 20–40 seconds…',
  'Generating your report…',
]

const PHASE_DURATIONS = [4_000, 8_000, 25_000, Infinity]

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
      const data = await submitAudit(formState)

      clearTimers()
      setPhase(PHASES.length - 1)

      const rawReport = data.report || data.output || ''
      if (!rawReport) {
        throw new Error('Report was empty. Please try again.')
      }

      const parsed = parseReport(rawReport)
      setReport(parsed)
      setStatus('done')

    } catch (err) {
      clearTimers()
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
