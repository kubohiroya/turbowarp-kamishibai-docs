import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import historyManifest from '../sources/dsl4/release-history-4.0.json' with {type: 'json'};

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const history = read('docs/dsl-author-guides/dsl-4.0-history.md');
const dsl4Index = read('site/4.0/index.html');
const entry = historyManifest.entries.find(({version}) => version === '4.0.0-rc.10');
const previousEntry = historyManifest.entries.find(({version}) => version === '4.0.0-rc.8');

test('publishes a separate DSL 4.0 release history', () => {
  const publication = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'dsl-4.0-history.md',
  );

  assert.equal(publication?.version, '4.0');
  assert.equal(publication?.outputDirectory, '4.0/dsl-author-guides');
  assert.match(dsl4Index, /dsl-author-guides\/dsl-4\.0-history\//u);
});

test('records rc.25 source and public artifacts while preserving earlier verification scope', () => {
  const current = historyManifest.entries[0];
  assert.equal(current.version, '4.0.0-rc.25');
  assert.equal(current.publication.tagCommit, 'a68f8dc4d38b4609c8387192d3be0376963735e3');
  assert.equal(current.schema.documentationReferenceCommit, current.publication.tagCommit);
  assert.equal(current.schema.releaseReferenceCommit, current.publication.tagCommit);
  assert.equal(current.artifacts.standardSb3.size, 6923215);
  assert.equal(current.artifacts.npmTarball.size, 6664616);
  assert.equal(current.verification.sampleTests, 63);
  assert.equal(current.verification.physicalCameraAndPose, 'not-run-for-rc.25');
  assert.match(current.verification.publicSamples, /^16-public-artifacts/u);
  assert.match(current.verification.sampleBrowser, /fake-camera-web-and-real-editor/u);
  for (const value of [
    current.publication.tagCommit,
    current.source.sourceIdentity,
    current.schema.releaseSha256,
    current.artifacts.standardSb3.sha256,
    current.artifacts.npmTarball.sha256,
    current.verification.sampleCommit,
  ]) {
    assert.ok(history.includes(value), value);
  }
  assert.match(history, /名前付き台本1個だけをルートとは解釈しません/u);
  assert.match(history, /実カメラ・実ポーズの確認は今回行っていません/u);
  const rc22 = historyManifest.entries.find(({version}) => version === '4.0.0-rc.22');
  assert.equal(rc22.publication.tagCommit, 'f8048b8c4ebd0ecd6213bb87582862034b2b88ce');
  assert.equal(rc22.verification.physicalCameraAndPose, 'not-run-for-rc.22');
});

test('records rc.10 as a published prerelease without claiming stable 4.0.0', () => {
  assert.equal(historyManifest.series, '4.0');
  assert.equal(entry.version, '4.0.0-rc.10');
  assert.equal(entry.publicationState, 'published-prerelease');
  assert.equal(entry.publication.gitTag, 'v4.0.0-rc.10');
  assert.equal(entry.publication.tagCommit, '65f5e705921b6c92ba6ec5373ec13eff5101f2c6');
  assert.equal(entry.publication.npmVersion, '4.0.0-rc.10');
  assert.equal(entry.publication.npmDistTag, 'next');
  assert.equal(entry.publication.recommendedStableRelease, 'v3.2.3');
  assert.equal(entry.publication.officialDsl4Release, null);

  assert.match(history, /状態: \*\*公開プレリリース\*\*/u);
  assert.match(history, /正式版`v4\.0\.0`は未公開/u);
});

test('pins rc.10 source, schema, artifacts, surfaces, flags, and verification', () => {
  assert.equal(
    entry.source.releasePreparationMergeCommit,
    '235b0bfce403fd8a6e3026bd23b6562b53c132e5',
  );
  assert.equal(entry.source.freezeMergeCommit, '65f5e705921b6c92ba6ec5373ec13eff5101f2c6');
  assert.equal(
    entry.source.sourceIdentity,
    'sha256:ed05e732c9c0a0d7f43d85802450c88871bdab938a6809f7898815ae3cea714f',
  );
  assert.equal(
    entry.schema.releaseSha256,
    '22edefa88eaa928edb8ae6fb6a8f9dce89e56ad2feb63ebaa91337757540a1df',
  );
  assert.equal(entry.schema.documentationReferenceCommit, entry.publication.tagCommit);
  assert.equal(
    entry.schema.documentationReferenceSha256,
    '22edefa88eaa928edb8ae6fb6a8f9dce89e56ad2feb63ebaa91337757540a1df',
  );
  assert.equal(
    entry.artifacts.standardSb3.sha256,
    'a8620868f5da118c142cf2a11db6679ce7fab8b8ef84f5e6cce26887d61e94ec',
  );
  assert.equal(entry.artifacts.standardSb3.size, 6787273);
  assert.equal(
    entry.artifacts.npmTarball.sha256,
    'dfb42cbf86ca45465298be357f5852ae52aefc7f226c3c6742ee1c5c6e317c3c',
  );
  assert.equal(
    entry.verification.physicalCameraAndPose,
    'previous-camera-context-measurement-only; rc.10 physical-rerun-not-recorded',
  );
  assert(entry.surfaces.includes('turbowarp-core-action-blocks'));
  assert(entry.surfaces.includes('pose-preview-overlay'));
  assert(entry.surfaces.includes('named-bubble-close-policies'));
  assert(entry.surfaces.includes('tm-extension-id'));

  for (const value of [
    entry.source.releasePreparationMergeCommit,
    entry.source.freezeMergeCommit,
    entry.source.sourceIdentity,
    entry.schema.releaseSha256,
    entry.artifacts.standardSb3.sha256,
    entry.artifacts.npmTarball.sha256,
  ]) {
    assert.match(history, new RegExp(value, 'u'));
  }
});

test('records the rc.10 dependency pins and immutable rollback while preserving rc.8 history', () => {
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-bubble'], '0.11.0');
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-tm'], '2.0.0');
  assert.equal(entry.rollback.fixVersion, 'publish-4.0.0-rc.11');
  assert.equal(previousEntry.version, '4.0.0-rc.8');
  assert.equal(previousEntry.dependencies['@kubohiroya/turbowarp-bubble'], '0.10.0');
  assert.equal(previousEntry.dependencies['@kubohiroya/turbowarp-tmpose'], '1.12.0');
  assert.match(history, /23 core action/u);
  assert.match(history, /rc\.8以前のversion付きSB3/u);
  assert.match(history, /4\.0\.0-rc\.11/u);
});

test('defines the update contract and keeps migration details out', () => {
  assert.deepEqual(historyManifest.updateContract.requiredChecks, [
    'pnpm verify:full',
    'pnpm release:check',
    'pnpm check',
    'repeat-build-skip',
  ]);
  assert(historyManifest.updateContract.requiredFields.length >= 9);
  assert.match(history, /^## 次のversionを追記する$/mu);
  assert.doesNotMatch(history, /convert-dsl4|kamishibai=|\.txt|^## .*移行/mu);
});
