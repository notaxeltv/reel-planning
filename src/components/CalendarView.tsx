import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Reel } from '../types'
import { cn } from '../types'

type Marker = { reel: Reel; kind: 'record' | 'publish' }

export function CalendarView({
  reels,
  onOpen,
  onNew,
}: {
  reels: Reel[]
  onOpen: (reel: Reel) => void
  onNew: (preset?: Partial<Reel>) => void
}) {
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState<Date>(() => new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const markers = useMemo(() => {
    const map = new Map<string, Marker[]>()
    for (const reel of reels) {
      if (reel.recordDate) {
        const list = map.get(reel.recordDate) ?? []
        list.push({ reel, kind: 'record' })
        map.set(reel.recordDate, list)
      }
      if (reel.publishDate) {
        const list = map.get(reel.publishDate) ?? []
        list.push({ reel, kind: 'publish' })
        map.set(reel.publishDate, list)
      }
    }
    return map
  }, [reels])

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const selectedItems = markers.get(selectedKey) ?? []
  const monthTitle = format(cursor, 'LLLL yyyy', { locale: it })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-ember-2">Calendario</p>
          <h1 className="mt-1 font-display text-4xl capitalize">{monthTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Legend />
          <button
            type="button"
            onClick={() => setCursor((current) => addMonths(current, -1))}
            className="rounded-full border border-line bg-panel p-2 hover:border-ember/40"
            aria-label="Mese precedente"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date()
              setCursor(now)
              setSelected(now)
            }}
            className="rounded-full border border-line bg-panel px-3 py-2 text-xs font-medium hover:border-ember/40"
          >
            Oggi
          </button>
          <button
            type="button"
            onClick={() => setCursor((current) => addMonths(current, 1))}
            className="rounded-full border border-line bg-panel p-2 hover:border-ember/40"
            aria-label="Mese successivo"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="grid grid-cols-7 border-b border-line text-[11px] uppercase tracking-[0.16em] text-mute">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((label) => (
            <div key={label} className="px-3 py-3">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const items = markers.get(key) ?? []
            const outside = !isSameMonth(day, cursor)
            const active = isSameDay(day, selected)
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(day)}
                onDoubleClick={() => onNew({ recordDate: key, status: 'to_record' })}
                className={cn(
                  'min-h-[118px] border-t border-r border-line p-2 text-left align-top transition last:border-r-0',
                  outside ? 'bg-ink/40 text-mute/50' : 'bg-transparent',
                  active ? 'bg-ember/10' : 'hover:bg-paper/4',
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full text-sm',
                      isToday(day) ? 'bg-ember text-ink' : '',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <span className="text-[10px] text-mute">{items.length || ''}</span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={`${item.kind}-${item.reel.id}`}
                      className={cn(
                        'truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                        item.kind === 'record'
                          ? 'bg-ember/20 text-ember-2'
                          : 'bg-gold/15 text-gold',
                      )}
                    >
                      {item.kind === 'record' ? 'REC' : 'OUT'} · {item.reel.title}
                    </div>
                  ))}
                  {items.length > 3 ? (
                    <div className="text-[10px] text-mute">+{items.length - 3}</div>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <section className="rounded-3xl border border-line bg-panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl capitalize">
              {format(selected, 'EEEE d MMMM', { locale: it })}
            </h2>
            <p className="text-sm text-mute">
              Doppio clic su un giorno per pianificare una ripresa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNew({ recordDate: selectedKey, status: 'to_record' })}
            className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-ink"
          >
            Aggiungi ripresa
          </button>
        </div>
        {selectedItems.length === 0 ? (
          <p className="text-sm text-mute">Nessun reel in questo giorno.</p>
        ) : (
          <ul className="space-y-2">
            {selectedItems.map((item) => (
              <li key={`${item.kind}-${item.reel.id}`}>
                <button
                  type="button"
                  onClick={() => onOpen(item.reel)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left hover:border-ember/40"
                >
                  <div>
                    <p className="font-medium">{item.reel.title}</p>
                    <p className="text-xs text-mute">
                      {item.kind === 'record' ? 'Registrazione' : 'Pubblicazione'}
                      {item.reel.location ? ` · ${item.reel.location}` : ''}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider',
                      item.kind === 'record' ? 'bg-ember/20 text-ember-2' : 'bg-gold/15 text-gold',
                    )}
                  >
                    {item.kind === 'record' ? 'RIPRESA' : 'USCITA'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Legend() {
  return (
    <div className="mr-2 hidden items-center gap-3 text-[11px] text-mute sm:flex">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-ember" /> Ripresa
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-gold" /> Uscita
      </span>
    </div>
  )
}
