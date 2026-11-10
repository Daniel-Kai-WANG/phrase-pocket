# Phrase Pocket

A personal English practice journal with scenario quests, daily expressions, spaced review and speaking practice. Definitions, hints and feedback use plain English.

## Development

Requires Node.js 22.12 or later. Run `npm install`, then `npm run dev`. Copy `.env.example` to `.env.local` for the private coaching service and run `npm run dev:server`.

## Checks

Run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`. Run `npm run test:e2e` with the Playwright Chromium and WebKit engines installed for browser regressions. The suite starts an isolated development server on port 5197 under the Pages subpath and uses test-only coaching responses. It does not test provider judgement, real microphone capture or an installed iPhone app. Test fixtures are isolated from personal learning records.

## Storage

Learning progress stays on the current device. Export a backup before changing devices or clearing browser storage. Recorded audio is kept only for the current speaking session unless explicitly downloaded.

## Publication

The static frontend targets GitHub Pages. The private coaching service runs separately and keeps credentials on the server. See [publication setup and recovery](docs/deployment.md) and [verified implementation status](docs/implementation-status.md).
