import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import surface from '../sources/dsl4/standard-surface-rc25.json' with {type: 'json'};

const read = (filename) =>
  readFileSync(new URL(`../docs/turbowarp-programmer-guides/${filename}`, import.meta.url), 'utf8');
const broadcastGuide = read('dsl-4.0-turbowarp-broadcast-guide.md');
const blockReference = read('dsl-4.0-runtime-block-reference.md');
const runtimeVariableReference = read('dsl-4.0-runtime-variable-turbowarp-reference.md');
const runtimeVariableGuide = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-4.0-runtime-variable-guide.md', import.meta.url),
  'utf8',
);

test('explains exact broadcast-and-wait behavior from YAML through TurboWarp receivers', () => {
  for (const term of [
    'broadcastMessageAndWait',
    'メッセージを受け取ったとき',
    'すべての受信scriptが終了',
    '大文字・小文字',
    'clone',
    '有限時間',
    'キャンセル',
    '直ちに完了',
  ]) {
    assert.match(broadcastGuide, new RegExp(term, 'u'));
  }
});

test('lists every public rc.25 bundled block with its member and arguments', () => {
  assert.equal(surface.extensionId, 'kubohiroyakamishibai4');
  assert.equal(surface.blocks.length, 200);
  const members = new Set(surface.blocks.map(({opcode}) => opcode.split('__')[0]));
  assert.equal(members.size, 8);
  const rows = [
    ...blockReference.matchAll(
      /^\|\s+`([^`]+)`\s+\|\s+(command|reporter|Boolean|boolean|hat)\s+\|\s+(.+?)\s+\|\s+(.+?)\s+\|$/gmu,
    ),
  ];
  assert.equal(rows.length, surface.blocks.length);
  assert.deepEqual(
    rows.map((m) => m[1]).sort(),
    surface.blocks.map(({opcode}) => opcode.split('__')[1]).sort(),
  );
  for (const {opcode, text, blockType, arguments: args = {}} of surface.blocks) {
    const member = opcode.split('__')[0];
    assert.ok(blockReference.includes('`' + member + '`'), member);
    const argsText = Object.keys(args).join('、') || '—';
    assert.ok(
      rows.some(
        (row) =>
          row[1] === opcode.split('__')[1] &&
          row[2] === blockType &&
          row[3] === text.replaceAll('|', '\\|') &&
          row[4] === argsText,
      ),
      opcode,
    );
  }
  for (const slug of [
    'turbowarp-asset-cache',
    'turbowarp-async-input',
    'turbowarp-bubble',
    'turbowarp-camera-source',
    'turbowarp-runtime-expression',
    'turbowarp-svg-text',
    'turbowarp-teachable-machine',
  ]) {
    assert.ok(blockReference.includes(`https://kubohiroya.github.io/${slug}/`), slug);
  }
});

test('preserves the rc.22 surface and removes only its retired source blocks in rc.25', () => {
  const previous = JSON.parse(
    readFileSync(new URL('../sources/dsl4/standard-surface-rc22.json', import.meta.url), 'utf8'),
  );
  const removed = [
    'kubohiroyakamishibairuntime4__whenDsl4Source',
    'kubohiroyakamishibairuntime4__dsl4SourceFromYamlJson',
  ];
  assert.equal(previous.blocks.length, 202);
  assert.deepEqual(
    surface.blocks,
    previous.blocks.filter(({opcode}) => !removed.includes(opcode)),
  );
  assert.match(blockReference, /名前（LABEL）が空欄の台本1個がルート/u);
  assert.match(blockReference, /名前付き宣言だけでは、1個でもルートになりません/u);
  assert.match(blockReference, /タイトルを閉じるとその台本を直接再生/u);
  assert.match(blockReference, /「再読み込み」では、編集したブロックを読み直し/u);
  assert.doesNotMatch(blockReference, /^\|\s+`(?:whenDsl4Source|dsl4SourceFromYamlJson)`/mu);
});

test('retains palette images as historical captures rather than presenting them as rc.25', () => {
  const appendix = blockReference.slice(blockReference.indexOf('## 旧版のパレット画像'));
  assert.match(appendix, /rc\.5／rc\.7/u);
  const images = [...appendix.matchAll(/!\[[^\]]+\]\(\.\.\/images\/([^\)]+)\)/gu)];
  assert.equal(images.length, 7);
  for (const [, filename] of images)
    assert.ok(readFileSync(new URL(`../docs/images/${filename}`, import.meta.url)).length > 0);
});

test('distinguishes the Stage mirrors, read-only reporters and write actions', () => {
  for (const term of [
    'ポーズ認識',
    'チャージ',
    '0〜100',
    'variables:',
    'setVariable',
    'changeVariable',
    'toggleVariable',
  ])
    assert.ok(blockReference.includes(term), term);
  assert.match(runtimeVariableReference, /17個の読取block/u);
  assert.match(runtimeVariableReference, /専用書込reporterはありません/u);
  assert.match(runtimeVariableReference, /宣言済み/u);
  assert.match(runtimeVariableReference, /型不一致/u);
  assert.match(runtimeVariableReference, /有限でない数値/u);
});

test('documents the runtime state and application navigation reporters from the release', () => {
  const state = surface.blocks.filter(
    ({opcode, blockType}) =>
      opcode.startsWith('kubohiroyakamishibairuntime4__') &&
      ['reporter', 'Boolean', 'boolean'].includes(blockType),
  );
  assert.equal(state.length, 17);
  for (const {opcode, text} of state) {
    assert.ok(runtimeVariableReference.includes('`' + opcode.split('__')[1] + '`'), opcode);
    assert.ok(runtimeVariableReference.includes(text), text);
  }
});

test('documents core variable writes instead of the obsolete queued-write proposal', () => {
  assert.match(runtimeVariableGuide, /setVariable: \{name: score, value: 10\}/u);
  assert.match(runtimeVariableGuide, /changeVariable: \{name: score, by: 1\}/u);
  assert.match(runtimeVariableGuide, /toggleVariable: ready/u);
  assert.match(runtimeVariableReference, /書換えはcore action/u);
  assert.match(runtimeVariableReference, /専用flagを設けません/u);
  assert.doesNotMatch(runtimeVariableGuide, /action境界でcommit|書込queue.*正常に終わった/u);
});

test('shares a branch snapshot and rejects unknown expression keys', () => {
  assert.ok(runtimeVariableGuide.includes('runtime["pose.phase"]'));
  assert.match(runtimeVariableGuide, /一回のbranch評価/u);
  assert.match(runtimeVariableGuide, /snapshotを共有/u);
  assert.match(runtimeVariableReference, /K4-EXPRESSION-RUNTIME-UNKNOWN/u);
  assert.match(runtimeVariableReference, /Standard productionはON/u);
});

test('cross-links the author and programmer variable guides', () => {
  assert.ok(
    runtimeVariableGuide.includes(
      '../turbowarp-programmer-guides/dsl-4.0-runtime-variable-turbowarp-reference.md',
    ),
  );
  assert.ok(
    runtimeVariableReference.includes('../dsl-author-guides/dsl-4.0-runtime-variable-guide.md'),
  );
  for (const source of [runtimeVariableGuide, runtimeVariableReference])
    assert.match(source, /4\.0\.0-rc\.25/u);
});
