# Checkpoint 18 Handoff

Date: 2026-06-14

## Completed

- Inferred next task as `FRONTEND SOURCE TRACKING CLEANUP` because checkpoint 17 synced the generated static bundle, but the source rewrite still had many untracked files and root `.gitignore` hid new `api-hub-express/src/lib/*` files.
- Added `.gitignore` exceptions so `api-hub-express/src/lib/` source files are trackable while root Python `lib/` ignores remain intact.
- Staged the route-based frontend source state:
  - new site components under `api-hub-express/src/components/site/`
  - new legal routes for `/terms` and `/privacy`
  - new `api-hub-express/src/styles.css`
  - new frontend lib error helpers
  - Vite/Tailwind config updates
  - removal of obsolete page/component/style files replaced by the route-based shell

## Validation

- `python manage.py test`: pass, 43 tests.
- `npm run build` in `api-hub-express`: pass.
- `npx playwright test --config=playwright.config.ts --reporter=list` in `api-hub-express`: pass, 15 tests.
  - Used local Chrome via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when present.
  - Started local Django on `127.0.0.1:8000` with `--noreload`.
  - Started Vite preview on `127.0.0.1:4173`.
- Known warning: Browserslist/caniuse-lite data is old.

## Git Notes

- Playwright removed prior tracked failure artifacts under `api-hub-express/test-results`; those generated test-result deletions remain unstaged.
- `api-hub-express/test-results/.last-run.json` remains untracked and unstaged.
- `api-hub-express/dist/` remains ignored.

## Next Checkpoint Prompt

```text
Continue from checkpoint 18.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: CLEAN GENERATED TEST ARTIFACT TRACKING.
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
