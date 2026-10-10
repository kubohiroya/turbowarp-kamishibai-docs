import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {generateDsl4Reference} from './generate-dsl4-reference.mjs';

const execFileAsync = promisify(execFile);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(projectRoot, 'sources/dsl4');
const schemaPath = 'schema/dsl-4.schema.json';
const repositoryFullName = 'kubohiroya/turbowarp-kamishibai-app';

function parseArguments(argumentsAfterScript) {
  const normalizedArguments = argumentsAfterScript.filter((argument) => argument !== '--');
  const options =
    /** @type {{repository?: string, commit?: string, workingTree?: boolean, issue?: number}} */ ({});
  for (let index = 0; index < normalizedArguments.length; index += 1) {
    const name = normalizedArguments[index];
    if (name === '--working-tree') {
      options.workingTree = true;
      continue;
    }
    const value = normalizedArguments[index + 1];
    if (!['--repository', '--commit', '--issue'].includes(name) || value === undefined) {
      throw new Error(
        'Usage: pnpm docs:dsl4:sync -- --repository <local-repository> --commit <commit> [--working-tree --issue <issue>]',
      );
    }
    if (name === '--issue') {
      options.issue = Number(value);
    } else {
      options[name.slice(2)] = value;
    }
    index += 1;
  }
  if (
    !options.repository ||
    !options.commit ||
    (options.workingTree && (!Number.isInteger(options.issue) || options.issue < 1)) ||
    (!options.workingTree && options.issue !== undefined)
  ) {
    throw new Error(
      'Usage: pnpm docs:dsl4:sync -- --repository <local-repository> --commit <commit> [--working-tree --issue <issue>]',
    );
  }
  return /** @type {{repository: string, commit: string, workingTree?: boolean, issue?: number}} */ (
    options
  );
}

async function git(repository, ...argumentsAfterGit) {
  const {stdout} = await execFileAsync('git', ['-C', repository, ...argumentsAfterGit], {
    encoding: 'buffer',
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout;
}

/**
 * @param {{repository: string, commit: string, workingTree?: boolean, issue?: number}} options
 */
export async function syncDsl4Schema({repository, commit, workingTree = false, issue}) {
  const resolvedRepository = path.resolve(projectRoot, repository);
  const remoteUrl = (await git(resolvedRepository, 'remote', 'get-url', 'origin'))
    .toString('utf8')
    .trim();
  const normalizedRemote = remoteUrl
    .replace(/^git@github\.com:/u, 'https://github.com/')
    .replace(/\.git$/u, '');
  if (normalizedRemote !== `https://github.com/${repositoryFullName}`) {
    throw new Error(`Unexpected upstream repository: ${remoteUrl}`);
  }
  const fullCommit = (await git(resolvedRepository, 'rev-parse', '--verify', `${commit}^{commit}`))
    .toString('utf8')
    .trim();
  const [schema, commitDate, worktreeHead] = await Promise.all([
    workingTree
      ? readFile(path.join(resolvedRepository, schemaPath))
      : git(resolvedRepository, 'show', `${fullCommit}:${schemaPath}`),
    git(resolvedRepository, 'show', '-s', '--format=%cI', fullCommit),
    workingTree ? git(resolvedRepository, 'rev-parse', 'HEAD') : Promise.resolve(null),
  ]);
  if (worktreeHead && worktreeHead.toString('utf8').trim() !== fullCommit) {
    throw new Error('Working-tree snapshot base commit must match the repository HEAD.');
  }
  JSON.parse(schema.toString('utf8'));
  const schemaSha256 = createHash('sha256').update(schema).digest('hex');
  const lock = workingTree
    ? {
        repository: repositoryFullName,
        sourceKind: 'working-tree-candidate',
        baseCommit: fullCommit,
        baseCommitDate: commitDate.toString('utf8').trim(),
        candidateIssue: issue,
        candidateIssueUrl: `https://github.com/${repositoryFullName}/issues/${issue}`,
        schemaPath,
        schemaSha256,
        snapshotLicense: 'MPL-2.0',
      }
    : {
        repository: repositoryFullName,
        sourceKind: 'commit',
        commit: fullCommit,
        commitDate: commitDate.toString('utf8').trim(),
        schemaPath,
        schemaSha256,
        schemaUrl: `https://github.com/${repositoryFullName}/blob/${fullCommit}/${schemaPath}`,
        surfaceSpecificationUrl: `https://github.com/${repositoryFullName}/blob/${fullCommit}/docs/design/dsl-4-surface.md`,
        snapshotLicense: 'MPL-2.0',
      };
  await mkdir(outputDirectory, {recursive: true});
  await Promise.all([
    writeFile(path.join(outputDirectory, 'dsl-4.schema.json'), schema),
    writeFile(path.join(outputDirectory, 'source-lock.json'), `${JSON.stringify(lock, null, 2)}\n`),
  ]);
  await generateDsl4Reference();
  console.log(
    `Synced ${repositoryFullName}@${fullCommit.slice(0, 7)}${workingTree ? ' working-tree candidate' : ''} (${schemaSha256}) and regenerated the reference.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await syncDsl4Schema(parseArguments(process.argv.slice(2)));
}
