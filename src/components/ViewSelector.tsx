'use client'

import type { VistaCalendario, Seccion, Estamento } from '@/types'
import { NOMBRES_SECCION } from '@/types'

interface ViewSelectorProps {
  vista: VistaCalendario
  onVistaChange: (vista: VistaCalendario) => void
  seccionSeleccionada?: Seccion
  onSeccionChange: (seccion?: Seccion) => void
  estamentoSeleccionado?: Estamento
  onEstamentoChange: (estamento?: Estamento) => void
}

export default function ViewSelector({
  vista,
  onVistaChange,
  seccionSeleccionada,
  onSeccionChange,
  estamentoSeleccionado,
  onEstamentoChange
}: ViewSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista del Calendario</h3>
      
      {/* Selector de vista principal */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            onVistaChange('general')
            onSeccionChange(undefined)
            onEstamentoChange(undefined)
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            vista === 'general'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Visión General
        </button>
        <button
          onClick={() => onVistaChange('por-seccion')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            vista === 'por-seccion'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Por Secciones
        </button>
      </div>

      {/* Selectores de sección y estamento */}
      {vista === 'por-seccion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={seccionSeleccionada || ''}
              onChange={(e) => onSeccionChange(e.target.value as Seccion || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Seleccionar sección...</option>
              {(Object.keys(NOMBRES_SECCION) as Seccion[]).map(seccion => (
                <option key={seccion} value={seccion}>
                  {NOMBRES_SECCION[seccion]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estamento
            </label>
            <select
              value={estamentoSeleccionado || ''}
              onChange={(e) => onEstamentoChange(e.target.value as Estamento || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los estamentos</option>
              <option value="enfermera">Enfermeras</option>
              <option value="tens">TENS</option>
              <option value="auxiliar">Auxiliares</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}