import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const dsl4Index = read('site/4.0/index.html');
const adultOverview = read('docs/user-guides/executive-summary-adult-4.0.md');
const childOverview = read('docs/user-guides/executive-summary-kids-4.0.md');
const userGuide = read('docs/user-guides/user-guide-4.0.md');
const playTutorial = read('docs/tutorials/play.md');
const createTutorial = read('docs/tutorials/create.md');
const authorGuide = read('docs/dsl-author-guides/dsl-4.0-author-guide.md');
const conversionGuide = read('docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md');
const schemaReference = read('docs/dsl-author-guides/dsl-4.0-schema-reference.md');
const releaseHistory = read('docs/dsl-author-guides/dsl-4.0-history.md');
const applicationGuide = read('docs/developer-guides/application-materials-guide-4.0.md');
const developerGuide = read('docs/developer-guides/developer-guide-4.0.md');
const internalSpecification = read('docs/developer-guides/internal-specification-4.0.md');
const extensionGuide = read('docs/developer-guides/extension-guide-4.0.md');
const diagnosticsDesign = read('docs/developer-guides/dsl-4.0-diagnostics-design.md');
const releaseSmoke = read('docs/developer-guides/release-smoke-4.0.md');

test('keeps implementation terms out of the general-user entry surfaces', () => {
  const indexEntry = dsl4Index.match(
    /<header class="page-intro">[\s\S]*?<\/header>[\s\S]*?<section class="release-status"[\s\S]*?<\/section>/u,
  )?.[0];
  assert.ok(indexEntry);

  for (const source of [indexEntry, adultOverview, childOverview, userGuide, playTutorial]) {
    assert.doesNotMatch(
      source,
      /StoryDocument|Source Graph|project\.source\.json|candidate|generation|source frontend|platform adapter|feature flag|SHA-256|[a-f0-9]{40}/iu,
    );
  }

  assert.match(playTutorial, /カメラを使わない場合は、公開作品の/u);
  assert.match(playTutorial, /カメラを使わない場合/u);
  assert.match(userGuide, /カメラを使わない場合や許可したくない場合/u);
  assert.doesNotMatch(userGuide, /checksum|issuecomment-|feature flag|surface|diagnostic code/iu);
});

test('introduces authoring terms before relying on them', () => {
  assert.match(createTutorial, /YAML（項目を字下げして並べるテキスト形式）/u);
  assert.match(createTutorial, /SB3（TurboWarpやScratchで開ける一つの作品ファイル）/u);
  assert.match(createTutorial, /ローカルプレビュー（ブラウザー上で\s*変更を確かめる画面）/u);
  assert.match(createTutorial, /`project\.source\.json`は読み込む台本を\s*指定する設定ファイル/u);

  const authorIntroduction = authorGuide.slice(
    0,
    authorGuide.indexOf('## 公開プレリリースと文書基準'),
  );
  for (const term of [
    'YAML台本',
    '作品フォルダー',
    '素材（asset）',
    '命令（action）',
    'プレビュー',
    'SB3',
  ]) {
    assert.match(authorIntroduction, new RegExp(term.replace(/[()]/gu, '\\$&'), 'u'));
  }
  assert.match(authorIntroduction, /先に入門チュートリアル/u);
});

test('marks migration and schema documents as purpose-specific references', () => {
  const conversionIntroduction = conversionGuide.slice(
    0,
    conversionGuide.indexOf('## 基本コマンド'),
  );
  assert.match(conversionIntroduction, /すでに3\.1／3\.2の台本を持っている方/u);
  assert.match(conversionIntroduction, /初めてTurboWarp紙芝居を使う方/u);
  assert.doesNotMatch(conversionIntroduction, /one-shot|grammar|atomic/iu);

  const referenceIntroduction = schemaReference.slice(
    0,
    schemaReference.indexOf('## このリファレンスについて'),
  );
  assert.match(referenceIntroduction, /正確な値を検索するための仕様一覧/u);
  assert.match(referenceIntroduction, /先頭から読むチュートリアルではありません/u);
  assert.match(referenceIntroduction, /「紙芝居を作る」チュートリアル/u);
});

test('states the audience and prerequisites before developer detail', () => {
  assert.match(releaseHistory, /開発・リリース担当者向け/u);
  assert.match(releaseHistory, /アプリの使い方や台本作成の\s*入門書ではありません/u);
  assert.match(releaseHistory, /## 最初に出てくる言葉/u);
  assert.match(applicationGuide, /新規作品を作る全員の必須手順書でもありません/u);
  assert.match(applicationGuide, /最初に出てくる言葉は、次の意味です/u);
  assert.match(developerGuide, /アプリの使い方や台本作成の入門書ではありません/u);
  assert.match(developerGuide, /内部仕様書の用語表/u);
  assert.match(internalSpecification, /アプリの使い方や台本作成の\s*入門書ではありません/u);
  assert.match(internalSpecification, /## 用語/u);
  assert.match(extensionGuide, /アプリの利用者や台本作者が読む必要はありません/u);
  assert.match(extensionGuide, /内部仕様書の用語表/u);
  assert.match(diagnosticsDesign, /エラーを見た台本作者の操作手順ではありません/u);
  assert.match(diagnosticsDesign, /内部仕様書の用語表/u);
  assert.match(releaseSmoke, /一般的な動作確認を説明する文書ではありません/u);
  assert.match(releaseSmoke, /\| manifest\s+\|/u);
  assert.match(releaseSmoke, /\| checksum\s+\|/u);
});
