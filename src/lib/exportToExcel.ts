import * as XLSX from 'xlsx'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Turno, Funcionario, Seccion } from '@/types'
import { NOMBRES_SECCION } from '@/types'

interface ExportOptions {
  turnos: Turno[]
  funcionarios: Funcionario[]
  mesInicio: Date
  mesFin?: Date
}

export function exportTurnosToExcel({ turnos, funcionarios, mesInicio, mesFin }: ExportOptions) {
  const wb = XLSX.utils.book_new()

  // Si no hay mesFin, usar solo el mes de inicio
  const inicio = startOfMonth(mesInicio)
  const fin = mesFin ? endOfMonth(mesFin) : endOfMonth(mesInicio)

  // Hoja 1: Vista General por Fecha
  const hojaGeneral = generarHojaGeneral(turnos, funcionarios, inicio, fin)
  XLSX.utils.book_append_sheet(wb, hojaGeneral, 'Vista General')

  // Hoja 2: Vista por Funcionario
  const hojaFuncionarios = generarHojaPorFuncionario(turnos, funcionarios, inicio, fin)
  XLSX.utils.book_append_sheet(wb, hojaFuncionarios, 'Por Funcionario')

  // Hoja 3: Vista por Sección
  const hojaSeccion = generarHojaPorSeccion(turnos, funcionarios, inicio, fin)
  XLSX.utils.book_append_sheet(wb, hojaSeccion, 'Por Sección')

  // Generar y descargar el archivo
  const nombreArchivo = `Turnos_${format(inicio, 'yyyy-MM', { locale: es })}.xlsx`
  XLSX.writeFile(wb, nombreArchivo)
}

function generarHojaGeneral(
  turnos: Turno[],
  funcionarios: Funcionario[],
  inicio: Date,
  fin: Date
): XLSX.WorkSheet {
  const dias = eachDayOfInterval({ start: inicio, end: fin })

  const data: any[][] = [
    ['Fecha', 'Día', 'Funcionario', 'Estamento', 'Sección', 'Tipo Turno', 'Hora Inicio', 'Hora Fin', 'Notas']
  ]

  dias.forEach(dia => {
    const fechaStr = format(dia, 'yyyy-MM-dd')
    const turnosDelDia = turnos
      .filter(t => t.fecha === fechaStr)
      .sort((a, b) => {
        // Ordenar por tipo de turno (largo primero) y luego por sección
        if (a.tipoTurno !== b.tipoTurno) {
          return a.tipoTurno === 'largo' ? -1 : 1
        }
        return a.seccion.localeCompare(b.seccion)
      })

    if (turnosDelDia.length === 0) {
      // Agregar fila vacía para días sin turnos
      data.push([
        format(dia, 'dd/MM/yyyy'),
        format(dia, 'EEEE', { locale: es }),
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ])
    } else {
      turnosDelDia.forEach(turno => {
        const funcionario = funcionarios.find(f => f.id === turno.funcionarioId)
        data.push([
          format(dia, 'dd/MM/yyyy'),
          format(dia, 'EEEE', { locale: es }),
          funcionario ? `${funcionario.nombre} ${funcionario.apellido}` : 'Desconocido',
          funcionario?.estamento || '',
          NOMBRES_SECCION[turno.seccion],
          turno.tipoTurno === 'largo' ? 'Largo' : 'Noche',
          turno.horaInicio,
          turno.horaFin,
          turno.notas || ''
        ])
      })
    }
  })

  const ws = XLSX.utils.aoa_to_sheet(data)

  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 12 }, // Día
    { wch: 25 }, // Funcionario
    { wch: 12 }, // Estamento
    { wch: 20 }, // Sección
    { wch: 12 }, // Tipo Turno
    { wch: 12 }, // Hora Inicio
    { wch: 12 }, // Hora Fin
    { wch: 40 }  // Notas
  ]

  return ws
}

function generarHojaPorFuncionario(
  turnos: Turno[],
  funcionarios: Funcionario[],
  inicio: Date,
  fin: Date
): XLSX.WorkSheet {
  const data: any[][] = [
    ['Funcionario', 'Estamento', 'Fecha', 'Día', 'Sección', 'Tipo Turno', 'Hora Inicio', 'Hora Fin', 'Notas']
  ]

  // Ordenar funcionarios por estamento y luego por apellido
  const funcionariosOrdenados = [...funcionarios].sort((a, b) => {
    if (a.estamento !== b.estamento) {
      const orden = { enfermera: 1, tens: 2, auxiliar: 3 }
      return orden[a.estamento] - orden[b.estamento]
    }
    return a.apellido.localeCompare(b.apellido)
  })

  funcionariosOrdenados.forEach(funcionario => {
    const turnosFuncionario = turnos
      .filter(t => {
        const fecha = parseISO(t.fecha)
        return t.funcionarioId === funcionario.id && fecha >= inicio && fecha <= fin
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    if (turnosFuncionario.length > 0) {
      turnosFuncionario.forEach((turno, index) => {
        const fecha = parseISO(turno.fecha)
        data.push([
          index === 0 ? `${funcionario.nombre} ${funcionario.apellido}` : '',
          index === 0 ? funcionario.estamento : '',
          format(fecha, 'dd/MM/yyyy'),
          format(fecha, 'EEEE', { locale: es }),
          NOMBRES_SECCION[turno.seccion],
          turno.tipoTurno === 'largo' ? 'Largo' : 'Noche',
          turno.horaInicio,
          turno.horaFin,
          turno.notas || ''
        ])
      })
    }
  })

  const ws = XLSX.utils.aoa_to_sheet(data)

  ws['!cols'] = [
    { wch: 25 }, // Funcionario
    { wch: 12 }, // Estamento
    { wch: 12 }, // Fecha
    { wch: 12 }, // Día
    { wch: 20 }, // Sección
    { wch: 12 }, // Tipo Turno
    { wch: 12 }, // Hora Inicio
    { wch: 12 }, // Hora Fin
    { wch: 40 }  // Notas
  ]

  return ws
}

function generarHojaPorSeccion(
  turnos: Turno[],
  funcionarios: Funcionario[],
  inicio: Date,
  fin: Date
): XLSX.WorkSheet {
  const data: any[][] = [
    ['Sección', 'Fecha', 'Día', 'Tipo Turno', 'Funcionario', 'Estamento', 'Hora Inicio', 'Hora Fin', 'Notas']
  ]

  const secciones = Object.keys(NOMBRES_SECCION) as Seccion[]

  secciones.forEach(seccion => {
    const turnosSeccion = turnos
      .filter(t => {
        const fecha = parseISO(t.fecha)
        return t.seccion === seccion && fecha >= inicio && fecha <= fin
      })
      .sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha)
        }
        return a.tipoTurno === 'largo' ? -1 : 1
      })

    if (turnosSeccion.length > 0) {
      turnosSeccion.forEach((turno, index) => {
        const fecha = parseISO(turno.fecha)
        const funcionario = funcionarios.find(f => f.id === turno.funcionarioId)

        data.push([
          index === 0 ? NOMBRES_SECCION[seccion] : '',
          format(fecha, 'dd/MM/yyyy'),
          format(fecha, 'EEEE', { locale: es }),
          turno.tipoTurno === 'largo' ? 'Largo' : 'Noche',
          funcionario ? `${funcionario.nombre} ${funcionario.apellido}` : 'Desconocido',
          funcionario?.estamento || '',
          turno.horaInicio,
          turno.horaFin,
          turno.notas || ''
        ])
      })
    }
  })

  const ws = XLSX.utils.aoa_to_sheet(data)

  ws['!cols'] = [
    { wch: 20 }, // Sección
    { wch: 12 }, // Fecha
    { wch: 12 }, // Día
    { wch: 12 }, // Tipo Turno
    { wch: 25 }, // Funcionario
    { wch: 12 }, // Estamento
    { wch: 12 }, // Hora Inicio
    { wch: 12 }, // Hora Fin
    { wch: 40 }  // Notas
  ]

  return ws
}
