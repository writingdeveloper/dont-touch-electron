export function clampFloat(value: string, min: number, max: number, fallback: number): number {
  const parsed = parseFloat(value)
  if (isNaN(parsed) || !isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

export function clampInt(value: string, min: number, max: number, fallback: number): number {
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || !isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}
