import { useState } from 'react'
import { STATUS_META, STATUS_ORDER } from '../constants'
import { useStore } from '../store'
import type { Reel, ReelStatus } from '../types'
import { cn } from '../types'
import { EmptyState, ReelCard } from './ui'

export function Kanban({
  reels,
  onOpen,
  onNew,
}: {
  reels: Reel[]
  onOpen: (reel: Reel) => void
  onNew: (preset?: Partial<Reel>) => void
}) {
  const { moveReel } = useStore()
  const [over, setOver] = useState<ReelStatus | null>(null)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-ember-2">Pipeline</p>
        <h1 className="mt-1 font-display text-4xl">Dall’idea alla pubblicazione</h1>
        <p className="mt-2 text-sm text-mute">Trascina le card da una colonna all’altra per aggiornare lo stato.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => {
          const items = reels.filter((reel) => reel.status === status)
          const meta = STATUS_META[status]
          return (
            <section
              key={status}
              onDragOver={(event) => {
                event.preventDefault()
                setOver(status)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(event) => {
                event.preventDefault()
                const id = event.dataTransfer.getData('text/reel-id')
                if (id) moveReel(id, status)
                setOver(null)
              }}
              className={cn(
                'w-[280px] shrink-0 rounded-3xl border p-3 transition',
                over === status ? 'border-ember/50 bg-ember/8' : 'border-line bg-panel/50',
              )}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full', meta.dot)} />
                    <h2 className="text-sm font-semibold">{meta.label}</h2>
                  </div>
                  <p className="text-[11px] text-mute">{meta.hint}</p>
                </div>
                <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-mute">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map((reel) => (
                  <ReelCard key={reel.id} reel={reel} onOpen={onOpen} draggable />
                ))}
                {items.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onNew({ status })}
                    className="w-full rounded-2xl border border-dashed border-line py-8 text-xs text-mute hover:border-ember/40 hover:text-paper"
                  >
                    Aggiungi qui
                  </button>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>

      {reels.length === 0 ? (
        <EmptyState
          title="Pipeline vuota"
          body="Crea il primo reel e spostalo lungo gli stati di produzione."
          action={{ label: 'Nuovo reel', onClick: () => onNew() }}
        />
      ) : null}
    </div>
  )
}
