import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

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

test('keeps the block walkthrough explicit about development prerequisites and saved-block input', () => {
  for (const source of [guide, tutorial]) {
    assert.doesNotMatch(source, /```ya?ml/iu);
    assert.match(source, /Issue #891/u);
    assert.match(source, /未公開の開発版/u);
    assert.match(source, /公開rc\.22/u);
    assert.doesNotMatch(source, /when kamishibai DSL source|whenDsl4Source/u);
    assert.match(source, /kamishibai \[4\.0\]/u);
  }
  assert.match(tutorial, /export-block-dsl[\s\S]*--input[^\n]+story-edited\.sb3/u);
  assert.match(tutorial, /build-dsl4[\s\S]*--base[^\n]+story-edited\.sb3/u);
  assert.match(tutorial, /--replace-existing/u);
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
