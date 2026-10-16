import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {extname, join, relative, resolve} from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '..');
const textExtensions = new Set(['.html', '.json', '.md']);
const legacyTerminologyPattern =
  /\b(?:TMPose|TMPOSE|TurboWarp TMPose|turbowarp-tmpose|tmpose-kamishibai)\b/u;
const allowedLegacyTerminologyFiles = new Set([
  'MIGRATION.md',
  'DSL4-IMPLEMENTATION-VISUALS.md',
  'DSL4-PUBLICATION-STATUS.md',
  'docs/LICENSE.md',
  'docs/developer-guides/application-materials-guide.md',
  'docs/developer-guides/dsl4-implementation-walkthrough.md',
  'docs/developer-guides/release-smoke-4.0.md',
  'docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md',
  'docs/dsl-author-guides/dsl-4.0-history.md',
  'docs/tutorials/README.md',
  'site/workshops/index.html',
  'site/4.0/index.html',
  'sources/dsl4/release-history-4.0.json',
  'sources/dsl4/release-smoke-4.0-candidate.json',
  'sources/dsl4/user-guide-4.0-public-surfaces.json',
  'docs/tutorials/screenshots.json',
  'docs/workshops/2026-08-01/tmpose-kamishibai-cover-20260801.md',
  'docs/workshops/2026-08-01/tmpose-kamishibai-20260801.md',
  'docs/workshops/2026-08-01/tmpose-kamishibai-staff-20260801.md',
]);

function collectTextFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectTextFiles(path);
    }
    return textExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

test('uses context-appropriate terms for digital kamishibai delivery and play', () => {
  const rootMarkdown = readdirSync(repositoryRoot, {withFileTypes: true})
    .filter((entry) => entry.isFile() && extname(entry.name) === '.md')
    .map((entry) => join(repositoryRoot, entry.name));
  const files = [
    ...rootMarkdown,
    ...collectTextFiles(join(repositoryRoot, 'docs')),
    ...collectTextFiles(join(repositoryRoot, 'site')),
    ...collectTextFiles(join(repositoryRoot, 'sources', 'dsl4')),
  ];
  const violations = files.flatMap((path) => {
    const lines = readFileSync(path, 'utf8').split('\n');
    return lines.flatMap((line, index) =>
      /上映|上演/u.test(line)
        ? [`${relative(repositoryRoot, path)}:${index + 1}: ${line.trim()}`]
        : [],
    );
  });

  assert.deepEqual(violations, []);
});

test('keeps legacy pose-era terminology out of current prose', () => {
  const rootMarkdown = readdirSync(repositoryRoot, {withFileTypes: true})
    .filter((entry) => entry.isFile() && extname(entry.name) === '.md')
    .map((entry) => join(repositoryRoot, entry.name));
  const files = [
    ...rootMarkdown,
    ...collectTextFiles(join(repositoryRoot, 'docs')),
    ...collectTextFiles(join(repositoryRoot, 'site')),
    ...collectTextFiles(join(repositoryRoot, 'sources')),
  ];
  const violations = files.flatMap((path) => {
    const relativePath = relative(repositoryRoot, path);
    if (allowedLegacyTerminologyFiles.has(relativePath)) return [];
    const lines = readFileSync(path, 'utf8').split('\n');
    return lines.flatMap((line, index) =>
      legacyTerminologyPattern.test(line) ? [`${relativePath}:${index + 1}: ${line.trim()}`] : [],
    );
  });

  assert.deepEqual(violations, []);
});

test('uses the renamed TurboWarp Teachable Machine and TurboWarp紙芝居 product names', () => {
  const files = [
    ...readdirSync(repositoryRoot, {withFileTypes: true})
      .filter((entry) => entry.isFile() && extname(entry.name) === '.md')
      .map((entry) => join(repositoryRoot, entry.name)),
    ...collectTextFiles(join(repositoryRoot, 'docs')),
    ...collectTextFiles(join(repositoryRoot, 'site')),
    ...collectTextFiles(join(repositoryRoot, 'sources')),
  ];
  const offenders = files
    .filter((file) =>
      /TurboWarp TM(?![A-Za-z])|TM紙芝居|kubohiroya\.github\.io\/turbowarp-tm\//u.test(
        readFileSync(file, 'utf8'),
      ),
    )
    .map((file) => relative(repositoryRoot, file));
  assert.deepEqual(offenders, []);
});
