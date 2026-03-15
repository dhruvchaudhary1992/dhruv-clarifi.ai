import { ShieldCheck } from 'lucide-react'

export default function PolicyOverview({ text }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
          <ShieldCheck size={15} className="text-indigo-600" />
        </div>
        <span className="section-label">1 · Policy Overview</span>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}
