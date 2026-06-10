# Checkpoint 15 Handoff

Date: 2026-06-10

## Completed

- Inferred next task as `SOCIAL AUTH QUERY INTEGRATION` because checkpoint 14 left `[fill next task]`, the frontend social auth panel was still local/hardcoded, and the backend social start endpoint had stray rating code.
- Fixed `GET /api/v1/auth/social/{provider}/start/`:
  - disabled configured providers now return `social_provider_disabled`
  - unknown providers still return 404
  - enabled providers redirect to configured `auth_url`
  - optional `next` is forwarded as OAuth `state` when no state already exists
- Added backend tests for:
  - disabled provider rejection
  - unknown provider rejection
  - enabled provider redirect with `state`
- Added React Query hooks:
  - `useSocialProviders()`
  - `useStartSocialLogin()`
- Wired `SocialAuth` to backend provider discovery instead of local hardcoded provider buttons.
- Social buttons now reflect configured backend providers, show disabled-provider errors, and preserve loading/error states.

## Validation

- `python manage.py test api.tests.MongoApiTests.test_social_auth_providers_are_discoverable api.tests.MongoApiTests.test_social_auth_start_rejects_disabled_provider api.tests.MongoApiTests.test_social_auth_start_rejects_unknown_provider api.tests.MongoApiTests.test_social_auth_start_redirects_enabled_provider`: pass.
- `python manage.py test`: pass, 43 tests.
- `npm run build` in `api-hub-express`: pass.
- Known warning: Browserslist/caniuse-lite data is old.

## Git Notes

- Worktree still contains large pre-existing frontend/static changes from earlier checkpoints; do not revert them.
- Several frontend source files remain untracked from earlier checkpoint work.
- `api-hub-express/src/lib/*.ts*` is covered by root `.gitignore` `lib/`; force-add may be needed for lib files.
- This checkpoint stages social auth backend/frontend source files and this handoff only.
- `npm run build` emitted local build output; this checkpoint did not stage static bundle churn.

## Next Checkpoint Prompt

```text
Continue from checkpoint 15.
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
