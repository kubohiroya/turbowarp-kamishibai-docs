import assert from 'node:assert/strict';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import {
  legacyPublicationEntries,
  renderLegacyPublicationManifest,
  renderLegacyVersionNotice,
} from '../scripts/legacy-version-notices.mjs';

test('maps every previous unversioned document URL to its version root', () => {
  const entries = legacyPublicationEntries();

  assert.equal(entries.length, documentationConfig.documents.length);
  assert.ok(entries.every(({legacyDirectory}) => !/^(?:3\.2|4\.0)\//u.test(legacyDirectory)));
  assert.ok(entries.every(({targetDirectory}) => /^(?:3\.2|4\.0)\//u.test(targetDirectory)));
  assert.deepEqual(
    entries.find(({legacyDirectory}) => legacyDirectory === 'dsl-author-guides/command-reference'),
    {
      title: '紙芝居DSL 3.2 コマンドリファレンス',
      version: '3.2',
      legacyDirectory: 'dsl-author-guides/command-reference',
      targetDirectory: '3.2/dsl-author-guides/command-reference',
    },
  );
  assert.equal(
    entries.find(
      ({legacyDirectory}) => legacyDirectory === 'dsl-author-guides/dsl-4.0-schema-reference',
    )?.targetDirectory,
    '4.0/dsl-author-guides/dsl-4.0-schema-reference',
  );
});

test('renders a human-readable legacy notice without automatic redirect', () => {
  const entry = legacyPublicationEntries()[0];
  const notice = renderLegacyVersionNotice(entry);
  const targetUrl = `https://kubohiroya.github.io/turbowarp-kamishibai-docs/${entry.targetDirectory}/`;

  assert.match(notice, /旧URLから自動転送は行いません/u);
  assert.match(notice, /紙芝居DSLの版を選ぶ/u);
  assert.ok(notice.includes(targetUrl));
  assert.doesNotMatch(notice, /http-equiv=["']refresh/iu);
  assert.doesNotMatch(notice, /location\.(?:assign|replace)|location\.href/iu);
});

test('keeps the previous Viewer URL usable as a notice publication', () => {
  const manifest = renderLegacyPublicationManifest(legacyPublicationEntries()[0]);

  assert.match(manifest.name, /移転のお知らせ/u);
  assert.deepEqual(
    manifest.readingOrder.map(({url}) => url),
    ['document.html'],
  );
});
