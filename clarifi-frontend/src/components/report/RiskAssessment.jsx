import { Activity } from 'lucide-react'

const RISK_CONFIG = {
  high:     { label: 'High Risk',     classes: 'bg-red-100 text-red-700',   border: 'border-red-200' },
  moderate: { label: 'Moderate Risk', classes: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  low:      { label: 'Low Risk',      classes: 'bg-green-100 text-green-700', border: 'border-green-200' },
}

export default function RiskAssessment({ text, riskLevel }) {
  const cfg = RISK_CONFIG[riskLevel] || RISK_CONFIG.low
  return (
    <div className={`card border ${cfg.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Activity size={15} className="text-indigo-600" />
          </div>
          <span className="section-label">4 · Clinical Risk Assessment</span>
        </div>
        <span className={`badge ${cfg.classes}`}>{cfg.label}</span>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}
