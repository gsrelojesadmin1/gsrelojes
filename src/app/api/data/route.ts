import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const TABLE = 'site_config'
const ROW_ID = 'main'
const localPath = path.join(process.cwd(), 'src/data/site-data.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseReady = !!SUPABASE_URL && !!SUPABASE_KEY

function getSupabase() {
  return createClient(SUPABASE_URL!, SUPABASE_KEY!)
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  // 1. Try Supabase (production)
  if (supabaseReady) {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from(TABLE)
        .select('data')
        .eq('id', ROW_ID)
        .maybeSingle()

      if (!error && data?.data) {
        return NextResponse.json(data.data)
      }

      // Row not found — auto-seed from bundled local file
      const seed = JSON.parse(readFileSync(localPath, 'utf-8'))
      await supabase.from(TABLE).upsert({ id: ROW_ID, data: seed })
      return NextResponse.json(seed)
    } catch (e) {
      console.error('[api/data GET] Supabase error, falling back to local file:', e)
    }
  }

  // 2. Fallback: bundled local file (always works on Vercel for reads)
  try {
    return NextResponse.json(JSON.parse(readFileSync(localPath, 'utf-8')))
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
  }
}

// ── PUT ──────────────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 1. Supabase (required in production — add env vars to Vercel project settings)
  if (supabaseReady) {
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from(TABLE)
        .upsert({ id: ROW_ID, data: body, updated_at: new Date().toISOString() })

      if (error) {
        // Table doesn't exist yet
        if (error.code === '42P01') {
          console.error('[api/data PUT] Table not found. Run the setup SQL in Supabase.')
          return NextResponse.json(
            { error: 'Tabla site_config no existe. Ejecutá el SQL de configuración en Supabase.' },
            { status: 500 }
          )
        }
        throw new Error(error.message)
      }

      return NextResponse.json({ success: true })
    } catch (e) {
      console.error('[api/data PUT] Supabase error:', e)
      return NextResponse.json({ error: 'Error al guardar en Supabase.' }, { status: 500 })
    }
  }

  // 2. Local filesystem (development only — fails on Vercel)
  try {
    writeFileSync(localPath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      {
        error:
          'El servidor no puede guardar datos. ' +
          'Agregá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno de Vercel.',
      },
      { status: 500 }
    )
  }
}
