# Checkpoint 25 Handoff

Date: 2026-06-24

## Completed

- Continued from checkpoint 24 without redoing frontend lint cleanup.
- Reviewed frontend dependency health in `api-hub-express`.
- Ran `npm outdated --json` and `npm audit --json`.
- Updated dependency lockfile within existing semver ranges via `npm update`.
- Bumped direct dev dependency `vite` from `^5.4.19` to `^6.4.3` because audit showed remaining Vite/esbuild advisories required Vite `6.4.3`.
- Pinned `typescript-eslint` to `~8.50.0` because latest `8.62.x` pulled `eslint-visitor-keys@5`, which warns on current local Node `22.11.0`; `8.50.1` validates cleanly and keeps Node engine compatibility.
- Updated transitive frontend packages, including patched `react-router-dom`/`react-router` `6.30.4`, patched Vite/esbuild/Rollup tree, and other safe patch/minor lockfile updates.
- Attempted `npx update-browserslist-db@latest`; it failed because `bun.lockb` made updater choose Bun, but Bun is not installed. Targeted `npm update caniuse-lite browserslist` reported up to date, and build no longer prints the stale Browserslist warning.

## Validation

- `npm run lint` passes.
- `npm audit --audit-level=moderate` passes with 0 vulnerabilities.
- `npm run build` passes on Vite `6.4.3`.
- `npm ls eslint-visitor-keys` shows no `eslint-visitor-keys@5`; no engine warning after pinning `typescript-eslint`.

## Remaining Dependency Notes

- `npm outdated --json` still reports intentional major-version candidates:
  - React/React DOM 19
  - React Router 7
  - Recharts 3
  - Zod 4
  - `@hookform/resolvers` 5
  - Lucide React 1.x
  - several ESLint plugin/globals/type major lines
- `recharts@2.15.4` now reports deprecation metadata in lockfile; migration to Recharts 3 should be a separate UI/chart validation checkpoint.

## Git Notes

- Latest completed checkpoint before this was `e7e0a10 checkpoint: clean frontend lint debt`.
- This checkpoint should commit:
  - `api-hub-express/package.json`
  - `api-hub-express/package-lock.json`
  - `CHECKPOINT_25_HANDOFF.md`

## Next Checkpoint Prompt

```text
Continue from checkpoint 25.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: FRONTEND RECHARTS 3 MIGRATION REVIEW.
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
