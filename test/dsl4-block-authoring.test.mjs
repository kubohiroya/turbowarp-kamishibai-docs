import assert from 'node:assert/strict';
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
  assert.equal(advanced.length, 5);
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
    assert.match(source, /Issue #881/u);
    assert.match(source, /未公開の開発版/u);
    assert.match(source, /公開rc\.22/u);
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
      for (const match of node.text.matchAll(/\[([A-Z]+)\]/gu))
        assert.ok(Object.hasOwn(node.inputs, match[1]));
      if (node.opcode === 'property') {
        assert.ok(Array.isArray(JSON.parse(node.inputs.PATH)));
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
    assert.doesNotMatch(svg, /undefined|NaN/u);
    checkNodes(diagram.nodes);
  }
});
