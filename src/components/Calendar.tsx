'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Turno, EstadoCobertura, VistaCalendario, Seccion, Estamento } from '@/types'
import { REQUERIMIENTOS_SECCION } from '@/types'

interface CalendarProps {
  turnos: Turno[]
  onDayClick: (date: Date) => void
  vista: VistaCalendario
  seccionSeleccionada?: Seccion
  estamentoSeleccionado?: Estamento
  funcionarios: any[]
}

export default function Calendar({ 
  turnos, 
  onDayClick, 
  vista, 
  seccionSeleccionada, 
  estamentoSeleccionado,
  funcionarios 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const getEstadoDia = (date: Date): EstadoCobertura => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const turnosDelDia = turnos.filter(t => t.fecha === dateStr && !t.personalizado)

    if (turnosDelDia.length === 0) return 'vacio'

    // Calcular totales requeridos y asignados
    let totalRequerido = { enfermeras: 0, tens: 0, auxiliares: 0 }
    let totalAsignado = { enfermeras: 0, tens: 0, auxiliares: 0 }

    Object.entries(REQUERIMIENTOS_SECCION).forEach(([seccion, req]) => {
      totalRequerido.enfermeras += req.enfermeras * 2 // largo y noche
      totalRequerido.tens += req.tens * 2
      totalRequerido.auxiliares += req.auxiliares * 2
    })

    turnosDelDia.forEach(turno => {
      const funcionario = funcionarios.find(f => f.id === turno.funcionarioId)
      if (funcionario) {
        if (funcionario.estamento === 'enfermera') totalAsignado.enfermeras++
        if (funcionario.estamento === 'tens') totalAsignado.tens++
        if (funcionario.estamento === 'auxiliar') totalAsignado.auxiliares++
      }
    })

    const completo = 
      totalAsignado.enfermeras >= totalRequerido.enfermeras &&
      totalAsignado.tens >= totalRequerido.tens &&
      totalAsignado.auxiliares >= totalRequerido.auxiliares

    if (completo) return 'completo'
    return 'parcial'
  }

  const getTurnosParaVista = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    let turnosDelDia = turnos.filter(t => t.fecha === dateStr)

    if (vista === 'por-seccion' && seccionSeleccionada) {
      turnosDelDia = turnosDelDia.filter(t => t.seccion === seccionSeleccionada)
    }

    if (estamentoSeleccionado) {
      turnosDelDia = turnosDelDia.filter(t => {
        const funcionario = funcionarios.find(f => f.id === t.funcionarioId)
        return funcionario?.estamento === estamentoSeleccionado
      })
    }

    return turnosDelDia
  }

  const getColorDia = (date: Date): string => {
    if (vista === 'por-seccion') {
      const turnosVista = getTurnosParaVista(date)
      if (turnosVista.length === 0) return 'bg-white hover:bg-gray-50'
      return 'bg-blue-50 hover:bg-blue-100'
    }

    const estado = getEstadoDia(date)
    if (estado === 'completo') return 'bg-green-100 hover:bg-green-200'
    if (estado === 'parcial') return 'bg-yellow-100 hover:bg-yellow-200'
    return 'bg-red-50 hover:bg-red-100'
  }

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const turnosVista = getTurnosParaVista(day)
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={`
                relative p-3 rounded-lg transition-all min-h-[80px] flex flex-col
                ${getColorDia(day)}
                ${isToday(day) ? 'ring-2 ring-blue-500 font-bold' : ''}
                ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''}
              `}
            >
              <span className="text-lg mb-1">{format(day, 'd')}</span>
              
              {/* Mostrar nombres en vista por sección */}
              {vista === 'por-seccion' && turnosVista.length > 0 && (
                <div className="text-xs space-y-0.5 overflow-hidden">
                  {turnosVista.slice(0, 3).map(turno => {
                    const func = funcionarios.find(f => f.id === turno.funcionarioId)
                    return (
                      <div key={turno.id} className="truncate text-gray-700">
                        {func?.nombre.split(' ')[0]} {func?.apellido.split(' ')[0]}
                      </div>
                    )
                  })}
                  {turnosVista.length > 3 && (
                    <div className="text-gray-500">+{turnosVista.length - 3}</div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {vista === 'general' ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-300"></div>
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 rounded border border-red-200"></div>
              <span>Sin cubrir</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 rounded border border-blue-300"></div>
            <span>Tiene asignaciones</span>
          </div>
        )}
      </div>
    </div>
  )
}