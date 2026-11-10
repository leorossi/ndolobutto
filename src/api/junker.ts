const API_BASE_URL =
  import.meta.env.VITE_JUNKER_API_BASE_URL ??
  'https://bff.aliaserviziambientali.it'

const CODICE_ISTAT_COMUNE =
  import.meta.env.VITE_CODICE_ISTAT_COMUNE ?? '048050'

const appInfo = {
  platform: 'Android',
  platformVersion: '4.1.2',
  deviceUid: 'a9e77e63b3d9478d',
  codiceIstatComune: CODICE_ISTAT_COMUNE,
  lang: 'IT',
} as const

export interface JunkerSuggestion {
  genericId: number
  desc: string
}

export interface JunkerBin {
  binId: number
  desc: string
  color: number
  icon: string
}

export interface JunkerDetails {
  genericDesc: string
  bins: JunkerBin[]
}

export class JunkerApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'JunkerApiError'
    this.status = status
  }
}

async function post<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new JunkerApiError(
      `Il servizio ha risposto con un errore (${response.status}).`,
      response.status,
    )
  }

  return (await response.json()) as T
}

export function searchObjects(
  query: string,
  signal?: AbortSignal,
): Promise<JunkerSuggestion[]> {
  const term = query.trim()

  if (!term) {
    return Promise.resolve([])
  }

  return post<JunkerSuggestion[]>(
    '/api/v1/reserved-area/junker/autocomplete',
    { appInfo, query: term },
    signal,
  )
}

export function getObjectDetails(
  genericId: number,
  signal?: AbortSignal,
): Promise<JunkerDetails> {
  return post<JunkerDetails>(
    '/api/v1/reserved-area/junker/details',
    { appInfo, genericId },
    signal,
  )
}
