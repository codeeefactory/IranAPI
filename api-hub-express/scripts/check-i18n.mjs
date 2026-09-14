import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/lib/i18n.tsx", import.meta.url), "utf8");
const languages = ["en", "fa", "ar", "tr", "es"];

function readDictionary(language) {
  const match = source.match(
    new RegExp(`const ${language}(?:\\s*:\\s*Dict)?\\s*=\\s*\\{([\\s\\S]*?)\\n\\}(?: as const| satisfies CompleteDict)?;`),
  );
  if (!match) throw new Error(`dictionary not found: ${language}`);

  const entries = new Map();
  for (const item of match[1].matchAll(/^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)",?$/gm)) {
    entries.set(item[1], item[2]);
  }
  return entries;
}

function placeholders(value) {
  return [...value.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();
}

const dictionaries = Object.fromEntries(languages.map((language) => [language, readDictionary(language)]));
const english = dictionaries.en;
const errors = [];

for (const language of languages.slice(1)) {
  const dictionary = dictionaries[language];
  const missing = [...english.keys()].filter((key) => !dictionary.has(key));
  const extra = [...dictionary.keys()].filter((key) => !english.has(key));
  if (missing.length) errors.push(`${language}: missing ${missing.join(", ")}`);
  if (extra.length) errors.push(`${language}: unknown ${extra.join(", ")}`);

  for (const [key, englishValue] of english) {
    const translatedValue = dictionary.get(key);
    if (translatedValue === undefined) continue;
    const expected = placeholders(englishValue).join(",");
    const actual = placeholders(translatedValue).join(",");
    if (expected !== actual) errors.push(`${language}.${key}: placeholders ${actual || "none"}; expected ${expected || "none"}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`i18n OK: ${english.size} keys × ${languages.length} languages`);
}
