export default function TopBar({ onBack }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <div>
          <span className="font-semibold text-slate-800 text-sm">Clarifi</span>
          <span className="text-slate-400 text-xs ml-2">Sentinel Insurance Auditor</span>
        </div>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Back to home
        </button>
      )}
    </header>
  )
}
