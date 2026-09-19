# IranAPI CLI

Official command-line client for IranAPI catalog, documentation, compressed-project analysis/deployment, OpenAPI schema, and public API caller.

## Install

Requires Node.js 20 or newer.

```bash
# stable path exists on every generated deployment hostname
npm install --global https://YOUR_CURRENT_DOMAIN/downloads/iranapi-cli.tgz
```

No domain is baked into the CLI. The website publishes `/cli/manifest.json` from every new hostname. Connect once after a hostname rotation; no source edit, rebuild, or reinstall is required:

```bash
# option A: discover + persist current runtime (recommended for temporary domains)
iranapi connect https://YOUR_CURRENT_DOMAIN

# option B: environment variable (recommended for CI)
export IRANAPI_API_URL=https://YOUR_CURRENT_DOMAIN/api/v1

# option C: one-off flag
iranapi --api-url https://YOUR_CURRENT_DOMAIN/api/v1 doctor

# option D: persist during login
iranapi login --api-url https://YOUR_CURRENT_DOMAIN/api/v1
```

After the URL is configured once (via any of these methods), commands work without repeating it until the domain changes.

## Commands

```bash
iranapi doctor
iranapi apis list --search weather --limit 10
iranapi apis get open-weather
iranapi docs search authentication --api open-weather
iranapi call GET "https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current=temperature_2m"
iranapi schema --out openapi.json
iranapi request GET catalog/apis/ --json
iranapi analyze ./my-api.zip --json
iranapi deploy ./my-api.tar.gz --name "My API" --region ir-tehran-1 --json

# temporary/local domain-safe usage
IRANAPI_API_URL=https://your-current-host.example/api/v1 iranapi doctor
```

`iranapi call` is public and needs no IranAPI account. It accepts any public HTTP(S) URL allowed by server-side caller policy.

`iranapi analyze` and `iranapi deploy` accept `.zip`, `.tar`, `.tar.gz`, and `.tgz`. Managed runtime detection covers Java, JavaScript, TypeScript, Python, C++, and C#. Uploaded source is inspected statically and never executed by the web request. Deploy submits it to the worker, waits through `queued` and `building`, then returns the live URL. Use `--no-wait` to return immediately or `--timeout <seconds>` to set the build deadline.

## Authentication

Open browser, sign in, and store CLI token:

```bash
iranapi login
iranapi whoami
```

If website uses a different origin from API:

```bash
iranapi login --browser-url https://iranapi.example
```

Token login remains available for automation:

```bash
iranapi login --token iapi_your_token
iranapi whoami
iranapi logout
```

Credential precedence is `--token`, `IRANAPI_TOKEN`, then `~/.iranapi/config.json`. Config file is written with owner-only permissions where supported. Tokens are never included in normal output; `doctor` prints only a redacted preview.

For CI, prefer environment variables:

```bash
IRANAPI_API_URL=https://example.com/api/v1 IRANAPI_TOKEN=... iranapi --json whoami
```

## Stable JSON

Pass global `--json` before or after a command. Successful commands emit the backend JSON response. CLI failures emit:

```json
{
  "ok": false,
  "error": {
    "code": "auth_required",
    "message": "Authentication required.",
    "status": 401
  }
}
```

## Development

```bash
npm install
npm test
npm link
iranapi doctor
```
