import FileDropZone from '../upload/FileDropZone'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}

export default function StepUpload({ formState, errors, update }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="section-label mb-3">Upload Policy Document</p>
        <FileDropZone
          value={formState.pdfFile}
          onChange={file => update('pdfFile', file)}
          error={errors.pdfFile}
        />
      </div>

      <div>
        <p className="section-label mb-3">Review Your Details</p>
        <div className="card p-4">
          <Row label="Name" value={formState.fullName || '—'} />
          <Row label="Email" value={formState.email} />
          <Row label="City" value={formState.city} />
          <Row label="Weight" value={formState.weight ? `${formState.weight} kg` : null} />
          <Row label="Height" value={formState.height ? `${formState.height} m` : null} />
          <Row label="Procedure" value={formState.procedure || '—'} />
          <Row label="Hospital" value={formState.hospital || '—'} />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Your policy is encrypted in transit and processed securely. A copy of the audit report will also be sent to your email.
      </p>
    </div>
  )
}
