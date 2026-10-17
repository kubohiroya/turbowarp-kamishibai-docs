import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig, dsl4PublicationStatus} from '../docs/config.mjs';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const statusPolicy = read('DSL4-PUBLICATION-STATUS.md');
const dsl4Index = read('site/4.0/index.html');
const dsl4Documents = documentationConfig.documents
  .filter((document) => document.version === '4.0')
  .map((document) => ({
    collectionId: document.collectionId,
    sourceFilename: document.sourceFilename,
    source: read(`docs/${document.sourceDirectory}/${document.sourceFilename}`),
  }));

test('records the current implementation and publication state in config', () => {
  assert.deepEqual(dsl4PublicationStatus, {
    verifiedOn: '2026-10-17',
    implementationCommit: 'f8048b8c4ebd0ecd6213bb87582862034b2b88ce',
    schemaImplementationCommit: '450a5bb950ef769241ec8258690e652b39b23bde',
    latestPublishedRelease: 'v3.2.3',
    publishedDsl4Prerelease: 'v4.0.0-rc.22',
    officialDsl4Release: null,
  });
});

test('distinguishes current prerelease, stable, sample baseline, and document state', () => {
  for (const term of ['実装基準', '公開プレリリース', '安定版', '公開サンプル基準', '文書状態']) {
    assert.match(statusPolicy, new RegExp(term, 'u'));
  }

  assert.match(statusPolicy, /v4\.0\.0.*未公開/u);
  assert.match(statusPolicy, /v4\.0\.0-rc\.22/u);
  assert.match(statusPolicy, /サンプル作品、スターター、Web版はrc\.22/u);
});

test('shows rc.22 on the 4.0 top and current public samples', () => {
  assert.match(dsl4Index, /4\.0\.0-rc\.22を公開しています/u);
  assert.match(dsl4Index, /kamishibai-4\.0\.0-rc\.22\.sb3/u);
  assert.match(dsl4Index, /turbowarp-kamishibai-app\/v\/4\.0\.0-rc\.22/u);
  assert.match(
    dsl4Index,
    /公開サンプル作品とチュートリアル成果物も、現在<code>rc\.22<\/code>基準/u,
  );
  assert.match(dsl4Index, /安定版<code>4\.0\.0<\/code>はまだ未公開/u);
  assert.match(dsl4Index, /最新安定版は\s*<code>v3\.2\.3<\/code>/u);

  assert.equal(dsl4Documents.length, 22);
  for (const {sourceFilename, source} of dsl4Documents) {
    if (sourceFilename === 'turbowarp-ecosystem.md') continue;
    assert.match(source, /4\.0\.0-rc\.22|v4\.0\.0-rc\.22/u, sourceFilename);
  }
});

test('does not claim that stable v4.0.0 is published', () => {
  for (const source of [statusPolicy, dsl4Index, ...dsl4Documents.map(({source}) => source)]) {
    assert.doesNotMatch(source, /v4\.0\.0.{0,20}(?:公開済み|正式リリース済み)/u);
  }
});
