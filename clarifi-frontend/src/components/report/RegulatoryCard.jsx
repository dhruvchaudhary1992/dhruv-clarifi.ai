import { Scale } from 'lucide-react'

export default function RegulatoryCard({ text }) {
  return (
    <div className="card bg-slate-50 border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Scale size={15} className="text-indigo-600" />
        </div>
        <span className="section-label">6 · Regulatory Safeguards (IRDAI 2024)</span>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}
