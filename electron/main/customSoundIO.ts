import { app, ipcMain, protocol } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export interface CustomSoundEntry {
  id: string
  originalName: string
  ext: string
  sizeBytes: number
  addedAt: string
}

const ALLOWED_EXTS = new Set(['.mp3', '.wav', '.ogg'])
const MAX_BYTES = 5 * 1024 * 1024

function customSoundsDir(): string {
  return path.join(app.getPath('userData'), 'custom-sounds')
}

function indexPath(): string {
  return path.join(customSoundsDir(), 'index.json')
}

function readIndex(): CustomSoundEntry[] {
  try {
    const txt = fs.readFileSync(indexPath(), 'utf-8')
    const parsed = JSON.parse(txt)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // missing or invalid → treat as empty
  }
  return []
}

function writeIndex(entries: CustomSoundEntry[]): void {
  fs.mkdirSync(customSoundsDir(), { recursive: true })
  fs.writeFileSync(indexPath(), JSON.stringify(entries, null, 2))
}

function sanitizeExt(ext: string): string | null {
  const lower = ext.toLowerCase()
  return ALLOWED_EXTS.has(lower) ? lower : null
}

function fileForId(id: string, ext: string): string {
  return path.join(customSoundsDir(), `${id}${ext}`)
}

// Must be called BEFORE app.whenReady() resolves
export function registerCustomSoundScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'custom-sound',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
      },
    },
  ])
}

// Must be called AFTER app.whenReady()
export function registerCustomSoundIO(): void {
  fs.mkdirSync(customSoundsDir(), { recursive: true })

  protocol.handle('custom-sound', async (request) => {
    const url = new URL(request.url)
    const id = `custom-${url.hostname}`
    const entries = readIndex()
    const entry = entries.find(e => e.id === id)
    if (!entry) return new Response('Not Found', { status: 404 })
    const filePath = fileForId(entry.id, entry.ext)
    if (!fs.existsSync(filePath)) return new Response('Not Found', { status: 404 })
    const data = fs.readFileSync(filePath)
    const mime = entry.ext === '.mp3' ? 'audio/mpeg' : entry.ext === '.ogg' ? 'audio/ogg' : 'audio/wav'
    return new Response(new Uint8Array(data), { headers: { 'Content-Type': mime } })
  })

  ipcMain.handle('custom-sound:list', () => readIndex())

  ipcMain.handle('custom-sound:add', (_, payload: { filename: string; bytes: ArrayBuffer | Uint8Array }) => {
    const ext = sanitizeExt(path.extname(payload.filename ?? ''))
    if (!ext) throw new Error('Unsupported file type — use .mp3, .wav or .ogg')
    const buf = Buffer.from(payload.bytes as Uint8Array)
    if (buf.byteLength > MAX_BYTES) throw new Error(`File too large (max ${MAX_BYTES} bytes)`)
    if (buf.byteLength === 0) throw new Error('Empty file')

    const uuid = crypto.randomUUID()
    const id = `custom-${uuid}`
    fs.mkdirSync(customSoundsDir(), { recursive: true })
    fs.writeFileSync(fileForId(id, ext), buf)

    const entry: CustomSoundEntry = {
      id,
      originalName: path.basename(payload.filename).slice(0, 120),
      ext,
      sizeBytes: buf.byteLength,
      addedAt: new Date().toISOString(),
    }
    const entries = readIndex()
    entries.push(entry)
    writeIndex(entries)
    return entry
  })

  ipcMain.handle('custom-sound:delete', (_, id: string) => {
    const entries = readIndex()
    const idx = entries.findIndex(e => e.id === id)
    if (idx < 0) return false
    const [removed] = entries.splice(idx, 1)
    try {
      fs.unlinkSync(fileForId(removed.id, removed.ext))
    } catch {
      // ignore — file may be gone already
    }
    writeIndex(entries)
    return true
  })

  ipcMain.handle('custom-sound:resolve-url', (_, id: string) => {
    const entries = readIndex()
    const entry = entries.find(e => e.id === id)
    if (!entry) return null
    const host = id.replace(/^custom-/, '')
    return `custom-sound://${host}`
  })
}
