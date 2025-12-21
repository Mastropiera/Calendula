'use client'

import { useState } from 'react'
import { format, addDays, getDay } from 'date-fns'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import type { Funcionario, Turno, Estamento, Seccion } from '@/types'
import { NOMBRES_SECCION } from '@/types'
import { saveTurnos } from '@/lib/storage'

interface AssignByStaffProps {
  funcionarios: Funcionario[]
  turnos: Turno[]
  onTurnosChange: (turnos: Turno[]) => void
}

export default function AssignByStaff({
  funcionarios,
  turnos,
  onTurnosChange
}: AssignByStaffProps) {
  const [selectedEstamento, setSelectedEstamento] = useState<Estamento>('enfermera')
  const [selectedFuncionario, setSelectedFuncionario] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion>('selector')
  const [startDate, setStartDate] = useState('')

  const funcionariosFiltrados = funcionarios.filter(f => f.estamento === selectedEstamento)

  const handleRellenarCuartoTurno = async () => {
    if (!selectedFuncionario || !startDate) {
      alert('Por favor selecciona un funcionario y una fecha de inicio')
      return
    }

    const nuevosTurnos: Turno[] = []
    let currentDate = new Date(startDate + 'T12:00:00')

    // Rellenar un mes (30 días)
    for (let i = 0; i < 30; i += 4) {
      const dayOfWeek = getDay(currentDate)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const horaInicioLargo = isWeekend ? '09:00' : '08:00'

      // Día 1: Largo
      nuevosTurnos.push({
        id: `turno-${Date.now()}-${Math.random()}`,
        fecha: format(currentDate, 'yyyy-MM-dd'),
        tipoTurno: 'largo',
        horaInicio: horaInicioLargo,
        horaFin: '20:00',
        funcionarioId: selectedFuncionario,
        seccion: selectedSeccion,
        personalizado: false
      })

      // Día 2: Noche
      const dia2 = addDays(currentDate, 1)
      const dia2DayOfWeek = getDay(dia2)
      const dia2IsWeekend = dia2DayOfWeek === 0 || dia2DayOfWeek === 6
      nuevosTurnos.push({
        id: `turno-${Date.now()}-${Math.random()}`,
        fecha: format(dia2, 'yyyy-MM-dd'),
        tipoTurno: 'noche',
        horaInicio: '20:00',
        horaFin: dia2IsWeekend ? '09:00' : '08:00',
        funcionarioId: selectedFuncionario,
        seccion: selectedSeccion,
        personalizado: false
      })

      // Días 3 y 4: Libres (no se agregan turnos)
      currentDate = addDays(currentDate, 4)
    }

    const todosLosTurnos = [...turnos, ...nuevosTurnos]
    await saveTurnos(todosLosTurnos)
    onTurnosChange(todosLosTurnos)
    
    alert(`Se asignaron ${nuevosTurnos.length} turnos en patrón de cuarto turno`)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estamento
          </label>
          <select
            value={selectedEstamento}
            onChange={(e) => {
              setSelectedEstamento(e.target.value as Estamento)
              setSelectedFuncionario('')
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="enfermera">Enfermeras</option>
            <option value="tens">TENS</option>
            <option value="auxiliar">Auxiliares</option>
          </select>
        </div>

        {/* Funcionario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funcionario
          </label>
          <select
            value={selectedFuncionario}
            onChange={(e) => {
              setSelectedFuncionario(e.target.value)
              setShowCalendar(!!e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {funcionariosFiltrados.map(func => (
              <option key={func.id} value={func.id}>
                {func.nombre} {func.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sección
          </label>
          <select
            value={selectedSeccion}
            onChange={(e) => setSelectedSeccion(e.target.value as Seccion)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {(Object.keys(NOMBRES_SECCION) as Seccion[]).map(seccion => (
              <option key={seccion} value={seccion}>
                {NOMBRES_SECCION[seccion]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opciones de asignación */}
      {showCalendar && selectedFuncionario && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Opciones de Asignación
          </h4>

          <div className="space-y-4">
            {/* Rellenar cuarto turno */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-700 mb-3">Rellenar Cuarto Turno</h5>
              <p className="text-sm text-gray-600 mb-3">
                Patrón: Largo → Noche → Libre → Libre (repite por 30 días)
              </p>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Fecha de inicio"
                />
                <button
                  onClick={handleRellenarCuartoTurno}
                  disabled={!startDate}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Rellenar
                </button>
              </div>
            </div>

            {/* Nota sobre otras opciones */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para asignar turnos largos, turnos de noche o turnos personalizados individualmente, 
                usa la pestaña "Asignar por Día".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar turnos del funcionario seleccionado */}
      {selectedFuncionario && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            Turnos asignados a {funcionarios.find(f => f.id === selectedFuncionario)?.nombre}
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {turnos
              .filter(t => t.funcionarioId === selectedFuncionario)
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map(turno => (
                <div key={turno.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{format(new Date(turno.fecha + 'T12:00:00'), 'd/MM/yyyy')}</span>
                    <span className="text-gray-600 ml-2">
                      {NOMBRES_SECCION[turno.seccion]} - {turno.tipoTurno === 'largo' ? 'Largo' : 'Noche'}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const nuevosTurnos = turnos.filter(t => t.id !== turno.id)
                      await saveTurnos(nuevosTurnos)
                      onTurnosChange(nuevosTurnos)
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}