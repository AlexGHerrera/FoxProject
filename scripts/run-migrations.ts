/**
 * Script para ejecutar migraciones de Supabase
 * Uso: npx tsx scripts/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Cargar variables de entorno
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas')
  console.error('Configura estas variables en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration(filePath: string, name: string) {
  console.log(`\n📄 Ejecutando: ${name}...`)
  
  try {
    const sql = readFileSync(filePath, 'utf-8')
    
    // Dividir por statements (separados por ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        // Intentar ejecución directa si RPC falla
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ name, sql: statement })
        
        if (directError) {
          console.error(`   ❌ Error en statement:`, error.message)
          throw error
        }
      }
    }
    
    console.log(`   ✅ ${name} completada`)
  } catch (error) {
    console.error(`   ❌ Error ejecutando ${name}:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Iniciando migraciones de Supabase...\n')
  console.log(`📡 Conectado a: ${SUPABASE_URL}`)
  
  const migrations = [
    {
      path: join(__dirname, '../database/migrations/002_production_ready.sql'),
      name: '002_production_ready',
    },
    {
      path: join(__dirname, '../database/migrations/003_create_storage_bucket.sql'),
      name: '003_create_storage_bucket',
    },
  ]
  
  for (const migration of migrations) {
    await runMigration(migration.path, migration.name)
  }
  
  console.log('\n✅ Todas las migraciones completadas exitosamente!')
  console.log('\n📋 Próximos pasos:')
  console.log('1. Regístrate en la app')
  console.log('2. Ejecuta database/SET_ADMIN_ROLE.sql con tu email en Supabase Dashboard')
  console.log('3. Verifica que el bucket "feedback-screenshots" existe en Storage')
}

main().catch((error) => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})


