import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const authorGuide = read('docs/dsl-author-guides/dsl-4.0-author-guide.md');
const tutorialReadme = read('docs/tutorials/README.md');
const createTutorial = read('docs/tutorials/create.md');

test('separates the tutorial learning path from the author guide reference role', () => {
  assert.match(authorGuide, /## チュートリアルと本書の使い分け/u);
  assert.match(authorGuide, /最初の作品を\s*完成させるための短い実習/u);
  assert.match(authorGuide, /本書を最初から最後まで通読する必要はありません/u);
  assert.match(authorGuide, /Schemaリファレンス.*使える値や必須条件を検索/u);
  assert.match(authorGuide, /大人向け概要 → 本書の記法 → 最小台本/u);
  assert.match(
    authorGuide,
    /作品フォルダーへファイルを置く → ブラウザーで確認する → エラーを直す/u,
  );
  assert.match(authorGuide, /補足.*台本の分割、すべての命令、詳細な制約/u);
});

test('defines tutorial scope, canonical sample ownership, and release stages', () => {
  assert.match(tutorialReadme, /## 台本作成ガイドとの役割分担/u);
  assert.match(tutorialReadme, /最初の作品を完成させるための最短経路/u);
  assert.match(tutorialReadme, /`turbowarp-kamishibai-samples`を正本/u);
  assert.match(tutorialReadme, /完全なsample YAMLや\s*配布物を複製して保守しません/u);
  assert.match(tutorialReadme, /固定commit、\s*starter version、artifact URL、integrity、license/u);
  assert.match(tutorialReadme, /`browser-authoring` gateを`published`、`ready: true`/u);
});

test('keeps the create tutorial minimal and separate from 3.x migration', () => {
  assert.match(createTutorial, /## このチュートリアルと台本作成ガイドの違い/u);
  assert.match(createTutorial, /できあがるのは、変更した台本と\s*素材をまとめたSB3/u);
  assert.match(createTutorial, /すべての命令、複数の台本を組み合わせる方法、分岐、独自の命令/u);
  assert.match(createTutorial, /DSL 3\.1／3\.2のTXT／SB3操作や変換は扱いません/u);
  assert.match(createTutorial, /4\.0\.0-rc\.8/u);
  assert.match(createTutorial, /公開プレリリース/u);
  assert(
    createTutorial.indexOf('## 完了チェック') <
      createTutorial.indexOf('## このチュートリアルと台本作成ガイドの違い'),
  );
});
