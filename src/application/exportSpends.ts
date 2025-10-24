/**
 * Caso de uso: Export Spends
 * Exporta gastos a CSV
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'
import { centsToEur } from '@/domain/models'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ExportOptions {
  startDate: Date
  endDate: Date
  categories?: string[]
}

/**
 * Exporta gastos a CSV formato español
 * Separador: ; (punto y coma)
 * Codificación: UTF-8
 * Decimales: coma
 */
export async function exportSpendsToCSV(
  userId: string,
  repository: ISpendRepository,
  options: ExportOptions
): Promise<string> {
  // Validación
  if (options.startDate > options.endDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
  }

  // Obtener gastos
  const spends = await repository.list(
    userId,
    {
      startDate: options.startDate,
      endDate: options.endDate,
      categories: options.categories,
    },
    { limit: 10000, offset: 0 } // límite alto para exportación
  )

  // Cabecera CSV
  const headers = ['Fecha', 'Categoría', 'Importe (€)', 'Comercio', 'Nota', 'Pago']

  // Filas
  const rows = spends.map((spend) => {
    const fecha = format(spend.timestamp, 'dd/MM/yyyy', { locale: es })
    const categoria = spend.category
    const importe = centsToEur(spend.amountCents).toFixed(2).replace('.', ',')
    const comercio = spend.merchant || ''
    const nota = spend.note || ''
    const pago = spend.paidWith || ''

    return [fecha, categoria, importe, comercio, nota, pago]
  })

  // Construir CSV
  const csvLines = [
    headers.join(';'),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escapar comillas y punto y coma
          const escaped = String(cell).replace(/"/g, '""')
          return /[;"\n]/.test(escaped) ? `"${escaped}"` : escaped
        })
        .join(';')
    ),
  ]

  return csvLines.join('\n')
}

/**
 * Genera nombre de archivo para descarga
 */
export function generateExportFilename(startDate: Date, endDate: Date): string {
  const start = format(startDate, 'yyyy-MM-dd')
  const end = format(endDate, 'yyyy-MM-dd')
  return `gastos_${start}_${end}.csv`
}

