import { Funcionario, Turno } from '@/types'

// Funciones para manejar el almacenamiento de funcionarios
export async function getFuncionarios(): Promise<Funcionario[]> {
  try {
    const result = await window.storage.get('funcionarios')
    return result ? JSON.parse(result.value) : []
  } catch (error) {
    console.log('No hay funcionarios guardados aún')
    return []
  }
}

export async function saveFuncionarios(funcionarios: Funcionario[]): Promise<void> {
  try {
    await window.storage.set('funcionarios', JSON.stringify(funcionarios))
  } catch (error) {
    console.error('Error guardando funcionarios:', error)
    throw error
  }
}

export async function addFuncionario(funcionario: Funcionario): Promise<void> {
  const funcionarios = await getFuncionarios()
  funcionarios.push(funcionario)
  await saveFuncionarios(funcionarios)
}

export async function updateFuncionario(id: string, data: Partial<Funcionario>): Promise<void> {
  const funcionarios = await getFuncionarios()
  const index = funcionarios.findIndex(f => f.id === id)
  if (index !== -1) {
    funcionarios[index] = { ...funcionarios[index], ...data }
    await saveFuncionarios(funcionarios)
  }
}

export async function deleteFuncionario(id: string): Promise<void> {
  const funcionarios = await getFuncionarios()
  const filtered = funcionarios.filter(f => f.id !== id)
  await saveFuncionarios(filtered)
}

// Funciones para manejar el almacenamiento de turnos
export async function getTurnos(): Promise<Turno[]> {
  try {
    const result = await window.storage.get('turnos')
    return result ? JSON.parse(result.value) : []
  } catch (error) {
    console.log('No hay turnos guardados aún')
    return []
  }
}

export async function saveTurnos(turnos: Turno[]): Promise<void> {
  try {
    await window.storage.set('turnos', JSON.stringify(turnos))
  } catch (error) {
    console.error('Error guardando turnos:', error)
    throw error
  }
}

export async function addTurno(turno: Turno): Promise<void> {
  const turnos = await getTurnos()
  turnos.push(turno)
  await saveTurnos(turnos)
}

export async function updateTurno(id: string, data: Partial<Turno>): Promise<void> {
  const turnos = await getTurnos()
  const index = turnos.findIndex(t => t.id === id)
  if (index !== -1) {
    turnos[index] = { ...turnos[index], ...data }
    await saveTurnos(turnos)
  }
}

export async function deleteTurno(id: string): Promise<void> {
  const turnos = await getTurnos()
  const filtered = turnos.filter(t => t.id !== id)
  await saveTurnos(filtered)
}

export async function getTurnosByFecha(fecha: string): Promise<Turno[]> {
  const turnos = await getTurnos()
  return turnos.filter(t => t.fecha === fecha)
}

export async function getTurnosByFuncionario(funcionarioId: string): Promise<Turno[]> {
  const turnos = await getTurnos()
  return turnos.filter(t => t.funcionarioId === funcionarioId)
}