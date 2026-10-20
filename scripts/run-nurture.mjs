import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';

const script = process.argv[2];
if (!script || basename(script) !== script || !script.endsWith('.mjs')) throw new Error('Provide a Nurture script filename.');
const cwd = fileURLToPath(new URL('../nurture-v01/', import.meta.url));
const result = spawnSync(process.execPath, [fileURLToPath(new URL(`../nurture-v01/scripts/${script}`, import.meta.url)), ...process.argv.slice(3)], { cwd, env: process.env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
