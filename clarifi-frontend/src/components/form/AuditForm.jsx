import { ChevronRight, ChevronLeft, Send } from 'lucide-react'
import StepPersonal from './StepPersonal'
import StepMedical from './StepMedical'
import StepUpload from './StepUpload'

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Medical' },
  { id: 3, label: 'Upload & Submit' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${current === s.id ? 'bg-indigo-600 text-white shadow-sm' : current > s.id ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            <span>{current > s.id ? '✓' : s.id}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-6 h-px ${current > s.id ? 'bg-green-400' : 'bg-slate-300'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function AuditForm({ formHook, onSubmit }) {
  const { step, formState, errors, update, next, back } = formHook

  const stepTitles = {
    1: { title: 'Tell us about yourself', sub: 'Basic details to personalise your audit' },
    2: { title: 'Medical details', sub: 'Used for BMI, cost, and risk calculations' },
    3: { title: 'Upload your policy', sub: "We'll analyse your coverage against estimated costs" },
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepIndicator current={step} />

      <div className="card animate-slide-up">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">{stepTitles[step].title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{stepTitles[step].sub}</p>
        </div>

        {step === 1 && <StepPersonal formState={formState} errors={errors} update={update} />}
        {step === 2 && <StepMedical formState={formState} errors={errors} update={update} />}
        {step === 3 && <StepUpload formState={formState} errors={errors} update={update} />}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { if (!formState.pdfFile) { update('pdfFile', null); return } onSubmit() }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Send size={15} /> Run Audit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
