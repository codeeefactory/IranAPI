# Checkpoint 16 Handoff

Date: 2026-06-10

## Completed

- Inferred next task as `E2E CRAWLER + METADATA STABILIZATION` because checkpoint 15 left `[fill next task]` and Playwright specs still targeted older Persian/mojibake route copy and DOM.
- Updated frontend metadata in `api-hub-express/index.html`:
  - readable IranAPI title
  - readable description
  - removed stale `40,000 API` claim
  - updated OpenGraph/Twitter metadata
- Added `api-hub-express/playwright.config.ts`:
  - `e2e` test directory
  - Chromium project
  - `PLAYWRIGHT_BASE_URL` support
  - optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for local Chrome/Edge when Playwright browser download is blocked
- Added `@playwright/test` dev dependency.
- Updated `e2e/crawl.spec.ts` to match current cyber UI:
  - current route shell and `main#main`
  - current docs sections
  - current payment query param
  - current dashboard profile controls
  - current logout behavior
  - live-empty-catalog/fallback API detail behavior
- Updated `e2e/page-health.spec.ts` to ignore external CDN font CORS noise while still failing real page/runtime errors.

## Validation

- `python manage.py test`: pass, 43 tests.
- `npm run build` in `api-hub-express`: pass.
- `npx playwright test --config=playwright.config.ts --reporter=list` in `api-hub-express`: pass, 15 tests.
  - Used local Chrome because `npx playwright install chromium` was blocked by `cdn.playwright.dev` DNS/location errors.
  - Command used: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'`.
- Known warning: Browserslist/caniuse-lite data is old.
- `npm install --save-dev @playwright/test` reported 13 audit findings (5 moderate, 8 high); no audit fixes applied.

## Git Notes

- Worktree still contains large pre-existing frontend/static changes from earlier checkpoints; do not revert them.
- Several frontend source files remain untracked from earlier checkpoint work.
- This checkpoint stages E2E specs/config, metadata, npm manifests, and this handoff only.
- `npm run build` emitted local `dist` output; this checkpoint did not stage static bundle churn.
- Temporary Django/Vite processes used for E2E were stopped.

## Next Checkpoint Prompt

```text
Continue from checkpoint 16.
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
