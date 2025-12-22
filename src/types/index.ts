// Tipos de estamento
export type Estamento = 'enfermera' | 'tens' | 'auxiliar'

// Tipos de turno
export type TipoTurno = 'largo' | 'noche' | 'libre' | 'personalizado'

// Secciones de la urgencia
export type Seccion =
  | 'selector'
  | 'reanimador1'
  | 'reanimador2'
  | 'esi2'
  | 'vertical1'
  | 'vertical2'
  | 'horizontal'
  | 'boarding-oriente'
  | 'boarding-poniente'
  | 'procedimientos1'
  | 'procedimientos2'
  | 'trauma'
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

// Configuración de rotativa de cuarto turno
export interface RotativaCuartoTurno {
  id: string
  nombre: string // ej: "Rotativa Diciembre 2024"
  funcionarios: string[] // IDs de funcionarios en orden
  secuenciaRotacion: Seccion[] // Secciones en orden de rotación
  fechaInicio: string // formato: YYYY-MM-DD
  diasPorSeccion: number // típicamente 2 (largo + noche)
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
  color?: string // color en formato hex, ej: #FF5733
  notas?: string // notas adicionales del turno
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
export type VistaCalendario = 'general' | 'por-seccion' | 'por-funcionario'

// Estado de cobertura
export type EstadoCobertura = 'completo' | 'parcial' | 'vacio'

// Rol de usuario
export type RolUsuario = 'coordinadora' | 'personal'

// Configuración de requerimientos por sección
export const REQUERIMIENTOS_SECCION: Record<Seccion, { enfermeras: number; tens: number; auxiliares: number }> = {
  'selector': { enfermeras: 2, tens: 0, auxiliares: 0 },
  'reanimador1': { enfermeras: 1, tens: 0, auxiliares: 0 },
  'reanimador2': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'esi2': { enfermeras: 3, tens: 2, auxiliares: 1 },
  'vertical1': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'vertical2': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'horizontal': { enfermeras: 2, tens: 2, auxiliares: 2 },
  'boarding-oriente': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'boarding-poniente': { enfermeras: 1, tens: 1, auxiliares: 1 },
  'procedimientos1': { enfermeras: 1, tens: 0, auxiliares: 0 },
  'procedimientos2': { enfermeras: 1, tens: 1, auxiliares: 0 },
  'trauma': { enfermeras: 1, tens: 1, auxiliares: 1 },
  'central': { enfermeras: 0, tens: 0, auxiliares: 1 },
  'fast-track': { enfermeras: 0, tens: 2, auxiliares: 0 },
  'coordinacion': { enfermeras: 1, tens: 0, auxiliares: 0 },
}

// Nombres legibles de secciones
export const NOMBRES_SECCION: Record<Seccion, string> = {
  'selector': 'Selector',
  'reanimador1': 'Reanimador 1',
  'reanimador2': 'Reanimador 2',
  'esi2': 'ESI 2',
  'vertical1': 'Vertical 1',
  'vertical2': 'Vertical 2 (Enlace)',
  'horizontal': 'Horizontal',
  'boarding-oriente': 'Boarding Oriente',
  'boarding-poniente': 'Boarding Poniente',
  'procedimientos1': 'Procedimientos 1',
  'procedimientos2': 'Procedimientos 2',
  'trauma': 'Trauma',
  'central': 'Central',
  'fast-track': 'Fast Track',
  'coordinacion': 'Coordinación',
}

// Secuencia de rotación para cuarto turno (basada en la imagen proporcionada)
export const SECUENCIA_CUARTO_TURNO: Seccion[] = [
  'procedimientos2',  // PROCE 2
  'reanimador1',      // REA 1
  'esi2',             // ESI 2
  'selector',         // SELECTOR
  'horizontal',       // HORIZONTAL
  'procedimientos2',  // PROCE 2 (repite)
  'esi2',             // ESI 2
  'boarding-oriente', // BOARDING O
  'horizontal',       // HORIZONTAL
  'vertical1',        // VERTICAL 1
  'esi2',             // ESI 2
  'vertical2',        // VERTICAL 2 (ENLACE)
  'selector',         // SELECTOR
  'trauma',           // TRAUMA
  'reanimador2',      // REA 2
  'boarding-poniente' // BOARDING P
]