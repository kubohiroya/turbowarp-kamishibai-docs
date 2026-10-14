import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (filename) =>
  readFileSync(new URL(`../docs/turbowarp-programmer-guides/${filename}`, import.meta.url), 'utf8');
const readAuthorGuide = (filename) =>
  readFileSync(new URL(`../docs/dsl-author-guides/${filename}`, import.meta.url), 'utf8');

const broadcastGuide = read('dsl-4.0-turbowarp-broadcast-guide.md');
const blockReference = read('dsl-4.0-runtime-block-reference.md');
const runtimeVariableReference = read('dsl-4.0-runtime-variable-turbowarp-reference.md');
const runtimeVariableGuide = readAuthorGuide('dsl-4.0-runtime-variable-guide.md');

const publicOpcodes = {
  runtime: [
    'stage',
    'bgm',
    'sound',
    'wait',
    'debugger',
    'broadcastMessageAndWait',
    'transition',
    'goto',
    'branch',
    'keyInputToChangeScene',
    'touchInputToChangeScene',
    'poseInputToChangeScene',
    'show',
    'hide',
    'setTransparency',
    'moveTo',
    'say',
    'think',
    'setSkin',
    'setLayer',
    'loop',
    'setText',
    'pose',
  ],
  assetManager: [
    'registerAsset',
    'assetErrorType',
    'assetErrorLabel',
    'deleteMemoryAsset',
    'deleteAllMemoryAssets',
    'deleteCachedAsset',
    'deleteAllCachedAssets',
    'isLoaded',
    'setTextValue',
    'setTextStyle',
    'setThisSpriteSkin',
    'setSpriteSkin',
    'startActorLoop',
    'startActorSequence',
    'stopActorAnimation',
    'finishAllActorSequences',
    'setStageSkin',
    'playSound',
    'playSoundUntilDone',
    'stopSound',
    'stopAllSounds',
    'getAssetMimeType',
    'getVersion',
  ],
  asyncInput: [
    'listenForKey',
    'listenForKeyAndBroadcast',
    'stopListeningForKey',
    'stopAllKeyListeners',
    'listenForTouch',
    'listenForTouchAndBroadcast',
    'stopListeningForTouch',
    'stopAllInputListeners',
    'listenForActorTouchAndBroadcast',
  ],
  bubble: [
    'defineBubbleStyle',
    'defineBubbleClosePolicy',
    'setBubblePlacement',
    'setPortraitBase',
    'setPortraitLayout',
    'setBubbleDistance',
    'setBubbleVisualStyle',
    'setBubbleTailLength',
    'setBubbleOffset',
    'setBlinkFrames',
    'setLipSyncFrames',
    'setContinueFrames',
    'setBubbleReveal',
    'setBubbleWordDelimiters',
    'setBubbleRevealSound',
    'setBubbleVoice',
    'finishBubbleReveal',
    'setBubbleShowAnimation',
    'setBubbleHideAnimation',
    'animateBubble',
    'shakeBubble',
    'explodeBubble',
    'animateBubbleShape',
    'say',
    'think',
    'showWithBubbleStyle',
    'setBubbleAnimationMode',
    'waitForBubbleContinue',
    'waitAndCloseBubbleWithPolicy',
    'closeBubble',
    'getVersion',
  ],
  runtimeExpression: [
    'runtimeCondition',
    'registerConditionalBroadcast',
    'unregisterConditionalBroadcast',
  ],
  svgText: ['defineStyle', 'setText'],
  kubohiroyatm: [
    'versionReporter',
    'setModelURL',
    'startCamera',
    'stopCamera',
    'isCameraRunning',
    'refreshCameraList',
    'setCameraSelection',
    'cameraCountReporter',
    'cameraDeviceIdReporter',
    'cameraDeviceNameReporter',
    'showPreview',
    'hidePreview',
    'isPreviewVisible',
    'setPreviewOpacity',
    'setPreviewPosition',
    'setPreviewMirroring',
    'previewMirroringReporter',
    'setPoseOverlayVisibility',
    'isPoseOverlayVisible',
    'setPoseJointStyle',
    'setPoseBoneStyle',
    'setPoseOverlayMinimumConfidence',
    'setPoseConfidenceScaling',
    'loadModel',
    'isModelLoaded',
    'startRecognition',
    'stopRecognition',
    'isRecognizing',
    'currentPoseReporter',
    'scoreReporter',
    'poseScoreReporter',
    'isPose',
    'isPoseWithThreshold',
    'cameraMsReporter',
    'modelLoadMsReporter',
    'firstRecognitionMsReporter',
    'lastErrorReporter',
  ],
};

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

test('lists every public bundled block and member documentation URI', () => {
  const allOpcodes = Object.values(publicOpcodes).flat();
  assert.equal(allOpcodes.length, 128);
  for (const opcode of new Set(allOpcodes)) {
    assert.ok(blockReference.includes('`' + opcode + '`'), `missing opcode ${opcode}`);
  }
  for (const slug of [
    'turbowarp-asset-manager',
    'turbowarp-async-input',
    'turbowarp-bubble',
    'turbowarp-runtime-expression',
    'turbowarp-svg-text',
    'turbowarp-teachable-machine',
  ]) {
    assert.match(blockReference, new RegExp(`https://kubohiroya\\.github\\.io/${slug}/`, 'u'));
  }
  assert.match(blockReference, /128ブロック/u);
  assert.match(blockReference, /Open Documentation/u);

  const paletteTableHeaders = blockReference.match(
    /^\| opcode\s+\| パレットのブロック文\s+\| 役割\s+\|$/gmu,
  );
  assert.equal(paletteTableHeaders?.length, 9, 'every public block table must expose palette text');

  const paletteRows = [
    ...blockReference.matchAll(/^\| `([^`]+)`\s+\| `([^`]+)`\s+\| [^\n]+\|$/gmu),
  ];
  assert.equal(paletteRows.length, 128, 'every public block must include non-empty palette text');
  assert.deepEqual(
    paletteRows.map((match) => match[1]).sort(),
    allOpcodes.sort(),
    'palette-text rows must match the public opcode inventory',
  );
});

test('places one real palette capture at the start of every member chapter', () => {
  const figures = [
    ['Kamishibai DSL 4.0 Runtime', 'dsl4-palette-kamishibai-runtime.jpg'],
    ['Asset Manager 0.11.0', 'dsl4-palette-asset-manager.jpg'],
    ['Async Input 0.4.0', 'dsl4-palette-async-input.jpg'],
    ['Bubble 0.10.0', 'dsl4-palette-bubble.jpg'],
    ['Runtime Expression 0.4.0', 'dsl4-palette-runtime-expression.jpg'],
    ['SVG Text 0.5.0', 'dsl4-palette-svg-text.jpg'],
    ['TurboWarp Teachable Machine 1.12.0', 'dsl4-palette-tmpose.png'],
  ];

  for (const [heading, filename] of figures) {
    const headingIndex = blockReference.indexOf(`## ${heading}`);
    const imagePath = `../images/${filename}`;
    const imageIndex = blockReference.indexOf(imagePath);
    const nextChapterIndex = blockReference.indexOf('\n## ', headingIndex + 4);
    assert.ok(headingIndex >= 0, `missing chapter ${heading}`);
    assert.ok(imageIndex > headingIndex, `missing chapter-opening figure ${filename}`);
    assert.ok(
      nextChapterIndex === -1 || imageIndex < nextChapterIndex,
      `${filename} is outside the ${heading} chapter`,
    );
    assert.match(
      blockReference.slice(headingIndex, imageIndex),
      /^## [^\n]+\n\n!\[[^\]]+\]\($/u,
      `${filename} must immediately follow the chapter heading`,
    );
  }

  assert.match(blockReference, /固定幅[\s\S]*完全なopcodeと役割[\s\S]*表を正本/u);
});

test('distinguishes feature-gated and host-only APIs from palette blocks', () => {
  assert.match(blockReference, /temporalPoseScoring`が既定OFF/u);
  assert.match(blockReference, /latest-needed/u);
  assert.match(blockReference, /Composition API/u);
  assert.match(blockReference, /パレットには表示されません/u);
  assert.doesNotMatch(
    blockReference,
    /startPredict|stopPredict|isPredicting|firstPredictMsReporter/u,
  );
});

test('documents the two Stage variables exposed to TurboWarp blocks', () => {
  for (const contract of [
    /公開変数（2変数）/u,
    /`ポーズ認識`[\s\S]*0〜100/u,
    /`チャージ`[\s\S]*0〜100/u,
    /dsl4-pose-confidence/u,
    /dsl4-pose-progress/u,
    /`scratchMirror`[\s\S]*既定mode/u,
    /`scratchBinding`[\s\S]*0〜100/u,
    /`presenter`[\s\S]*2変数はランタイムから更新されない/u,
    /`variables:`[\s\S]*内部状態/u,
    /TurboWarpの変数blockから参照できる固定名の公開変数は、上記2変数だけ/u,
  ]) {
    assert.match(blockReference, contract);
  }
});

test('separates the current two Stage variables from the default-off runtime-variable surface', () => {
  assert.match(blockReference, /現状TurboWarpブロックから参照できる公開変数（2変数）/u);
  assert.match(blockReference, /追加surfaceは実装済みですが既定OFF/u);
  assert.match(
    runtimeVariableReference,
    /文書状態: \*\*受け入れ済み・実装済み利用契約（既定OFF）\*\*/u,
  );
  assert.match(runtimeVariableReference, /4\.0\.0-rc\.8の現行公開APIには含まれません/u);
});

test('classifies internal runtime state and defines the implemented block contract', () => {
  for (const contract of [
    /`variables`[\s\S]*公開推奨（読取）/u,
    /`status`[\s\S]*公開推奨/u,
    /`sceneId`[\s\S]*公開推奨/u,
    /`actionIndex`[\s\S]*表示用に変換して公開推奨/u,
    /`diagnostic`[\s\S]*安全部分だけ公開推奨/u,
    /`generation`[\s\S]*非公開/u,
    /`phase`[\s\S]*公開推奨/u,
    /`confidence`[\s\S]*既存`ポーズ認識`で公開済み/u,
    /runtime diagnostics[\s\S]*通常paletteには非公開/u,
  ]) {
    assert.match(runtimeVariableReference, contract);
  }

  for (const blockText of [
    'story variable [NAME]',
    'story variable [NAME] exists?',
    'story status',
    'current scene id',
    'current action path',
    'last runtime error code',
    'pose phase',
    'Kamishibai DSL 4.0 runtime version',
  ]) {
    assert.ok(runtimeVariableReference.includes('`' + blockText + '`'), blockText);
  }
});

test('keeps story-variable mutation staged, typed, cancellable, and reversible', () => {
  for (const contract of [
    /読取surfaceとは別のfeature flag/u,
    /宣言済み型との完全一致/u,
    /action境界でcommit/u,
    /generationが変わった場合は破棄/u,
    /`dsl4TurboWarpStateSurface`[\s\S]*既定OFF/u,
    /`dsl4TurboWarpStoryVariableWrite`[\s\S]*既定OFF/u,
    /現行の125 blockと2つのStage変数に\s*変更がありません/u,
  ]) {
    assert.match(runtimeVariableReference, contract);
  }
});

test('makes expression evaluation a required consumer of the public runtime snapshot', () => {
  for (const currentContract of [
    /`branch\[\]\.if`の条件式/u,
    /ASCIIのbare nameは`score >= 10`/u,
    /`vars\["救助回数"\] >= 2`/u,
    /Stage変数、sprite変数、Temporary Variables[\s\S]*自動では含まれません/u,
  ]) {
    assert.match(blockReference, currentContract);
  }

  for (const implementedContract of [
    /分岐式も同じ公開snapshotを参照する/u,
    /`runtime\["KEY"\]`構文/u,
    /`runtime\["status"\]`[\s\S]*`story status`/u,
    /`runtime\["pose\.phase"\]`[\s\S]*`pose phase`/u,
    /同じ値を\s*同じ型と寿命で参照/u,
    /全ruleで共有/u,
    /ruleごとにStage変数やTemporary Variablesを読み直してはいけません/u,
    /action境界でcommitされた場合にだけ次のbranch snapshotへ入ります/u,
    /`dsl4ExpressionRuntimeState`[\s\S]*既定OFF/u,
  ]) {
    assert.match(runtimeVariableReference, implementedContract);
  }
});

test('splits runtime variables by reader role and cross-links both documents', () => {
  assert.match(runtimeVariableGuide, /「台本を作る人向けドキュメント」に属し/u);
  assert.match(runtimeVariableGuide, /`variables:`へ初期値とともに宣言/u);
  assert.match(runtimeVariableGuide, /`branch\[\]\.if`/u);
  assert.match(runtimeVariableGuide, /次の`branch`は確定した値を参照/u);
  assert.match(
    runtimeVariableGuide,
    /\.\.\/turbowarp-programmer-guides\/dsl-4\.0-runtime-variable-turbowarp-reference\.md/u,
  );

  assert.match(
    runtimeVariableReference,
    /「TurboWarpでプログラムを書く人向けドキュメント」に属し/u,
  );
  assert.match(runtimeVariableReference, /公開block、型付き書込、snapshotの確定時期/u);
  assert.match(
    runtimeVariableReference,
    /\.\.\/dsl-author-guides\/dsl-4\.0-runtime-variable-guide\.md/u,
  );
});
