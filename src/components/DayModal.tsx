'use client'

import { format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { X } from 'lucide-react'
import type { Turno, Funcionario, Seccion } from '@/types'
import { NOMBRES_SECCION, REQUERIMIENTOS_SECCION } from '@/types'

interface DayModalProps {
  date: Date
  turnos: Turno[]
  funcionarios: Funcionario[]
  onClose: () => void
}

export default function DayModal({ date, turnos, funcionarios, onClose }: DayModalProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const turnosDelDia = turnos.filter(t => t.fecha === dateStr && !t.personalizado)
  
  // Determinar hora de inicio según día de la semana
  const dayOfWeek = getDay(date)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const horaInicioLargo = isWeekend ? '09:00' : '08:00'

  const getTurnosPorSeccionYTipo = (seccion: Seccion, tipo: 'largo' | 'noche') => {
    return turnosDelDia.filter(t => t.seccion === seccion && t.tipoTurno === tipo)
  }

  const getFuncionarioNombre = (funcionarioId: string) => {
    const func = funcionarios.find(f => f.id === funcionarioId)
    return func ? `${func.nombre} ${func.apellido}` : 'Desconocido'
  }

  const getFuncionarioEstamento = (funcionarioId: string) => {
    const func = funcionarios.find(f => f.id === funcionarioId)
    return func?.estamento || ''
  }

  const renderSeccion = (seccion: Seccion) => {
    const turnosLargo = getTurnosPorSeccionYTipo(seccion, 'largo')
    const turnosNoche = getTurnosPorSeccionYTipo(seccion, 'noche')
    const requerido = REQUERIMIENTOS_SECCION[seccion]

    // Agrupar por estamento
    const agruparPorEstamento = (turnos: Turno[]) => {
      const enfermeras = turnos.filter(t => getFuncionarioEstamento(t.funcionarioId) === 'enfermera')
      const tens = turnos.filter(t => getFuncionarioEstamento(t.funcionarioId) === 'tens')
      const auxiliares = turnos.filter(t => getFuncionarioEstamento(t.funcionarioId) === 'auxiliar')
      return { enfermeras, tens, auxiliares }
    }

    const largoAgrupado = agruparPorEstamento(turnosLargo)
    const nocheAgrupado = agruparPorEstamento(turnosNoche)

    return (
      <div key={seccion} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-3">{NOMBRES_SECCION[seccion]}</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Turno Largo */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              Largo ({horaInicioLargo}-20:00)
            </div>
            <div className="space-y-1 text-sm">
              {requerido.enfermeras > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">Enfermeras ({largoAgrupado.enfermeras.length}/{requerido.enfermeras}):</span>
                  {largoAgrupado.enfermeras.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {largoAgrupado.enfermeras.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
              {requerido.tens > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">TENS ({largoAgrupado.tens.length}/{requerido.tens}):</span>
                  {largoAgrupado.tens.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {largoAgrupado.tens.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
              {requerido.auxiliares > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">Auxiliares ({largoAgrupado.auxiliares.length}/{requerido.auxiliares}):</span>
                  {largoAgrupado.auxiliares.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {largoAgrupado.auxiliares.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Turno Noche */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              Noche (20:00-{horaInicioLargo})
            </div>
            <div className="space-y-1 text-sm">
              {requerido.enfermeras > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">Enfermeras ({nocheAgrupado.enfermeras.length}/{requerido.enfermeras}):</span>
                  {nocheAgrupado.enfermeras.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {nocheAgrupado.enfermeras.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
              {requerido.tens > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">TENS ({nocheAgrupado.tens.length}/{requerido.tens}):</span>
                  {nocheAgrupado.tens.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {nocheAgrupado.tens.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
              {requerido.auxiliares > 0 && (
                <div className="text-gray-700">
                  <span className="font-medium">Auxiliares ({nocheAgrupado.auxiliares.length}/{requerido.auxiliares}):</span>
                  {nocheAgrupado.auxiliares.length > 0 ? (
                    <div className="ml-2 space-y-1">
                      {nocheAgrupado.auxiliares.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: t.color || '#10B981' }}
                          />
                          <div className="flex-1">
                            <div>{getFuncionarioNombre(t.funcionarioId)}</div>
                            {t.notas && (
                              <div className="text-xs text-gray-600 italic mt-0.5">{t.notas}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-red-500">Sin asignar</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 capitalize">
            {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(NOMBRES_SECCION) as Seccion[]).map(seccion => renderSeccion(seccion))}
          </div>
        </div>
      </div>
    </div>
  )
}