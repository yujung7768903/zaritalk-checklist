import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SituationSelectPage from './pages/SituationSelectPage'
import ChecklistPage from './pages/ChecklistPage'
import GlossaryPage from './pages/GlossaryPage'
import DiagnosisSelectPage from './pages/DiagnosisSelectPage'
import DiagnosisPage from './pages/DiagnosisPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SituationSelectPage />} />
          <Route path="/checklist/:type" element={<ChecklistPage />} />
          <Route path="/diagnosis" element={<DiagnosisSelectPage />} />
          <Route path="/diagnosis/:type" element={<DiagnosisPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
