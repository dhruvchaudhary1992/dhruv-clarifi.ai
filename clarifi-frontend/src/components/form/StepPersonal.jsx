function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
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

export default function StepPersonal({ formState, errors, update }) {
  return (
    <div className="space-y-5">
      <Field label="Full Name" error={errors.fullName}>
        <Input value={formState.fullName} onChange={v => update('fullName', v)} placeholder="Ramesh Sharma" error={errors.fullName} />
      </Field>
      <Field label="Email Address" required error={errors.email}>
        <Input type="email" value={formState.email} onChange={v => update('email', v)} placeholder="ramesh@example.com" error={errors.email} />
      </Field>
      <Field label="City" required error={errors.city}>
        <Input value={formState.city} onChange={v => update('city', v)} placeholder="Mumbai" error={errors.city} />
      </Field>
    </div>
  )
}
