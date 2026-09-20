import {
  addDays,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarClock, Clapperboard, Film, Sparkles, Sun } from 'lucide-react'
import type { Reel } from '../types'
import { EmptyState, ReelCard, formatDay } from './ui'

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function Dashboard({
  reels,
  onOpen,
  onNew,
}: {
  reels: Reel[]
  onOpen: (reel: Reel) => void
  onNew: (preset?: Partial<Reel>) => void
}) {
  const today = startOfLocalDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)
  const monthStart = startOfMonth(today)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  const toRecord = reels.filter((reel) => reel.status === 'to_record' || reel.status === 'idea')
  const inProgress = reels.filter((reel) => reel.status === 'recorded' || reel.status === 'editing')
  const scheduled = reels.filter((reel) => reel.status === 'scheduled')
  const publishedMonth = reels.filter((reel) => {
    if (reel.status !== 'published' || !reel.publishDate) return false
    return parseISO(reel.publishDate) >= monthStart
  })

  const weekRecordings = reels.filter((reel) => {
    if (!reel.recordDate) return false
    const date = parseISO(reel.recordDate)
    return isWithinInterval(date, { start: weekStart, end: addDays(weekEnd, 1) })
  })

  const upcomingRecord = [...reels]
    .filter((reel) => reel.recordDate && parseISO(reel.recordDate) >= today && reel.status !== 'published')
    .sort((a, b) => (a.recordDate ?? '').localeCompare(b.recordDate ?? ''))
    .slice(0, 5)

  const upcomingPublish = [...reels]
    .filter((reel) => reel.publishDate && parseISO(reel.publishDate) >= today && reel.status !== 'published')
    .sort((a, b) => (a.publishDate ?? '').localeCompare(b.publishDate ?? ''))
    .slice(0, 5)

  const ideas = reels.filter((reel) => reel.status === 'idea').slice(0, 4)

  const nextSession = upcomingRecord[0]

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-ember-2">{greet}</p>
          <h1 className="mt-1 font-display text-4xl tracking-tight md:text-5xl">
            Cosa giriamo questa settimana
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">
            Call sheet dei reel: hook, shot list, data di ripresa e data di uscita. Tutto in un posto, prima di accendere la camera.
          </p>
        </div>
        {nextSession ? (
          <button
            type="button"
            onClick={() => onOpen(nextSession)}
            className="rounded-3xl border border-ember/30 bg-ember/10 px-5 py-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-ember-2">Prossima sessione</p>
            <p className="mt-1 font-display text-xl">{nextSession.title}</p>
            <p className="text-sm text-mute">
              {formatDay(nextSession.recordDate, 'EEEE d MMMM')} · {nextSession.durationSec}s
            </p>
          </button>
        ) : null}
      </section>

      <section className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const count = reels.filter((reel) => reel.recordDate && isSameDay(parseISO(reel.recordDate), day)).length
          const isToday = isSameDay(day, today)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() =>
                onNew({
                  recordDate: format(day, 'yyyy-MM-dd'),
                  status: 'to_record',
                })
              }
              className={`rounded-2xl border px-2 py-3 text-center ${
                isToday ? 'border-ember/50 bg-ember/12' : 'border-line bg-panel/70'
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-mute">
                {format(day, 'EEE', { locale: it })}
              </div>
              <div className="font-display text-xl">{format(day, 'd')}</div>
              <div className="mt-1 text-[11px] text-ember-2">
                {count === 0 ? '—' : count === 1 ? '1 ripresa' : `${count} riprese`}
              </div>
            </button>
          )
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Clapperboard} label="Da registrare" value={toRecord.length} hint="Idee e call sheet" />
        <Stat icon={Film} label="In lavorazione" value={inProgress.length} hint="Girato o in editing" />
        <Stat icon={CalendarClock} label="In programma" value={scheduled.length} hint="Pronti all’uscita" />
        <Stat icon={Sun} label="Pubblicati nel mese" value={publishedMonth.length} hint="Già online" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <Header title="Da girare" subtitle="Ordinate per data di ripresa" />
          {upcomingRecord.length === 0 ? (
            <EmptyState
              title="Nessuna ripresa in agenda"
              body="Aggiungi una data di registrazione ai reel, oppure crea il primo della settimana."
              action={{ label: 'Pianifica una ripresa', onClick: () => onNew({ status: 'to_record' }) }}
            />
          ) : (
            <div className="grid gap-3">
              {upcomingRecord.map((reel) => (
                <ReelCard key={reel.id} reel={reel} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
        <div>
          <Header title="In uscita" subtitle="Date di pubblicazione" />
          {upcomingPublish.length === 0 ? (
            <EmptyState
              title="Nessuna uscita prevista"
              body="Quando un reel è pronto, assegnagli una data di pubblicazione."
            />
          ) : (
            <div className="grid gap-3">
              {upcomingPublish.map((reel) => (
                <ReelCard key={reel.id} reel={reel} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <Header title="Inbox idee" subtitle={`${ideas.length} da sviluppare`} />
        {ideas.length === 0 ? (
          <p className="text-sm text-mute">Nessuna idea in sospeso. Ottimo, oppure è ora di scriverne una.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {ideas.map((reel) => (
              <ReelCard key={reel.id} reel={reel} onOpen={onOpen} />
            ))}
          </div>
        )}
      </section>

      {weekRecordings.length > 0 ? (
        <p className="flex items-center gap-2 text-sm text-mute">
          <Sparkles className="size-4 text-gold" />
          {weekRecordings.length} reel in call sheet questa settimana.
        </p>
      ) : null}
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="text-xs text-mute">{subtitle}</p>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Film
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-mute">{label}</p>
        <Icon className="size-4 text-ember-2" />
      </div>
      <p className="mt-2 font-display text-4xl">{value}</p>
      <p className="text-xs text-mute">{hint}</p>
    </div>
  )
}
