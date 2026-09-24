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
import EvaluacionPage from './pages/evaluacion/EvaluacionPage'
import AntropometriaPage from './pages/evaluacion/AntropometriaPage'
import EvaluacionNinoPage from './pages/evaluacion/EvaluacionNinoPage'
import EvaluacionAdolescentePage from './pages/evaluacion/EvaluacionAdolescentePage'
import EvaluacionEmbarazadaPage from './pages/evaluacion/EvaluacionEmbarazadaPage'
import BioquimicaPage from './pages/evaluacion/BioquimicaPage'
import EvaluacionClinicaPage from './pages/evaluacion/EvaluacionClinicaPage'
import EvaluacionAdultoPage from './pages/evaluacion/EvaluacionAdultoPage'
import DietaConstructorPage from './pages/dietas/DietaConstructorPage'
import SeguimientoPage from './pages/seguimiento/SeguimientoPage'
import ExportarPDFPage from './pages/reportes/ExportarPDFPage'
import ConsumoPage from './pages/consumo/ConsumoPage'
import RecordatorioPage from './pages/consumo/RecordatorioPage'
import { SelectorPacientes } from './components/pacientes/SelectorPacientes'

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

            {/* ── Módulo A · Evaluación nutricional ── */}
            <Route path="/evaluaciones" element={<EvaluacionPage />} />
            <Route path="/evaluacion/:pacienteId" element={<EvaluacionPage />} />
            <Route path="/evaluacion/:pacienteId/antropometria" element={<AntropometriaPage />} />
            <Route path="/evaluacion/:pacienteId/nino" element={<EvaluacionNinoPage />} />
            <Route path="/evaluacion/:pacienteId/adolescente" element={<EvaluacionAdolescentePage />} />
            <Route path="/evaluacion/:pacienteId/embarazada" element={<EvaluacionEmbarazadaPage />} />
            <Route path="/evaluacion/:pacienteId/bioquimica" element={<BioquimicaPage />} />
            <Route path="/evaluacion/:pacienteId/clinica" element={<EvaluacionClinicaPage />} />
            <Route path="/evaluacion/:pacienteId/adulto" element={<EvaluacionAdultoPage />} />

            {/* ── Módulo B · Constructor de dietas ── */}
            <Route
              path="/dietas"
              element={
                <SelectorPacientes
                  titulo="Dietas"
                  descripcion="Elige al paciente para construir o abrir su plan semanal"
                  destino={id => `/dietas/${id}/nueva`}
                />
              }
            />
            <Route path="/dietas/:pacienteId/nueva" element={<DietaConstructorPage />} />
            <Route path="/dietas/:pacienteId/:dietaId" element={<DietaConstructorPage />} />

            {/* ── Módulo E · Consumo declarado ── */}
            <Route path="/consumo" element={<ConsumoPage />} />
            <Route path="/consumo/:pacienteId" element={<ConsumoPage />} />
            <Route path="/consumo/:pacienteId/:registroId" element={<RecordatorioPage />} />

            {/* ── Módulo D · Exportación PDF ── */}
            <Route path="/dietas/:pacienteId/:dietaId/exportar" element={<ExportarPDFPage />} />
            <Route
              path="/reportes"
              element={
                <SelectorPacientes
                  titulo="Reportes PDF"
                  descripcion="Elige al paciente para exportar su plan nutricional"
                  destino={id => `/dietas/${id}/nueva`}
                />
              }
            />

            {/* ── Módulo C · Seguimiento ── */}
            <Route
              path="/seguimiento"
              element={
                <SelectorPacientes
                  titulo="Seguimiento"
                  descripcion="Elige al paciente para ver su evolución consulta a consulta"
                  destino={id => `/seguimiento/${id}`}
                />
              }
            />
            <Route path="/seguimiento/:pacienteId" element={<SeguimientoPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
