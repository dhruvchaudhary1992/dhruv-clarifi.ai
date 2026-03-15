import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import AuditPage from './pages/AuditPage'

export default function App() {
  const [page, setPage] = useState('landing') // 'landing' | 'audit'

  if (page === 'audit') return <AuditPage onBack={() => setPage('landing')} />
  return <LandingPage onStart={() => setPage('audit')} />
}
