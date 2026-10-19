import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';

const dsl4Summary = readFileSync(
  new URL('../docs/user-guides/executive-summary-adult-4.0.md', import.meta.url),
  'utf8',
);
const dsl32Summary = readFileSync(
  new URL('../docs/user-guides/executive-summary-adult.md', import.meta.url),
  'utf8',
);
const dsl40Index = readFileSync(new URL('../site/4.0/index.html', import.meta.url), 'utf8');

test('publishes the adult overview as an independent DSL 4.0 document', () => {
  const dsl4Document = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'executive-summary-adult-4.0.md',
  );
  const dsl32Document = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'executive-summary-adult.md',
  );

  assert.equal(dsl4Document?.version, '4.0');
  assert.equal(dsl4Document?.outputDirectory, '4.0/user-guides');
  assert.equal(dsl4Document?.legacyOutputDirectory, 'user-guides');
  assert.match(dsl4Document?.audience ?? '', /初めての方/u);
  assert.equal(dsl32Document?.version, '3.2');
  assert.equal(dsl32Document?.outputDirectory, '3.2/user-guides');
  assert.match(dsl32Summary, /^# 紙芝居アプリ 3\.2 概要説明書 大人向け$/mu);
  assert.match(dsl4Summary, /^# 紙芝居アプリ 4\.0 概要説明書 大人向け$/mu);
  assert.match(dsl4Summary, /文書状態: 公開プレリリース`4\.0\.0-rc\.23`を前提とする概要/u);
  assert.match(dsl40Index, /href="user-guides\/executive-summary-adult-4\.0\/"/u);
  assert.match(dsl40Index, /4\.0\/user-guides\/executive-summary-adult-4\.0\/publication\.json/u);
});

test('introduces the experience, creation flow, safety, and educational use in plain language', () => {
  for (const expected of [
    'このアプリは何？',
    'できること',
    '遊ぶ人の流れ',
    '作る人の流れ',
    '人とAIの役割',
    '安全に使うために',
    '教育・ワークショップでの利用',
    '4.0の公開状況',
    'キーやタッチだけで参加',
    'カメラを使わないことも正式な選択肢',
  ]) {
    assert.match(dsl4Summary, new RegExp(expected.replaceAll('?', '\\?'), 'u'));
  }
});

test('keeps authoring and implementation details out of the first-read overview', () => {
  for (const forbidden of [
    /Source Graph/u,
    /StoryDocument/u,
    /project\.source\.json/u,
    /candidate|generation/u,
    /ソースフロントエンド/u,
    /プラットフォームアダプター/u,
    /フィーチャーフラグ/u,
    /validate-dsl4|preview-dsl4|build-dsl4/u,
    /自己完結SB3/u,
    /Content-Type|SHA-256/u,
    /```/u,
  ]) {
    assert.doesNotMatch(dsl4Summary, forbidden);
  }
});

test('does not mix DSL 3.x syntax or delivery contracts into the DSL 4.0 source', () => {
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
    /移行(?:手順|方法|説明)/u,
  ]) {
    assert.doesNotMatch(dsl4Summary, forbidden);
  }
});
