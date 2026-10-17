import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import currentCandidate from '../sources/dsl4/release-smoke-4.0-candidate.json' with {type: 'json'};

const candidate = currentCandidate.historicalCandidates[0];

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const guide = read('docs/developer-guides/release-smoke-4.0.md');
const dsl4Index = read('site/4.0/index.html');

test('publishes the DSL 4.0 smoke guide as an independent publication', () => {
  const publication = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'release-smoke-4.0.md',
  );

  assert.equal(publication?.version, '4.0');
  assert.equal(publication?.outputDirectory, '4.0/developer-guides');
  assert.match(dsl4Index, /developer-guides\/release-smoke-4\.0\//u);
});

test('pins the published rc.8 source and distributable artifacts by checksum', () => {
  assert.equal(candidate.status, 'published-prerelease-automated-verification-passed');
  assert.equal(candidate.runtime.version, '4.0.0-rc.8');
  assert.match(candidate.runtime.candidateCommit, /^[0-9a-f]{40}$/u);
  assert.match(candidate.runtime.freezeCommit, /^[0-9a-f]{40}$/u);
  assert.match(candidate.runtime.schema.sha256, /^[0-9a-f]{64}$/u);
  assert.match(candidate.runtime.releaseSource.sourceIdentity, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(candidate.runtime.standardArtifact.publicationState, 'published');
  assert.match(candidate.runtime.standardArtifact.sha256, /^[0-9a-f]{64}$/u);
  assert.equal(candidate.runtime.packageTarball.publicationState, 'published');
  assert.match(candidate.runtime.packageTarball.sha256, /^[0-9a-f]{64}$/u);
  assert.match(candidate.runtime.packageTarball.integrity, /^sha512-/u);
  assert.equal(candidate.publicSamples.version, '4.0.0-rc.8');
  assert.match(candidate.publicSamples.status, /rc\.8-derived-artifacts/u);
  assert.match(candidate.publicSamples.pullRequest, /turbowarp-kamishibai-samples\/pull\/126/u);
  assert.equal(
    candidate.publicSamples.publicationCommit,
    '236fe4ac09e17aaaaa0fb0fd1f8ebdc173073c7f',
  );
  assert.match(candidate.publicSamples.pagesDeploymentRun, /actions\/runs\/32368656029/u);
});

test('records rc.8 flags, automated evidence, physical measurement, and privacy', () => {
  assert.equal(candidate.runtime.featureFlags.defaultState, 'all-off');
  assert(
    candidate.runtime.featureFlags.standardProductionEnabled.includes('dsl4TurboWarpActionSurface'),
  );
  assert(
    candidate.runtime.featureFlags.nonEmbeddedDevelopmentAdditionalEnabled.includes(
      'dsl4BrowserDistributionBuild',
    ),
  );
  assert.doesNotMatch(JSON.stringify(candidate.runtime.featureFlags), /dsl4PoseOverlay/u);
  assert.match(guide, /ポーズoverlayには専用flagがなく/u);
  assert.equal(candidate.evidence.upstreamVerification.status, 'pass');
  assert.equal(candidate.evidence.upstreamVerification.unitTests, 1161);
  assert.equal(candidate.evidence.upstreamVerification.chromiumTests, 13);
  assert.equal(candidate.evidence.publicationVerification.pagesArtifactHashMatch, true);
  assert.equal(
    candidate.evidence.physicalCameraAndPose.status,
    'camera-context-measured-overlay-browser-verified',
  );
  assert.equal(candidate.evidence.physicalCameraAndPose.previousEvidenceAppliesToRc8, true);
  assert.equal(candidate.environment.cameraFrameStorage, false);
});

test('defines rc.8 surfaces, release stops, physical rerun, and immutable rollback', () => {
  for (const heading of [
    '公開物を照合する',
    'TurboWarp surfaceを確認する',
    'Browser／CLI Previewを確認する',
    '実カメラ・実ポーズ',
    'Release-stop条件',
    'Rollback',
  ]) {
    assert.match(guide, new RegExp(`^## ${heading.replaceAll('.', '\\.')}`, 'mu'));
  }

  assert.match(guide, /camera frameは保存しません/u);
  assert.match(guide, /TurboWarp Teachable Machine 1\.12\.0/u);
  assert.match(guide, /Bubble 0\.10\.0/u);
  assert.match(guide, /bubbleClosePolicies/u);
  assert.match(guide, /23個のcore action/u);
  assert.match(guide, /4\.0\.0-rc\.22/u);
  assert(candidate.releaseStops.length >= 8);
  assert.equal(candidate.rollback.recommendedStableVersion, '3.2.3');
});

test('does not carry obsolete DSL 3.x diagnostics or flag names into the DSL 4.0 procedure', () => {
  assert.doesNotMatch(guide, /unsupported-version/u);
  assert.doesNotMatch(guide, /featureDetailedScriptErrors/u);
});
