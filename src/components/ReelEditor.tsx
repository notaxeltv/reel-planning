import { X } from 'lucide-react'
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { DURATION_PRESETS, PLATFORM_META, STATUS_ORDER, STATUS_META } from '../constants'
import type { Platform, Priority, Reel, ReelStatus } from '../types'
import { cn } from '../types'

const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'youtube', 'facebook', 'pinterest']
const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export function ReelEditor({
  reel,
  isNew,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  reel: Reel
  isNew: boolean
  onChange: (reel: Reel) => void
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}) {
  function patch<K extends keyof Reel>(key: K, value: Reel[K]) {
    onChange({ ...reel, [key]: value })
  }

  function togglePlatform(platform: Platform) {
    const has = reel.platforms.includes(platform)
    patch(
      'platforms',
      has ? reel.platforms.filter((item) => item !== platform) : [...reel.platforms, platform],
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="h-full flex-1 bg-black/55" onClick={onClose} aria-label="Chiudi" />
      <section className="flex h-full w-full max-w-[640px] flex-col border-l border-line bg-ink-2 shadow-[-24px_0_80px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ember-2">
              {isNew ? 'Nuovo reel' : 'Scheda reel'}
            </p>
            <h2 className="font-display text-3xl">{reel.title || 'Senza titolo'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-line p-2 hover:bg-panel">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <Field label="Titolo">
            <input
              value={reel.title}
              onChange={(event) => patch('title', event.target.value)}
              placeholder="Es. 3 hook che fermano lo scroll"
              className="field"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stato">
              <select
                value={reel.status}
                onChange={(event) => patch('status', event.target.value as ReelStatus)}
                className="field"
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priorità">
              <div className="flex gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => patch('priority', priority)}
                    className={cn(
                      'flex-1 rounded-xl border py-2 text-sm capitalize',
                      reel.priority === priority
                        ? 'border-ember bg-ember/15 text-paper'
                        : 'border-line text-mute',
                    )}
                  >
                    {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Bassa'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Piattaforme">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm',
                    reel.platforms.includes(platform)
                      ? 'border-ember bg-ember/15 text-paper'
                      : 'border-line text-mute',
                  )}
                >
                  {PLATFORM_META[platform].label}
                </button>
              ))}
            </div>
          </Field>

          <section className="space-y-4">
            <h3 className="font-display text-xl">Creatività</h3>
            <Field label="Hook (primi 1-3 secondi)">
              <textarea
                value={reel.hook}
                onChange={(event) => patch('hook', event.target.value)}
                rows={2}
                className="field resize-y"
                placeholder="La frase che deve fermare lo scroll"
              />
            </Field>
            <Field label="Script / sceneggiatura">
              <textarea
                value={reel.script}
                onChange={(event) => patch('script', event.target.value)}
                rows={6}
                className="field resize-y"
                placeholder="Battute, overlay, tempi"
              />
            </Field>
            <Field label="Shot list">
              <textarea
                value={reel.shotList}
                onChange={(event) => patch('shotList', event.target.value)}
                rows={4}
                className="field resize-y"
                placeholder="- Close-up&#10;- B-roll mani&#10;- Insert prodotto"
              />
            </Field>
            <Field label="Audio / trend">
              <input
                value={reel.audio}
                onChange={(event) => patch('audio', event.target.value)}
                className="field"
                placeholder="Nome brano o trend da usare"
              />
            </Field>
          </section>

          <section className="space-y-4">
            <h3 className="font-display text-xl">Produzione</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data ripresa">
                <input
                  type="date"
                  value={reel.recordDate ?? ''}
                  onChange={(event) => patch('recordDate', event.target.value || null)}
                  className="field"
                />
              </Field>
              <Field label="Data pubblicazione">
                <input
                  type="date"
                  value={reel.publishDate ?? ''}
                  onChange={(event) => patch('publishDate', event.target.value || null)}
                  className="field"
                />
              </Field>
            </div>
            <Field label="Durata">
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => patch('durationSec', seconds)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm',
                      reel.durationSec === seconds
                        ? 'border-ember bg-ember/15'
                        : 'border-line text-mute',
                    )}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Location">
                <input value={reel.location} onChange={(event) => patch('location', event.target.value)} className="field" />
              </Field>
              <Field label="Outfit">
                <input value={reel.outfit} onChange={(event) => patch('outfit', event.target.value)} className="field" />
              </Field>
              <Field label="Props">
                <input value={reel.props} onChange={(event) => patch('props', event.target.value)} className="field" />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-display text-xl">Pubblicazione</h3>
            <Field label="Caption">
              <textarea
                value={reel.caption}
                onChange={(event) => patch('caption', event.target.value)}
                rows={4}
                className="field resize-y"
              />
            </Field>
            <Field label="Hashtag">
              <input
                value={reel.hashtags}
                onChange={(event) => patch('hashtags', event.target.value)}
                className="field"
                placeholder="#reels #..."
              />
            </Field>
            <Field label="Note">
              <textarea
                value={reel.notes}
                onChange={(event) => patch('notes', event.target.value)}
                rows={3}
                className="field resize-y"
              />
            </Field>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Eliminare questo reel dal piano?')) onDelete()
              }}
              className="text-sm text-ember-2 hover:underline"
            >
              Elimina
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-line px-4 py-2 text-sm">
              Chiudi
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-ink"
            >
              Salva reel
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-label'?: string }>, { 'aria-label': label })
    : children

  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-mute">{label}</div>
      {child}
    </div>
  )
}
