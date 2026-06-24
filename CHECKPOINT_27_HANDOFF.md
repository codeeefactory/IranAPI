# Checkpoint 27 Handoff

Date: 2026-06-24

## Completed

- Continued from checkpoint 26 without redoing Recharts migration work.
- Checked repo state first:
  - Working tree was clean.
  - Latest commit before this checkpoint was `23f2939 checkpoint: migrate frontend charts to recharts 3`.
- Reviewed Zod 4 migration surface:
  - No frontend source imports `zod`.
  - No frontend source imports `zodResolver`.
  - Zod appears only as a direct package dependency.
- Checked official Zod 4 migration guide:
  - Install target is `zod@^4`.
  - Common code migrations include `message` to `error`, `.errors` to `.issues`, and string-format API deprecations, but none apply because there is no local Zod source usage.
- Checked `@hookform/resolvers` compatibility surface:
  - Installed `@hookform/resolvers@3.10.0` has `react-hook-form` peer only.
  - No local resolver usage, so resolver major was left for its own checkpoint.
- Upgraded frontend dependency `zod` from `^3.25.76` to `^4.4.3`.
- Updated `package-lock.json` through `npm install zod@^4.4.3`.

## Validation

- `npm run lint` passes.
- `npx tsc -b` passes.
- `npm run build` passes.
- `npm audit --audit-level=moderate` passes with 0 vulnerabilities.
- `npm ls zod --depth=0` confirms `zod@4.4.3`.
- `npm outdated --json` no longer reports Zod.

## Remaining Dependency Notes

- `npm outdated --json` still reports intentional major-version candidates:
  - React/React DOM 19 and matching `@types/react`/`@types/react-dom` 19
  - React Router 7
  - `@hookform/resolvers` 5
  - Lucide React 1.x
  - `react-day-picker` 10
  - `next-themes` 0.4
  - TypeScript 6
  - ESLint helper package major lines (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@types/node`)
- `typescript-eslint` remains pinned to `~8.50.0` from checkpoint 25 because newer `8.62.x` pulled an incompatible local engine warning through `eslint-visitor-keys@5`.

## Git Notes

- This checkpoint should commit:
  - `api-hub-express/package.json`
  - `api-hub-express/package-lock.json`
  - `CHECKPOINT_27_HANDOFF.md`

## Next Checkpoint Prompt

```text
Continue from checkpoint 27.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: FRONTEND HOOKFORM RESOLVERS 5 MIGRATION REVIEW.
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
