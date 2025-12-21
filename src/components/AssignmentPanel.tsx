'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, User } from 'lucide-react'
import AssignByDay from './AssignByDay'
import AssignByStaff from './AssignByStaff'
import type { Funcionario, Turno } from '@/types'

interface AssignmentPanelProps {
  funcionarios: Funcionario[]
  turnos: Turno[]
  onTurnosChange: (turnos: Turno[]) => void
}

export default function AssignmentPanel({
  funcionarios,
  turnos,
  onTurnosChange
}: AssignmentPanelProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'staff'>('day')

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Asignar Turnos</h3>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('day')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'day'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          Asignar por Día
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'staff'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-5 h-5" />
          Asignar por Funcionario
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'day' && (
          <AssignByDay
            funcionarios={funcionarios}
            turnos={turnos}
            onTurnosChange={onTurnosChange}
          />
        )}
        {activeTab === 'staff' && (
          <AssignByStaff
            funcionarios={funcionarios}
            turnos={turnos}
            onTurnosChange={onTurnosChange}
          />
        )}
      </div>
    </div>
  )
}