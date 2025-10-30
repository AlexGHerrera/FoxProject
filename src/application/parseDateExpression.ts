/**
 * Parser de fechas relativas en español
 * Convierte expresiones como "ayer", "el martes", "hace 3 días" a Date
 */

/**
 * Parsea una expresión de fecha relativa a Date
 * @param expression - Expresión en español: "ayer", "hoy", "hace 2 días", etc.
 * @returns Date o null si no se puede parsear
 */
export function parseDateExpression(expression: string | null | undefined): Date | null {
  if (!expression) return null

  const now = new Date()
  const normalized = expression.toLowerCase().trim()

  // Hoy
  if (/^hoy$/i.test(normalized)) {
    return now
  }

  // Ayer
  if (/^ayer$/i.test(normalized)) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }

  // Anteayer
  if (/^anteayer$/i.test(normalized)) {
    const dayBeforeYesterday = new Date(now)
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
    return dayBeforeYesterday
  }

  // "hace X días"
  const daysAgoMatch = normalized.match(/hace\s+(\d+)\s+d[ií]as?/)
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10)
    const date = new Date(now)
    date.setDate(date.getDate() - days)
    return date
  }

  // "hace X semanas"
  const weeksAgoMatch = normalized.match(/hace\s+(\d+)\s+semanas?/)
  if (weeksAgoMatch) {
    const weeks = parseInt(weeksAgoMatch[1], 10)
    const date = new Date(now)
    date.setDate(date.getDate() - weeks * 7)
    return date
  }

  // Días de la semana (busca el más reciente)
  const weekDays = [
    { names: ['lunes'], dayOfWeek: 1 },
    { names: ['martes'], dayOfWeek: 2 },
    { names: ['miércoles', 'miercoles'], dayOfWeek: 3 },
    { names: ['jueves'], dayOfWeek: 4 },
    { names: ['viernes'], dayOfWeek: 5 },
    { names: ['sábado', 'sabado'], dayOfWeek: 6 },
    { names: ['domingo'], dayOfWeek: 0 },
  ]

  for (const { names, dayOfWeek } of weekDays) {
    for (const name of names) {
      // "el martes", "martes pasado", "el martes pasado"
      const pattern = new RegExp(`(el\\s+)?${name}(\\s+pasado)?`, 'i')
      if (pattern.test(normalized)) {
        const currentDay = now.getDay()
        let daysBack = currentDay - dayOfWeek
        
        // Si es "pasado" o el día aún no ha llegado esta semana, retroceder una semana más
        if (normalized.includes('pasado') || daysBack <= 0) {
          daysBack += 7
        }
        
        const date = new Date(now)
        date.setDate(date.getDate() - daysBack)
        return date
      }
    }
  }

  // Intentar parsear fecha ISO o formato común
  try {
    const parsedDate = new Date(expression)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate
    }
  } catch (e) {
    // Ignorar errores de parseo
  }

  // No se pudo parsear
  return null
}

/**
 * Ejemplos de uso y tests inline
 */
export function testParseDateExpression() {
  const tests = [
    { input: 'hoy', expected: 0 },
    { input: 'ayer', expected: -1 },
    { input: 'anteayer', expected: -2 },
    { input: 'hace 3 días', expected: -3 },
    { input: 'hace 1 semana', expected: -7 },
    { input: 'hace 2 semanas', expected: -14 },
  ]

  console.log('[parseDateExpression] Running tests...')
  const now = new Date()
  
  for (const { input, expected } of tests) {
    const result = parseDateExpression(input)
    if (!result) {
      console.error(`❌ "${input}" -> null (expected ${expected} days ago)`)
      continue
    }

    const daysDiff = Math.round((now.getTime() - result.getTime()) / (1000 * 60 * 60 * 24))
    const passed = daysDiff === expected
    
    console.log(
      passed ? '✅' : '❌',
      `"${input}" -> ${daysDiff} days ago (expected ${expected})`
    )
  }
}

// Descomentar para ejecutar tests:
// testParseDateExpression()

