import { useEffect, useMemo, useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { Dashboard } from './components/Dashboard'
import { Kanban } from './components/Kanban'
import { Layout } from './components/Layout'
import { ReelEditor } from './components/ReelEditor'
import { ReelList } from './components/ReelList'
import { StoreProvider, useStore } from './store'
import { blankReel } from './types'
import type { Reel, View } from './types'

function Shell() {
  const { reels, addReel, updateReel, deleteReel } = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<Reel | null>(null)
  const [isNew, setIsNew] = useState(false)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return reels
    return reels.filter((reel) =>
      [
        reel.title,
        reel.hook,
        reel.script,
        reel.shotList,
        reel.audio,
        reel.caption,
        reel.hashtags,
        reel.location,
        reel.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [reels, query])

  function openNew(preset?: Partial<Reel>) {
    setIsNew(true)
    setDraft(blankReel(preset))
  }

  function openEdit(reel: Reel) {
    setIsNew(false)
    setDraft({ ...reel })
  }

  function closeEditor() {
    setDraft(null)
  }

  function saveDraft() {
    if (!draft) return
    if (!draft.title.trim()) {
      if (isNew) {
        closeEditor()
        return
      }
    }
    if (isNew) addReel({ ...draft, title: draft.title.trim() || 'Nuovo reel' })
    else updateReel(draft.id, { ...draft, title: draft.title.trim() || 'Senza titolo' })
    closeEditor()
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement).tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (event.key === 'Escape') {
        closeEditor()
        return
      }
      if (typing) return
      if (event.key === 'n' || event.key === 'N') openNew()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Layout view={view} onView={setView} query={query} onQuery={setQuery} onNew={() => openNew()}>
      {view === 'dashboard' ? (
        <Dashboard reels={visible} onOpen={openEdit} onNew={openNew} />
      ) : null}
      {view === 'pipeline' ? <Kanban reels={visible} onOpen={openEdit} onNew={openNew} /> : null}
      {view === 'calendar' ? (
        <CalendarView reels={visible} onOpen={openEdit} onNew={openNew} />
      ) : null}
      {view === 'list' ? <ReelList reels={visible} onOpen={openEdit} onNew={() => openNew()} /> : null}
      {draft ? (
        <ReelEditor
          reel={draft}
          isNew={isNew}
          onChange={setDraft}
          onClose={closeEditor}
          onSave={saveDraft}
          onDelete={
            isNew
              ? undefined
              : () => {
                  deleteReel(draft.id)
                  closeEditor()
                }
          }
        />
      ) : null}
    </Layout>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
