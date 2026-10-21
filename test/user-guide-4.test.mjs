import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import surfaces from '../sources/dsl4/user-guide-4.0-public-surfaces.json' with {type: 'json'};

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const guide = read('docs/user-guides/user-guide-4.0.md');

test('publishes the DSL 4.0 user guide independently', () => {
  const entry = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'user-guide-4.0.md',
  );

  assert.ok(entry);
  assert.equal(entry.version, '4.0');
  assert.match(entry.title, /4\.0 操作説明書/u);
});

test('covers the public start-to-finish operation path', () => {
  for (const expected of [
    '浦島太郎 Web版',
    'Loading',
    '右上の「×」',
    'Space',
    'ArrowRight',
    'ArrowDown',
    'カメラを拒否した',
    'ポーズが成立しない',
    'エラーが表示された',
    '終える・もう一度見る',
    'カメラ使用中の表示',
  ]) {
    assert.match(guide, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  }

  assert.match(guide, /カメラを使わない場合や許可したくない場合は、キーや画面の\s*タッチ/u);
  assert.match(guide, /画面の文章だけを記録/u);
});

test('keeps live-surface evidence in the machine-readable manifest', () => {
  assert.equal(surfaces.formatVersion, 1);
  assert.equal(surfaces.releaseState.formalGitHubReleasePublished, false);
  assert.equal(typeof surfaces.samples.pagesDeploymentRun, 'number');
  assert.equal(surfaces.releaseState.publishedPrerelease, 'v4.0.0-rc.41');
  assert.equal(surfaces.releaseState.sampleBaselineDiffersFromPublishedPrerelease, false);
  assert.equal(surfaces.samples.runtime.version, '4.0.0-rc.41');
  assert.equal(surfaces.samples.runtime.commit, '7bd9a2b34bf7b0cf2f8992cdfe27d0ae55f9224b');
  assert.equal(surfaces.samples.tutorial.version, '4.0.0-rc.41');
  assert.equal(surfaces.samples.tutorial.status, 'published');
  assert.equal(surfaces.samples.tutorial.license, 'MPL-2.0');
  assert.equal(surfaces.samples.publicationCommit, '17c3cc9ddeafabbada219793737cf69f0844699f');
  assert.equal(surfaces.samples.publicArtifactVerification.artifactCount, 20);
  assert.equal(surfaces.samples.publicArtifactVerification.artifacts.length, 20);
  const publicArtifacts = new Map(
    surfaces.samples.publicArtifactVerification.artifacts.map((artifact) => [
      artifact.path,
      artifact,
    ]),
  );
  for (const [key, path] of [
    ['urashima', 'stories/urashima/urashima-blocks-4.0.sb3'],
    ['tutorial', 'stories/tutorial/tutorial-blocks-4.0.sb3'],
    ['myUrashima', 'stories/my-urashima/my-urashima-blocks-4.0.sb3'],
  ]) {
    const sample = surfaces.samples[key];
    const blocks = sample.blocksSb3 ?? sample.sb3Blocks;
    assert.equal(blocks.sha256, publicArtifacts.get(path).sha256);
    assert.equal(blocks.size, publicArtifacts.get(path).size);
  }
  assert.equal(Object.hasOwn(surfaces.samples.myUrashima, 'blocksSb3Url'), true);
  assert.deepEqual(
    surfaces.samples.myUrashima.workshopBlocks.map(({poseCount}) => poseCount),
    [2, 3, 4],
  );
  for (const artifact of surfaces.samples.myUrashima.workshopBlocks) {
    assert.equal(artifact.sha256, publicArtifacts.get(artifact.path).sha256);
    assert.equal(artifact.size, publicArtifacts.get(artifact.path).size);
  }
  assert.equal(surfaces.samples.automatedVerification.savedYamlMatches, true);
  assert.match(surfaces.samples.automatedVerification.editorBlockStory, /^passed;/u);
  assert.equal(surfaces.physicalVerification.camera, 'not-run-for-rc.41');
  assert.equal(surfaces.physicalVerification.pose, 'not-run-for-rc.41');
  assert.equal(surfaces.physicalVerification.appliesToPublishedPrerelease, false);
  assert.equal(
    surfaces.previousVerification.physicalVerification.rc8Verification,
    'previous-camera-context-measurement; recognition-and-overlay-browser-verified',
  );
  assert.equal(surfaces.visuals.formalUiCapturesIncluded, true);
  const rc23 = surfaces.historicalVerifications.find(
    ({releaseState}) => releaseState.publishedPrerelease === 'v4.0.0-rc.23',
  );
  assert.equal(rc23.samples.publicationCommit, 'd8deecfbd46b69a6787ec9e5deea936b8b54f0f0');
  assert.equal(rc23.samples.publicArtifactVerification.artifactCount, 12);
  assert.equal(Object.hasOwn(rc23.samples.myUrashima, 'blocksSb3Url'), false);
  const rc22 = surfaces.historicalVerifications.find(
    ({releaseState}) => releaseState.publishedPrerelease === 'v4.0.0-rc.22',
  );
  assert.equal(rc22.samples.publicationCommit, '536173448d235d33d300df2542404e123ae9667b');
  assert.equal(
    rc22.releaseState.standardSb3Sha256,
    '3731ed3a58c000d40f65057fbe5e27b340bae915df11e863fd55c98ba061b5c9',
  );

  for (const sample of [surfaces.samples.urashima, surfaces.samples.myUrashima]) {
    assert.match(guide, new RegExp(sample.webUrl.replaceAll('.', '\\.'), 'u'));
  }

  assert.doesNotMatch(guide, /SHA-256|[a-f0-9]{64}/u);
  assert.doesNotMatch(guide, /issuecomment-|feature flag|checksum|surface/iu);
});

test('does not fold earlier-series operation formats into the 4.0 guide', () => {
  for (const legacyTerm of ['DSL 3.1', 'DSL 3.2', 'kamishibai=', '.txt', 'Generic', 'Player']) {
    assert.doesNotMatch(guide, new RegExp(legacyTerm.replace('.', '\\.'), 'u'));
  }
});
