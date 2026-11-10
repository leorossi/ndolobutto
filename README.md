# Ndolobutto

> *Ndolobutto?* — “Where do I throw it?” in Tuscan dialect.

A small web app for waste sorting in Florence: type the name of an object and
instantly see which bin it belongs in.

**Live demo:** <https://ndolobutto.leorossi.online>

## Features

- Instant search with autocomplete, debounced input and cancellation of stale
  requests.
- Full keyboard navigation of suggestions (`↑`, `↓`, `Enter`, `Esc`).
- Result panel showing one or more bins, with the official icon and container
  color.
- Clear loading, empty and error states, with retry actions.
- Responsive layout and accessible markup (ARIA combobox, visible focus,
  `prefers-reduced-motion` support).

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- [Manrope](https://fontsource.org/fonts/manrope) via Fontsource

## Getting started

### Requirements

- Node.js 20.19+ (or 22.12+)
- npm 10+

### Install and run

```bash
git clone git@github.com:leorossi/ndolobutto.git
cd ndolobutto
npm install
npm run dev
```

Vite starts a local dev server (usually at <http://localhost:5173>).

### Available scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the development server with HMR.           |
| `npm run build`   | Type-check the project and create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally.              |
| `npm run lint`    | Lint the source with Oxlint.                     |

## Configuration

The app reads its configuration from Vite environment variables. Copy the
example file and adjust it if needed:

```bash
cp .env.example .env.local
```

| Variable                   | Default                              | Description                                  |
| -------------------------- | ------------------------------------ | -------------------------------------------- |
| `VITE_JUNKER_API_BASE_URL` | `https://bff.aliaserviziambientali.it` | Base URL of the Aliaservizi Ambientali BFF.  |
| `VITE_CODICE_ISTAT_COMUNE` | `048050`                             | ISTAT code of the municipality used in requests. |

Variables are inlined at build time, so rebuild the app after changing them.
Never commit `.env.local` or other local env files.

## API

Requests are sent directly from the browser to the Aliaservizi Ambientali BFF
(the endpoint allows cross-origin requests):

- `POST /api/v1/reserved-area/junker/autocomplete` with `{ appInfo, query }`
- `POST /api/v1/reserved-area/junker/details` with `{ appInfo, genericId }`

Both payloads include `appInfo`, which carries the municipality ISTAT code.

## Project structure

```text
src/
├── api/junker.ts          # API client and types
├── components/
│   ├── SearchBar.tsx      # combobox with autocomplete
│   └── ResultCard.tsx     # result card and loading skeleton
├── hooks/
│   └── useDebouncedValue.ts
├── utils/colors.ts        # color and icon helpers
├── App.tsx
├── App.css
└── index.css
```

## Deployment

`npm run build` produces a fully static site in `dist/`, which can be served by
any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, nginx, …).
Remember to set the environment variables in the build environment.

## Contributing

Contributions are welcome — bug reports, fixes and small improvements alike.

1. **Open an issue first** for anything non-trivial, so we can agree on the
   approach before you spend time on it.
2. **Fork** the repository and clone your fork.
3. **Create a branch** from `main`:

   ```bash
   git checkout -b feat/short-description
   ```

4. **Install dependencies** and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

5. **Make your changes**, keeping the existing structure, naming and code style.
6. **Check your work** before committing:

   ```bash
   npm run lint
   npm run build
   ```

7. **Commit** using a clear message, preferably following
   [Conventional Commits](https://www.conventionalcommits.org/):

   ```text
   feat: add keyboard shortcut to clear the search
   fix: handle empty API responses
   docs: improve contributing instructions
   ```

8. **Push** your branch and open a pull request against `main`. Describe what
   changed, why, and how you tested it.

### Guidelines

- Keep TypeScript strict and avoid `any` unless there is a good reason.
- Preserve accessibility: keyboard navigation, focus states and ARIA attributes.
- Avoid new dependencies when the platform or existing packages already cover
  the need.
- Keep the UI responsive and respect `prefers-reduced-motion`.
- Do not commit secrets, local env files or build output (`dist/`).

## Disclaimer

Data and icons are provided by
[Alia Estra](https://aliaestra.it/ambiente/raccolta-e-pulizia-strade/dove-lo-butto),
the waste management utility serving Florence. This is a demo project and is not
affiliated with the official service.
