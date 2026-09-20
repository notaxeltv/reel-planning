import { Clapperboard, LoaderCircle } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useAuth } from '../auth'
import { useStore } from '../store'

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-svh place-items-center px-4">
      <div className="grain" />
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-ember text-ink">
            <Clapperboard className="size-5" />
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Reel Plan</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-mute">Board condivisa</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Splash({ message }: { message: string }) {
  return (
    <Frame>
      <div className="flex items-center gap-3 text-sm text-mute">
        <LoaderCircle className="size-4 animate-spin text-ember-2" />
        {message}
      </div>
    </Frame>
  )
}

export function SetupScreen() {
  return (
    <Frame>
      <h1 className="font-display text-3xl">Manca il collegamento al cloud</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Sul sito Vercel servono le variabili d’ambiente, non il file .env del PC. Aggiungile in Settings →
        Environment Variables e fai Redeploy.
      </p>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-paper/90">
        <li>
          <code className="rounded bg-ink-2 px-1">VITE_SUPABASE_URL</code>
        </li>
        <li>
          <code className="rounded bg-ink-2 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>
        </li>
        <li>
          <code className="rounded bg-ink-2 px-1">VITE_SUPABASE_ANON_KEY</code> (stessa chiave)
        </li>
        <li>Redeploy del progetto</li>
      </ol>
    </Frame>
  )
}

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const action = mode === 'in' ? signIn : signUp
    const message = await action(email.trim(), password)
    if (message) setError(message)
    setBusy(false)
  }

  return (
    <Frame>
      <h1 className="font-display text-3xl">{mode === 'in' ? 'Entra nella board' : 'Crea il tuo accesso'}</h1>
      <p className="mt-2 text-sm text-mute">
        Stesso piano per entrambi, come Trello: idee, riprese, uscite e pipeline restano allineati.
      </p>
      <form className="mt-6 space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mute">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-ember/50"
            placeholder="voi@email.com"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-mute">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-ember/50"
            placeholder="Almeno 6 caratteri"
          />
        </label>
        {error ? <p className="text-sm text-ember-2">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-ember py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {busy ? 'Un attimo…' : mode === 'in' ? 'Accedi' : 'Crea account'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'in' ? 'up' : 'in')
          setError(null)
        }}
        className="mt-4 text-sm text-mute underline-offset-2 hover:text-paper hover:underline"
      >
        {mode === 'in' ? 'Prima volta? Crea un account' : 'Hai già un account? Accedi'}
      </button>
    </Frame>
  )
}

export function DeniedScreen() {
  const { email, signOut } = useAuth()
  const { error, reload } = useStore()

  return (
    <Frame>
      <h1 className="font-display text-3xl">Non sei ancora sulla board</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        L’account <span className="text-paper">{email}</span> esiste, ma non è nella lista{' '}
        <code className="rounded bg-ink-2 px-1">allowed_emails</code>. Chi ha creato il progetto deve
        aggiungerla in Supabase e poi tu riprovi.
      </p>
      {error ? <p className="mt-3 text-sm text-ember-2">{error}</p> : null}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={reload}
          className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-ink"
        >
          Riprova
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-full border border-line px-4 py-2 text-sm text-mute hover:text-paper"
        >
          Esci
        </button>
      </div>
    </Frame>
  )
}
