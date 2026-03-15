import { Building2 } from 'lucide-react'

export default function HospitalStatus({ text, isNetwork }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Building2 size={15} className="text-indigo-600" />
        </div>
        <span className="section-label">2 · Hospital Network Status</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">Network Classification</span>
        <span className={`badge text-sm font-bold px-4 py-1.5
          ${isNetwork ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isNetwork ? '✓ Network Hospital' : '✗ Non-Network Hospital'}
        </span>
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}
