import type { Platform, Priority, ReelStatus } from './types'

export const STATUS_ORDER: ReelStatus[] = [
  'idea',
  'to_record',
  'recorded',
  'editing',
  'scheduled',
  'published',
]

export const STATUS_META: Record<
  ReelStatus,
  { label: string; hint: string; tone: string; dot: string }
> = {
  idea: {
    label: 'Idea',
    hint: 'Da sviluppare',
    tone: 'bg-lilac/15 text-lilac border-lilac/25',
    dot: 'bg-lilac',
  },
  to_record: {
    label: 'Da registrare',
    hint: 'In call sheet',
    tone: 'bg-ember/15 text-ember-2 border-ember/30',
    dot: 'bg-ember',
  },
  recorded: {
    label: 'Registrato',
    hint: 'In cartella riprese',
    tone: 'bg-sage/15 text-sage border-sage/30',
    dot: 'bg-sage',
  },
  editing: {
    label: 'In editing',
    hint: 'Montaggio',
    tone: 'bg-gold/15 text-gold border-gold/30',
    dot: 'bg-gold',
  },
  scheduled: {
    label: 'Programmato',
    hint: 'In coda social',
    tone: 'bg-sky/15 text-sky border-sky/30',
    dot: 'bg-sky',
  },
  published: {
    label: 'Pubblicato',
    hint: 'Online',
    tone: 'bg-paper/10 text-paper/80 border-paper/15',
    dot: 'bg-paper/70',
  },
}

export const PRIORITY_META: Record<Priority, { label: string; tone: string }> = {
  high: { label: 'Alta', tone: 'text-ember-2' },
  medium: { label: 'Media', tone: 'text-gold' },
  low: { label: 'Bassa', tone: 'text-mute' },
}

export const PLATFORM_META: Record<Platform, { label: string; short: string }> = {
  instagram: { label: 'Instagram', short: 'IG' },
  tiktok: { label: 'TikTok', short: 'TT' },
  youtube: { label: 'YouTube Shorts', short: 'YT' },
  facebook: { label: 'Facebook', short: 'FB' },
  pinterest: { label: 'Pinterest', short: 'PIN' },
}

export const DURATION_PRESETS = [7, 15, 30, 45, 60, 90]
