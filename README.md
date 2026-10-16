# Full Stack Open — Part 7: Hooks, monorepo, error handling, styling

Separate submission repository for Part 7 (as required by the course),
copied from https://github.com/fullstack-hy2020/fs-extension.

My other submissions (parts 0–5) live in
https://github.com/aslamalkarywk7/fullstackopen,
part 6 in https://github.com/aslamalkarywk7/fullstackopen-part6.

## routed-anecdotes (7.1–7.6)

- `src/hooks/index.js`: `useField` (type/value/onChange/reset) and
  `useAnecdotes` (fetch/add/delete via the Fetch API service, components
  call the hook directly, no props passed from `App`).
- Spread field props into inputs (reset destructured out, no React warnings).

```bash
cd routed-anecdotes
npm install
npm run server  # json-server :3001 (separate terminal)
npm run dev
```

## bloglist (7.7–7.20)

Monorepo: `server/` (Express + Mongoose, comments + testing reset) and
`client/` (Vite + React + Zustand + React Router + MaterialUI).

```bash
cd bloglist
npm install --prefix server && npm install --prefix client
npm run dev   # runs both via concurrently
```

- 7.7: monorepo layout, `npm run dev` starts both, backend serves the
  built frontend in production.
- 7.8: `ErrorBoundary` (nav stays outside, friendly fallback).
- 7.9: splat route → "Page not found".
- 7.10: Prettier configured (`npm run format` in client).
- 7.11–7.14: Zustand stores (notification, blogs, user).
- 7.15: `services/persistentUser.js` + `useField` in forms.
- 7.16–7.17: users table view + individual user view.
- 7.18–7.19: anonymous comments (`POST /api/blogs/:id/comments`).
- 7.20: MUI styling for the new views.
