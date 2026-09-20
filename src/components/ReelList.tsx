import { PLATFORM_META, PRIORITY_META, STATUS_META } from '../constants'
import type { Reel } from '../types'
import { EmptyState, PlatformPills, ReelCard, StatusBadge, formatDay } from './ui'

export function ReelList({
  reels,
  onOpen,
  onNew,
}: {
  reels: Reel[]
  onOpen: (reel: Reel) => void
  onNew: () => void
}) {
  const sorted = [...reels].sort((a, b) => {
    const aDate = a.recordDate ?? a.publishDate ?? a.createdAt
    const bDate = b.recordDate ?? b.publishDate ?? b.createdAt
    return aDate.localeCompare(bDate)
  })

  if (reels.length === 0) {
    return (
      <EmptyState
        title="Nessun reel trovato"
        body="Prova a cambiare la ricerca, oppure crea un nuovo pezzo da girare."
        action={{ label: 'Nuovo reel', onClick: onNew }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-ember-2">Elenco</p>
        <h1 className="mt-1 font-display text-4xl">{reels.length} reel in piano</h1>
      </div>

      <div className="grid gap-3 md:hidden">
        {sorted.map((reel) => (
          <ReelCard key={reel.id} reel={reel} onOpen={onOpen} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-line md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-panel text-[11px] uppercase tracking-[0.14em] text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Piattaforme</th>
              <th className="px-4 py-3 font-medium">Ripresa</th>
              <th className="px-4 py-3 font-medium">Uscita</th>
              <th className="px-4 py-3 font-medium">Priorità</th>
              <th className="px-4 py-3 font-medium">Durata</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((reel) => (
              <tr
                key={reel.id}
                onClick={() => onOpen(reel)}
                className="cursor-pointer border-t border-line bg-ink-2/40 hover:bg-panel"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{reel.title || 'Senza titolo'}</div>
                  <div className="line-clamp-1 text-xs text-mute">{reel.hook || 'Nessun hook'}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={reel.status} />
                </td>
                <td className="px-4 py-3">
                  <PlatformPills platforms={reel.platforms} />
                </td>
                <td className="px-4 py-3 text-mute">{formatDay(reel.recordDate, 'd MMM')}</td>
                <td className="px-4 py-3 text-mute">{formatDay(reel.publishDate, 'd MMM')}</td>
                <td className={PRIORITY_META[reel.priority].tone}>{PRIORITY_META[reel.priority].label}</td>
                <td className="px-4 py-3 text-mute">{reel.durationSec}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mute">
        {Object.values(PLATFORM_META).map((item) => item.short).join(' · ')} · stati: {Object.values(STATUS_META).map((item) => item.label).join(', ')}
      </p>
    </div>
  )
}
