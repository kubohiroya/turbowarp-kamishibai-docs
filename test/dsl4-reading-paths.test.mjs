import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const dsl4Index = read('site/4.0/index.html');
const adultOverview = read('docs/user-guides/executive-summary-adult-4.0.md');
const childOverview = read('docs/user-guides/executive-summary-kids-4.0.md');
const applicationGuide = read('docs/developer-guides/application-materials-guide-4.0.md');
const authorGuide = read('docs/dsl-author-guides/dsl-4.0-author-guide.md');
const conversionGuide = read('docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md');
const schemaReference = read('docs/dsl-author-guides/dsl-4.0-schema-reference.md');
const developerGuide = read('docs/developer-guides/developer-guide-4.0.md');
const internalSpecification = read('docs/developer-guides/internal-specification-4.0.md');
const extensionGuide = read('docs/developer-guides/extension-guide-4.0.md');
const diagnosticsDesign = read('docs/developer-guides/dsl-4.0-diagnostics-design.md');

test('offers purpose-specific progressive reading paths on the DSL 4.0 top page', () => {
  assert.match(dsl4Index, /目的に合う順番で読む/u);
  for (const pathTitle of [
    '初めて4.0を知る',
    '新しい作品を作る',
    '3.1／3.2作品を移行する',
    '実装を理解・保守する',
  ]) {
    assert.match(dsl4Index, new RegExp(pathTitle, 'u'));
  }
  assert.match(dsl4Index, /細かな仕様書は最初から読む必要はありません/u);

  const beginnerPath = dsl4Index.match(/<h3>初めて4\.0を知る<\/h3>[\s\S]*?<\/article>/u)?.[0];
  assert.ok(beginnerPath);
  assert.match(beginnerPath, /executive-summary-adult-4\.0/u);
  assert.match(beginnerPath, /executive-summary-kids-4\.0/u);
  assert.doesNotMatch(beginnerPath, /application-materials-guide-4\.0/u);

  const authorCard = dsl4Index.indexOf('> 紙芝居DSL 4.0 台本作成ガイド</h3>');
  const schemaCard = dsl4Index.indexOf('> 紙芝居DSL 4.0 Schemaリファレンス</h3>');
  const conversionCard = dsl4Index.indexOf('> 紙芝居DSL 3.2から4.0への変換ガイド</h3>');
  assert.ok(authorCard >= 0);
  assert.ok(schemaCard > authorCard);
  assert.ok(conversionCard > schemaCard);
});

test('connects overview, authoring, reference, and implementation documents without prerequisite jumps', () => {
  assert.match(adultOverview, /## このアプリは何？/u);
  assert.match(adultOverview, /## 遊ぶ人の流れ/u);
  assert.match(adultOverview, /## 作る人の流れ/u);
  assert.match(adultOverview, /## 人とAIの役割/u);
  assert.match(adultOverview, /## 安全に使うために/u);
  assert.match(adultOverview, /## 教育・ワークショップでの利用/u);
  assert.match(adultOverview, /## 次に読む/u);
  assert.match(adultOverview, /目的に合う文書だけを選んでください/u);
  assert.match(adultOverview, /アプリ・教材・ツールチェインガイド/u);
  assert.doesNotMatch(childOverview, /アプリ・教材・ツールチェインガイド/u);
  assert.match(applicationGuide, /初めて4\.0の全体像を知るための概要説明書でも/u);
  assert.match(applicationGuide, /新規作品を作る全員の必須手順書でもありません/u);
  assert.match(applicationGuide, /ソフトウェアメンテナンスガイド/u);

  assert.match(authorGuide, /## このガイドの読み進め方/u);
  assert.match(authorGuide, /Schemaリファレンスは最初から通読せず/u);
  assert.match(conversionGuide, /## このガイドの位置づけ/u);
  assert.match(conversionGuide, /既存TXT台本を安全にYAMLへ変換/u);
  assert.match(schemaReference, /先頭から読むチュートリアルではありません/u);

  assert.match(developerGuide, /## このガイドの読み進め方/u);
  assert.match(internalSpecification, /## 読む前に/u);
  assert.match(extensionGuide, /## 読む前に/u);
  assert.match(diagnosticsDesign, /## 読む前に/u);
  assert.match(internalSpecification, /アプリ・教材・ツールチェインガイド/u);
  assert.match(extensionGuide, /内部仕様書/u);
  assert.match(diagnosticsDesign, /機能拡張・プラットフォーム統合ガイド/u);
});

test('keeps authoring and implementation prerequisites out of the adult overview', () => {
  assert.match(adultOverview, /キーを押す、画面に触れる、カメラの前でポーズを取る/u);
  assert.match(adultOverview, /人が確認して決めます/u);
  assert.match(adultOverview, /カメラを使わないことも正式な選択肢/u);
  assert.match(adultOverview, /作者向け・開発者向け文書で確認できます/u);

  for (const implementationTerm of [
    /Source Graph/u,
    /StoryDocument/u,
    /candidate|generation/u,
    /ソースフロントエンド/u,
    /ランタイムコントローラー/u,
    /プラットフォームアダプター/u,
    /フィーチャーフラグ/u,
  ]) {
    assert.doesNotMatch(adultOverview, implementationTerm);
  }
});

test('uses focused rendered diagrams for relationships that span multiple stages or owners', () => {
  const documentsWithDiagrams = [
    adultOverview,
    authorGuide,
    conversionGuide,
    internalSpecification,
    extensionGuide,
    diagnosticsDesign,
  ];

  for (const source of documentsWithDiagrams) {
    assert.ok((source.match(/<figure class="[^"]*\bconcept-flow\b[^"]*">/gu) ?? []).length >= 1);
    assert.match(source, /<figcaption>.+<\/figcaption>/u);
    assert.match(source, /concept-flow__track/u);
  }

  assert.match(adultOverview, /作品を開く[\s\S]*物語を見る[\s\S]*キー・タッチ・ポーズで参加する/u);
  assert.match(authorGuide, /最小台本[\s\S]*台本と素材を配置[\s\S]*場面と命令を追加/u);
  assert.match(conversionGuide, /3\.1／3\.2のTXT[\s\S]*convert-dsl4[\s\S]*4\.0のYAML/u);
  assert.match(
    internalSpecification,
    /Source Graph[\s\S]*StoryDocument[\s\S]*Runtime controller/iu,
  );
  assert.match(extensionGuide, /Port contract[\s\S]*Platform composition/u);
  assert.match(diagnosticsDesign, /validate[\s\S]*commit[\s\S]*安全停止/u);
});
