import { FileStack } from 'lucide-react'

export default function ClaimGuidance({ text, claimMode }) {
  const isCashless = claimMode === 'cashless'
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileStack size={15} className="text-indigo-600" />
          </div>
          <span className="section-label">5 · Claim Process Guidance</span>
        </div>
        <span className={`badge ${isCashless ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
          {isCashless ? '⚡ Cashless' : '↩ Reimbursement'}
        </span>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}
