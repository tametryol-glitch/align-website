#!/usr/bin/env node
/**
 * Bulk-import Cosmic Frequencies from a CSV into the registry.
 *
 *   node scripts/import-frequencies.mjs <input.csv> [--source community]
 *
 * Expected columns (header row required, order irrelevant):
 *
 *   code      the numeric sequence, e.g. "520 741 8"   (required)
 *   title     short user-facing name                   (required)
 *   domain    health|money|love|career|protection|spiritual (required)
 *   themes    one or more theme keys, ; separated      (required)
 *   intent    second person, what it is for            (required)
 *   severity  1|2|3 - defaults to 3 for health, 2 otherwise
 *   source    community|derived - defaults to --source
 *
 * Everything imported lands as verified:false. Flipping that flag is a
 * deliberate, per-entry decision made after checking an entry against its
 * source; nothing in this script may set it, because an importer that can
 * mark its own output as verified defeats the gate it is feeding.
 *
 * Writes src/data/cosmicFrequencies/imported.ts and wires it into the
 * registry. Existing hand-written domain files are never touched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'cosmicFrequencies');

const DOMAINS = new Set([
  'health', 'money', 'love', 'career', 'protection', 'spiritual',
]);

/** Parse the theme union straight out of types.ts so the two cannot drift. */
function loadThemeKeys() {
  const src = fs.readFileSync(path.join(DATA_DIR, 'types.ts'), 'utf8');
  const m = src.match(/export type FrequencyTheme\s*=(.*?);/s);
  if (!m) throw new Error('FrequencyTheme union not found in types.ts');
  return new Set([...m[1].matchAll(/'([a-z0-9-]+)'/g)].map((x) => x[1]));
}

/** Minimal RFC4180-ish CSV reader: quoted fields, escaped quotes, CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (c === '\r') continue;
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function main() {
  const [, , inputPath, ...rest] = process.argv;
  if (!inputPath) {
    console.error('usage: node scripts/import-frequencies.mjs <input.csv> [--source community]');
    process.exit(1);
  }

  const sourceFlag = rest.includes('--source')
    ? rest[rest.indexOf('--source') + 1]
    : 'community';
  if (!['community', 'derived'].includes(sourceFlag)) {
    console.error(`--source must be "community" or "derived", got "${sourceFlag}"`);
    process.exit(1);
  }

  const THEMES = loadThemeKeys();
  const rows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
  const header = rows.shift().map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);

  for (const required of ['code', 'title', 'domain', 'themes', 'intent']) {
    if (col(required) === -1) {
      console.error(`missing required column: ${required}`);
      process.exit(1);
    }
  }

  const out = [];
  const seenCode = new Set();
  const seenId = new Set();
  const errors = [];
  let skippedDuplicate = 0;

  rows.forEach((r, idx) => {
    const line = idx + 2; // 1-indexed, plus the header
    const get = (n) => (col(n) === -1 ? '' : (r[col(n)] ?? '').trim());

    const code = get('code');
    const title = get('title');
    const domain = get('domain').toLowerCase();
    const intent = get('intent');
    const themes = get('themes').split(/[;|]/).map((s) => s.trim()).filter(Boolean);

    if (!/^[\d ]+$/.test(code)) {
      errors.push(`line ${line}: code must be digits and spaces only ("${code}")`);
      return;
    }
    const digits = code.replace(/\D/g, '');
    if (digits.length < 3 || digits.length > 13) {
      errors.push(`line ${line}: code has ${digits.length} digits, expected 3-13`);
      return;
    }
    if (!DOMAINS.has(domain)) {
      errors.push(`line ${line}: unknown domain "${domain}"`);
      return;
    }
    if (!title) { errors.push(`line ${line}: title is required`); return; }
    if (!intent) { errors.push(`line ${line}: intent is required`); return; }
    if (themes.length === 0) { errors.push(`line ${line}: at least one theme required`); return; }

    const badThemes = themes.filter((t) => !THEMES.has(t));
    if (badThemes.length) {
      errors.push(`line ${line}: unknown theme(s) ${badThemes.join(', ')}`);
      return;
    }

    if (seenCode.has(digits)) { skippedDuplicate++; return; }
    seenCode.add(digits);

    let id = `${domain}-${slugify(title)}`;
    let n = 2;
    while (seenId.has(id)) id = `${domain}-${slugify(title)}-${n++}`;
    seenId.add(id);

    const severityRaw = get('severity');
    const severity = severityRaw
      ? Number(severityRaw)
      : (domain === 'health' ? 3 : 2);
    if (![1, 2, 3].includes(severity)) {
      errors.push(`line ${line}: severity must be 1, 2 or 3`);
      return;
    }
    if (domain === 'health' && severity !== 3) {
      errors.push(`line ${line}: health entries must be severity 3`);
      return;
    }

    const source = get('source') || sourceFlag;
    if (!['community', 'derived'].includes(source)) {
      errors.push(`line ${line}: source must be "community" or "derived"`);
      return;
    }

    out.push({ id, code, title, domain, themes, intent, severity, source });
  });

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n`);
    errors.slice(0, 40).forEach((e) => console.error('  ' + e));
    if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
    process.exit(1);
  }

  out.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const body = out.map((f) => `  {
    id: '${f.id}',
    code: '${f.code}',
    title: '${esc(f.title)}',
    domain: '${f.domain}',
    themes: [${f.themes.map((t) => `'${t}'`).join(', ')}],
    intent:
      '${esc(f.intent)}',
    severity: ${f.severity},
    source: '${f.source}',
    verified: false,
  },`).join('\n');

  const file = `/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — imported entries.

   GENERATED by scripts/import-frequencies.mjs. Do not hand-edit: the
   next import overwrites this file. Corrections belong in the source
   CSV, which is re-imported.

   Everything here is verified:false, so none of it can reach a push
   until it has been checked against its source and promoted
   deliberately. The importer cannot set that flag.
   ────────────────────────────────────────────────────────────── */

import type { CosmicFrequency } from './types';

export const IMPORTED_FREQUENCIES: CosmicFrequency[] = [
${body}
];
`;

  fs.writeFileSync(path.join(DATA_DIR, 'imported.ts'), file, 'utf8');

  console.log(`\nimported ${out.length} frequencies -> src/data/cosmicFrequencies/imported.ts`);
  if (skippedDuplicate) console.log(`skipped ${skippedDuplicate} duplicate code(s)`);
  console.log('\nNext: add IMPORTED_FREQUENCIES to COSMIC_FREQUENCIES in index.ts,');
  console.log('then copy the data folder to align-app (the parity test enforces this).');
}

main();
