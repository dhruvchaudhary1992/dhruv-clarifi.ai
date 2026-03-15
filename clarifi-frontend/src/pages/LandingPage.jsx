import { ShieldCheck, FileSearch, Zap, ArrowRight } from 'lucide-react'

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="card flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-indigo-600" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function StepBadge({ num, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{num}</div>
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  )
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-slate-800">Clarifi</span>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Start Audit <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full text-indigo-700 text-xs font-semibold mb-6">
          <ShieldCheck size={12} /> Powered by Sentinel AI · IRDAI 2024 Compliant
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
          Know exactly what your<br />
          <span className="text-indigo-600">health insurance covers</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Upload your policy, enter your surgery details, and get a full AI-powered insurance audit in under 60 seconds — costs, risks, hospital network status, and legal rights.
        </p>
        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          Start Your Free Audit <ArrowRight size={18} />
        </button>
        <p className="mt-3 text-xs text-slate-400">No account needed · Audit report emailed to you</p>
      </main>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <p className="section-label text-center mb-6">What the audit covers</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard icon={ShieldCheck} title="Policy Coverage Analysis" desc="Reads your policy PDF and identifies what's covered, waiting periods, and PED clauses." />
          <FeatureCard icon={FileSearch} title="Hospital Network Check" desc="Confirms if your chosen hospital is in-network — determines cashless vs. reimbursement." />
          <FeatureCard icon={Zap} title="Cost & Risk Estimates" desc="Market surgery costs by city, recommended sum insured, and clinical risk based on BMI." />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-xl mx-auto px-6 pb-20">
        <p className="section-label text-center mb-6">How it works</p>
        <div className="space-y-4">
          <StepBadge num="1" label="Fill in your personal and medical details" />
          <StepBadge num="2" label="Upload your health insurance policy PDF" />
          <StepBadge num="3" label="Receive a full audit report on-screen and by email" />
        </div>
      </section>

      <footer className="text-center pb-8 text-xs text-slate-400">
        Clarifi · Sentinel Insurance Auditor · For informational purposes only
      </footer>
    </div>
  )
}
