import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';

import inventory from '../sources/turbowarp-ecosystem.json' with {type: 'json'};
import schema from '../sources/turbowarp-ecosystem.schema.json' with {type: 'json'};

const require = createRequire(import.meta.url);
const Ajv = /** @type {any} */ (require('ajv'));
const guide = readFileSync(
  new URL('../docs/developer-guides/turbowarp-ecosystem.md', import.meta.url),
  'utf8',
);
const legacyNeedle = ['tm', 'pose'].join('');

test('validates the TurboWarp ecosystem inventory schema', () => {
  const ajv = new Ajv({allErrors: true});
  ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/u);
  ajv.addFormat('uri', {
    validate(value) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  });
  const validate = ajv.compile(schema);

  assert.equal(validate(inventory), true, ajv.errorsText(validate.errors));
});

test('publishes every ecosystem repository from the machine-readable inventory', () => {
  const ids = new Set(inventory.repositories.map(({id}) => id));
  assert.equal(ids.size, inventory.repositories.length);

  for (const entry of inventory.repositories) {
    assert.match(guide, new RegExp(`https://github\\.com/${entry.repository}`, 'u'));
    assert.match(guide, new RegExp(entry.packageName.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
    assert.match(guide, new RegExp(entry.productName.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  }

  assert.deepEqual(
    inventory.repositories.find(({id}) => id === 'turbowarp-teachable-machine')?.extensionId,
    'kubohiroyatm',
  );
  assert.ok(inventory.repositories.some(({category}) => category === 'upstream-fork'));
});

test('publishes the Asset Cache dependency on Named Data', () => {
  const assetCache = inventory.repositories.find(({id}) => id === 'turbowarp-asset-cache');

  assert.deepEqual(assetCache?.dependencies, ['turbowarp-named-data']);
  assert.match(guide, /named\[TurboWarp Named Data\] --> asset\[TurboWarp Asset Cache\]/u);
});

test('keeps current ecosystem guidance free of old pose-era names', () => {
  for (const text of [
    guide,
    JSON.stringify(inventory),
    readFileSync(new URL('../sources/turbowarp-ecosystem.schema.json', import.meta.url), 'utf8'),
  ]) {
    assert.doesNotMatch(text, new RegExp(legacyNeedle, 'u'));
    assert.doesNotMatch(text, /TMPose|TMPOSE/u);
    assert.doesNotMatch(text, new RegExp(`turbowarp-${legacyNeedle}`, 'u'));
    assert.doesNotMatch(text, /TurboWarp-Asset-Manager/u);
  }
});
