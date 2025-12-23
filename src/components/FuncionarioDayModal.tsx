'use client'

import { useState } from 'react'
import { format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Trash2, Plus } from 'lucide-react'
import type { Turno, Funcionario, Seccion, TipoTurno } from '@/types'
import { NOMBRES_SECCION } from '@/types'

interface FuncionarioDayModalProps {
  date: Date
  funcionario: Funcionario
  turnos: Turno[]
  onClose: () => void
  onDeleteTurno: (turnoId: string) => void
  onAddTurno: (turno: Omit<Turno, 'id'>) => void
  onUpdateTurno: (turnoId: string, turno: Partial<Turno>) => void
}

export default function FuncionarioDayModal({
  date,
  funcionario,
  turnos,
  onClose,
  onDeleteTurno,
  onAddTurno,
  onUpdateTurno
}: FuncionarioDayModalProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const turnosDelDia = turnos.filter(t => t.fecha === dateStr && t.funcionarioId === funcionario.id)

  const [isAdding, setIsAdding] = useState(false)
  const [editingTurnoId, setEditingTurnoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tipoTurno: 'largo' as TipoTurno,
    horaInicio: '',
    horaFin: '',
    seccion: 'selector' as Seccion,
    notas: '',
    color: '#8B5CF6'
  })

  // Determinar hora de inicio según día de la semana
  const dayOfWeek = getDay(date)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const horaInicioLargoDefault = isWeekend ? '09:00' : '08:00'
  const horaFinNocheDefault = isWeekend ? '09:00' : '08:00'

  const handleTipoTurnoChange = (tipo: TipoTurno) => {
    setFormData(prev => {
      if (tipo === 'largo') {
        return { ...prev, tipoTurno: tipo, horaInicio: horaInicioLargoDefault, horaFin: '20:00' }
      } else if (tipo === 'noche') {
        return { ...prev, tipoTurno: tipo, horaInicio: '20:00', horaFin: horaFinNocheDefault }
      } else {
        return { ...prev, tipoTurno: tipo, horaInicio: '', horaFin: '' }
      }
    })
  }

  const handleAddTurno = () => {
    onAddTurno({
      fecha: dateStr,
      tipoTurno: formData.tipoTurno,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      funcionarioId: funcionario.id,
      seccion: formData.seccion,
      personalizado: true,
      color: formData.color,
      notas: formData.notas || undefined
    })
    setIsAdding(false)
    setFormData({
      tipoTurno: 'largo',
      horaInicio: '',
      horaFin: '',
      seccion: 'selector',
      notas: '',
      color: '#8B5CF6'
    })
  }

  const handleStartEdit = (turno: Turno) => {
    setEditingTurnoId(turno.id)
    setFormData({
      tipoTurno: turno.tipoTurno,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      seccion: turno.seccion,
      notas: turno.notas || '',
      color: turno.color || '#8B5CF6'
    })
  }

  const handleSaveEdit = () => {
    if (!editingTurnoId) return
    onUpdateTurno(editingTurnoId, {
      tipoTurno: formData.tipoTurno,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      seccion: formData.seccion,
      notas: formData.notas || undefined,
      color: formData.color
    })
    setEditingTurnoId(null)
    setFormData({
      tipoTurno: 'largo',
      horaInicio: '',
      horaFin: '',
      seccion: 'selector',
      notas: '',
      color: '#8B5CF6'
    })
  }

  const handleCancelEdit = () => {
    setEditingTurnoId(null)
    setIsAdding(false)
    setFormData({
      tipoTurno: 'largo',
      horaInicio: '',
      horaFin: '',
      seccion: 'selector',
      notas: '',
      color: '#8B5CF6'
    })
  }

  const secciones: Seccion[] = [
    'selector', 'reanimador1', 'reanimador2', 'esi2', 'vertical1', 'vertical2',
    'horizontal', 'boarding-oriente', 'boarding-poniente', 'procedimientos1',
    'procedimientos2', 'trauma', 'central', 'fast-track', 'coordinacion'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            <p className="text-gray-600 mt-1">
              {funcionario.nombre} {funcionario.apellido}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Turnos existentes */}
          {turnosDelDia.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Turnos asignados:</h4>
              {turnosDelDia.map(turno => (
                <div key={turno.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {editingTurnoId === turno.id ? (
                    // Modo edición
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de turno
                          </label>
                          <select
                            value={formData.tipoTurno}
                            onChange={(e) => handleTipoTurnoChange(e.target.value as TipoTurno)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="largo">Largo</option>
                            <option value="noche">Noche</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sección
                          </label>
                          <select
                            value={formData.seccion}
                            onChange={(e) => setFormData({ ...formData, seccion: e.target.value as Seccion })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            {secciones.map(sec => (
                              <option key={sec} value={sec}>{NOMBRES_SECCION[sec]}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora inicio
                          </label>
                          <input
                            type="time"
                            value={formData.horaInicio}
                            onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora fin
                          </label>
                          <input
                            type="time"
                            value={formData.horaFin}
                            onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notas (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.notas}
                          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                          placeholder="Ej: Reemplazo, coordinación, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: turno.color || '#10B981' }}
                            />
                            <span className="font-semibold text-gray-800">
                              {turno.tipoTurno === 'largo' ? 'Turno Largo' : turno.tipoTurno === 'noche' ? 'Turno Noche' : 'Otro Turno'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {NOMBRES_SECCION[turno.seccion]} • {turno.horaInicio} - {turno.horaFin}
                          </p>
                          {turno.notas && (
                            <p className="text-sm text-gray-500 italic mt-1">{turno.notas}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(turno)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este turno?')) {
                                onDeleteTurno(turno.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botón/Form para agregar turno */}
          {!isAdding && !editingTurnoId && (
            <button
              onClick={() => {
                setIsAdding(true)
                handleTipoTurnoChange('largo')
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar turno
            </button>
          )}

          {isAdding && (
            <div className="border border-green-300 rounded-lg p-4 bg-green-50 space-y-3">
              <h4 className="font-semibold text-gray-700">Nuevo turno:</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de turno
                  </label>
                  <select
                    value={formData.tipoTurno}
                    onChange={(e) => handleTipoTurnoChange(e.target.value as TipoTurno)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="largo">Largo</option>
                    <option value="noche">Noche</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección
                  </label>
                  <select
                    value={formData.seccion}
                    onChange={(e) => setFormData({ ...formData, seccion: e.target.value as Seccion })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {secciones.map(sec => (
                      <option key={sec} value={sec}>{NOMBRES_SECCION[sec]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Ej: Reemplazo, coordinación, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddTurno}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Agregar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {turnosDelDia.length === 0 && !isAdding && (
            <p className="text-center text-gray-500 py-4">
              No hay turnos asignados para este día
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
