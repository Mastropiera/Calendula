import { Funcionario, Turno, RotativaCuartoTurno } from '@/types'

// Funciones para manejar el almacenamiento de funcionarios
export async function getFuncionarios(): Promise<Funcionario[]> {
  try {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('funcionarios')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.log('No hay funcionarios guardados aún')
    return []
  }
}

export async function saveFuncionarios(funcionarios: Funcionario[]): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios))
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
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('turnos')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.log('No hay turnos guardados aún')
    return []
  }
}

export async function saveTurnos(turnos: Turno[]): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem('turnos', JSON.stringify(turnos))
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

// Funciones para manejar el almacenamiento de rotativas de cuarto turno
export async function getRotativas(): Promise<RotativaCuartoTurno[]> {
  try {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('rotativas')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.log('No hay rotativas guardadas aún')
    return []
  }
}

export async function saveRotativas(rotativas: RotativaCuartoTurno[]): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem('rotativas', JSON.stringify(rotativas))
  } catch (error) {
    console.error('Error guardando rotativas:', error)
    throw error
  }
}

export async function addRotativa(rotativa: RotativaCuartoTurno): Promise<void> {
  const rotativas = await getRotativas()
  rotativas.push(rotativa)
  await saveRotativas(rotativas)
}

export async function updateRotativa(id: string, data: Partial<RotativaCuartoTurno>): Promise<void> {
  const rotativas = await getRotativas()
  const index = rotativas.findIndex(r => r.id === id)
  if (index !== -1) {
    rotativas[index] = { ...rotativas[index], ...data }
    await saveRotativas(rotativas)
  }
}

export async function deleteRotativa(id: string): Promise<void> {
  const rotativas = await getRotativas()
  const filtered = rotativas.filter(r => r.id !== id)
  await saveRotativas(filtered)
}