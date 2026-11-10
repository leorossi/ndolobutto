import { useEffect, useRef, useState } from 'react'
import {
  getObjectDetails,
  JunkerApiError,
  searchObjects,
  type JunkerDetails,
  type JunkerSuggestion,
} from './api/junker'
import { ResultCard, ResultCardSkeleton } from './components/ResultCard'
import { SearchBar, type SearchStatus } from './components/SearchBar'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import './App.css'

type DetailStatus = 'idle' | 'loading' | 'success' | 'error'

const POPULAR_SEARCHES = ['Tovagliolo', 'Batteria', 'Lampadina', 'Tappo']

function describeError(error: unknown): string {
  if (error instanceof JunkerApiError) {
    return error.status >= 500
      ? 'Il servizio sta riscontrando un problema. Riprova tra qualche istante.'
      : 'La richiesta non è andata a buon fine. Riprova tra poco.'
  }

  return 'Il servizio non è raggiungibile in questo momento. Controlla la connessione e riprova.'
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7.5h12l-1 13.2a1.8 1.8 0 0 1-1.8 1.7H8.8A1.8 1.8 0 0 1 7 20.7L6 7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 7.5V5.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7M4 7.5h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 11v7.5M14 11v7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 2.5C8 2 4 4.5 4 8.5c0 2 1.5 3.5 3.5 3.5 4 0 6-4 6-9.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 14c1.5-3 3.5-5 6-6.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 280)
  const [suggestions, setSuggestions] = useState<JunkerSuggestion[]>([])
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchAttempt, setSearchAttempt] = useState(0)

  const [selected, setSelected] = useState<JunkerSuggestion | null>(null)
  const [details, setDetails] = useState<JunkerDetails | null>(null)
  const [detailStatus, setDetailStatus] = useState<DetailStatus>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailAttempt, setDetailAttempt] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedQuery !== query) return

    const term = query.trim()

    if (selected && term === selected.desc) {
      return
    }

    if (term.length < 2) {
      return
    }

    const controller = new AbortController()

    searchObjects(term, controller.signal)
      .then((items) => {
        setSuggestions(items)
        setSearchStatus('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setSuggestions([])
        setSearchStatus('error')
        setSearchError(describeError(error))
      })

    return () => controller.abort()
  }, [debouncedQuery, query, selected, searchAttempt])

  useEffect(() => {
    if (!selected) return

    const controller = new AbortController()

    getObjectDetails(selected.genericId, controller.signal)
      .then((data) => {
        setDetails(data)
        setDetailStatus('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setDetailStatus('error')
        setDetailError(describeError(error))
      })

    return () => controller.abort()
  }, [selected, detailAttempt])

  const handleQueryChange = (value: string) => {
    setQuery(value)

    if (selected) {
      setSelected(null)
      setDetails(null)
      setDetailStatus('idle')
      setDetailError(null)
    }

    if (value.trim().length < 2) {
      setSuggestions([])
      setSearchStatus('idle')
      setSearchError(null)
      setIsOpen(false)
      return
    }

    setSearchStatus('loading')
    setSearchError(null)
    setIsOpen(true)
  }

  const handleSelect = (suggestion: JunkerSuggestion) => {
    setQuery(suggestion.desc)
    setSelected(suggestion)
    setSuggestions([])
    setSearchStatus('idle')
    setSearchError(null)
    setIsOpen(false)
    setDetails(null)
    setDetailStatus('loading')
    setDetailError(null)
    setDetailAttempt(0)
  }

  const handleReset = () => {
    setQuery('')
    setSelected(null)
    setDetails(null)
    setDetailStatus('idle')
    setDetailError(null)
    setSuggestions([])
    setSearchStatus('idle')
    setSearchError(null)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (selected && query === selected.desc) return
    if (query.trim().length >= 2) setIsOpen(true)
  }

  const handleSearchRetry = () => {
    setIsOpen(true)
    setSearchStatus('loading')
    setSearchError(null)
    setSearchAttempt((attempt) => attempt + 1)
  }

  const handlePopular = (term: string) => {
    handleQueryChange(term)
    inputRef.current?.focus()
  }

  const hasPanel =
    detailStatus === 'loading' || details !== null || detailStatus === 'error'

  return (
    <div className="app">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="ambient-grid" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="/" aria-label="Ndolobutto, torna alla ricerca">
          <span className="brand__mark">
            <BrandMark />
          </span>
          <span className="brand__word">
            Ndolobutto<span className="brand__accent">?</span>
          </span>
        </a>

        <a
          className="header-link"
          href="https://aliaestra.it/ambiente/raccolta-e-pulizia-strade/dove-lo-butto"
          target="_blank"
          rel="noreferrer"
        >
          Guida ufficiale
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M5 11 11 5M6 5h5v5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </header>

      <main className={`main${hasPanel ? ' main--compact' : ''}`}>
        <section className="hero">
          <span className="eyebrow">
            <span className="eyebrow__icon">
              <LeafIcon />
            </span>
            Raccolta differenziata, senza dubbi
          </span>

          <h1 className="hero__title">
            Ndolobutto<span>?</span>
          </h1>
          <p className="hero__subtitle">
            Scrivi il nome di un oggetto e scopri subito in quale contenitore
            va. Un gesto semplice per differenziare meglio.
          </p>

          <SearchBar
            query={query}
            suggestions={suggestions}
            status={searchStatus}
            error={searchError}
            isOpen={isOpen}
            inputRef={inputRef}
            onQueryChange={handleQueryChange}
            onOpenChange={setIsOpen}
            onSelect={handleSelect}
            onFocus={handleFocus}
            onRetry={handleSearchRetry}
          />

          {!hasPanel && query.length === 0 && (
            <div className="popular">
              <span className="popular__label">Prova con</span>
              <div className="popular__list">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    type="button"
                    className="chip"
                    key={term}
                    onClick={() => handlePopular(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasPanel && query.trim().length === 1 && (
            <p className="search-note">Continua a scrivere…</p>
          )}
        </section>

        {detailStatus === 'loading' && (
          <div className="panel-slot">
            <ResultCardSkeleton />
          </div>
        )}

        {details && detailStatus === 'success' && (
          <div className="panel-slot">
            <ResultCard details={details} onReset={handleReset} />
          </div>
        )}

        {detailStatus === 'error' && (
          <div className="panel-slot">
            <div className="error-card" role="alert">
              <div className="error-card__icon">!</div>
              <div className="error-card__body">
                <span className="error-card__eyebrow">Ops</span>
                <h2>Non riusciamo a recuperare le indicazioni</h2>
                <p>
                  {detailError ??
                    'Il servizio non è disponibile in questo momento. Riprova tra poco.'}
                </p>
              </div>
              <div className="error-card__actions">
                <button
                  type="button"
                  className="button button--solid"
                  onClick={() => {
                    setDetailError(null)
                    setDetailStatus('loading')
                    setDetailAttempt((attempt) => attempt + 1)
                  }}
                >
                  Riprova
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={handleReset}
                >
                  Nuova ricerca
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>
          Dati e icone forniti da{' '}
          <a
            href="https://aliaestra.it/ambiente/raccolta-e-pulizia-strade/dove-lo-butto"
            target="_blank"
            rel="noreferrer"
          >
            Alia Estra
          </a>
          .
        </p>
        <span className="site-footer__dot" aria-hidden="true" />
        <p>Progetto dimostrativo, non affiliato al servizio ufficiale.</p>
      </footer>
    </div>
  )
}

export default App
