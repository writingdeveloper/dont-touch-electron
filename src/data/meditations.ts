import { Language } from '../i18n/translations'

export interface BreathingPattern {
  inhale: number   // seconds
  hold: number     // seconds
  exhale: number   // seconds
  cycles: number   // number of repetitions
}

export interface Meditation {
  id: string
  name: Record<Language, string>
  description: Record<Language, string>
  duration: number  // total seconds
  pattern: BreathingPattern
}

export const meditations: Meditation[] = [
  {
    id: 'quick-calm',
    name: {
      en: 'Quick Calm (1 min)',
      ko: '빠른 진정 (1분)',
      ja: 'クイックカーム (1分)',
      zh: '快速镇定 (1分钟)',
      es: 'Calma Rápida (1 min)',
      ru: 'Быстрое успокоение (1 мин)',
    },
    description: {
      en: 'Box breathing for quick stress relief',
      ko: '빠른 스트레스 해소를 위한 박스 호흡',
      ja: '素早いストレス解消のためのボックス呼吸',
      zh: '快速缓解压力的盒式呼吸',
      es: 'Respiración cuadrada para alivio rápido del estrés',
      ru: 'Квадратное дыхание для быстрого снятия стресса',
    },
    duration: 60,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      cycles: 5,
    },
  },
  {
    id: 'mindful-break',
    name: {
      en: 'Mindful Break (3 min)',
      ko: '마음챙김 휴식 (3분)',
      ja: 'マインドフル休憩 (3分)',
      zh: '正念休息 (3分钟)',
      es: 'Descanso Consciente (3 min)',
      ru: 'Осознанный перерыв (3 мин)',
    },
    description: {
      en: '4-7-8 breathing for deep relaxation',
      ko: '깊은 이완을 위한 4-7-8 호흡',
      ja: '深いリラクゼーションのための4-7-8呼吸',
      zh: '深度放松的4-7-8呼吸',
      es: 'Respiración 4-7-8 para relajación profunda',
      ru: 'Дыхание 4-7-8 для глубокого расслабления',
    },
    duration: 180,
    pattern: {
      inhale: 4,
      hold: 7,
      exhale: 8,
      cycles: 9,
    },
  },
  {
    id: 'deep-relaxation',
    name: {
      en: 'Deep Relaxation (5 min)',
      ko: '깊은 이완 (5분)',
      ja: 'ディープリラクゼーション (5分)',
      zh: '深度放松 (5分钟)',
      es: 'Relajación Profunda (5 min)',
      ru: 'Глубокое расслабление (5 мин)',
    },
    description: {
      en: 'Extended breathing for full body relaxation',
      ko: '전신 이완을 위한 확장 호흡',
      ja: '全身リラクゼーションのための拡張呼吸',
      zh: '全身放松的延长呼吸',
      es: 'Respiración extendida para relajación corporal completa',
      ru: 'Расширенное дыхание для полного расслабления тела',
    },
    duration: 300,
    pattern: {
      inhale: 5,
      hold: 5,
      exhale: 7,
      cycles: 18,
    },
  },
]

export function getMeditationById(id: string): Meditation | undefined {
  return meditations.find(m => m.id === id)
}

export function getDefaultMeditation(): Meditation {
  return meditations[1] // Mindful Break as default
}
