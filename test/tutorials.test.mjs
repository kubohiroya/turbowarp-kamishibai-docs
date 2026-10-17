import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import {parse} from 'yaml';

import {documentationConfig} from '../docs/config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const tutorialRoot = path.join(projectRoot, 'docs/tutorials');
const navigationContract = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'navigation-contract.json'), 'utf8'),
);
const screenshotManifest = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'screenshots.json'), 'utf8'),
);
const publicationPlan = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'publication-plan.json'), 'utf8'),
);
const packageManifest = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const dsl4Schema = JSON.parse(
  readFileSync(path.join(projectRoot, 'sources/dsl4/dsl-4.schema.json'), 'utf8'),
);
const tutorialSources = Object.fromEntries(
  ['README.md', 'play.md', 'create.md'].map((filename) => [
    filename,
    readFileSync(path.join(tutorialRoot, filename), 'utf8'),
  ]),
);
const implementationWalkthrough = readFileSync(
  path.join(projectRoot, 'docs/developer-guides/dsl4-implementation-walkthrough.md'),
  'utf8',
);
const tutorialScreenshotFixture = readFileSync(
  path.join(projectRoot, 'scripts/fixtures/tutorial-screenshot.html'),
  'utf8',
);

function screenshotMarkers(source) {
  return [...source.matchAll(/<!-- screenshot:([PC]-\d{2}) -->/gu)].map((match) => match[1]);
}

function yamlBlocksBetween(source, startHeading, endHeading) {
  const start = source.indexOf(startHeading);
  const end = source.indexOf(endHeading, start + startHeading.length);
  assert(start >= 0 && end > start);
  return [...source.slice(start, end).matchAll(/```yaml\n([\s\S]*?)\n```/gu)].map(
    (match) => match[1],
  );
}

test('registers the tutorial publications without changing the active AppBar contract', () => {
  assert.equal(navigationContract.status, 'active');
  assert.equal(screenshotManifest.status, 'ready-for-publication');
  assert.deepEqual(
    documentationConfig.documents
      .filter(({sourceDirectory}) => sourceDirectory === 'tutorials')
      .map(({sourceFilename, publicationOutputDirectory, listedOnVersionTop}) => ({
        sourceFilename,
        publicationOutputDirectory,
        listedOnVersionTop,
      })),
    [
      {
        sourceFilename: 'play.md',
        publicationOutputDirectory: '4.0/tutorials/play',
        listedOnVersionTop: true,
      },
      {
        sourceFilename: 'create.md',
        publicationOutputDirectory: '4.0/tutorials/create',
        listedOnVersionTop: true,
      },
    ],
  );

  const publicIndex = readFileSync(path.join(projectRoot, 'site/index.html'), 'utf8');
  assert.match(publicIndex, /ワークショップ<\/a/iu);
  assert.doesNotMatch(publicIndex, /チュートリアル<\/a/iu);
  assert.match(tutorialScreenshotFixture, /<span>ワークショップ<\/span>/u);
  assert.doesNotMatch(tutorialScreenshotFixture, /<span>チュートリアル<\/span>/u);
});

test('defines the active five-item AppBar and current-section rules', () => {
  assert.equal(navigationContract.formatVersion, 1);
  assert.deepEqual(
    navigationContract.items.map(({id, label}) => [id, label]),
    [
      ['home', 'トップ'],
      ['documents', 'ドキュメント'],
      ['workshops', 'ワークショップ'],
      ['samples', '作品'],
      ['downloads', 'ダウンロード'],
    ],
  );
  assert.equal(navigationContract.contractVersion, '2.0.0');
  assert.deepEqual(Object.keys(navigationContract.siteSettings).sort(), [
    'turbowarp-kamishibai-app',
    'turbowarp-kamishibai-docs',
    'turbowarp-kamishibai-samples',
  ]);

  const itemIds = new Set(navigationContract.items.map(({id}) => id));
  for (const rule of navigationContract.currentSectionRules) assert(itemIds.has(rule.current));
  const workshopRuleIndex = navigationContract.currentSectionRules.findIndex(
    ({site, current}) => site === 'turbowarp-kamishibai-docs' && current === 'workshops',
  );
  const documentRuleIndex = navigationContract.currentSectionRules.findIndex(
    ({site, current}) => site === 'turbowarp-kamishibai-docs' && current === 'documents',
  );
  assert(workshopRuleIndex >= 0 && workshopRuleIndex < documentRuleIndex);

  assert.deepEqual(navigationContract.changeLocations.map(({repository}) => repository).sort(), [
    'kubohiroya/turbowarp-kamishibai-app',
    'kubohiroya/turbowarp-kamishibai-docs',
    'kubohiroya/turbowarp-kamishibai-samples',
  ]);
  for (const location of navigationContract.changeLocations) assert(location.paths.length > 0);
});

test('fixes the versioned tutorial publication plan without adding an AppBar item', () => {
  assert.equal(publicationPlan.formatVersion, 1);
  assert.equal(publicationPlan.status, 'ready-for-publication');
  assert.equal(publicationPlan.targetDslVersion, '4.0');
  assert.deepEqual(publicationPlan.listing, {
    source: 'site/4.0/index.html',
    entryCount: 2,
    entries: [
      {
        sectionId: 'user-documents',
        categoryTitle: '紙芝居を見る人向けドキュメント',
        title: '紙芝居を遊ぶ',
        entrySource: 'play.md',
      },
      {
        sectionId: 'dsl-documents',
        categoryTitle: '台本を作る人向けドキュメント',
        title: '紙芝居を作る',
        entrySource: 'create.md',
      },
    ],
  });
  const listingSource = readFileSync(
    path.join(projectRoot, publicationPlan.listing.source),
    'utf8',
  );
  for (const {sectionId, categoryTitle, title, entrySource} of publicationPlan.listing.entries) {
    const section = listingSource.match(
      new RegExp(`<section aria-labelledby="${sectionId}">[\\s\\S]*?<\\/section>`, 'u'),
    )?.[0];
    assert.ok(section);
    assert.match(section, new RegExp(`<h2 id="${sectionId}">${categoryTitle}<\\/h2>`, 'u'));
    assert.match(section, new RegExp(`>[^<]*${title}<\\/h3>`, 'u'));
    assert.match(
      section,
      new RegExp(`href="tutorials/${entrySource.replace(/\.md$/u, '')}/"`, 'u'),
    );
  }
  assert.doesNotMatch(
    listingSource,
    /<h3>[\s\S]*?TurboWarp紙芝居 4\.0 チュートリアル[\s\S]*?<\/h3>/u,
  );
  assert.deepEqual(
    publicationPlan.pages.map(({source, publicPath, role}) => [source, publicPath, role]),
    [
      ['play.md', '/4.0/tutorials/play/', 'play'],
      ['create.md', '/4.0/tutorials/create/', 'create'],
    ],
  );
  assert.equal(new Set(publicationPlan.pages.map(({publicPath}) => publicPath)).size, 2);
  for (const page of publicationPlan.pages) {
    assert(page.publicPath.startsWith('/4.0/tutorials/'));
    assert.equal(readFileSync(path.join(tutorialRoot, page.source), 'utf8').length > 0, true);
  }
  assert.deepEqual(publicationPlan.redirects, [
    {
      source: 'site/4.0/tutorials/index.html',
      from: '/4.0/tutorials/',
      to: '/4.0/',
    },
  ]);
  const redirectSource = readFileSync(
    path.join(projectRoot, publicationPlan.redirects[0].source),
    'utf8',
  );
  assert.match(redirectSource, /http-equiv="refresh" content="0; url=\.\.\/"/u);
  assert.match(redirectSource, /rel="canonical"[^>]*\/4\.0\//u);
  assert.deepEqual(
    publicationPlan.activationGates,
    screenshotManifest.gates.map(({id}) => id),
  );
  assert.deepEqual(publicationPlan.navigation, {
    contract: 'navigation-contract.json',
    addAppBarItem: false,
    currentItem: 'documents',
    currentLabel: 'ドキュメント',
  });
  assert.equal(
    navigationContract.items.some(
      ({id, label}) => id === 'tutorials' || label === 'チュートリアル',
    ),
    false,
  );
  assert(
    navigationContract.currentSectionRules.some(
      ({site, pathPrefix, current}) =>
        site === 'turbowarp-kamishibai-docs' &&
        pathPrefix === '/turbowarp-kamishibai-docs/' &&
        current === 'documents',
    ),
  );
  assert.deepEqual(publicationPlan.rollback, {
    removeListingEntries: true,
    unpublishPages: true,
    restoreOverviewPage: true,
    preserveAppBar: true,
    preserveDsl32: true,
  });
});

test('maps every planned screenshot to a draft marker and a release gate', () => {
  assert.equal(screenshotManifest.formatVersion, 2);
  assert.equal(screenshotManifest.targetDslVersion, '4.0');
  assert.deepEqual(screenshotManifest.releaseBaseline, {
    version: '4.0.0-rc.5',
    channel: 'next',
    state: 'published-prerelease',
    sourceIdentity: 'sha256:a6c4be01405af1b3070f6d02dc584a55bd2b45844ae48761aa3d4141ef474ca4',
    sb3Sha256: '2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c',
    npmUrl: 'https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.5',
    githubReleaseUrl:
      'https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.5',
    pagesUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/',
    evidence: [
      'https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/583',
      'https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/596',
    ],
  });
  assert.equal(
    screenshotManifest.implementationBaseline.commit,
    'f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6',
  );
  assert.deepEqual(screenshotManifest.browserAuthoringBaseline, {
    version: '4.0.0-rc.5',
    state: 'published-prerelease',
    issue: 'https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/555',
    documentationIssue: 'https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/118',
    captureFixture: 'test/fixtures/dsl4/browser-authoring-menu.html',
  });
  assert.equal(
    screenshotManifest.sampleBaseline.commit,
    '919565243adc3800ebe8271cc4af6f7b68110ef2',
  );
  assert.equal(screenshotManifest.sampleBaseline.runtimeVersion, '4.0.0-rc.3');
  assert.equal(screenshotManifest.sampleBaseline.differsFromReleaseBaseline, true);
  assert.equal(screenshotManifest.sampleBaseline.pullRequestState, 'merged');
  assert.equal(
    screenshotManifest.sampleBaseline.publicationCommit,
    '919565243adc3800ebe8271cc4af6f7b68110ef2',
  );
  assert.equal(screenshotManifest.sampleBaseline.status, 'tutorial-sample-published');
  assert.deepEqual(screenshotManifest.sampleBaseline.publicSamples, {
    urashima: {
      detailUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/',
      webUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/web-4.0/',
      yamlUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/urashima.k4.yml',
      sb3Url:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/urashima-4.0.sb3',
      sb3Sha256: '4516f543c25fe8d96edfa639cf789a174fd898199c5e34a1a29e079ceecbc6cb',
      webSha256: 'd0a605d0f7838fd52f1ceb71507ad0385435d0ad32cd7ebc8ae4798bed8e37ce',
    },
    myUrashima: {
      detailUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/my-urashima/',
      webUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/my-urashima/web-4.0/',
      sb3Sha256: '7cbb6084b42d11c61473649db45950e293cf806ce1f54bace61f9c17ad7f33f3',
      webSha256: 'c1952f90e1cd25502d0dfcbe379f9493183d8af308c6338e1afe716540404c10',
    },
    tutorial: {
      detailUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/',
      webUrl: 'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/web-4.0/',
      yamlUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/story.kamishibai.yaml',
      sb3Url:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/tutorial-4.0.sb3',
      starterUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/tutorial-story-starter-4.0.zip',
      additionKitUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/tutorial-story-addition-kit-4.0.zip',
      manifestUrl:
        'https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/public-surfaces.json',
      sb3Sha256: '518fe92750a2e05a4711d8c9ad646256e9b21b9fa7161275174d12cca3a4dc7b',
      webSha256: 'ff9553c797e4b613f8c03dbbe5c9cdec1b3493e927b13df8ddf975666a6ec513',
    },
  });
  assert.equal(
    screenshotManifest.sampleBaseline.sb3Sha256,
    '518fe92750a2e05a4711d8c9ad646256e9b21b9fa7161275174d12cca3a4dc7b',
  );
  assert.equal(
    screenshotManifest.sampleBaseline.webSha256,
    'ff9553c797e4b613f8c03dbbe5c9cdec1b3493e927b13df8ddf975666a6ec513',
  );
  assert.equal(screenshotManifest.sampleBaseline.formalCaptureReuse, true);
  assert.equal(
    screenshotManifest.sampleBaseline.walkthrough,
    '../developer-guides/dsl4-implementation-walkthrough.md',
  );
  assert.deepEqual(screenshotManifest.capturePolicy.viewport, {width: 1280, height: 720});
  assert.equal(screenshotManifest.capturePolicy.deviceScaleFactor, 1);
  assert.equal(screenshotManifest.capturePolicy.locale, 'ja-JP');
  assert.equal(screenshotManifest.capturePolicy.reducedMotion, true);
  assert.equal(screenshotManifest.capturePolicy.sourcePathsVisible, false);
  assert.equal(screenshotManifest.capturePolicy.cameraPermissionRequired, false);
  assert.equal(screenshotManifest.capturePolicy.cameraSubject, 'synthetic-fixture');
  assert.equal(screenshotManifest.capturePolicy.capturedAt, '2026-08-13T11:39:48+09:00');
  assert.match(screenshotManifest.capturePolicy.browser, /Google Chrome 151/u);
  assert.match(screenshotManifest.capturePolicy.provenance.privacy, /no real person/u);

  for (const captureId of ['P-01', 'P-02']) {
    const capture = screenshotManifest.captures.find(({id}) => id === captureId);
    assert.equal(capture.capturedAt, '2026-08-13T11:39:48+09:00');
    assert.equal(capture.captureProvenance.sampleCommit, screenshotManifest.sampleBaseline.commit);
    assert.equal(capture.captureProvenance.pagesDeploymentRun, 31660773675);
  }

  const expectedIds = [
    ...Array.from({length: 8}, (_, index) => `P-${String(index + 1).padStart(2, '0')}`),
    ...Array.from({length: 14}, (_, index) => `C-${String(index + 1).padStart(2, '0')}`),
  ];
  const captureIds = screenshotManifest.captures.map(({id}) => id);
  assert.deepEqual(captureIds.sort(), expectedIds.sort());
  assert.equal(new Set(captureIds).size, captureIds.length);

  const markers = [
    ...screenshotMarkers(tutorialSources['play.md']),
    ...screenshotMarkers(tutorialSources['create.md']),
  ];
  assert.deepEqual(markers.sort(), expectedIds.sort());
  assert.equal(new Set(markers).size, markers.length);

  const createCaptureSteps = Object.fromEntries(
    screenshotManifest.captures
      .filter(({tutorial}) => tutorial === 'create')
      .map(({id, step}) => [id, step]),
  );
  assert.deepEqual(createCaptureSteps, {
    'C-01': 2,
    'C-02': 3,
    'C-03': 3,
    'C-04': 3,
    'C-05': 4,
    'C-06': 4,
    'C-07': 5,
    'C-08': 5,
    'C-09': 5,
    'C-10': 6,
    'C-11': 7,
    'C-12': 9,
    'C-13': 1,
    'C-14': 8,
  });

  const gateIds = new Set(screenshotManifest.gates.map(({id}) => id));
  assert.deepEqual(
    screenshotManifest.gates.filter(({ready}) => ready).map(({id}) => id),
    [
      'dsl4-release',
      'tutorial-sample',
      'app-shell',
      'preview-flow',
      'browser-authoring',
      'pose-feedback',
      'camera-controls',
      'cli-contract',
      'capture-environment',
    ],
  );
  assert.deepEqual(
    Object.fromEntries(
      screenshotManifest.gates.map(({id, progressStatus}) => [id, progressStatus]),
    ),
    {
      'dsl4-release': 'published',
      'tutorial-sample': 'published',
      'app-shell': 'published',
      'preview-flow': 'implemented',
      'browser-authoring': 'published',
      'pose-feedback': 'published',
      'camera-controls': 'published',
      'cli-contract': 'published',
      'capture-environment': 'published',
    },
  );
  for (const gate of screenshotManifest.gates) {
    assert(['blocked', 'partial', 'implemented', 'published'].includes(gate.progressStatus));
    assert.equal(gate.remaining.length === 0, gate.ready);
    if (gate.progressStatus !== 'blocked') assert(gate.evidence.length > 0);
  }
  assert(
    screenshotManifest.gates
      .find(({id}) => id === 'preview-flow')
      .dependencies.includes('https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/394'),
  );
  const releaseGate = screenshotManifest.gates.find(({id}) => id === 'dsl4-release');
  assert.equal(releaseGate.ready, true);
  assert.equal(releaseGate.progressStatus, 'published');
  assert.deepEqual(releaseGate.dependencies, [
    'https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/583',
  ]);
  assert.match(releaseGate.description, /4\.0\.0-rc\.5/u);
  assert.equal(releaseGate.remaining.length, 0);
  const tutorialSampleGate = screenshotManifest.gates.find(({id}) => id === 'tutorial-sample');
  assert.equal(tutorialSampleGate.ready, true);
  assert.deepEqual(tutorialSampleGate.dependencies, [
    'https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/94',
    'https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/100',
    'https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/102',
    'https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/104',
  ]);
  assert(
    tutorialSampleGate.evidence.includes(
      'https://github.com/kubohiroya/turbowarp-kamishibai-samples/pull/107',
    ),
  );
  assert.match(tutorialSampleGate.description, /starter、addition kit、Web版、SB3/u);
  assert.equal(tutorialSampleGate.remaining.length, 0);

  for (const capture of screenshotManifest.captures) {
    assert(['play', 'create'].includes(capture.tutorial));
    assert(capture.gates.length > 0);
    assert(capture.gates.every((gate) => gateIds.has(gate)));
    assert(
      capture.required
        ? capture.status === 'captured'
        : ['not-applicable', 'reused'].includes(capture.status),
    );
    const imageEntries = capture.frames ?? [capture];
    for (const imageEntry of imageEntries) {
      assert(imageEntry.captionDraft.length > 0);
      assert(imageEntry.altDraft.length > 0);
      assert(
        imageEntry.filename.startsWith(
          `docs/images/tutorials/dsl4/${capture.tutorial}/tutorial-${capture.tutorial}-`,
        ),
      );
      assert(imageEntry.filename.endsWith('.png'));
      if (capture.required) {
        const bytes = readFileSync(path.join(projectRoot, imageEntry.filename));
        assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
        assert.equal(bytes.readUInt32BE(16), 1280);
        assert.equal(bytes.readUInt32BE(20), 720);
        const artifactId = capture.frames ? `${capture.id}-${imageEntry.id}` : capture.id;
        assert.equal(
          `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
          screenshotManifest.captureArtifacts[artifactId],
        );
      }
    }
  }
  assert.equal(Object.keys(screenshotManifest.captureArtifacts).length, 21);

  const fixtureFrames = screenshotManifest.captures.flatMap((capture) =>
    capture.frames
      ? capture.frames.map(({sourceFixtureFrame}) => sourceFixtureFrame)
      : [capture.sourceFixtureFrame].filter(Boolean),
  );
  assert.deepEqual(fixtureFrames.sort(), [
    'camera-control-collision',
    'dialog-position-selector',
    'dialog-scope-selector',
    'reloaded-action',
    'watching-top-right',
  ]);

  const reloadDialogCapture = screenshotManifest.captures.find(({id}) => id === 'C-05');
  assert.equal(reloadDialogCapture.frames.length, 2);
  assert.match(reloadDialogCapture.description, /2段階/u);

  const previewControlCapture = screenshotManifest.captures.find(({id}) => id === 'C-10');
  assert.equal(previewControlCapture.reuseOf, undefined);
  assert.equal(previewControlCapture.sourceFixtureFrame, 'camera-control-collision');
  assert(previewControlCapture.gates.includes('camera-controls'));
  assert.match(previewControlCapture.description, /重ならない/u);

  const optionalCaptures = screenshotManifest.captures.filter(({required}) => !required);
  assert(optionalCaptures.every(({conditional}) => conditional.length > 0));
});

test('keeps the published prerelease reviewable with its fixed captures', () => {
  assert.match(tutorialSources['README.md'], /### rc\.22の現行基準/u);
  assert.match(tutorialSources['README.md'], /### 過去の実装追跡（rc\.8）/u);
  assert.match(tutorialSources['README.md'], /rc\.22の検証へ読み替えません/u);
  assert.match(tutorialSources['README.md'], /公開プレリリース/u);
  assert.match(tutorialSources['README.md'], /\/4\.0\/tutorials\/play\//u);
  assert.match(tutorialSources['README.md'], /\/4\.0\/tutorials\/create\//u);
  assert.match(
    tutorialSources['README.md'],
    /「紙芝居を遊ぶ」を[\s\S]*「紙芝居を見る人向けドキュメント」/u,
  );
  assert.match(tutorialSources['README.md'], /「紙芝居を作る」を「台本を作る人向けドキュメント」/u);
  assert.match(tutorialSources['README.md'], /独立カテゴリーや統合一覧カードは設けません/u);
  assert.match(tutorialSources['README.md'], /AppBarへ独立した「チュートリアル」項目は追加せず/u);
  assert.match(tutorialSources['play.md'], /## 完了チェック/u);
  assert.match(tutorialSources['create.md'], /Scratchのブロックは追加しません/u);
  assert.match(tutorialSources['create.md'], /```yaml[\s\S]*kamishibai: '4\.0'/u);
  assert.match(tutorialSources['create.md'], /preview-dsl4 --help/u);
  assert.match(tutorialSources['create.md'], /validate-dsl4/u);
  assert.match(tutorialSources['create.md'], /build-dsl4/u);
  assert.match(tutorialSources['create.md'], /4\.0\.0-rc\.22/u);
  assert.match(tutorialSources['create.md'], /addition-kit\/earthquake-classroom\.svg/u);
  assert.match(tutorialSources['create.md'], /addition-kit\/add-pose-scene\.yml\.txt/u);
  assert.match(tutorialSources['create.md'], /file: classroom\.svg/u);
  assert.match(tutorialSources['create.md'], /file: student-ready\.svg/u);
  assert.match(tutorialSources['create.md'], /file: earthquake-classroom\.svg/u);
  assert.match(tutorialSources['create.md'], /更新状態ボタン[\s\S]*再開位置[\s\S]*再開方針/u);
  assert.match(tutorialSources['create.md'], /recognitionModel: SafetyPose/u);
  assert.match(tutorialSources['create.md'], /overlay:[\s\S]*boneStyle:[\s\S]*width: 3/u);
  assert.match(tutorialSources['create.md'], /Student\.show:[\s\S]*skin: ProtectHead/u);
  assert.match(tutorialSources['create.md'], /success:[\s\S]*できた！ 頭を守れたね/u);
  assert.match(tutorialSources['play.md'], /メニューへ戻る前[\s\S]*できたこと/u);
  assert.match(tutorialSources['create.md'], /`Student\.sya`を`Student\.say`へ直/u);
  const advancedCli = tutorialSources['create.md'].indexOf('## 高度な利用者・CI向けのCLI（任意）');
  assert(advancedCli > 0);
  const generalAuthorFlow = tutorialSources['create.md'].slice(0, advancedCli);
  assert.doesNotMatch(generalAuthorFlow, /```bash|pnpm exec turbowarp-kamishibai-app/u);
  assert.match(generalAuthorFlow, /緑の旗[\s\S]*台本を開く[\s\S]*tutorial-story/u);
  assert.match(generalAuthorFlow, /配布用SB3を作る/u);
  assert.doesNotMatch(
    tutorialSources['create.md'],
    /candidate|session token|transactional|Story Path|severity|外周8方向|プロジェクトを開く/iu,
  );
  assert.doesNotMatch(tutorialSources['create.md'], /├── assets\/[\s\S]*└── pose-models\//u);
});

test('routes general users and script authors before implementation details', () => {
  assert.match(
    tutorialSources['play.md'],
    /入口: \[TurboWarp紙芝居 4\.0 ドキュメント\]\(https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-docs\/4\.0\/\)/u,
  );
  assert.match(tutorialSources['play.md'], /## 最初にやること/u);
  assert.match(tutorialSources['play.md'], /台本やコマンドを入力する必要はありません/u);

  assert.match(
    tutorialSources['create.md'],
    /入口: \[TurboWarp紙芝居 4\.0 ドキュメント\]\(https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-docs\/4\.0\/\)/u,
  );
  assert.match(tutorialSources['create.md'], /## 最初のゴール/u);
  assert.match(tutorialSources['create.md'], /ここではまだ編集せず、Step 1から順番に進めます/u);
  assert.match(tutorialSources['create.md'], /text: なにがおきたの？/u);
  assert.match(tutorialSources['create.md'], /text: 地震だ！/u);
  assert.match(tutorialSources['create.md'], /Scratchのブロックは追加しません/u);
  assert.match(tutorialSources['play.md'], /stories\/tutorial\/web-4\.0\//u);
  assert.match(tutorialSources['create.md'], /tutorial-story-starter-4\.0\.zip/u);

  const previewStep = tutorialSources['create.md'].indexOf('## 3. TurboWarpで作品フォルダーを開く');
  const editStep = tutorialSources['create.md'].indexOf('## 4. セリフを変更する');
  const changedDialogue = tutorialSources['create.md'].indexOf('text: 地震だ！');
  assert(previewStep >= 0 && previewStep < editStep && editStep < changedDialogue);
});

test('keeps the starter and every tutorial addition valid against the pinned DSL 4.0 Schema', () => {
  const createSource = tutorialSources['create.md'];
  const [starterBlock] = yamlBlocksBetween(
    createSource,
    '## 4. セリフを変更する',
    '## 5. 背景、登場人物、場面を追加する',
  );
  const starter = parse(starterBlock);
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const validate = new AjvConstructor({allErrors: true, strict: false}).compile(dsl4Schema);
  assert.equal(validate(starter), true, JSON.stringify(validate.errors));

  const [newAssets, newActor, newScene] = yamlBlocksBetween(
    createSource,
    '## 5. 背景、登場人物、場面を追加する',
    '## 6. ポーズ場面を追加する',
  ).map((block) => parse(block));
  Object.assign(starter, newAssets, newActor, newScene);

  const [poseAssets, poseScene] = yamlBlocksBetween(
    createSource,
    '## 6. ポーズ場面を追加する',
    '## 7. 診断を読んで修正する',
  ).map((block) => parse(block));
  Object.assign(starter, poseAssets, poseScene);
  assert.equal(validate(starter), true, JSON.stringify(validate.errors));
  assert.deepEqual(Object.keys(starter.scenes), [
    'earthquake',
    'instruction',
    'protect',
    'success',
  ]);
  assert.equal(starter.scenes.protect.actions[1]['Student.show'].skin, 'ProtectHead');
  assert.equal(
    starter.scenes.success[2]['Student.say'].text,
    'できた！ 頭を守れたね。揺れがおさまるまで、そのまま待とう。',
  );
});

test('separates reader-facing screenshot text from capture-only implementation details', () => {
  const createCaptures = screenshotManifest.captures.filter(({tutorial}) => tutorial === 'create');
  const readerText = createCaptures
    .flatMap((capture) => capture.frames ?? [capture])
    .flatMap(({captionDraft, altDraft}) => [captionDraft, altDraft])
    .join('\n');
  assert.doesNotMatch(
    readerText,
    /candidate|kind|scene|action|reload status button|camera control|8方向/iu,
  );

  for (const id of ['C-05', 'C-08', 'C-10']) {
    const capture = createCaptures.find((candidate) => candidate.id === id);
    const notes = (capture.frames ?? [capture]).flatMap(({captureNotes = []}) => captureNotes);
    assert(notes.length > 0, `${id} must keep its implementation details in captureNotes`);
  }
});

test('keeps the reproducible implementation walkthrough in the developer guide', () => {
  assert.match(
    tutorialSources['README.md'],
    /\.\.\/developer-guides\/dsl4-implementation-walkthrough\.md/u,
  );
  assert.match(implementationWalkthrough, /開発者向け追試手順/u);
  assert.match(implementationWalkthrough, /29c0deadcb98badf94a0244c479ca896dc71f842/u);
  assert.match(
    implementationWalkthrough,
    /turbowarp-kamishibai-samples`は取得・build・変更しません/u,
  );
  assert.match(implementationWalkthrough, /preview-dsl4 --watch/u);
  assert.match(implementationWalkthrough, /K4-VERSION-001/u);
  assert.match(
    implementationWalkthrough,
    /91d7f594aaf922450fba359a90c7c26e7c1dfda51cf002534cb4605dbb0d7041/u,
  );
  for (const filename of [
    'dsl4-rc5-preview-running.png',
    'dsl4-rc5-runtime-title.png',
    'dsl4-rc5-preview-diagnostic.png',
  ]) {
    assert.match(implementationWalkthrough, new RegExp(`\\.\\./images/${filename}`, 'u'));
  }
  assert.doesNotMatch(implementationWalkthrough, /<!-- screenshot:[PC]-\d{2} -->/u);
  assert.doesNotMatch(implementationWalkthrough, /正式公開プレイヤーの操作説明です/u);
  assert.match(packageManifest.scripts.format, /dsl4-implementation-walkthrough/u);
});
