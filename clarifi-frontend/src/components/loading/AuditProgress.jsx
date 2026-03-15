import { Loader2, CheckCircle2 } from 'lucide-react'

export default function AuditProgress({ phases, currentPhase }) {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="card text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <Loader2 className="text-indigo-600 animate-spin" size={28} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-1">Running Your Audit</h2>
        <p className="text-sm text-slate-500 mb-8">
          The AI is orchestrating multiple tools — this typically takes 30–60 seconds.
        </p>

        <div className="space-y-3 text-left">
          {phases.map((label, i) => {
            const done = i < currentPhase
            const active = i === currentPhase
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${active ? 'bg-indigo-50 border border-indigo-100' : done ? 'opacity-60' : 'opacity-30'}`}>
                {done ? (
                  <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                ) : active ? (
                  <Loader2 className="text-indigo-500 animate-spin shrink-0" size={18} />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={`text-sm ${active ? 'font-medium text-indigo-800' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          A copy of your audit report will also be sent to your email.
        </p>
      </div>
    </div>
  )
}
