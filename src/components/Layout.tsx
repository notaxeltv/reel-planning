import {
  CalendarDays,
  Clapperboard,
  Columns3,
  LayoutDashboard,
  List,
  Plus,
  Search,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useStore } from '../store'
import type { View } from '../types'
import { cn } from '../types'

const NAV: { id: View; label: string; hint: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Panoramica', hint: 'Settimana e sessioni', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', hint: 'Dall’idea alla pubblicazione', icon: Columns3 },
  { id: 'calendar', label: 'Calendario', hint: 'Riprese e uscite', icon: CalendarDays },
  { id: 'list', label: 'Elenco', hint: 'Tutti i reel', icon: List },
]

export function Layout({
  view,
  onView,
  query,
  onQuery,
  onNew,
  children,
}: {
  view: View
  onView: (view: View) => void
  query: string
  onQuery: (value: string) => void
  onNew: () => void
  children: ReactNode
}) {
  const { reels } = useStore()
  const openCount = reels.filter((reel) => reel.status !== 'published').length

  return (
    <div className="relative min-h-svh">
      <div className="grain" />
      <div className="mx-auto flex min-h-svh max-w-[1600px]">
        <aside className="sticky top-0 hidden h-svh w-[270px] shrink-0 flex-col border-r border-line/80 bg-ink-2/80 p-5 backdrop-blur md:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ember text-ink shadow-[0_10px_30px_rgba(226,74,43,0.35)]">
              <Clapperboard className="size-5" />
            </div>
            <div>
              <p className="font-display text-[22px] leading-none">Reel Plan</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-mute">
                Call sheet social
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onView(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                    active
                      ? 'bg-paper/6 text-paper'
                      : 'text-mute hover:bg-paper/4 hover:text-paper',
                  )}
                >
                  <Icon className={cn('size-4', active ? 'text-ember-2' : '')} />
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-[11px] text-mute">{item.hint}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <div className="rounded-2xl border border-line bg-panel p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-mute">In lavorazione</p>
              <p className="mt-1 font-display text-3xl">{openCount}</p>
              <p className="text-xs text-mute">reel aperti nel pipeline</p>
            </div>
            <p className="px-1 text-[11px] leading-relaxed text-mute">
              I dati restano in questo browser. Tasto <kbd className="rounded bg-panel-2 px-1">N</kbd> per un nuovo reel.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line/80 bg-ink/80 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2">
              <Search className="size-4 text-mute" />
              <input
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Cerca titolo, hook, audio, location…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-mute"
              />
            </div>
            <div className="hidden text-right text-xs text-mute sm:block">
              <div className="uppercase tracking-[0.16em]">Oggi</div>
              <div className="text-paper">
                {new Date().toLocaleDateString('it-IT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={onNew}
              className="inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_8px_24px_rgba(226,74,43,0.28)] transition hover:bg-ember-2"
            >
              <Plus className="size-4" />
              Nuovo reel
            </button>
          </header>

          <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onView(item.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs whitespace-nowrap',
                  view === item.id ? 'bg-ember text-ink' : 'bg-panel text-mute',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
