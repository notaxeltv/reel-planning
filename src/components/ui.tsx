import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Clapperboard, Plus } from 'lucide-react'
import { PLATFORM_META, PRIORITY_META, STATUS_META } from '../constants'
import type { Reel } from '../types'
import { cn } from '../types'

export function formatDay(value: string | null, pattern = 'd MMM'): string {
  if (!value) return '—'
  return format(parseISO(value), pattern, { locale: it })
}

export function StatusBadge({ status }: { status: Reel['status'] }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide',
        meta.tone,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

export function PlatformPills({ platforms }: { platforms: Reel['platforms'] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform) => (
        <span
          key={platform}
          className="rounded-md border border-line bg-ink-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-mute"
          title={PLATFORM_META[platform].label}
        >
          {PLATFORM_META[platform].short}
        </span>
      ))}
    </div>
  )
}

export function ReelCard({
  reel,
  onOpen,
  draggable = false,
}: {
  reel: Reel
  onOpen: (reel: Reel) => void
  draggable?: boolean
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/reel-id', reel.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => onOpen(reel)}
      className="w-full rounded-2xl border border-line bg-panel p-3.5 text-left transition hover:-translate-y-0.5 hover:border-ember/40 hover:bg-panel-2"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <StatusBadge status={reel.status} />
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', PRIORITY_META[reel.priority].tone)}>
          {PRIORITY_META[reel.priority].label}
        </span>
      </div>
      <h3 className="font-display text-[17px] leading-snug text-paper">{reel.title}</h3>
      {reel.hook ? (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-mute">{reel.hook}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-2">
        <PlatformPills platforms={reel.platforms} />
        <span className="text-[11px] text-mute">{reel.durationSec}s</span>
      </div>
      {reel.recordDate || reel.publishDate ? (
        <p className="mt-2 text-[11px] text-mute/90">
          {reel.recordDate ? `Ripresa ${formatDay(reel.recordDate)}` : null}
          {reel.recordDate && reel.publishDate ? ' · ' : null}
          {reel.publishDate ? `Uscita ${formatDay(reel.publishDate)}` : null}
        </p>
      ) : null}
    </button>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-line bg-panel/40 px-6 py-16 text-center">
      <Clapperboard className="mb-3 size-8 text-ember/80" />
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-mute">{body}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-ink"
        >
          <Plus className="size-4" />
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
