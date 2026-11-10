import { useEffect, useRef, useState, type RefObject } from 'react'
import type { JunkerSuggestion } from '../api/junker'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

interface SearchBarProps {
  query: string
  suggestions: JunkerSuggestion[]
  status: SearchStatus
  error: string | null
  isOpen: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onOpenChange: (isOpen: boolean) => void
  onSelect: (suggestion: JunkerSuggestion) => void
  onFocus: () => void
  onRetry: () => void
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16.5 16.5 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5 11 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const term = query.trim()

  if (!term) return <>{text}</>

  const index = text
    .toLocaleLowerCase('it-IT')
    .indexOf(term.toLocaleLowerCase('it-IT'))

  if (index === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  )
}

export function SearchBar({
  query,
  suggestions,
  status,
  error,
  isOpen,
  inputRef,
  onQueryChange,
  onOpenChange,
  onSelect,
  onFocus,
  onRetry,
}: SearchBarProps) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (activeIndex < 0) return

    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    option?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const choose = (suggestion: JunkerSuggestion) => {
    setActiveIndex(-1)
    onSelect(suggestion)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        if (suggestions.length > 0) onOpenChange(true)
        return
      }
      if (suggestions.length === 0) return
      setActiveIndex((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        if (suggestions.length > 0) onOpenChange(true)
        return
      }
      if (suggestions.length === 0) return
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter') {
      if (!isOpen || suggestions.length === 0) return
      event.preventDefault()
      const index =
        activeIndex >= 0 && activeIndex < suggestions.length ? activeIndex : 0
      choose(suggestions[index])
      return
    }

    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault()
        onOpenChange(false)
        setActiveIndex(-1)
      }
      return
    }

    if (event.key === 'Tab') {
      onOpenChange(false)
    }
  }

  const showSkeleton = status === 'loading' && suggestions.length === 0
  const showEmpty =
    status === 'success' && suggestions.length === 0 && query.trim().length >= 2
  const showList = suggestions.length > 0
  const activeOptionId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `suggestion-${suggestions[activeIndex].genericId}`
      : undefined

  return (
    <div className="search">
      <div className={`search__field${isOpen ? ' search__field--open' : ''}`}>
        <span className="search__icon">
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          id="object-search"
          className="search__input"
          type="text"
          value={query}
          placeholder="Cerca un oggetto… es. tovagliolo"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          role="combobox"
          aria-label="Cerca un oggetto da smaltire"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-activedescendant={activeOptionId}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={() => onOpenChange(false)}
        />

        {status === 'loading' && (
          <span className="search__spinner" aria-label="Ricerca in corso" />
        )}

        {status !== 'loading' && query.length > 0 && (
          <button
            type="button"
            className="search__clear"
            aria-label="Cancella la ricerca"
            onClick={() => {
              onQueryChange('')
              onOpenChange(false)
              setActiveIndex(-1)
              inputRef.current?.focus()
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="m4.5 4.5 7 7m0-7-7 7"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search__dropdown">
          {status === 'error' && (
            <div className="search__message search__message--error">
              <span className="search__message-icon">!</span>
              <div>
                <strong>Qualcosa non ha funzionato</strong>
                <p>{error ?? 'Riprova tra qualche istante.'}</p>
                <button
                  type="button"
                  className="search__retry"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onRetry}
                >
                  Riprova
                </button>
              </div>
            </div>
          )}

          {showSkeleton && (
            <div className="search__skeleton" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div className="search__skeleton-row" key={row}>
                  <span />
                  <span />
                </div>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="search__message">
              <span className="search__message-icon">?</span>
              <div>
                <strong>Nessun oggetto trovato</strong>
                <p>
                  Prova con un termine più semplice, ad esempio “carta” o
                  “batteria”.
                </p>
              </div>
            </div>
          )}

          {showList && (
            <>
              <ul
                ref={listRef}
                id="search-suggestions"
                className="search__list"
                role="listbox"
                aria-label="Suggerimenti"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.genericId}
                    id={`suggestion-${suggestion.genericId}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    data-index={index}
                    className={`search__option${
                      index === activeIndex ? ' search__option--active' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(suggestion)}
                  >
                    <span className="search__option-dot" aria-hidden="true" />
                    <span className="search__option-text">
                      <HighlightedText
                        text={suggestion.desc}
                        query={query}
                      />
                    </span>
                    <span className="search__option-arrow" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="search__footer">
                <span>
                  {suggestions.length}{' '}
                  {suggestions.length === 1 ? 'risultato' : 'risultati'}
                </span>
                <span className="search__footer-hint">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>
                  per navigare · <kbd>↵</kbd> per aprire
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
