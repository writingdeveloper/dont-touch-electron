import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'sounds')

const SAMPLE_RATE = 44100

function encodeWav(samples) {
  const numSamples = samples.length
  const buffer = Buffer.alloc(44 + numSamples * 2)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + numSamples * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(numSamples * 2, 40)
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }
  return buffer
}

function envelope(t, duration, attack = 0.01, release = 0.1) {
  if (t < attack) return t / attack
  if (t > duration - release) return Math.max(0, (duration - t) / release)
  return 1
}

function makeSoft() {
  const duration = 0.6
  const samples = []
  const n = Math.floor(SAMPLE_RATE * duration)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE
    const env = envelope(t, duration, 0.02, 0.3)
    const tone = 0.3 * Math.sin(2 * Math.PI * 660 * t) + 0.15 * Math.sin(2 * Math.PI * 880 * t)
    samples.push(tone * env)
  }
  return encodeWav(samples)
}

function makeChime() {
  const duration = 0.8
  const samples = []
  const n = Math.floor(SAMPLE_RATE * duration)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE
    const env = envelope(t, duration, 0.005, 0.5) * Math.exp(-2 * t)
    const tone =
      0.4 * Math.sin(2 * Math.PI * 1046 * t) +
      0.25 * Math.sin(2 * Math.PI * 1568 * t) +
      0.1 * Math.sin(2 * Math.PI * 2093 * t)
    samples.push(tone * env)
  }
  return encodeWav(samples)
}

function makeBuzzer() {
  const duration = 0.9
  const samples = []
  const n = Math.floor(SAMPLE_RATE * duration)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE
    const env = envelope(t, duration, 0.01, 0.05)
    const vibrato = 1 + 0.04 * Math.sin(2 * Math.PI * 6 * t)
    const base = Math.sign(Math.sin(2 * Math.PI * 440 * vibrato * t))
    const harmonic = 0.3 * Math.sign(Math.sin(2 * Math.PI * 660 * vibrato * t))
    samples.push(0.4 * (base + harmonic) * env)
  }
  return encodeWav(samples)
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(path.join(OUT_DIR, 'tone-soft.wav'), makeSoft())
writeFileSync(path.join(OUT_DIR, 'tone-chime.wav'), makeChime())
writeFileSync(path.join(OUT_DIR, 'tone-buzzer.wav'), makeBuzzer())
console.log('Generated tones in', OUT_DIR)
