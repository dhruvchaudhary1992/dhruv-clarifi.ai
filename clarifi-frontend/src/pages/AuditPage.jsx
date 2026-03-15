import { AlertCircle, RotateCcw, MailCheck } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import AuditForm from '../components/form/AuditForm'
import AuditProgress from '../components/loading/AuditProgress'
import AuditReport from '../components/report/AuditReport'
import { useAuditForm } from '../hooks/useAuditForm'
import { useAuditSubmit } from '../hooks/useAuditSubmit'

export default function AuditPage({ onBack }) {
  const formHook = useAuditForm()
  const { status, phase, phases, report, errorMsg, submit, reset } = useAuditSubmit()

  function handleSubmit() {
    if (!formHook.validate(3)) return
    submit(formHook.formState)
  }

  function handleReset() {
    formHook.reset()
    reset()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar onBack={status === 'idle' ? onBack : undefined} />

      <main className="flex-1 px-4 py-10">
        {status === 'idle' && (
          <AuditForm formHook={formHook} onSubmit={handleSubmit} />
        )}

        {status === 'loading' && (
          <AuditProgress phases={phases} currentPhase={phase} />
        )}

        {status === 'error' && (
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="card border border-red-200 bg-red-50 text-center">
              <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
              <h3 className="font-semibold text-red-800 mb-1">Audit Failed</h3>
              <p className="text-sm text-red-600 mb-5">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}

        {status === 'background' && (
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="card border border-indigo-200 bg-indigo-50 text-center">
              <MailCheck className="mx-auto mb-3 text-indigo-500" size={36} />
              <h3 className="font-semibold text-slate-800 mb-2">Audit Running in Background</h3>
              <p className="text-sm text-slate-600 mb-1">
                The AI agent is still processing your policy — this usually takes 2–3 minutes.
              </p>
              <p className="text-sm font-medium text-indigo-700 mb-6">
                Your full report will be emailed to <span className="font-bold">{formHook.formState.email}</span>
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <RotateCcw size={14} /> Start New Audit
              </button>
            </div>
          </div>
        )}

        {status === 'done' && report && (
          <AuditReport report={report} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
