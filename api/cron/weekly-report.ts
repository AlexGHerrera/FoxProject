/**
 * Weekly Report Cron Job
 * Se ejecuta todos los lunes a las 9:00 AM
 * Genera y envía reporte semanal por email
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar autorización
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calcular fechas de la semana pasada
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Obtener métricas
    const { count: newUsers } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())

    const { count: totalSpends } = await supabase
      .from('spends')
      .select('*', { count: 'exact', head: true })
      .gte('ts', weekAgo.toISOString())

    // Uso de IA
    const { data: aiUsage } = await supabase
      .from('api_usage')
      .select('tokens_input, tokens_output, latency_ms, success')
      .gte('created_at', weekAgo.toISOString())

    let totalCalls = 0
    let totalTokens = 0
    let totalLatency = 0
    let successCount = 0

    if (aiUsage) {
      totalCalls = aiUsage.length
      aiUsage.forEach((usage) => {
        if (usage.tokens_input) totalTokens += usage.tokens_input
        if (usage.tokens_output) totalTokens += usage.tokens_output
        if (usage.latency_ms) totalLatency += usage.latency_ms
        if (usage.success) successCount++
      })
    }

    const avgLatency = totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0
    const successRate = totalCalls > 0 ? Math.round((successCount / totalCalls) * 100) : 0

    // Errores críticos
    const { data: errors } = await supabase
      .from('api_usage')
      .select('error_message, created_at')
      .eq('success', false)
      .gte('created_at', weekAgo.toISOString())
      .limit(10)

    // Feedback recibido
    const { data: feedback } = await supabase
      .from('feedback')
      .select('type, message, created_at')
      .gte('created_at', weekAgo.toISOString())

    // Generar reporte HTML
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte Semanal - Foxy</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1>📊 Reporte Semanal - Foxy</h1>
          <p>Período: ${weekAgo.toLocaleDateString('es-ES')} - ${now.toLocaleDateString('es-ES')}</p>
          
          <h2>👥 Usuarios</h2>
          <ul>
            <li>Nuevos usuarios esta semana: <strong>${newUsers || 0}</strong></li>
          </ul>

          <h2>💰 Gastos</h2>
          <ul>
            <li>Total de gastos registrados: <strong>${totalSpends || 0}</strong></li>
          </ul>

          <h2>🤖 Uso de IA</h2>
          <ul>
            <li>Total de llamadas: <strong>${totalCalls}</strong></li>
            <li>Total de tokens: <strong>${totalTokens.toLocaleString()}</strong></li>
            <li>Latencia promedio: <strong>${avgLatency}ms</strong></li>
            <li>Tasa de éxito: <strong>${successRate}%</strong></li>
          </ul>

          ${errors && errors.length > 0 ? `
          <h2>⚠️ Errores Críticos</h2>
          <ul>
            ${errors.map(e => `<li>${e.error_message || 'Sin mensaje'} - ${new Date(e.created_at).toLocaleString('es-ES')}</li>`).join('')}
          </ul>
          ` : '<p>✅ No hubo errores críticos esta semana</p>'}

          <h2>💬 Feedback Recibido</h2>
          ${feedback && feedback.length > 0 ? `
          <ul>
            ${feedback.map(f => `
              <li>
                <strong>${f.type === 'bug' ? '🐛 Bug' : f.type === 'suggestion' ? '💡 Sugerencia' : '❓ Pregunta'}</strong><br>
                ${f.message}<br>
                <small>${new Date(f.created_at).toLocaleString('es-ES')}</small>
              </li>
            `).join('')}
          </ul>
          ` : '<p>No se recibió feedback esta semana</p>'}

          <hr>
          <p style="color: #666; font-size: 0.9em;">
            Este es un reporte automático generado por Foxy.
          </p>
        </body>
      </html>
    `

    // Enviar email usando Resend (recomendado) o Supabase Auth SMTP
    // Por ahora, solo logueamos el reporte. Para enviar email real, usar Resend API:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Foxy <noreply@foxy.app>',
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `Reporte Semanal - ${now.toLocaleDateString('es-ES')}`,
    //   html: reportHtml,
    // })

    console.log('Weekly Report Generated:', {
      newUsers,
      totalSpends,
      aiUsage: { totalCalls, totalTokens, avgLatency, successRate },
      errors: errors?.length || 0,
      feedback: feedback?.length || 0,
    })

    return res.status(200).json({
      success: true,
      message: 'Report generated',
      data: {
        newUsers,
        totalSpends,
        aiUsage: { totalCalls, totalTokens, avgLatency, successRate },
        errors: errors?.length || 0,
        feedback: feedback?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return res.status(500).json({
      error: 'Failed to generate report',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

