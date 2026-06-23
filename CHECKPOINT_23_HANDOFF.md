# Checkpoint 23 Handoff

Date: 2026-06-23

## Completed

- Inferred next task as `API KEY STORAGE HARDENING` because checkpoint 22 left `[fill next task]`, core checks passed, and `REPO_MAP.md` flagged plaintext API key storage as a future security checkpoint.
- Updated Mongo profile key rotation to stop storing raw API keys:
  - stores `profile.api_key_hash`
  - stores `profile.api_key_preview`
  - clears legacy `profile.api_key`
  - returns the raw key only as transient `_api_key_secret` from repository code
- Updated `/api/v1/account/api-key/rotate/` to return the raw key once in top-level `api_key`, while profile payload remains preview-only.
- Updated profile serialization to support hashed-key profiles and legacy raw-key profiles without exposing raw stored secrets.
- Updated dashboard key rotation UI/types to show the one-time key from the rotation response without caching it into the profile.
- Updated backend tests to assert no raw API key is persisted and no raw key appears in profile payloads.

## Validation

- `python manage.py test api` passes: 44 tests.
- `npm run build` passes.
- `npm run lint` still fails on pre-existing unrelated lint debt:
  - `src/lib/i18n.tsx` empty blocks
  - `src/routes/api.$slug.tsx` explicit `any`
  - `src/routes/signup.tsx` explicit `any`
  - `tailwind.config.ts` `require()` import
  - existing Fast Refresh warnings in shared UI files
- Touched `dashboard.tsx` no longer appears in lint errors after fixing its `any` helper types.

## Git Notes

- Latest completed checkpoint before this was `1458ce6 checkpoint: clean local artifact tracking`.
- This checkpoint should commit:
  - `api/repositories.py`
  - `api/serializers.py`
  - `api/views.py`
  - `api/tests.py`
  - `api-hub-express/src/lib/api-client.ts`
  - `api-hub-express/src/routes/dashboard.tsx`
  - `CHECKPOINT_23_HANDOFF.md`
- Build may emit ignored `api-hub-express/dist` changes only.

## Next Checkpoint Prompt

```text
Continue from checkpoint 23.
Use Caveman output mode.
Read repo first.
Check git status and latest commit.
Do not redo completed checkpoint work.
Next task: FRONTEND LINT DEBT CLEANUP.
Follow checkpoint rules:
- implement
- validate
- fix
- commit
- report
- create next-chat handoff
- stop
```
