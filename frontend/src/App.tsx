import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SituationSelectPage from './pages/SituationSelectPage'
import ChecklistPage from './pages/ChecklistPage'
import CalculatorPage from './pages/CalculatorPage'
import GlossaryPage from './pages/GlossaryPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SituationSelectPage />} />
          <Route path="/checklist/:type" element={<ChecklistPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
