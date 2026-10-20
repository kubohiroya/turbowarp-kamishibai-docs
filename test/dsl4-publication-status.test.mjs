import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig, dsl4PublicationStatus} from '../docs/config.mjs';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const statusPolicy = read('DSL4-PUBLICATION-STATUS.md');
const dsl4Index = read('site/4.0/index.html');
const appRelease = JSON.parse(read('sources/dsl4/app-release.json'));
const dsl4Documents = documentationConfig.documents
  .filter((document) => document.version === '4.0')
  .map((document) => ({
    collectionId: document.collectionId,
    sourceFilename: document.sourceFilename,
    source: read(`docs/${document.sourceDirectory}/${document.sourceFilename}`),
  }));

test('records the current implementation and publication state in config', () => {
  assert.deepEqual(dsl4PublicationStatus, {
    verifiedOn: appRelease.checkedOn,
    implementationCommit: appRelease.commit,
    schemaImplementationCommit: appRelease.schema.commit,
    latestPublishedRelease: appRelease.latestStableRelease,
    publishedDsl4Prerelease: appRelease.prerelease ? appRelease.tag : null,
    officialDsl4Release: appRelease.officialDsl4Release,
  });
});

test('distinguishes current prerelease, stable, sample baseline, and document state', () => {
  for (const term of ['実装基準', '公開プレリリース', '安定版', '公開サンプル基準', '文書状態']) {
    assert.match(statusPolicy, new RegExp(term, 'u'));
  }

  assert.match(statusPolicy, /v4\.0\.0.*未公開/u);
  assert.match(statusPolicy, /v4\.0\.0-rc\.25/u);
  assert.match(statusPolicy, /サンプル作品、スターター、Web版はrc\.25/u);
});

test('links the resolved public app without relabeling historical samples', () => {
  assert.ok(dsl4Index.includes(`${appRelease.version}を公開しています`));
  assert.ok(dsl4Index.includes(appRelease.artifact.url));
  assert.ok(dsl4Index.includes(appRelease.releaseUrl));
  assert.equal(dsl4Index.includes(appRelease.npm.url), appRelease.npm.published);
  assert.match(dsl4Index, /公開サンプルや本文・図版の対象版/u);
  assert.doesNotMatch(dsl4Index, /サンプル作品とチュートリアル成果物も、現在/u);

  assert.equal(dsl4Documents.length, 27);
  for (const {sourceFilename, source} of dsl4Documents) {
    if (sourceFilename === 'turbowarp-ecosystem.md') continue;
    if (sourceFilename === 'dsl-4.0-video-guide.md') {
      assert.match(source, /4\.0\.0-rc\.37/u, sourceFilename);
      assert.match(source, /標準ON/u);
    } else {
      assert.match(source, /4\.0\.0-rc\.25|v4\.0\.0-rc\.25/u, sourceFilename);
    }
  }
});

test('does not claim that stable v4.0.0 is published', () => {
  for (const source of [statusPolicy, dsl4Index, ...dsl4Documents.map(({source}) => source)]) {
    assert.doesNotMatch(source, /v4\.0\.0.{0,20}(?:公開済み|正式リリース済み)/u);
  }
});
