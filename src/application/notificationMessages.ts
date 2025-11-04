/**
 * Application: Notification Messages
 * Generador de mensajes amigables y variados para notificaciones
 */

type MessageVariant = { title: string; body: string }

const REMINDER_MESSAGES: MessageVariant[] = [
  { title: '¿Todo controlado por ahí? 🦊', body: 'Si has tenido algún gasto, apúntalo para no olvidarlo' },
  { title: 'Foxy por aquí 👋', body: '¿Has comprado algo hoy? Vamos a registrarlo juntos' },
  { title: '¡Foxy al habla! 🦊', body: '¿Qué tal el día? Si has gastado algo, cuéntamelo' },
  { title: 'Hey, ¿todo bien? 👋', body: 'Solo paso a recordarte que puedes registrar tus gastos' },
  { title: '¿Cómo va todo? 🦊', body: 'Recuerda apuntar tus gastos del día' },
]

const BUDGET_70_MESSAGES: MessageVariant[] = [
  { title: '¡Vas por el 70% del presupuesto! 📊', body: 'Nada mal, sigamos así' },
  { title: 'Hey, 70% del presupuesto usado 💰', body: 'Vas bien, pero ojo con lo que queda de mes' },
  { title: '70% de tu presupuesto gastado 📈', body: 'Todavía queda margen, ¡sigamos controlándolo!' },
]

const BUDGET_90_MESSAGES: MessageVariant[] = [
  { title: '⚠️ 90% del presupuesto alcanzado', body: 'Queda poco margen para el resto del mes' },
  { title: '¡Alerta! Ya llevas el 90% 📊', body: 'Intenta controlar los gastos hasta fin de mes' },
  { title: '90% del límite mensual 💸', body: 'Cuidado con los últimos días del mes' },
]

const SUMMARY_GOOD: MessageVariant[] = [
  { title: '¡Semana impecable! 🎉', body: 'Gastos controlados. Sigue así' },
  { title: '¡Genial! 💪', body: 'Esta semana has mantenido tus gastos bajo control' },
]

const SUMMARY_WARNING: MessageVariant[] = [
  { title: 'Resumen semanal 📊', body: 'Has gastado más de lo planeado. Ajustemos la próxima' },
  { title: 'Ojo con los gastos 👀', body: 'Esta semana te has pasado un poco. Vamos a mejorar' },
]

function getRandomMessage(messages: MessageVariant[]): MessageVariant {
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getReminderMessage(): MessageVariant {
  return getRandomMessage(REMINDER_MESSAGES)
}

export function getBudget70Message(): MessageVariant {
  return getRandomMessage(BUDGET_70_MESSAGES)
}

export function getBudget90Message(): MessageVariant {
  return getRandomMessage(BUDGET_90_MESSAGES)
}

export function getSummaryMessage(
  isGood: boolean,
  totalSpent: number,
  topCategories: Array<{ category: string; amount: number }>
): MessageVariant {
  const base = getRandomMessage(isGood ? SUMMARY_GOOD : SUMMARY_WARNING)
  const categoriesText = topCategories
    .map((cat, idx) => `${idx + 1}. ${cat.category}: ${(cat.amount / 100).toFixed(0)}€`)
    .join(', ')

  return {
    title: base.title,
    body: `${base.body}\n\nTotal: ${(totalSpent / 100).toFixed(0)}€\nTop 3: ${categoriesText}`,
  }
}

