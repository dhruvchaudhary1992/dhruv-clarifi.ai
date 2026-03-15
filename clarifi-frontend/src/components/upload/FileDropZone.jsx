import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'

export default function FileDropZone({ value, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      onChange(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      onChange(null)
      return
    }
    onChange(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <FileText className="text-green-600 shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 truncate">{value.name}</p>
            <p className="text-xs text-green-600">{(value.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            className="text-green-600 hover:text-green-800 transition-colors"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`w-full p-8 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer
            ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50'}
            ${error ? 'border-red-300' : ''}`}
        >
          <Upload className="mx-auto mb-3 text-slate-400" size={28} />
          <p className="text-sm font-medium text-slate-700">Drop your policy PDF here</p>
          <p className="text-xs text-slate-400 mt-1">or click to browse — PDF only, max 10MB</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
