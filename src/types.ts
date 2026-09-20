export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest'

export type ReelStatus =
  | 'idea'
  | 'to_record'
  | 'recorded'
  | 'editing'
  | 'scheduled'
  | 'published'

export type Priority = 'low' | 'medium' | 'high'

export type View = 'dashboard' | 'pipeline' | 'calendar' | 'list'

export interface Reel {
  id: string
  title: string
  hook: string
  script: string
  shotList: string
  audio: string
  platforms: Platform[]
  status: ReelStatus
  priority: Priority
  recordDate: string | null
  publishDate: string | null
  durationSec: number
  caption: string
  hashtags: string
  location: string
  outfit: string
  props: string
  notes: string
  createdAt: string
  updatedAt: string
}

export function blankReel(partial: Partial<Reel> = {}): Reel {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: '',
    hook: '',
    script: '',
    shotList: '',
    audio: '',
    platforms: ['instagram'],
    status: 'idea',
    priority: 'medium',
    recordDate: null,
    publishDate: null,
    durationSec: 30,
    caption: '',
    hashtags: '',
    location: '',
    outfit: '',
    props: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
