# Checkpoint 21 Handoff

Date: 2026-06-23

## Completed

- Inferred next task as `ADMIN SETTINGS REGRESSION CLEANUP` because checkpoint 20 left `[fill next task]` and `IranAPIBackend/settings.py` contained two `INSTALLED_APPS` assignments after the Jazzmin admin-theme work.
- Merged `INSTALLED_APPS` into one canonical list.
- Preserved required entries from both overwritten lists:
  - `whitenoise.runserver_nostatic`
  - `jazzmin` before `django.contrib.admin`
  - `rest_framework.authtoken`
  - `corsheaders`
  - `api`
- Added regression coverage verifying:
  - no duplicate installed apps
  - Whitenoise runserver static override remains installed
  - DRF token auth app remains installed
  - Jazzmin loads before Django admin

## Validation

- `python manage.py check` passes.
- `python manage.py findstatic api/admin-theme.css --verbosity 0` finds the custom admin stylesheet.
- `git diff --check` passes with only existing LF-to-CRLF Git warnings.
- `python manage.py test` passes: 44 tests.

## Git Notes

- Latest completed checkpoint before this was `a2caf08 checkpoint: add django admin theme`.
- This checkpoint should commit:
  - `IranAPIBackend/settings.py`
  - `api/tests.py`
  - `CHECKPOINT_21_HANDOFF.md`

## Next Checkpoint Prompt

```text
Continue from checkpoint 21.
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
