// Tipos de estamento
export type Estamento = 'enfermera' | 'tens' | 'auxiliar'

// Tipos de turno
export type TipoTurno = 'largo' | 'noche' | 'libre' | 'personalizado'

// Secciones de la urgencia
export type Seccion = 
  | 'selector'
  | 'reanimador'
  | 'esi2'
  | 'vertical1'
  | 'vertical2'
  | 'horizontal'
  | 'boarding-oriente'
  | 'boarding-poniente'
  | 'procedimientos'
  | 'tmt'
  | 'central'
  | 'fast-track'
  | 'coordinacion'

// Estructura de un funcionario
export interface Funcionario {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  estamento: Estamento
}

// Estructura de un turno asignado
export interface Turno {
  id: string
  fecha: string // formato: YYYY-MM-DD
  tipoTurno: TipoTurno
  horaInicio: string // formato: HH:mm
  horaFin: string // formato: HH:mm
  funcionarioId: string
  seccion: Seccion
  personalizado?: boolean
}

// Estructura de cobertura diaria por sección
export interface CoberturaDiaria {
  fecha: string
  seccion: Seccion
  turnos: {
    largo: Turno[]
    noche: Turno[]
  }
  requerido: {
    enfermeras: number
    tens: number
    auxiliares: number
  }
  asignado: {
    enfermeras: number
    tens: number
    auxiliares: number
  }
}

// Vista de calendario
export type VistaCalendario = 'general' | 'por-seccion'

// Estado de cobertura
export type EstadoCobertura = 'completo' | 'parcial' | 'vacio'

// Rol de usuario
export type RolUsuario = 'coordinadora' | 'personal'

// Configuración de requerimientos por sección
export const REQUERIMIENTOS_SECCION: Record<Seccion, { enfermeras: number; tens: number; auxiliares: number }> = {
  'selector': { enfermeras: 2, tens: 0, auxiliares: 0 },
  'reanimador': { enfermeras: 2, tens: 1, auxiliares: 0 },
  'esi2': { enfermeras: 3, tens: 2, auxiliares: 1 },
  'vertical1': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'vertical2': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'horizontal': { enfermeras: 2, tens: 2, auxiliares: 2 },
  'boarding-oriente': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'boarding-poniente': { enfermeras: 1, tens: 1, auxiliares: 1 },
  'procedimientos': { enfermeras: 2, tens: 1, auxiliares: 0 },
  'tmt': { enfermeras: 1, tens: 1, auxiliares: 1 },
  'central': { enfermeras: 0, tens: 0, auxiliares: 1 },
  'fast-track': { enfermeras: 0, tens: 2, auxiliares: 0 },
  'coordinacion': { enfermeras: 1, tens: 0, auxiliares: 0 },
}

// Nombres legibles de secciones
export const NOMBRES_SECCION: Record<Seccion, string> = {
  'selector': 'Selector',
  'reanimador': 'Reanimador',
  'esi2': 'ESI 2',
  'vertical1': 'Vertical 1',
  'vertical2': 'Vertical 2 (Enlace)',
  'horizontal': 'Horizontal',
  'boarding-oriente': 'Boarding Oriente',
  'boarding-poniente': 'Boarding Poniente',
  'procedimientos': 'Procedimientos',
  'tmt': 'TMT',
  'central': 'Central',
  'fast-track': 'Fast Track',
  'coordinacion': 'Coordinación',
}