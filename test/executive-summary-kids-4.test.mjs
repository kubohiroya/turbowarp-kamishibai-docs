import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';

const dsl4Summary = readFileSync(
  new URL('../docs/user-guides/executive-summary-kids-4.0.md', import.meta.url),
  'utf8',
);
const dsl32Summary = readFileSync(
  new URL('../docs/user-guides/executive-summary-kids.md', import.meta.url),
  'utf8',
);
const dsl40Index = readFileSync(new URL('../site/4.0/index.html', import.meta.url), 'utf8');

test('publishes the child overview as an independent furigana-enabled DSL 4.0 document', () => {
  const dsl4Document = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'executive-summary-kids-4.0.md',
  );
  const dsl32Document = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'executive-summary-kids.md',
  );

  assert.equal(dsl4Document?.version, '4.0');
  assert.equal(dsl4Document?.outputDirectory, '4.0/user-guides');
  assert.equal(dsl4Document?.legacyOutputDirectory, 'user-guides');
  assert.equal(dsl4Document?.addFurigana, true);
  assert.equal(dsl32Document?.version, '3.2');
  assert.equal(dsl32Document?.outputDirectory, '3.2/user-guides');
  assert.match(dsl32Summary, /^# 紙芝居アプリ 3\.2 概要説明書 子供向け$/mu);
  assert.match(dsl4Summary, /^# 紙芝居アプリ 4\.0 概要説明書 子供向け$/mu);
  assert.match(dsl4Summary, /この説明は、TurboWarp紙芝居4\.0で遊ぶ人/u);
  assert.match(dsl40Index, /href="user-guides\/executive-summary-kids-4\.0\/"/u);
  assert.match(dsl40Index, /4\.0\/user-guides\/executive-summary-kids-4\.0\/publication\.json/u);
});

test('explains seeing, moving, making, and safe participation without technical prerequisites', () => {
  for (const expected of [
    '見る — お話を楽しもう',
    '動く — ポーズで参加しよう',
    '作る — 自分たちの物語を考えよう',
    'カメラと個人情報のやくそく',
    'まわりの安全のやくそく',
    '困ったとき',
    'キーや画面のタッチで進める方法',
    '名前、学校、住所、電話番号、パスワード',
    '4.0.0-rc.23は公開プレリリース',
  ]) {
    assert.match(dsl4Summary, new RegExp(expected, 'u'));
  }
  assert.match(dsl4Summary, /最初からその書き方を覚える必要はありません/u);
  assert.doesNotMatch(dsl4Summary, /[a-f0-9]{40}|固定した実装|StoryDocument|Source Graph/u);
});

test('does not mix DSL 3.x TXT syntax or delivery steps into the DSL 4.0 child source', () => {
  for (const forbidden of [
    /DSL 3\.[12]/u,
    /kamishibai=3\.[12]/u,
    /\.txt\b/iu,
    /(?:^|`)action=/mu,
    /sceneLabel/u,
    /外部TXT/u,
    /汎用SB3/u,
    /編集用SB3/u,
    /再生用SB3/u,
    /convert-dsl4/u,
    /build-dsl4/u,
    /preview-dsl4/u,
    /validate-dsl4/u,
  ]) {
    assert.doesNotMatch(dsl4Summary, forbidden);
  }
});

test('keeps a valid heading outline and stays capture-image-free while gates are blocked', () => {
  const headings = [...dsl4Summary.matchAll(/^(#{1,6})\s+.+$/gmu)].map(
    ([, markers]) => markers.length,
  );
  assert.ok(headings.length > 1);
  assert.equal(headings[0], 1);
  assert.equal(headings.filter((level) => level === 1).length, 1);
  for (let index = 1; index < headings.length; index += 1) {
    assert.ok(headings[index] <= headings[index - 1] + 1, 'heading levels must not be skipped');
  }
  assert.doesNotMatch(dsl4Summary, /!\[[^\]]*\]\([^)]*\)|<img\b/iu);
  assert.match(dsl4Summary, /<figure class="concept-flow">/u);
});
