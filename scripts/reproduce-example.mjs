import {cp,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

if(!process.argv[2])throw new Error('Usage: node scripts/reproduce-example.mjs NEW_PROJECT_DIR');
const target=resolve(process.argv[2]);
const source=fileURLToPath(new URL('../examples/harbor-atlas/',import.meta.url));
await mkdir(target);
await cp(source,target,{recursive:true});
const runner=fileURLToPath(new URL('./project-workflow.mjs',import.meta.url));
const result=spawnSync(process.execPath,[runner,'check',target],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
