'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { RefreshCw, LogOut, Users, Download, Repeat } from 'lucide-react'
import Calendar from '@/components/Calendar'
import DayModal from '@/components/DayModal'
import ViewSelector from '@/components/ViewSelector'
import AssignmentPanel from '@/components/AssignmentPanel'
import StaffManagement from '@/components/StaffManagement'
import RotativaCuartoTurno from '@/components/RotativaCuartoTurno'
import { getFuncionarios, getTurnos } from '@/lib/storage'
import { exportTurnosToExcel } from '@/lib/exportToExcel'
import type { Funcionario, Turno, VistaCalendario, Seccion, Estamento } from '@/types'

export default function Home() {
  const { data: session, status } = useSession()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [vista, setVista] = useState<VistaCalendario>('general')
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<Seccion>()
  const [estamentoSeleccionado, setEstamentoSeleccionado] = useState<Estamento>()
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState<string>()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showRotativaModal, setShowRotativaModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar datos
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [loadedFuncionarios, loadedTurnos] = await Promise.all([
        getFuncionarios(),
        getTurnos()
      ])
      setFuncionarios(loadedFuncionarios)
      setTurnos(loadedTurnos)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  const handleExportToExcel = () => {
    if (turnos.length === 0) {
      alert('No hay turnos para exportar')
      return
    }

    const currentDate = new Date()
    exportTurnosToExcel({
      turnos,
      funcionarios,
      mesInicio: currentDate
    })
  }

  // Pantalla de login
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-green-600 mb-2">🌼 Caléndula</h1>
            <p className="text-gray-600">Sistema de Gestión de Turnos</p>
            <p className="text-sm text-gray-500 mt-2">Urgencia Hospitalaria</p>
          </div>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    )
  }

  // Aplicación principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-600 flex items-center gap-2">
                🌼 Caléndula
              </h1>
              <p className="text-gray-600 mt-1">Gestión de Turnos - Urgencia Hospitalaria</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-sm text-gray-600">Bienvenida</p>
                <p className="font-semibold text-gray-800">{session.user?.name}</p>
              </div>
              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                title="Exportar a Excel"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">Exportar</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowRotativaModal(true)}
                className="p-2 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                title="Rotativa 4° Turno"
              >
                <Repeat className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowStaffModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Gestionar Personal"
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Selector de vista */}
        <ViewSelector
          vista={vista}
          onVistaChange={setVista}
          seccionSeleccionada={seccionSeleccionada}
          onSeccionChange={setSeccionSeleccionada}
          estamentoSeleccionado={estamentoSeleccionado}
          onEstamentoChange={setEstamentoSeleccionado}
          funcionarioSeleccionado={funcionarioSeleccionado}
          onFuncionarioChange={setFuncionarioSeleccionado}
          funcionarios={funcionarios}
        />

        {/* Calendario */}
        <div className="mb-6">
          <Calendar
            turnos={turnos}
            funcionarios={funcionarios}
            onDayClick={setSelectedDate}
            vista={vista}
            seccionSeleccionada={seccionSeleccionada}
            estamentoSeleccionado={estamentoSeleccionado}
            funcionarioSeleccionado={funcionarioSeleccionado}
          />
        </div>

        {/* Panel de asignación */}
        <AssignmentPanel
          funcionarios={funcionarios}
          turnos={turnos}
          onTurnosChange={(newTurnos) => setTurnos(newTurnos)}
        />

        {/* Modal de día */}
        {selectedDate && (
          <DayModal
            date={selectedDate}
            turnos={turnos}
            funcionarios={funcionarios}
            onClose={() => setSelectedDate(null)}
          />
        )}

        {/* Modal de gestión de personal */}
        {showStaffModal && (
          <StaffManagement
            funcionarios={funcionarios}
            onFuncionariosChange={setFuncionarios}
            onClose={() => setShowStaffModal(false)}
          />
        )}

        {/* Modal de rotativa de cuarto turno */}
        {showRotativaModal && (
          <RotativaCuartoTurno
            funcionarios={funcionarios}
            turnos={turnos}
            onTurnosChange={setTurnos}
            onClose={() => setShowRotativaModal(false)}
          />
        )}
      </div>
    </div>
  )
}