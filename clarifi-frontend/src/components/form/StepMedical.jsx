function Field({ label, hint, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
    />
  )
}

export default function StepMedical({ formState, errors, update }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Weight" hint="kg" required error={errors.weight}>
          <Input type="number" value={formState.weight} onChange={v => update('weight', v)} placeholder="72" error={errors.weight} />
        </Field>
        <Field label="Height" hint="metres" required error={errors.height}>
          <Input type="number" step="0.01" value={formState.height} onChange={v => update('height', v)} placeholder="1.72" error={errors.height} />
        </Field>
      </div>
      <Field label="Planned Procedure" error={errors.procedure}>
        <Input value={formState.procedure} onChange={v => update('procedure', v)} placeholder="e.g. Knee Replacement" error={errors.procedure} />
      </Field>
      <Field label="Hospital Name" error={errors.hospital}>
        <Input value={formState.hospital} onChange={v => update('hospital', v)} placeholder="e.g. Lilavati Hospital" error={errors.hospital} />
      </Field>
      <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
        Procedure and hospital are optional but improve audit accuracy.
      </p>
    </div>
  )
}
