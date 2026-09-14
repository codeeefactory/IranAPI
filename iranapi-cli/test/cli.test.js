import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { archiveContentType, buildUrl, normalizeLimit, parseHeaders, requestJson } from "../dist/api.js";
import { redactToken, resolveSettings } from "../dist/config.js";
import { browserBaseUrl } from "../dist/browser-auth.js";

describe("URL construction", () => {
  it("keeps API base path and adds query", () => {
    assert.equal(
      buildUrl("http://localhost:8000/api/v1", "/catalog/apis/", { search: "weather", page_size: 5 }).toString(),
      "http://localhost:8000/api/v1/catalog/apis/?search=weather&page_size=5",
    );
  });

  it("allows absolute URLs for raw requests", () => {
    assert.equal(buildUrl("http://localhost:8000/api/v1", "https://example.com/status").toString(), "https://example.com/status");
  });
});

describe("input validation", () => {
  it("parses repeated headers and preserves colons in values", () => {
    assert.deepEqual(parseHeaders(["Accept: application/json", "X-Time: 12:30"]), {
      Accept: "application/json",
      "X-Time": "12:30",
    });
  });

  it("recognizes supported project archives", () => {
    assert.equal(archiveContentType("service.zip"), "application/zip");
    assert.equal(archiveContentType("service.tar.gz"), "application/gzip");
    assert.equal(archiveContentType("service.tgz"), "application/gzip");
    assert.equal(archiveContentType("service.tar"), "application/x-tar");
    assert.throws(() => archiveContentType("service.rar"), /zip/);
  });

  it("rejects malformed headers and limits", () => {
    assert.throws(() => parseHeaders(["broken"]), /Expected/);
    assert.throws(() => normalizeLimit(0), /1 to 100/);
    assert.throws(() => normalizeLimit(101), /1 to 100/);
    assert.equal(normalizeLimit("20"), 20);
  });

  it("rejects GET and HEAD request bodies before network access", async () => {
    const settings = { apiUrl: "http://127.0.0.1:1/api/v1", token: undefined };
    await assert.rejects(
      requestJson(settings, "GET", "catalog/apis/", { body: {} }),
      (error) => error.code === "invalid_request" && /GET requests/.test(error.message),
    );
    await assert.rejects(
      requestJson(settings, "HEAD", "system/health/", { body: {} }),
      (error) => error.code === "invalid_request" && /HEAD requests/.test(error.message),
    );
  });
});

describe("auth settings", () => {
  it("uses flag, environment, then config precedence", () => {
    assert.equal(resolveSettings({ token: "flag" }, { token: "config" }, { IRANAPI_TOKEN: "env" }).token, "flag");
    assert.equal(resolveSettings({}, { token: "config" }, { IRANAPI_TOKEN: "env" }).token, "env");
    assert.equal(resolveSettings({}, { token: "config" }, {}).token, "config");
  });

  it("redacts tokens", () => {
    assert.equal(redactToken("iapi_1234567890"), "iapi...7890");
    assert.equal(redactToken("short"), "********");
  });
});

describe("browser authentication", () => {
  it("derives website origin from API URL and accepts an override", () => {
    assert.equal(browserBaseUrl("https://iranapi.example/api/v1"), "https://iranapi.example");
    assert.equal(browserBaseUrl("http://localhost:8000/api/v1", "http://localhost:5173/signin"), "http://localhost:5173");
  });
});

it("renders executable help", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Usage: iranapi /);
  assert.match(result.stdout, /IranAPI catalog/);
  assert.match(result.stdout, /doctor/);
  assert.match(result.stdout, /call/);
  assert.match(result.stdout, /analyze/);
  assert.match(result.stdout, /deploy/);
});
