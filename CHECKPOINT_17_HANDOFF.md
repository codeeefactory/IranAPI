# Checkpoint 17 Handoff

Date: 2026-06-14

## Completed

- Inferred next task as `STATIC FRONTEND BUNDLE SYNC` because checkpoint 16 fixed source metadata and crawler expectations, but `frontend_static/index.html` still served stale mojibake Persian metadata with the old `40,000 API` claim.
- Rebuilt the Vite frontend from `api-hub-express`.
- Synced the generated production build into Django-served `frontend_static`.
- Cleaned old static asset hashes from `frontend_static/assets` so the served bundle matches the current `dist` output.
- Verified `frontend_static/index.html` now uses the fixed IranAPI title, description, Twitter site, and current hashed assets.

## Validation

- `python manage.py test`: pass, 43 tests.
- `npm run build` in `api-hub-express`: pass.
- `npx playwright test --config=playwright.config.ts --reporter=list` in `api-hub-express`: pass, 15 tests.
  - Used local Chrome via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when present.
  - Started local Django on `127.0.0.1:8000` with `--noreload`.
  - Started Vite preview on `127.0.0.1:4173`.
- `rg -n "40,000|lovable_dev|Ø|Ù|Û" frontend_static/index.html api-hub-express/index.html`: no matches.
- Known warning: Browserslist/caniuse-lite data is old.

## Git Notes

- Worktree still contains large pre-existing frontend source changes from earlier checkpoints; do not revert them.
- This checkpoint stages only `frontend_static` bundle sync and this handoff.
- Playwright removed prior tracked failure artifacts under `api-hub-express/test-results`; those generated test-result deletions were not staged.

## Next Checkpoint Prompt

```text
Continue from checkpoint 17.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: [fill next task]
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
