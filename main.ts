// Entry post-x-promote-make-your-own-bounty-01.
//
// The scored work here is the X post itself, not this program. This script
// only carries POST.json — the file that names the post — from the bot
// directory over to the output directory, where the house gate picks it up
// and reads the post's replies, reposts and quotes from X.
//
// Before handing the file over, we sanity-check it: it must exist, it must
// parse as JSON, and it must actually name a post URL. A broken POST.json
// fails loudly here instead of quietly handing the gate an empty file.
//
// Outside the grader container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const source = join(botDir, 'POST.json');
const target = join(outDir, 'POST.json');

if (!existsSync(source)) {
  console.error(`POST.json not found in ${botDir} — nothing to hand to the gate.`);
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(source, 'utf8');
} catch (err) {
  console.error(`could not read ${source}: ${err.message}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error(`POST.json in ${botDir} is not valid JSON.`);
  process.exit(1);
}

const url = parsed && parsed.url;
if (typeof url !== 'string' || url.length === 0) {
  console.error(`POST.json in ${botDir} has no usable "url" field.`);
  process.exit(1);
}

// The gate fetches the post from X, so the url must point at a real post,
// not just any string. Accept x.com or twitter.com links of the form
// https://x.com/<handle>/status/<digits>.
if (!/^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+/.test(url)) {
  console.error(`POST.json url does not look like an X post: ${url}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, raw);
console.log(`handed POST.json to ${target} (${url})`);
