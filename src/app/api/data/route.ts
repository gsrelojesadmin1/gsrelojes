import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

const TABLE = 'site_config'
const ROW_ID = 'main'
const localPath = path.join(process.cwd(), 'src/data/site-data.json')

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Service role key bypasses RLS (recommended for server routes).
    // Falls back to anon key if not configured — requires RLS disabled on the table.
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from(TABLE)
      .select('data')
      .eq('id', ROW_ID)
      .maybeSingle()

    if (data?.data) {
      return NextResponse.json(data.data)
    }

    // No row yet — seed Supabase from the bundled local file (first deploy only)
    const localData = JSON.parse(readFileSync(localPath, 'utf-8'))
    await supabase.from(TABLE).upsert({ id: ROW_ID, data: localData })
    return NextResponse.json(localData)
  } catch (e) {
    console.error('GET /api/data:', e)
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getSupabase()
    const { error } = await supabase
      .from(TABLE)
      .upsert({ id: ROW_ID, data: body, updated_at: new Date().toISOString() })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PUT /api/data:', e)
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 })
  }
}
