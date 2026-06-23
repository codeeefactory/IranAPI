# Checkpoint 22 Handoff

Date: 2026-06-23

## Completed

- Inferred next task as `GENERATED ARTIFACT TRACKING CLEANUP - TEMP/VENV/ZIP` because checkpoint 21 left `[fill next task]` and repo still tracked local run logs, frontend source zip bundles, and root virtualenv files.
- Added ignore rules for:
  - root `bin/`
  - root `pyvenv.cfg`
  - root `lib64` symlink/path
  - root `.tmp*.err`
  - `api-hub-express/.tmp*.err`
  - `api-hub-express/*.zip`
- Removed tracked generated artifacts from Git index while preserving local files:
  - root `.tmp*.err` stderr logs
  - `api-hub-express/.tmp*.err` Vite/preview stderr logs
  - `api-hub-express/api-hub-express.zip`
  - `api-hub-express/src.zip`
  - root virtualenv files under `bin/`, `lib64`, and `pyvenv.cfg`

## Validation

- `git check-ignore` confirms representative temp logs, zip bundles, root venv files, and `lib64` are ignored.
- Filtered `git ls-files` confirms no tracked `.err`, `.zip`, root `bin/`, `lib64`, or `pyvenv.cfg` artifacts remain.
- Local existence check confirms representative files still exist after `git rm --cached`.
- `git diff --cached --check` passes.
- `git diff --check` passes with only existing LF-to-CRLF Git warning on `.gitignore`.
- `python manage.py check` passes.

## Git Notes

- Latest completed checkpoint before this was `a4af18d checkpoint: clean admin settings regression`.
- This checkpoint should commit:
  - `.gitignore`
  - index deletions for generated temp/zip/venv artifacts
  - `CHECKPOINT_22_HANDOFF.md`
- No application tests were run because this checkpoint only changes artifact tracking and ignore rules.

## Next Checkpoint Prompt

```text
Continue from checkpoint 22.
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
