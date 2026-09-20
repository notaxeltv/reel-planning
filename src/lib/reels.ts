import { PLATFORM_META, PRIORITY_META, STATUS_META } from '../constants'
import type { Platform, Priority, Reel, ReelStatus } from '../types'

export type ReelRow = {
  id: string
  title: string
  hook: string
  script: string
  shot_list: string
  audio: string
  platforms: string[] | null
  status: string
  priority: string
  record_date: string | null
  publish_date: string | null
  duration_sec: number
  caption: string
  hashtags: string
  location: string
  outfit: string
  props: string
  notes: string
  created_at: string
  updated_at: string
}

function isPlatform(value: string): value is Platform {
  return value in PLATFORM_META
}

function isStatus(value: string): value is ReelStatus {
  return value in STATUS_META
}

function isPriority(value: string): value is Priority {
  return value in PRIORITY_META
}

export function fromRow(row: ReelRow): Reel {
  const platforms = (row.platforms ?? []).filter(isPlatform)
  return {
    id: row.id,
    title: row.title ?? '',
    hook: row.hook ?? '',
    script: row.script ?? '',
    shotList: row.shot_list ?? '',
    audio: row.audio ?? '',
    platforms: platforms.length > 0 ? platforms : ['instagram'],
    status: isStatus(row.status) ? row.status : 'idea',
    priority: isPriority(row.priority) ? row.priority : 'medium',
    recordDate: row.record_date,
    publishDate: row.publish_date,
    durationSec: row.duration_sec ?? 30,
    caption: row.caption ?? '',
    hashtags: row.hashtags ?? '',
    location: row.location ?? '',
    outfit: row.outfit ?? '',
    props: row.props ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toRow(reel: Reel): ReelRow {
  return {
    id: reel.id,
    title: reel.title,
    hook: reel.hook,
    script: reel.script,
    shot_list: reel.shotList,
    audio: reel.audio,
    platforms: reel.platforms,
    status: reel.status,
    priority: reel.priority,
    record_date: reel.recordDate || null,
    publish_date: reel.publishDate || null,
    duration_sec: reel.durationSec,
    caption: reel.caption,
    hashtags: reel.hashtags,
    location: reel.location,
    outfit: reel.outfit,
    props: reel.props,
    notes: reel.notes,
    created_at: reel.createdAt,
    updated_at: reel.updatedAt,
  }
}

export function authMessage(error: string): string {
  const lower = error.toLowerCase()
  if (lower.includes('invalid login')) return 'Email o password non corretti.'
  if (lower.includes('already registered')) return 'Questo account esiste già. Accedi.'
  if (lower.includes('email not confirmed')) {
    return 'Email non confermata. In Supabase disattiva “Confirm email” oppure conferma il messaggio.'
  }
  if (lower.includes('password')) return 'La password deve avere almeno 6 caratteri.'
  return error
}
