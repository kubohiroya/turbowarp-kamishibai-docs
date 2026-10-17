import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';

import {documentationConfig, dsl4PublicationStatus} from '../docs/config.mjs';
import {validateReferenceInputs} from '../scripts/dsl4-reference.mjs';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const json = (name) => JSON.parse(read(name));
const commit = 'f8048b8c4ebd0ecd6213bb87582862034b2b88ce';
const implementationCommit = '450a5bb950ef769241ec8258690e652b39b23bde';
const schema = json('sources/dsl4/dsl-4.schema.json');
const surfaces = json('sources/dsl4/user-guide-4.0-public-surfaces.json');

test('pins the rc.22 implementation independently of publication channels', () => {
  const lock = json('sources/dsl4/source-lock.json');
  assert.equal(lock.commit, implementationCommit);
  const releaseLock = json('sources/dsl4/release-source-lock-4.0-rc.22.json');
  assert.equal(releaseLock.commit, commit);
  const historySchema = json('sources/dsl4/release-history-4.0.json').entries[0].schema;
  assert.equal(historySchema.documentationReferenceCommit, implementationCommit);
  assert.equal(historySchema.releaseReferenceCommit, commit);
  assert.equal(
    releaseLock.schemaSha256,
    createHash('sha256').update(read('sources/dsl4/dsl-4.0-rc.22.schema.json')).digest('hex'),
  );
  assert.equal(dsl4PublicationStatus.schemaImplementationCommit, implementationCommit);
  assert.equal(
    lock.schemaSha256,
    createHash('sha256').update(read('sources/dsl4/dsl-4.schema.json')).digest('hex'),
  );
  assert.equal(dsl4PublicationStatus.implementationCommit, commit);
  const developerGuide = read('docs/developer-guides/developer-guide-4.0.md');
  assert.ok(developerGuide.includes(`--commit ${implementationCommit}`));
  assert.ok(!developerGuide.includes(`--commit ${commit}`));
  assert.equal(dsl4PublicationStatus.publishedDsl4Prerelease, 'v4.0.0-rc.22');
  assert.equal(dsl4PublicationStatus.officialDsl4Release, null);
});

test('covers current recognition, transitions, variable actions and ruby with validated annotations', () => {
  const counts = validateReferenceInputs({
    schema,
    annotations: json('sources/dsl4/annotations.ja.json'),
  });
  assert.equal(counts.topLevelFieldCount, 15);
  assert.equal(counts.actionCount, 30);
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const ajv = new AjvConstructor({strict: true, allErrors: true});
  const validate = ajv.compile(schema);
  const current = {
    kamishibai: '4.0',
    assets: {Model: {kind: 'recognitionModel', file: 'model'}},
    recognition: {preview: {mirroring: 'mirrored'}},
    presentation: {transitions: {scene: {effect: 'crossfade', seconds: 0.3}}},
    audio: {bgm: {transition: {effect: 'crossfade', seconds: 0.5, curve: 'equalPower'}}},
    variables: {score: 0, ready: false},
    scenes: {
      Start: [
        {setVariable: {name: 'score', value: 1}},
        {changeVariable: {name: 'score', by: 2}},
        {toggleVariable: 'ready'},
      ],
    },
  };
  assert.equal(validate(current), true, JSON.stringify(validate.errors));
  assert.equal(validate({...current, poseRecognition: {}}), false);
  assert.equal(validate({...current, assets: {Model: {kind: 'poseModel', file: 'model'}}}), false);
  const reference = read('docs/dsl-author-guides/dsl-4.0-schema-reference.md');
  for (const term of [
    'recognitionModel',
    'imageInputToChangeScene',
    'setVariable',
    'changeVariable',
    'toggleVariable',
    'setBgmVolume',
    'stopBgm',
    'ruby',
    'presentation',
    'audio',
  ]) {
    assert.ok(reference.includes(term), term);
  }
});

test('gives each current 4.0 guide an explicit rc.22 scope', () => {
  for (const document of documentationConfig.documents.filter(
    ({version, sourceFilename}) => version === '4.0' && sourceFilename !== 'turbowarp-ecosystem.md',
  )) {
    const source = read(`docs/${document.sourceDirectory}/${document.sourceFilename}`);
    assert.ok(source.includes('4.0.0-rc.22'), document.sourceFilename);
  }
});

test('records current public sample provenance without reusing historical physical passes', () => {
  assert.equal(surfaces.releaseState.publishedPrereleaseCommit, commit);
  assert.equal(surfaces.releaseState.publicSampleBaseline, 'v4.0.0-rc.22');
  assert.equal(surfaces.samples.runtime.commit, commit);
  assert.equal(surfaces.samples.tutorial.version, '4.0.0-rc.22');
  assert.equal(surfaces.physicalVerification.appliesToPublishedPrerelease, false);
  assert.equal(surfaces.physicalVerification.camera, 'not-run-for-rc.22');
  assert.equal(surfaces.physicalVerification.pose, 'not-run-for-rc.22');
  assert.equal(surfaces.previousVerification.releaseState.publishedPrerelease, 'v4.0.0-rc.10');
  assert.equal(surfaces.releaseState.npmDistTags.latest, '4.0.0-rc.22');
  assert.equal(
    surfaces.releaseState.standardSb3Url,
    'https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/download/v4.0.0-rc.22/kamishibai-4.0.0-rc.22.sb3',
  );
});

test('adds rc.22 history while retaining rc.10 and rc.8 checksums', () => {
  const history = json('sources/dsl4/release-history-4.0.json');
  assert.equal(history.entries[0].version, '4.0.0-rc.22');
  assert.equal(history.entries[0].publication.tagCommit, commit);
  assert.equal(
    history.entries.find(({version}) => version === '4.0.0-rc.10').artifacts.standardSb3.sha256,
    'a8620868f5da118c142cf2a11db6679ce7fab8b8ef84f5e6cce26887d61e94ec',
  );
  assert.equal(
    history.entries.find(({version}) => version === '4.0.0-rc.8').dependencies[
      '@kubohiroya/turbowarp-tmpose'
    ],
    '1.12.0',
  );
  const smoke = json('sources/dsl4/release-smoke-4.0-candidate.json');
  assert.equal(smoke.runtime.version, '4.0.0-rc.22');
  assert.equal(smoke.historicalCandidates[0].runtime.version, '4.0.0-rc.8');
  assert.equal(smoke.evidence.physicalCameraAndPose.status, 'not-run-for-rc.22');
});

test('preserves main portrait layout while rejecting it for the published rc.22 schema', () => {
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const portrait = {base: 'Face', placement: 'top-left', offset: [-4, 6, 120], cornerRadius: 12};
  const schemas = [
    {schemaPath: 'sources/dsl4/dsl-4.schema.json', expected: true},
    {schemaPath: 'sources/dsl4/dsl-4.0-rc.22.schema.json', expected: false},
  ];
  for (const {schemaPath, expected} of schemas) {
    const source = json(schemaPath);
    const ajv = new AjvConstructor({strict: true, allErrors: true});
    ajv.addSchema(source);
    const validate = ajv.compile({$ref: source.$id + '#/$defs/bubblePortrait'});
    assert.equal(validate({base: 'Face'}), true, schemaPath);
    assert.equal(validate(portrait), expected, schemaPath);
  }
  const reference = read('docs/dsl-author-guides/dsl-4.0-schema-reference.md');
  assert.match(reference, /portrait[\s\S]*rc\.22未対応/u);
  const converter = read('docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md');
  assert.match(converter, /K4-CONVERT-COMMAND-UNSUPPORTED/u);
  assert.match(converter, /`TMPoseURL=`を`TMURL=`へ/u);
});
