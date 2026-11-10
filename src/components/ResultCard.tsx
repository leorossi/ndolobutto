import type { CSSProperties } from 'react'
import type { JunkerDetails } from '../api/junker'
import { toDataUrl, toHexColor, toRgbaColor } from '../utils/colors'

interface ResultCardProps {
  details: JunkerDetails
  onReset: () => void
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M16 22h32l-2.8 32.2A5 5 0 0 1 40.2 59H23.8a5 5 0 0 1-5-4.8L16 22Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 22v-5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5M11 22h42"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M27 33v14M37 33v14"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ResultCard({ details, onReset }: ResultCardProps) {
  return (
    <article className="result" aria-live="polite">
      <header className="result__header">
        <div>
          <span className="result__eyebrow">
            <span className="result__eyebrow-dot" aria-hidden="true" />
            Risultato
          </span>
          <h2 className="result__title">{details.genericDesc}</h2>
        </div>

        <button type="button" className="button button--ghost" onClick={onReset}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle
              cx="9"
              cy="9"
              r="5.75"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="m13.5 13.5 3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Nuova ricerca
        </button>
      </header>

      <p className="result__lead">
        {details.bins.length > 1
          ? 'Puoi conferirlo in più modi. Scegli l’opzione più comoda per te:'
          : 'Questo oggetto va conferito qui:'}
      </p>

      <ul
        className={`bins${details.bins.length === 1 ? ' bins--single' : ''}`}
      >
        {details.bins.map((bin) => {
          const hex = toHexColor(bin.color)
          const iconUrl = toDataUrl(bin.icon)
          const style = {
            '--bin-color': hex,
            '--bin-tint': toRgbaColor(bin.color, 0.12),
            '--bin-tint-strong': toRgbaColor(bin.color, 0.22),
          } as CSSProperties

          return (
            <li className="bin" key={bin.binId} style={style}>
              <div className="bin__icon">
                {iconUrl ? (
                  <span
                    className="bin__icon-glyph"
                    style={
                      {
                        '--bin-icon': `url("${iconUrl}")`,
                      } as CSSProperties
                    }
                  />
                ) : (
                  <TrashIcon />
                )}
              </div>

              <div className="bin__body">
                <span className="bin__label">Contenitore</span>
                <h3 className="bin__name">{bin.desc}</h3>
                <span className="bin__swatch">
                  <span aria-hidden="true" />
                  {hex.toUpperCase()}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <footer className="result__footer">
        <p>
          Le regole possono cambiare da comune a comune. In caso di dubbio,
          consulta la guida ufficiale.
        </p>
        <a
          className="result__link"
          href="https://aliaestra.it/ambiente/raccolta-e-pulizia-strade/dove-lo-butto"
          target="_blank"
          rel="noreferrer"
        >
          Guida Alia Estra
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
      </footer>
    </article>
  )
}

export function ResultCardSkeleton() {
  return (
    <div className="result result--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--eyebrow" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--lead" />
      <div className="result__skeleton-bins">
        <div className="skeleton skeleton--bin" />
        <div className="skeleton skeleton--bin" />
      </div>
    </div>
  )
}
