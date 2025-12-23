'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Calendar, Users, Edit2, Repeat } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { RotativaCuartoTurno, Funcionario, Turno, Seccion } from '@/types'
import { SECUENCIA_CUARTO_TURNO, NOMBRES_SECCION } from '@/types'
import { getRotativas, saveRotativas, addRotativa, updateRotativa, deleteRotativa } from '@/lib/storage'
import { saveTurnos } from '@/lib/storage'

interface RotativaCuartoTurnoProps {
  funcionarios: Funcionario[]
  turnos: Turno[]
  onTurnosChange: (turnos: Turno[]) => void
  onClose: () => void
}

export default function RotativaCuartoTurno({
  funcionarios,
  turnos,
  onTurnosChange,
  onClose
}: RotativaCuartoTurnoProps) {
  const [rotativas, setRotativas] = useState<RotativaCuartoTurno[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rotativaAGenerar, setRotativaAGenerar] = useState<RotativaCuartoTurno | null>(null)
  const [modoGeneracion, setModoGeneracion] = useState<'nueva' | 'continuar'>('nueva')
  const [mesesAGenerar, setMesesAGenerar] = useState(2)
  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    funcionariosSeleccionados: [] as string[]
  })

  useEffect(() => {
    loadRotativas()
  }, [])

  const loadRotativas = async () => {
    const data = await getRotativas()
    setRotativas(data)
  }

  const handleAddFuncionario = (funcionarioId: string) => {
    if (!formData.funcionariosSeleccionados.includes(funcionarioId)) {
      setFormData({
        ...formData,
        funcionariosSeleccionados: [...formData.funcionariosSeleccionados, funcionarioId]
      })
    }
  }

  const handleRemoveFuncionario = (funcionarioId: string) => {
    setFormData({
      ...formData,
      funcionariosSeleccionados: formData.funcionariosSeleccionados.filter(id => id !== funcionarioId)
    })
  }

  const handleMoveFuncionario = (index: number, direction: 'up' | 'down') => {
    const newList = [...formData.funcionariosSeleccionados]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]
      setFormData({ ...formData, funcionariosSeleccionados: newList })
    }
  }

  const handleCreateRotativa = async () => {
    if (!formData.nombre || !formData.fechaInicio || formData.funcionariosSeleccionados.length === 0) {
      alert('Por favor completa todos los campos y selecciona al menos un funcionario')
      return
    }

    if (editingId) {
      // Actualizar rotativa existente
      await updateRotativa(editingId, {
        nombre: formData.nombre,
        funcionarios: formData.funcionariosSeleccionados,
        fechaInicio: formData.fechaInicio
      })
    } else {
      // Crear nueva rotativa
      const nuevaRotativa: RotativaCuartoTurno = {
        id: `rotativa-${Date.now()}`,
        nombre: formData.nombre,
        funcionarios: formData.funcionariosSeleccionados,
        secuenciaRotacion: SECUENCIA_CUARTO_TURNO,
        fechaInicio: formData.fechaInicio,
        diasPorSeccion: 2
      }
      await addRotativa(nuevaRotativa)
    }

    await loadRotativas()
    setIsCreating(false)
    setEditingId(null)
    setFormData({ nombre: '', fechaInicio: '', funcionariosSeleccionados: [] })
  }

  const handleEditRotativa = (rotativa: RotativaCuartoTurno) => {
    setEditingId(rotativa.id)
    setFormData({
      nombre: rotativa.nombre,
      fechaInicio: rotativa.fechaInicio,
      funcionariosSeleccionados: rotativa.funcionarios
    })
    setIsCreating(true)
  }

  const handleCancelEdit = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ nombre: '', fechaInicio: '', funcionariosSeleccionados: [] })
  }

  const handleGenerarTurnos = async () => {
    if (!rotativaAGenerar) return

    const nuevosTurnos: Turno[] = []
    let fechaBase: Date
    let diasInicialesGenerados = 0
    let turnosFinales: Turno[]

    if (modoGeneracion === 'continuar' && rotativaAGenerar.ultimaFechaGenerada) {
      // Modo continuar: empezar desde el día siguiente a la última fecha generada
      fechaBase = addDays(parseISO(rotativaAGenerar.ultimaFechaGenerada), 1)
      diasInicialesGenerados = (rotativaAGenerar.mesesGenerados || 0) * 30
      // Mantener los turnos existentes de esta rotativa
      turnosFinales = turnos
    } else {
      // Modo nueva: eliminar turnos anteriores y empezar desde la fecha de inicio
      fechaBase = parseISO(rotativaAGenerar.fechaInicio)
      diasInicialesGenerados = 0
      // Eliminar todos los turnos existentes de esta rotativa
      turnosFinales = turnos.filter(t => t.rotativaId !== rotativaAGenerar.id)
    }

    const diasTotales = mesesAGenerar * 30 // Días del nuevo período a generar

    // Para cada funcionario
    rotativaAGenerar.funcionarios.forEach((funcionarioId, funcionarioIndex) => {
      // Calcular la sección inicial basada en los días ya generados
      const ciclosCompletados = Math.floor(diasInicialesGenerados / 4)
      let seccionIndex = (funcionarioIndex + ciclosCompletados) % rotativaAGenerar.secuenciaRotacion.length

      // Generar turnos para el nuevo período
      for (let diaActual = 0; diaActual < diasTotales; diaActual += 4) {
        const seccion = rotativaAGenerar.secuenciaRotacion[seccionIndex % rotativaAGenerar.secuenciaRotacion.length]

        // Día 1: Largo
        const fechaLargo = format(addDays(fechaBase, diaActual), 'yyyy-MM-dd')
        const dayOfWeekLargo = addDays(fechaBase, diaActual).getDay()
        const isWeekendLargo = dayOfWeekLargo === 0 || dayOfWeekLargo === 6

        nuevosTurnos.push({
          id: `turno-${Date.now()}-${Math.random()}`,
          fecha: fechaLargo,
          tipoTurno: 'largo',
          horaInicio: isWeekendLargo ? '09:00' : '08:00',
          horaFin: '20:00',
          funcionarioId,
          seccion,
          personalizado: false,
          color: '#8B5CF6',
          rotativaId: rotativaAGenerar.id
        })

        // Día 2: Noche
        const fechaNoche = format(addDays(fechaBase, diaActual + 1), 'yyyy-MM-dd')
        const dayOfWeekNoche = addDays(fechaBase, diaActual + 1).getDay()
        const isWeekendNoche = dayOfWeekNoche === 0 || dayOfWeekNoche === 6

        nuevosTurnos.push({
          id: `turno-${Date.now()}-${Math.random()}-n`,
          fecha: fechaNoche,
          tipoTurno: 'noche',
          horaInicio: '20:00',
          horaFin: isWeekendNoche ? '09:00' : '08:00',
          funcionarioId,
          seccion,
          personalizado: false,
          color: '#8B5CF6',
          rotativaId: rotativaAGenerar.id
        })

        // Días 3 y 4: Libre (no se crea turno)
        seccionIndex++
      }
    })

    // Actualizar la rotativa con la nueva información
    const ultimaFecha = format(addDays(fechaBase, diasTotales - 2), 'yyyy-MM-dd') // -2 porque el último turno es noche (día 2 del ciclo)
    const mesesTotales = (diasInicialesGenerados + diasTotales) / 30

    await updateRotativa(rotativaAGenerar.id, {
      ultimaFechaGenerada: ultimaFecha,
      mesesGenerados: mesesTotales
    })

    // Combinar turnos + nuevos turnos generados
    const turnosActualizados = [...turnosFinales, ...nuevosTurnos]
    await saveTurnos(turnosActualizados)
    onTurnosChange(turnosActualizados)

    const accion = modoGeneracion === 'continuar' ? 'Se continuaron' : 'Se generaron'
    alert(`${accion} ${nuevosTurnos.length} turnos para la rotativa "${rotativaAGenerar.nombre}"`)

    setRotativaAGenerar(null)
    setMesesAGenerar(2)
    setModoGeneracion('nueva')
    await loadRotativas()
  }

  const handleDeleteRotativa = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar esta rotativa?')) return
    await deleteRotativa(id)
    await loadRotativas()
  }

  const funcionariosDisponibles = funcionarios.filter(
    f => f.estamento === 'enfermera' && !formData.funcionariosSeleccionados.includes(f.id)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Rotativa de Cuarto Turno</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Botón crear rotativa */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Rotativa
            </button>
          )}

          {/* Formulario de creación/edición */}
          {isCreating && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-4">
                {editingId ? 'Editar Rotativa' : 'Crear Nueva Rotativa'}
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Rotativa *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Rotativa Diciembre 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Selección de funcionarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agregar Enfermeras a la Rotativa (en orden)
                  </label>
                  <select
                    onChange={(e) => handleAddFuncionario(e.target.value)}
                    value=""
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una enfermera...</option>
                    {funcionariosDisponibles.map(func => (
                      <option key={func.id} value={func.id}>
                        {func.nombre} {func.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de funcionarios seleccionados */}
                {formData.funcionariosSeleccionados.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orden de Rotación ({formData.funcionariosSeleccionados.length} enfermeras)
                    </label>
                    <div className="space-y-2">
                      {formData.funcionariosSeleccionados.map((funcionarioId, index) => {
                        const func = funcionarios.find(f => f.id === funcionarioId)
                        return (
                          <div
                            key={funcionarioId}
                            className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg"
                          >
                            <span className="font-semibold text-purple-600 w-8">{index + 1}.</span>
                            <span className="flex-1">{func?.nombre} {func?.apellido}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleMoveFuncionario(index, 'up')}
                                disabled={index === 0}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveFuncionario(index, 'down')}
                                disabled={index === formData.funcionariosSeleccionados.length - 1}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleRemoveFuncionario(funcionarioId)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleCreateRotativa}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Rotativa'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de rotativas existentes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Rotativas Configuradas</h4>
            {rotativas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay rotativas configuradas aún
              </p>
            ) : (
              rotativas.map(rotativa => (
                <div key={rotativa.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-lg text-gray-800">{rotativa.nombre}</h5>
                      <p className="text-sm text-gray-600">
                        Inicio: {format(parseISO(rotativa.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRotativa(rotativa)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar rotativa"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRotativa(rotativa.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar rotativa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Enfermeras ({rotativa.funcionarios.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rotativa.funcionarios.map((funcId, index) => {
                        const func = funcionarios.find(f => f.id === funcId)
                        return (
                          <span
                            key={funcId}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg"
                          >
                            {index + 1}. {func?.nombre} {func?.apellido.split(' ')[0]}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {rotativa.ultimaFechaGenerada && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Última generación:</strong> {rotativa.ultimaFechaGenerada}
                        <br />
                        <strong>Meses generados:</strong> {rotativa.mesesGenerados?.toFixed(1) || 0}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRotativaAGenerar(rotativa)
                        setModoGeneracion('nueva')
                      }}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Generar
                    </button>
                    {rotativa.ultimaFechaGenerada && (
                      <button
                        onClick={() => {
                          setRotativaAGenerar(rotativa)
                          setModoGeneracion('continuar')
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Repeat className="w-5 h-5" />
                        Continuar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para generar turnos */}
      {rotativaAGenerar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 m-4">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              {modoGeneracion === 'continuar' ? 'Continuar Rotativa' : 'Generar Turnos'}
            </h4>

            {modoGeneracion === 'continuar' ? (
              <div className="mb-4">
                <p className="text-gray-600 mb-3">
                  Continuarás la rotativa "{rotativaAGenerar.nombre}" desde donde terminó.
                </p>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 space-y-1">
                  <p><strong>Última fecha generada:</strong> {rotativaAGenerar.ultimaFechaGenerada}</p>
                  <p><strong>Próxima fecha de inicio:</strong> {format(addDays(parseISO(rotativaAGenerar.ultimaFechaGenerada!), 1), 'yyyy-MM-dd')}</p>
                  <p><strong>Meses ya generados:</strong> {rotativaAGenerar.mesesGenerados?.toFixed(1) || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">
                ¿Cuántos meses deseas generar para la rotativa "{rotativaAGenerar.nombre}"?
                {rotativaAGenerar.ultimaFechaGenerada && (
                  <span className="block mt-2 text-sm text-orange-600">
                    <strong>Advertencia:</strong> Esto eliminará los turnos existentes y generará nuevos desde la fecha de inicio original.
                  </span>
                )}
              </p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modoGeneracion === 'continuar' ? 'Meses adicionales a generar' : 'Número de meses'}
              </label>
              <select
                value={mesesAGenerar}
                onChange={(e) => setMesesAGenerar(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>1 mes (~30 días)</option>
                <option value={2}>2 meses (~60 días)</option>
                <option value={3}>3 meses (~90 días)</option>
                <option value={4}>4 meses (~120 días)</option>
                <option value={5}>5 meses (~150 días)</option>
                <option value={6}>6 meses (~180 días)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerarTurnos}
                className={`flex-1 text-white px-4 py-2 rounded-lg font-semibold transition-colors ${
                  modoGeneracion === 'continuar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {modoGeneracion === 'continuar' ? 'Continuar' : 'Generar'}
              </button>
              <button
                onClick={() => {
                  setRotativaAGenerar(null)
                  setMesesAGenerar(2)
                  setModoGeneracion('nueva')
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
