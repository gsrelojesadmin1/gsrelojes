import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic']

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET

async function uploadToCloudinary(buffer: Buffer, mimeType: string): Promise<string> {
  const { v2: cloudinary } = await import('cloudinary')

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'gs-relojes',
        format: 'avif',
        quality: 'auto:best',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('No result'))
        else resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

async function uploadToLocal(buffer: Buffer, originalName: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  mkdirSync(uploadsDir, { recursive: true })
  const ext = path.extname(originalName) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  writeFileSync(path.join(uploadsDir, filename), buffer)
  return `/uploads/${filename}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (cloudinaryConfigured) {
      const url = await uploadToCloudinary(buffer, file.type)
      return NextResponse.json({ url, storage: 'cloudinary' })
    } else {
      const url = await uploadToLocal(buffer, file.name)
      return NextResponse.json({
        url,
        storage: 'local',
        warning: 'Cloudinary no configurado. Configura .env.local para subir a la nube.',
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}
