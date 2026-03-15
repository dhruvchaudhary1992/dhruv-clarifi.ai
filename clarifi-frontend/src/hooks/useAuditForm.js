import { useState } from 'react'

const INITIAL = {
  fullName: '',
  email: '',
  city: '',
  weight: '',
  height: '',
  procedure: '',
  hospital: '',
  pdfFile: null,
}

const STEP_FIELDS = {
  1: ['email', 'city'],           // required fields per step
  2: ['weight', 'height'],
  3: ['pdfFile'],
}

export function useAuditForm() {
  const [step, setStep] = useState(1)
  const [formState, setFormState] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setFormState(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(targetStep) {
    const required = STEP_FIELDS[targetStep] || []
    const newErrors = {}
    for (const field of required) {
      const val = formState[field]
      if (!val || (typeof val === 'string' && !val.trim())) {
        newErrors[field] = 'This field is required'
      }
    }
    // Extra validation
    if (targetStep === 1 && formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (targetStep === 2) {
      if (formState.weight && (isNaN(formState.weight) || +formState.weight <= 0)) {
        newErrors.weight = 'Enter a valid weight in kg'
      }
      if (formState.height && (isNaN(formState.height) || +formState.height <= 0 || +formState.height > 3)) {
        newErrors.height = 'Enter height in metres (e.g. 1.72)'
      }
    }
    if (targetStep === 3 && formState.pdfFile && formState.pdfFile.type !== 'application/pdf') {
      newErrors.pdfFile = 'Only PDF files are accepted'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function next() {
    if (validate(step)) setStep(s => Math.min(s + 1, 3))
  }

  function back() {
    setStep(s => Math.max(s - 1, 1))
  }

  function reset() {
    setStep(1)
    setFormState(INITIAL)
    setErrors({})
  }

  return { step, formState, errors, update, next, back, reset, validate }
}
