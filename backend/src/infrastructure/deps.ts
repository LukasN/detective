import { Options } from "../options/options";
import { Deps } from "../model/deps";
import fs from "fs";
import { getProjectData } from '@softarc/sheriff-core';
import { globSync } from 'fast-glob';
import { loadConfig } from "./config";
import { cwd } from "process";

const DEFAULT_ENTRIES = [
  'src/main.ts',
  'main.ts',
  'src/index.ts',
  'index.ts'
];

const DEFAULT_NX_ENTRIES = [
  'apps/**/src/main.ts',
  'libs/**/src/main.ts',
  'packages/**/src/main.ts',
];

let deps: Deps;

// export function loadDeps(options: Options): Deps {
//   const depsPath = path.join(cwd(), options.sheriffDump);
//   const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8")) as Deps;
//   return deps;
// }

export function loadDeps(options: Options): Deps {
  if (!deps) {
    throw new Error('no dependencies loaded!');
  }
  return deps;
}

export function inferDeps(options: Options): boolean {
  const entryGlobs = getEntryGlobs(options);
  const entries = globSync(entryGlobs);

  if (entries.length === 0) {
    return false;
  }

  const dir = cwd();

  deps = entries
    .map(e => getProjectData(e, dir))
    .reduce((acc, curr) => ({...acc, ...curr}));

  return true;
}

export function getEntryGlobs(options: Options) {
  const config = loadConfig(options);

  let entryGlobs = DEFAULT_ENTRIES;
  if (config.entries?.length > 0) {
    entryGlobs = config.entries;
  }
  else if (fs.existsSync('nx.json')) {
    entryGlobs = DEFAULT_NX_ENTRIES;
  }
  return entryGlobs;
}
