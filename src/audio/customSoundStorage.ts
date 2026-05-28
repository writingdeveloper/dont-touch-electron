import { IPC_CHANNELS } from '../constants/ipc-channels'
import { safeInvoke } from '../utils/ipc'

export interface CustomSoundEntry {
  id: string
  originalName: string
  ext: string
  sizeBytes: number
  addedAt: string
}

export async function listCustomSounds(): Promise<CustomSoundEntry[]> {
  const result = await safeInvoke<CustomSoundEntry[]>(IPC_CHANNELS.CUSTOM_SOUND_LIST)
  return result ?? []
}

export async function addCustomSound(file: File): Promise<CustomSoundEntry | null> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const entry = await safeInvoke<CustomSoundEntry>(IPC_CHANNELS.CUSTOM_SOUND_ADD, {
    filename: file.name,
    bytes,
  })
  return entry ?? null
}

export async function deleteCustomSound(id: string): Promise<boolean> {
  const ok = await safeInvoke<boolean>(IPC_CHANNELS.CUSTOM_SOUND_DELETE, id)
  return ok === true
}

export async function resolveCustomSoundUrl(id: string): Promise<string | null> {
  const url = await safeInvoke<string | null>(IPC_CHANNELS.CUSTOM_SOUND_RESOLVE_URL, id)
  return url ?? null
}
