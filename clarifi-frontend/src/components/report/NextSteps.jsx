import { ArrowRight, ListChecks } from 'lucide-react'

export default function NextSteps({ text }) {
  // Extract up to 3 numbered/bulleted lines from the text
  const lines = text
    .split('\n')
    .map(l => l.replace(/^[\d\-\.\•\*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="card border border-indigo-100 bg-indigo-50">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-200 rounded-lg flex items-center justify-center">
          <ListChecks size={15} className="text-indigo-700" />
        </div>
        <span className="section-label text-indigo-500">7 · Recommended Next Steps</span>
      </div>
      <div className="space-y-3">
        {lines.length > 0 ? lines.map((step, i) => (
          <div key={i} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-indigo-100 shadow-sm">
            <span className="shrink-0 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm text-slate-700 leading-snug">{step}</span>
            <ArrowRight size={14} className="text-indigo-400 ml-auto shrink-0 mt-0.5" />
          </div>
        )) : (
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{text}</pre>
        )}
      </div>
    </div>
  )
}
