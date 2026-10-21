import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';

import {renderReferenceDocument, validateReferenceInputs} from '../scripts/dsl4-reference.mjs';

const schemaSource = readFileSync(new URL('../sources/dsl4/dsl-4.schema.json', import.meta.url));
const schema = JSON.parse(schemaSource.toString('utf8'));
const annotations = JSON.parse(
  readFileSync(new URL('../sources/dsl4/annotations.ja.json', import.meta.url), 'utf8'),
);
const lock = JSON.parse(
  readFileSync(new URL('../sources/dsl4/source-lock.json', import.meta.url), 'utf8'),
);
const generated = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-4.0-schema-reference.md', import.meta.url),
  'utf8',
);

test('pins the upstream DSL 4.0 Schema with its source and SHA-256', () => {
  const actualHash = createHash('sha256').update(schemaSource).digest('hex');
  assert.equal(actualHash, lock.schemaSha256);
  assert.equal(lock.repository, 'kubohiroya/turbowarp-kamishibai-app');
  assert.equal(lock.sourceKind, 'commit');
  const release = JSON.parse(
    readFileSync(new URL('../sources/dsl4/app-release.json', import.meta.url), 'utf8'),
  );
  assert.equal(lock.commit, release.commit);
  assert.equal(lock.schemaSha256, release.schema.schemaSha256);
  assert.equal(
    lock.schemaUrl,
    `https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/${lock.commit}/schema/dsl-4.schema.json`,
  );
  assert.equal(lock.snapshotLicense, 'MPL-2.0');
  assert.equal(lock.candidateIssue, undefined);
});

test('covers every top-level field and every Schema action with validated annotations', () => {
  assert.deepEqual(validateReferenceInputs({schema, annotations}), {
    actionCount: 34,
    annotationCount: 115,
    topLevelFieldCount: 15,
  });
});

test('validates every documented Actor.setTransparency form', () => {
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const ajv = new AjvConstructor({allErrors: true, strict: true});
  ajv.addSchema(schema);
  const validate = ajv.compile({$ref: `${schema.$id}#/$defs/setTransparencyAction`});
  const examples = [
    {'Hero.setTransparency': 50},
    {'Hero.setTransparency': {stableId: 'hero-half', transparency: 50}},
    {
      'Hero.setTransparency': {
        stableId: 'hero-fade-in',
        from: 100,
        to: 0,
        seconds: 0.5,
        background: true,
      },
    },
  ];
  for (const example of examples) {
    assert.equal(validate(example), true, JSON.stringify(validate.errors));
  }
});

test('generates the checked-in reference byte-for-byte deterministically', () => {
  const first = renderReferenceDocument({schema, annotations, lock});
  const second = renderReferenceDocument({schema, annotations, lock});
  assert.equal(first, second);
  assert.equal(generated, first);
  assert.match(generated, new RegExp(lock.commit.slice(0, 7), 'u'));
  assert.match(generated, new RegExp(lock.schemaSha256, 'u'));
  assert.match(generated, /camera preview操作UI/u);
  assert.match(generated, /`cornerRadius` \| 任意/u);
  assert.match(generated, /公開rc\.23で対応/u);
  assert.match(generated, /\[数値, 数値\] または \[数値, 数値, 数値\]/u);
  assert.match(generated, /関節とボーンのoverlay/u);
  assert.match(generated, /TurboWarp Teachable Machine 3\.5\.1/u);
  assert.match(generated, /物理device IDは台本やruntime変数へ保存しません/u);
  assert.match(generated, /`mirrored` \/ `unmirrored`/u);
  assert.match(generated, /`bubbleStyles` — 吹き出しstyle/u);
  assert.match(generated, /`bubbleClosePolicies` — 吹き出し終了条件/u);
  assert.match(generated, /`closePolicy`/u);
  assert.match(generated, /`broadcastMessageAndWait`/u);
  assert.match(generated, /`debugger`/u);
  assert.match(generated, /`Actor\.hide`/u);
  assert.match(generated, /`Actor\.setLayer`/u);
  assert.match(generated, /`Actor\.loop`/u);
  assert.match(generated, /`bitmapResolution`/u);
  assert.match(generated, /`rehearsal\.skipScene`/u);
  assert.match(generated, /asset・sceneのliteral ID/u);
  assert.doesNotMatch(generated, /`speechStyles`|`speechStyle`/u);
  assert.match(generated, /`Actor\.think`/u);
  assert.match(generated, /`easeInOut`/u);
  assert.match(generated, /`Actor\.setTransparency`/u);
  assert.match(generated, /`0`は完全不透明、`100`は完全透明/u);
  assert.match(generated, /## 前処理/u);
  assert.match(generated, /### `include` — 別の台本ファイルを読み込む/u);
  assert.match(generated, /include:\n  - chapters\/opening\.k4\.yml/u);
  assert.match(generated, /JSON Schemaのfieldではなく/u);
  assert.match(generated, /--enable-source-includes/u);
  assert.doesNotMatch(generated, /DSL 3\.[12]|kamishibai=3\.[12]/u);
});

test('rejects missing, extra, and ambiguously ordered annotations', () => {
  const missing = structuredClone(annotations);
  missing.sections.find(({id}) => id === 'top-level').entries.pop();
  assert.throws(
    () => validateReferenceInputs({schema, annotations: missing}),
    /Top-level field annotations differ/u,
  );

  const extra = structuredClone(annotations);
  extra.sections
    .find(({id}) => id === 'shared-types')
    .entries.push({
      pointer: '#/$defs/styleId',
      order: 10000,
      title: 'extra',
      summary: 'extra',
      example: 'caption',
    });
  assert.throws(
    () => validateReferenceInputs({schema, annotations: extra}),
    /shared-types section annotations differ/u,
  );

  const duplicateOrder = structuredClone(annotations);
  duplicateOrder.sections[0].entries[1].order = duplicateOrder.sections[0].entries[0].order;
  assert.throws(
    () => validateReferenceInputs({schema, annotations: duplicateOrder}),
    /Duplicate order/u,
  );

  const missingInclude = structuredClone(annotations);
  missingInclude.preSchemaDirectives.pop();
  assert.throws(
    () => validateReferenceInputs({schema, annotations: missingInclude}),
    /must document include exactly once/u,
  );
});
