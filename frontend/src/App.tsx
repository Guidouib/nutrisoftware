import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import PacientesPage from './pages/pacientes/PacientesPage'
import PacienteDetailPage from './pages/pacientes/PacienteDetailPage'
import CitasPage from './pages/citas/CitasPage'
import AlimentosPage from './pages/alimentos/AlimentosPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/pacientes/:id" element={<PacienteDetailPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/alimentos" element={<AlimentosPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
