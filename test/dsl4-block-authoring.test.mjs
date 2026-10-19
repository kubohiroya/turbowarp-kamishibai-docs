import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {parse} from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';

import {documentationConfig} from '../docs/config.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('site/4.0/index.html');
const guide = read('docs/block-author-guides/dsl-4.0-block-author-guide.md');
const tutorial = read('docs/tutorials/create-blocks.md');

function section(id) {
  return (
    index.match(new RegExp(`<section aria-labelledby="${id}">[\\s\\S]*?<\\/section>`, 'u'))?.[0] ??
    ''
  );
}

test('gives block and DSL authors exactly one tutorial and one guide, followed by shared details', () => {
  const blocks = section('block-documents');
  const dsl = section('dsl-documents');
  const details = section('author-details-documents');
  for (const source of [blocks, dsl]) {
    assert.equal((source.match(/<article>/gu) ?? []).length, 2);
    assert.match(source, /紙芝居を作る/u);
    assert.match(source, /紙芝居DSL 4\.0 台本作成ガイド/u);
  }
  assert.match(blocks, /tutorials\/create-blocks\//u);
  assert.match(blocks, /block-author-guides\/dsl-4\.0-block-author-guide\//u);
  assert.doesNotMatch(blocks, /href="tutorials\/create\/"/u);
  assert.match(dsl, /href="tutorials\/create\/"/u);
  assert.match(dsl, /href="dsl-author-guides\/dsl-4\.0-author-guide\/"/u);
  const advanced = documentationConfig.documents.filter(
    ({collectionId}) => collectionId === 'dsl-4.0-detail-guides',
  );
  assert.equal(advanced.length, 6);
  for (const document of advanced) {
    const path = document.publicationOutputDirectory.replace('4.0/', '');
    assert.ok(details.includes(`href="${path}/"`));
    assert.ok(!blocks.includes(`href="${path}/"`));
    assert.ok(!dsl.includes(`href="${path}/"`));
  }
  assert.ok(index.indexOf(blocks) < index.indexOf(dsl));
  assert.ok(index.indexOf(dsl) < index.indexOf(details));
});

test('uses the published CLI and keeps saved blocks as input when refreshing file bundles', () => {
  for (const source of [guide, tutorial]) {
    assert.doesNotMatch(source, /```ya?ml/iu);
    assert.match(source, /公開(?:プレリリース`4\.0\.0-rc\.26`|rc\.26)/u);
    assert.match(source, /Node\.js 24\.0\.0以上/u);
    assert.doesNotMatch(source, /未公開の開発版|開発版CLI|node bin\/turbowarp-kamishibai/u);
    assert.doesNotMatch(source, /when kamishibai DSL source|whenDsl4Source/u);
    assert.match(source, /kamishibai \[4\.0\]/u);
  }
  assert.match(
    tutorial,
    /npm install --save-dev --save-exact @kubohiroya\/turbowarp-kamishibai-app@4\.0\.0-rc\.26/u,
  );
  assert.match(
    tutorial,
    /npx --no-install turbowarp-kamishibai export-block-dsl[\s\S]*--input[^\n]+story-edited\.sb3/u,
  );
  assert.match(tutorial, /build-dsl4[\s\S]*--base[^\n]+story-edited\.sb3/u);
  assert.match(tutorial, /--replace-existing/u);
  const preparation = tutorial.slice(tutorial.indexOf('## 2.'), tutorial.indexOf('## 3.'));
  assert.match(
    preparation,
    /build-dsl4[\s\S]*--output[^\n]+tutorial-assets\.sb3[\s\S]*author-block-dsl[\s\S]*--base[^\n]+tutorial-assets\.sb3/u,
  );
  assert.match(tutorial, /file素材を追加した場合[\s\S]*場合だけ[\s\S]*bundleを更新/u);
});

test('prepares native actor targets and replaces existing runtime components in build examples', () => {
  const conversion = read('docs/dsl-author-guides/dsl-4.0-block-script-conversion-guide.md');
  const preparation = tutorial.slice(tutorial.indexOf('## 2.'), tutorial.indexOf('## 3.'));
  assert.match(
    preparation,
    /https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-samples\/stories\/tutorial\/tutorial-4\.0\.sb3/u,
  );
  assert.doesNotMatch(preparation, /releases\/download\/[^\n]+kamishibai-4\.0\.0-rc\.25\.sb3/u);
  assert.match(preparation, /Student[\s\S]*Scratchスプライト/u);
  assert.match(preparation, /build-dsl4[\s\S]*新規生成しません/u);
  for (const match of conversion.matchAll(/```sh\n([\s\S]*?)```/gu)) {
    if (match[1].includes('build-dsl4')) assert.match(match[1], /--replace-existing/u);
  }
  assert.match(guide, /control \[production\] = JSON \[\{"Space":"navigation.nextAction"\}\]/u);
});

test('validates complete standalone conversion examples against the published rc.25 schema', () => {
  const conversion = read('docs/dsl-author-guides/dsl-4.0-block-script-conversion-guide.md');
  const examples = [...conversion.matchAll(/```yaml\n([\s\S]*?)```/gu)]
    .map((match) => parse(match[1]))
    .filter((source) => source?.kamishibai === '4.0' && source.include === undefined);
  assert.equal(examples.length, 2);
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const ajv = new AjvConstructor({strict: true, allErrors: true});
  const validate = ajv.compile(JSON.parse(read('sources/dsl4/dsl-4.0-rc.25.schema.json')));
  for (const [index, source] of examples.entries()) {
    assert.equal(
      validate(source),
      true,
      `Example ${index + 1}: ${JSON.stringify(validate.errors)}`,
    );
    assert.ok(
      Object.hasOwn(source.controls?.keymaps ?? {}, 'production'),
      `Example ${index + 1} must define the profile selected by embedded block startup.`,
    );
  }
});

test('requires an empty Stage root and explains direct playback with explicit restart', () => {
  const conversion = read('docs/dsl-author-guides/dsl-4.0-block-script-conversion-guide.md');
  for (const source of [guide, tutorial, conversion]) {
    assert.match(source, /Stage[\s\S]*名前が空[\s\S]*ルート/u);
    assert.match(
      source,
      /名前付き[\s\S]*1個[\s\S]*ルート[\s\S]*なりません|名前付き宣言だけなら、1個でもルート不在/u,
    );
    assert.match(source, /緑の旗[\s\S]*タイトルを閉じ/u);
    assert.match(source, /開始し直す[\s\S]*現在のブロックを読み直/u);
    assert.match(source, /file素材[\s\S]*アセットバンドル/u);
    assert.doesNotMatch(source, /名前付きでも主台本にできます|ラベルが空欄でなくても主台本/u);
  }
  for (const source of [guide, conversion]) {
    assert.match(source, /Sprite上の既存の空名宣言[\s\S]*互換/u);
  }
  assert.match(guide, /不正な台本[\s\S]*診断[\s\S]*ファイル選択へ自動で切り替えません/u);
});

test('ships every referenced block diagram with accessible SVG and complete JSON input values', () => {
  const snapshot = JSON.parse(read('sources/dsl4-authoring-blocks.json'));
  const used = new Set(
    [...`${guide}\n${tutorial}`.matchAll(/images\/block-authoring\/([a-z0-9-]+)\.svg/gu)].map(
      (m) => m[1],
    ),
  );
  assert.equal(used.size, snapshot.diagrams.length);
  function checkNodes(nodes) {
    for (const node of nodes) {
      assert.notEqual(node.opcode, 'whenDsl4Source');
      if (node.kind === 'hat') {
        assert.equal(node.opcode, 'kamishibai');
        assert.equal(node.text, 'kamishibai [VERSION] [LABEL]');
        assert.equal(node.inputs.VERSION, '4.0');
        assert.equal(typeof node.inputs.LABEL, 'string');
        assert.equal(node.color, 'authoring');
      }
      for (const match of node.text.matchAll(/\[([A-Z]+)\]/gu))
        assert.ok(Object.hasOwn(node.inputs, match[1]));
      if (node.opcode === 'property') {
        assert.ok(Array.isArray(JSON.parse(node.inputs.PATH)));
        assert.ok(
          ['branches', 'bubbleStyles', 'bubbleClosePolicies', 'presentation', 'audio'].includes(
            JSON.parse(node.inputs.PATH)[0],
          ),
        );
        JSON.parse(node.inputs.VALUE);
      }
      checkNodes(node.children ?? []);
    }
  }
  for (const diagram of snapshot.diagrams) {
    assert.ok(used.has(diagram.id));
    const svg = read(`docs/images/block-authoring/${diagram.id}.svg`);
    assert.match(svg, /role="img" aria-labelledby="title desc"/u);
    assert.match(svg, /<title id="title">/u);
    assert.match(svg, /<desc id="desc">/u);
    assert.doesNotMatch(svg, /undefined|NaN|when kamishibai DSL source|whenDsl4Source/u);
    assert.match(svg, /Issue #886/u);
    checkNodes(diagram.nodes);
  }
});

test('documents label-based includes with independent source hats and YAML writeback', () => {
  const snapshot = JSON.parse(read('sources/dsl4-authoring-blocks.json'));
  const example = snapshot.diagrams.find(({id}) => id === 'guide-includes');
  assert.ok(example);
  const hats = example.nodes.filter(({kind}) => kind === 'hat');
  assert.equal(hats.length, 2);
  assert.equal(hats[0].inputs.LABEL, '');
  assert.notEqual(hats[1].inputs.LABEL, '');
  const include = example.nodes.find(({opcode}) => opcode === 'includeBlocks');
  assert.equal(include.inputs.LABEL, hats[1].inputs.LABEL);
  assert.ok(example.nodes.indexOf(include) < example.nodes.indexOf(hats[1]));
  assert.match(guide, /同じStageに名前付きの台本/u);
  assert.match(guide, /ラベルはSprite名とは独立/u);
  assert.match(guide, /blocks-0001\.k4\.yml/u);
  assert.doesNotMatch(guide, /公開版・開発版とも未対応|複数の宣言ハットを置くとエラー/u);
});

test('uses all eight definition blocks and keeps singleton settings unique across split figures', () => {
  const snapshot = JSON.parse(read('sources/dsl4-authoring-blocks.json'));
  const named = new Set(['asset', 'control', 'actor', 'textStyle', 'variable']);
  const singletons = new Set(['cover', 'loading', 'recognition']);
  const seen = new Set();
  const definitions = snapshot.diagrams.flatMap(({nodes}) => nodes);
  for (const node of definitions) {
    if (!named.has(node.opcode) && !singletons.has(node.opcode)) continue;
    seen.add(node.opcode);
    assert.ok(!Object.hasOwn(node.inputs, 'PATH'));
    const value = JSON.parse(node.inputs.VALUE);
    if (named.has(node.opcode)) assert.ok(node.inputs.NAME.length > 0);
    else {
      assert.ok(!Object.hasOwn(node.inputs, 'NAME'));
      assert.equal(typeof value, 'object');
      assert.ok(value !== null && !Array.isArray(value));
    }
    if (node.opcode === 'actor') assert.equal(typeof value, 'string');
    if (node.opcode === 'variable')
      assert.ok(['string', 'number', 'boolean'].includes(typeof value));
    if (node.opcode === 'control') assert.ok(!Object.hasOwn(value, 'keymaps'));
  }
  assert.equal(seen.size, 8);
  for (const ids of [
    ['guide-11', 'guide-12'],
    ['guide-15', 'guide-16'],
  ]) {
    const nodes = snapshot.diagrams.filter(({id}) => ids.includes(id)).flatMap(({nodes}) => nodes);
    for (const opcode of singletons)
      assert.ok(nodes.filter((node) => node.opcode === opcode).length <= 1);
  }
  const assets = snapshot.diagrams.find(({id}) => id === 'tutorial-assets').nodes;
  assert.deepEqual(
    assets.map(({opcode, inputs}) => [opcode, inputs.NAME]),
    [
      ['asset', 'EarthquakeClassroom'],
      ['asset', 'ProtectHead'],
    ],
  );
  const conversion = read('docs/dsl-author-guides/dsl-4.0-block-script-conversion-guide.md');
  for (const source of [guide, conversion]) {
    assert.match(source, /パレット.*非表示/u);
    assert.match(source, /再生成/u);
    assert.match(source, /旧CLI/u);
  }
});

test('publishes real form screenshots for all eight definitions with traceable capture records', () => {
  const capture = JSON.parse(read('sources/dsl4-definition-forms.json'));
  assert.equal(new Set(capture.screenshots.map(({opcode}) => opcode)).size, 8);
  assert.match(capture.implementationIssue, /issues\/891$/u);
  assert.equal(capture.verification.sb3ReloadPreserved, true);
  for (const screenshot of capture.screenshots) {
    const bytes = readFileSync(new URL(`../${screenshot.path}`, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), screenshot.sha256);
    assert.equal(bytes.readUInt32BE(16), screenshot.width);
    assert.equal(bytes.readUInt32BE(20), screenshot.height);
    assert.ok(guide.includes(screenshot.path.replace('docs/', '../')));
  }
  assert.match(guide, /フォームでJSONを編集する/u);
  assert.match(guide, /SB3ファイル自体の保存とは別/u);
  assert.match(tutorial, /書類アイコン/u);
});
