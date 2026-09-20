# Reel Plan

Dashboard condivisa per pianificare riprese e uscite dei reel, in due, sullo stesso piano: hook, shot list, date, caption e pipeline.

Funziona come una board [Trello](https://trello.com/): un link, due account, aggiornamenti in tempo reale.

## Come la usate insieme

1. **Tu** fai il setup una tantum (codice su GitHub, database Supabase, sito Vercel).
2. **Il tuo amico** apre il link, crea l’account con la sua email e accede.
3. Da quel momento create, spostate e modificate gli stessi reel. Se uno cambia una card, l’altro la vede senza ricaricare.

Non usate `localhost` per collaborare: ognuno deve aprire **lo stesso sito pubblicato**.

---

## Prima di tutto: il codice su GitHub

Vercel pubblica ciò che sta su GitHub. Se collaborazione, login e colori nuovi sono ancora solo sul PC, **fai commit e push su `main`** prima del deploy. Altrimenti online resta la versione vecchia (solo locale, senza cloud).

Repo: [github.com/notaxeltv/reel-planning](https://github.com/notaxeltv/reel-planning)

---

## A. Database su Supabase

### A1. Crea il progetto

1. Vai su [supabase.com](https://supabase.com) e registrati (va bene Google/GitHub).
2. **New project** / **New project**.
3. Compila:
   - **Name**: `reel-planning` (o come preferisci)
   - **Database password**: generane una forte e **salvala**. Serve per il pannello, non per entrare nella dashboard Reel Plan.
   - **Region**: una vicina, es. **Frankfurt (eu-central-1)**
4. Conferma e aspetta 1–2 minuti che il progetto sia **Active**.

### A2. Copia URL e chiave pubblica

1. Nel progetto, apri l’ingranaggio **Project Settings**.
2. Vai su **API** (a volte si chiama **API Keys** / **Data API**).
3. Copia e tieni da parte:

| Cosa copiare | A cosa serve | Dove si trova di solito |
| --- | --- | --- |
| **Project URL** | Indirizzo del database | `https://xxxxxxxxxxxx.supabase.co` |
| **anon** / **public** | Chiave che usa il sito | etichetta `anon` `public` |

**Non copiare** `service_role` / `secret`: è la chiave admin. Non va nel frontend né su Vercel.

### A3. Crea tabelle e permessi (SQL)

1. Nella barra a sinistra: **SQL Editor**.
2. **New query**.
3. Apri sul PC il file [`supabase/schema.sql`](supabase/schema.sql).
4. Incollalo tutto nella query.
5. In cima, sostituisci le due email di esempio con **le vostre vere email** (quelle con cui accederete, identiche, minuscole):

```sql
insert into public.allowed_emails (email) values
  ('tua-email@esempio.com'),
  ('email-amico@esempio.com')
on conflict (email) do nothing;
```

6. Premi **Run**. Deve finire senza errori.
7. Controllo rapido: **Table Editor** deve mostrare le tabelle `allowed_emails` e `reels`. In `allowed_emails` ci sono le due email.

Questo script crea:

- la lista di chi può entrare (`allowed_emails`)
- i reel condivisi (`reels`)
- le regole di sicurezza (solo chi è in lista legge e scrive)
- il canale **realtime** (le card si aggiornano da sole)

### A4. Login (Authentication)

1. Menu **Authentication**.
2. **Providers** → **Email**: deve essere **enabled**.
3. Disattiva **Confirm email** (a volte sta in **Authentication → Providers → Email**, a volte in **Authentication → Settings** come *Enable email confirmations*).  
   Se resta acceso, dopo la registrazione dovete confermare un’email prima di entrare.
4. **Authentication → URL Configuration** (lo completi dopo Vercel):
   - **Site URL**: per ora lascia il default, poi lo cambi con l’URL Vercel.
   - **Redirect URLs**: aggiungi
     - `http://localhost:5173/**`
     - `http://localhost:5174/**`
     - e, dopo il deploy, `https://IL-TUO-SITO.vercel.app/**`

---

## B. Pubblicazione su Vercel

### B1. Collega GitHub

1. Vai su [vercel.com](https://vercel.com) e accedi **con GitHub**.
2. Autorizza Vercel a vedere il repo `notaxeltv/reel-planning` (se chiede i permessi sui repository).

### B2. Importa il progetto

1. **Add New… → Project**.
2. Importa **reel-planning**.
3. Lascia i default di Vite:

| Campo | Valore |
| --- | --- |
| Framework | Vite (rilevato da solo) |
| Root Directory | `.` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### B3. Variabili d’ambiente (obbligatorie, prima del primo deploy)

In **Environment Variables** aggiungi **due** variabili, per **Production**, **Preview** e **Development**:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | lo **Project URL** di Supabase |
| `VITE_SUPABASE_ANON_KEY` | la chiave **anon public** |

Niente spazi, niente virgolette.

Poi **Deploy**. Attendi il build verde.

### B4. Copia l’URL e torna su Supabase

1. In Vercel, apri il progetto → **Domains**. Esempio: `https://reel-planning.vercel.app`.
2. Torna su Supabase → **Authentication → URL Configuration**:
   - **Site URL** = `https://reel-planning.vercel.app`
   - in **Redirect URLs** aggiungi `https://reel-planning.vercel.app/**`

### B5. Il tuo amico

1. Apre il link Vercel.
2. **Crea un account** con l’email che hai messo in `allowed_emails`.
3. Password a scelta, almeno 6 caratteri.
4. Entra: vede lo stesso piano tuo.

Se compare **Non sei ancora sulla board**, l’email non coincide. In SQL Editor:

```sql
insert into public.allowed_emails (email)
values ('email-esatta-dell-amico@esempio.com')
on conflict (email) do nothing;
```

Poi lui preme **Riprova**.

---

## C. Prova sul tuo PC (opzionale)

Utile per sviluppare. Per collaborare usate comunque il sito Vercel.

Nella cartella del progetto crea `.env.local` (è già ignorato da git, non finisce online):

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=incolla-la-anon-key
```

```powershell
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) (o la porta che Vite stampa) e accedi con un’email della lista.

Se cambi `.env.local`, **riavvia** `npm run dev`.

---

## Come lavorate in due

| Cosa | Come |
| --- | --- |
| Nuovo reel | Pulsante **Nuovo reel** o tasto `N` |
| Pipeline | Trascina le card da uno stato all’altro |
| Calendario | Doppio clic su un giorno per pianificare una ripresa |
| Modifiche | Si salvano sul cloud; l’altro le vede in tempo reale |
| Accesso | Ognuno ha email e password sue, stessa board |

Il pallino **In tempo reale** nella colonna di sinistra conferma che siete collegati.

---

## Problemi frequenti

| Sintomo | Cosa controllare |
| --- | --- |
| Schermata *Manca il collegamento al cloud* | Su Vercel mancano le due env, oppure le hai aggiunte **dopo** il deploy: **Redeploy**. In locale manca `.env.local` o non hai riavviato Vite. |
| Login *Email o password non corretti* | Account non creato, oppure Confirm email è ancora attivo. |
| *Non sei ancora sulla board* | Email diversa da quella in `allowed_emails` (anche solo una lettera). |
| Le card non si aggiornano da sole | Lo SQL è stato eseguito per intero? In **Database → Publications** la tabella `reels` deve essere in `supabase_realtime`. |
| Vercel ha la UI vecchia, senza login | Il push su GitHub non include ancora i file di collaborazione. |
| Build Vercel fallisce | Di solito manca una env `VITE_…` o il repo non è aggiornato. |

---

## Script

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Avvia l’app in sviluppo |
| `npm run build` | Compila per produzione |
| `npm run preview` | Anteprima della build |
