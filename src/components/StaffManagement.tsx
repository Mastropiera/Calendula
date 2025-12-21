'use client'

import { useState } from 'react'
import { X, Plus, Phone, Mail, Trash2, Edit2 } from 'lucide-react'
import type { Funcionario, Estamento } from '@/types'
import { saveFuncionarios } from '@/lib/storage'

interface StaffManagementProps {
  funcionarios: Funcionario[]
  onFuncionariosChange: (funcionarios: Funcionario[]) => void
  onClose: () => void
}

export default function StaffManagement({
  funcionarios,
  onFuncionariosChange,
  onClose
}: StaffManagementProps) {
  const [activeTab, setActiveTab] = useState<Estamento>('enfermera')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  })

  const funcionariosFiltrados = funcionarios.filter(f => f.estamento === activeTab)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.apellido || !formData.email) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    if (editingId) {
      // Editar
      const updatedFuncionarios = funcionarios.map(f =>
        f.id === editingId ? { ...f, ...formData } : f
      )
      await saveFuncionarios(updatedFuncionarios)
      onFuncionariosChange(updatedFuncionarios)
      setEditingId(null)
    } else {
      // Agregar
      const nuevoFuncionario: Funcionario = {
        id: `func-${Date.now()}-${Math.random()}`,
        ...formData,
        estamento: activeTab
      }
      const updatedFuncionarios = [...funcionarios, nuevoFuncionario]
      await saveFuncionarios(updatedFuncionarios)
      onFuncionariosChange(updatedFuncionarios)
    }

    setFormData({ nombre: '', apellido: '', telefono: '', email: '' })
    setIsAdding(false)
  }

  const handleEdit = (funcionario: Funcionario) => {
    setFormData({
      nombre: funcionario.nombre,
      apellido: funcionario.apellido,
      telefono: funcionario.telefono,
      email: funcionario.email
    })
    setEditingId(funcionario.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este funcionario?')) return
    
    const updatedFuncionarios = funcionarios.filter(f => f.id !== id)
    await saveFuncionarios(updatedFuncionarios)
    onFuncionariosChange(updatedFuncionarios)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ nombre: '', apellido: '', telefono: '', email: '' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Gestionar Personal</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('enfermera')}
            className={`px-4 py-2 font-semibold transition-all border-b-2 ${
              activeTab === 'enfermera'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Enfermeras ({funcionarios.filter(f => f.estamento === 'enfermera').length})
          </button>
          <button
            onClick={() => setActiveTab('tens')}
            className={`px-4 py-2 font-semibold transition-all border-b-2 ${
              activeTab === 'tens'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            TENS ({funcionarios.filter(f => f.estamento === 'tens').length})
          </button>
          <button
            onClick={() => setActiveTab('auxiliar')}
            className={`px-4 py-2 font-semibold transition-all border-b-2 ${
              activeTab === 'auxiliar'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Auxiliares ({funcionarios.filter(f => f.estamento === 'auxiliar').length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Botón agregar */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar {activeTab === 'enfermera' ? 'Enfermera' : activeTab === 'tens' ? 'TENS' : 'Auxiliar'}
            </button>
          )}

          {/* Formulario */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">
                {editingId ? 'Editar' : 'Agregar'} Funcionario
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+56 9 XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {editingId ? 'Guardar Cambios' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Tabla de funcionarios */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Apellido</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {funcionariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay funcionarios registrados en esta categoría
                    </td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map(func => (
                    <tr key={func.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{func.nombre}</td>
                      <td className="px-4 py-3 text-sm">{func.apellido}</td>
                      <td className="px-4 py-3 text-sm">
                        {func.telefono ? (
                          <a
                            href={`https://wa.me/${func.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <Phone className="w-4 h-4" />
                            {func.telefono}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <a
                          href={`mailto:${func.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-4 h-4" />
                          {func.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(func)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(func.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}