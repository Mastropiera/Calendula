'use client'

import { useState } from 'react'
import { format, getDay } from 'date-fns'
import { Plus } from 'lucide-react'
import type { Funcionario, Turno, Estamento, Seccion, TipoTurno } from '@/types'
import { NOMBRES_SECCION } from '@/types'
import { saveTurnos } from '@/lib/storage'

interface AssignByDayProps {
  funcionarios: Funcionario[]
  turnos: Turno[]
  onTurnosChange: (turnos: Turno[]) => void
}

export default function AssignByDay({
  funcionarios,
  turnos,
  onTurnosChange
}: AssignByDayProps) {
  const [selectedEstamento, setSelectedEstamento] = useState<Estamento>('enfermera')
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion>('selector')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTipoTurno, setSelectedTipoTurno] = useState<TipoTurno>('largo')
  const [selectedFuncionario, setSelectedFuncionario] = useState('')

  const funcionariosFiltrados = funcionarios.filter(f => f.estamento === selectedEstamento)

  const handleAssign = async () => {
    if (!selectedDate || !selectedFuncionario) {
      alert('Por favor completa todos los campos')
      return
    }

    const dayOfWeek = getDay(new Date(selectedDate))
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const horaInicio = selectedTipoTurno === 'largo' 
      ? (isWeekend ? '09:00' : '08:00')
      : '20:00'
    
    const horaFin = selectedTipoTurno === 'largo'
      ? '20:00'
      : (isWeekend ? '09:00' : '08:00')

    const nuevoTurno: Turno = {
      id: `turno-${Date.now()}-${Math.random()}`,
      fecha: selectedDate,
      tipoTurno: selectedTipoTurno,
      horaInicio,
      horaFin,
      funcionarioId: selectedFuncionario,
      seccion: selectedSeccion,
      personalizado: false
    }

    const nuevosTurnos = [...turnos, nuevoTurno]
    await saveTurnos(nuevosTurnos)
    onTurnosChange(nuevosTurnos)

    // Reset
    setSelectedFuncionario('')
    alert('Turno asignado correctamente')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Tipo de Turno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Turno
          </label>
          <select
            value={selectedTipoTurno}
            onChange={(e) => setSelectedTipoTurno(e.target.value as TipoTurno)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="largo">Largo</option>
            <option value="noche">Noche</option>
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Funcionario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funcionario
          </label>
          <select
            value={selectedFuncionario}
            onChange={(e) => setSelectedFuncionario(e.target.value)}
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

        {/* Botón */}
        <div className="flex items-end">
          <button
            onClick={handleAssign}
            disabled={!selectedDate || !selectedFuncionario}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Asignar Turno
          </button>
        </div>
      </div>

      {/* Lista de turnos asignados para la fecha seleccionada */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            Turnos asignados para {format(new Date(selectedDate + 'T12:00:00'), 'd/MM/yyyy')}
          </h4>
          <div className="space-y-2">
            {turnos
              .filter(t => t.fecha === selectedDate && t.seccion === selectedSeccion)
              .map(turno => {
                const func = funcionarios.find(f => f.id === turno.funcionarioId)
                return (
                  <div key={turno.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{func?.nombre} {func?.apellido}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({turno.tipoTurno === 'largo' ? 'Largo' : 'Noche'})
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
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}