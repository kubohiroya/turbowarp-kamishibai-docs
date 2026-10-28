import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import {injectSiteAppBar} from '../scripts/site-appbar.mjs';
import {shouldHideAppBarForFragment, updateAppBarScrollState} from '../site/site-shell.js';

const rootIndex = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const dsl32Index = readFileSync(new URL('../site/3.2/index.html', import.meta.url), 'utf8');
const dsl40Index = readFileSync(new URL('../site/4.0/index.html', import.meta.url), 'utf8');
const workshopIndex = readFileSync(
  new URL('../site/workshops/index.html', import.meta.url),
  'utf8',
);
const licensesIndex = readFileSync(new URL('../site/licenses/index.html', import.meta.url), 'utf8');
const documentIndexCss = readFileSync(
  new URL('../site/document-index.css', import.meta.url),
  'utf8',
);

test('keeps only the native Kamishibai header on static and generated documentation pages', () => {
  const siteShell = readFileSync(new URL('../site/site-shell.js', import.meta.url), 'utf8');
  assert.doesNotMatch(siteShell, /turbowarp-plus-site-header|turbowarp-plus-header/u);
  for (const html of [
    rootIndex,
    dsl32Index,
    dsl40Index,
    workshopIndex,
    licensesIndex,
    injectSiteAppBar('<html><head></head><body><main>文書本文</main></body></html>', '../../../', {
      pathname: '/turbowarp-kamishibai-docs/4.0/user-guides/user-guide-4.0/',
    }),
  ]) {
    assert.equal((html.match(/<header class="site-header">/gu) ?? []).length, 1);
    assert.match(html, /<span>TurboWarp紙芝居<\/span>/u);
    assert.match(html, /src="(?:\.\.\/)*site-shell\.js"/u);
    assert.doesNotMatch(html, /turbowarp-plus-site-header|<turbowarp-plus-header\b/u);
  }
});

test('preserves native header scrolling, focus visibility and document fragment behavior', () => {
  const initial = {lastY: 0, accumulatedDelta: 0, hidden: false};
  const hidden = updateAppBarScrollState(initial, {
    scrollY: 120,
    headerHeight: 64,
    hasFocus: false,
  });
  assert.equal(hidden.hidden, true);
  assert.equal(
    updateAppBarScrollState(hidden, {scrollY: 100, headerHeight: 64, hasFocus: false}).hidden,
    false,
  );
  assert.equal(
    updateAppBarScrollState(hidden, {scrollY: 120, headerHeight: 64, hasFocus: true}).hidden,
    false,
  );
  assert.equal(
    updateAppBarScrollState(hidden, {scrollY: 0, headerHeight: 64, hasFocus: false}).hidden,
    false,
  );
  assert.equal(shouldHideAppBarForFragment({hash: '#section', isDocumentPage: true}), true);
  assert.equal(shouldHideAppBarForFragment({hash: '#main-content', isDocumentPage: true}), false);
  assert.equal(shouldHideAppBarForFragment({hash: '#section', isDocumentPage: false}), false);
});

test('keeps version selection and camera privacy guidance on the site root', () => {
  assert.match(rootIndex, /<h1>紙芝居DSLの版を選ぶ<\/h1>/u);
  assert.equal((rootIndex.match(/class="version-banner version-banner--/gu) ?? []).length, 2);
  assert.doesNotMatch(rootIndex, /common-content|3\.2／4\.0 共通コンテンツ/u);
  assert.doesNotMatch(rootIndex, /href="workshops\/"/u);
  assert.doesNotMatch(rootIndex, /class="actions"/u);
  assert.doesNotMatch(rootIndex, /publication\.json/u);
  assert.match(rootIndex, /href="3\.2\/">DSL 3\.2のドキュメントへ/u);
  assert.match(rootIndex, /href="4\.0\/">DSL 4\.0のドキュメントへ/u);
  assert.ok(rootIndex.indexOf('version-banner--40') < rootIndex.indexOf('version-banner--32'));

  for (const document of documentationConfig.documents) {
    assert.doesNotMatch(rootIndex, new RegExp(`${document.publicationOutputDirectory}/`, 'u'));
  }
});

test('explains camera privacy immediately after the version banners', () => {
  const bannersStart = rootIndex.indexOf('<div class="version-banners"');
  const privacyStart = rootIndex.indexOf('<aside class="camera-privacy"');
  const mainEnd = rootIndex.indexOf('</main>');
  const privacy = rootIndex.slice(privacyStart, mainEnd);

  assert.ok(bannersStart >= 0);
  assert.ok(privacyStart > bannersStart);
  assert.ok(mainEnd > privacyStart);
  assert.match(privacy, /このアプリにおけるカメラ利用について/u);
  assert.match(privacy, /紙芝居を作成するとき/u);
  assert.match(privacy, /紙芝居を鑑賞するとき/u);
  assert.match(privacy, /ファイルにはサンプル画像が含まれます/u);
  assert.match(privacy, /元のサンプル画像そのものは含まれません/u);
  assert.match(privacy, /カメラの画像を外部へアップロードしません/u);
  assert.match(privacy, /学習済みモデルを紙芝居自体に含めて配布でき/u);
  assert.match(privacy, /モデル取得のための通信は行いません/u);
  assert.match(privacy, /記録・保存する機能はありません/u);
  assert.match(documentIndexCss, /\.camera-privacy__grid/u);
  assert.match(
    documentIndexCss,
    /@media \(max-width: 700px\)[\s\S]*\.camera-privacy__grid\s*\{\s*grid-template-columns: 1fr/u,
  );
});

test('styles camera privacy guidance independently from DSL version banners', () => {
  const version40Styles = documentIndexCss.match(/\.version-banner--40\s*\{([^}]*)\}/u)?.[1];
  const privacyStyles = documentIndexCss.match(/\.camera-privacy\s*\{([^}]*)\}/u)?.[1];
  const version40Accent = version40Styles?.match(/--version-accent:\s*(#[0-9a-f]{6})/u)?.[1];
  const version40Tint = version40Styles?.match(/--version-tint:\s*(#[0-9a-f]{6})/u)?.[1];
  const privacyAccent = privacyStyles?.match(/--privacy-accent:\s*(#[0-9a-f]{6})/u)?.[1];
  const privacyTint = privacyStyles?.match(/--privacy-tint:\s*(#[0-9a-f]{6})/u)?.[1];

  assert.ok(version40Accent);
  assert.ok(version40Tint);
  assert.ok(privacyAccent);
  assert.ok(privacyTint);
  assert.notEqual(privacyAccent, version40Accent);
  assert.notEqual(privacyTint, version40Tint);
  assert.match(privacyStyles, /background:[^;]*var\(--privacy-tint\)/u);
});

test('publishes each document only from its version-specific top page', () => {
  for (const document of documentationConfig.documents) {
    const versionIndex = document.version === '3.2' ? dsl32Index : dsl40Index;
    const otherVersionIndex = document.version === '3.2' ? dsl40Index : dsl32Index;
    const localDirectory = document.publicationOutputDirectory.replace(`${document.version}/`, '');

    if (document.listedOnVersionTop !== false) {
      assert.match(versionIndex, new RegExp(`href="${localDirectory}/"`, 'u'));
      assert.match(
        versionIndex,
        new RegExp(
          `turbowarp-kamishibai-docs/${document.publicationOutputDirectory}/publication\\.json`,
          'u',
        ),
      );
      const hrefPosition = versionIndex.indexOf(`class="button" href="${localDirectory}/"`);
      const card = versionIndex.slice(
        versionIndex.lastIndexOf('<article>', hrefPosition),
        versionIndex.indexOf('</article>', hrefPosition),
      );
      const [year, month, day] = document.updatedAt.split('-').map(Number);
      assert.match(
        card,
        new RegExp(
          `<p class="document-updated">\\s*更新日: <time datetime="${document.updatedAt}">${year}年${month}月${day}日<\\/time>\\s*<\\/p>`,
          'u',
        ),
      );
    } else {
      assert.doesNotMatch(versionIndex, new RegExp(`href="${localDirectory}/"`, 'u'));
    }
    assert.doesNotMatch(otherVersionIndex, new RegExp(`href="${localDirectory}/"`, 'u'));
    assert.doesNotMatch(versionIndex, new RegExp(`href="${localDirectory}\\.pdf"`, 'u'));
  }
});

test('keeps publication actions on their dedicated version and workshop pages', () => {
  const dsl32Actions = [...dsl32Index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const dsl40Actions = [...dsl40Index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const workshopActions = [...workshopIndex.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const dsl32Documents = documentationConfig.documents.filter(({version}) => version === '3.2');
  const dsl40Documents = documentationConfig.documents.filter(
    ({version, listedOnVersionTop}) => version === '4.0' && listedOnVersionTop !== false,
  );

  assert.equal(dsl32Actions.length, dsl32Documents.length);
  assert.equal(dsl40Actions.length, dsl40Documents.length);
  assert.equal(workshopActions.length, 2);
  for (const [, actions] of dsl32Actions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer']);
  }
  for (const [, actions] of workshopActions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer', 'PDF']);
  }
  for (const [, actions] of dsl40Actions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer']);
  }
});

test('styles the update date shown on every document card', () => {
  assert.match(documentIndexCss, /\.document-updated\s*\{/u);
  const listedDocuments = documentationConfig.documents.filter(
    ({listedOnVersionTop}) => listedOnVersionTop !== false,
  );
  assert.equal(
    (dsl32Index.match(/class="document-updated"/gu) ?? []).length +
      (dsl40Index.match(/class="document-updated"/gu) ?? []).length,
    listedDocuments.length,
  );
});

test('keeps the two version tops independent', () => {
  const dsl40Content = dsl40Index.replace(/<nav class="version-switch"[\s\S]*?<\/nav>/u, '');

  assert.match(dsl32Index, /<h1>紙芝居DSL 3\.2 ドキュメント<\/h1>/u);
  assert.match(dsl40Index, /<h1>TurboWarp紙芝居 4\.0 ドキュメント<\/h1>/u);
  assert.doesNotMatch(dsl32Index, /kamishibai: '4\.0'|Source Graph/u);
  assert.match(dsl40Content, /href="dsl-author-guides\/dsl-3\.2-to-4\.0-conversion-guide\/"/u);
  assert.doesNotMatch(
    dsl40Content,
    /href="dsl-author-guides\/(?:dsl-manual|command-reference|history)\/"/u,
  );
  assert.match(dsl32Index, /href="\.\.\/4\.0\/">DSL 4\.0へ切り替える/u);
  assert.match(dsl40Index, /href="\.\.\/3\.2\/">DSL 3\.2へ切り替える/u);
});

test('organizes both version tops by reader role and routes tutorials directly', () => {
  for (const index of [dsl32Index, dsl40Index]) {
    assert.match(index, />紙芝居を見る人向けドキュメント<\/h2>/u);
    assert.match(
      index,
      />(?:台本を作る人向けドキュメント|台本DSLで台本を作る人向けドキュメント)<\/h2>/u,
    );
    assert.match(index, />アプリを開発する人向けドキュメント<\/h2>/u);
    assert.doesNotMatch(index, />一般向けドキュメント<\/h2>/u);
    assert.doesNotMatch(index, />開発者向けドキュメント<\/h2>/u);
  }

  const viewerSection = dsl40Index.match(
    /<section aria-labelledby="user-documents">[\s\S]*?<\/section>/u,
  )?.[0];
  const authorSection = dsl40Index.match(
    /<section aria-labelledby="dsl-documents">[\s\S]*?<\/section>/u,
  )?.[0];
  assert.ok(viewerSection);
  assert.ok(authorSection);
  assert.match(viewerSection, /href="tutorials\/play\/"/u);
  assert.doesNotMatch(viewerSection, /href="tutorials\/create\/"/u);
  assert.match(authorSection, /href="tutorials\/create\/"/u);
  assert.doesNotMatch(authorSection, /href="tutorials\/play\/"/u);
  assert.doesNotMatch(dsl40Index, /class="button" href="tutorials\/"/u);
  assert.match(dsl40Index, /tutorials\/play\/publication\.json/u);
  assert.match(dsl40Index, /tutorials\/create\/publication\.json/u);
  assert.match(dsl40Index, />TurboWarpでプログラムを書く人向けドキュメント\s*<\/h2>/u);
  assert.match(dsl40Index, /DSL 4\.0ランタイムとのメッセージ・block・変数連携/u);
  assert.match(
    dsl40Index,
    /id="dsl-documents"[\s\S]*id="turbowarp-programmer-documents"[\s\S]*id="developer-documents"/u,
  );
  assert.match(dsl40Index, /turbowarp-programmer-guides\/dsl-4\.0-turbowarp-broadcast-guide\//u);
  assert.match(dsl40Index, /turbowarp-programmer-guides\/dsl-4\.0-runtime-block-reference\//u);
  assert.match(dsl40Index, /dsl-author-guides\/dsl-4\.0-runtime-variable-guide\//u);
  assert.match(
    dsl40Index,
    /turbowarp-programmer-guides\/dsl-4\.0-runtime-variable-turbowarp-reference\//u,
  );
});

test('explains how to choose between the versions on the root page', () => {
  assert.match(rootIndex, /既存作品を継続/u);
  assert.match(rootIndex, /新規制作を開始/u);
  assert.match(rootIndex, /kamishibai=3\.2/u);
  assert.match(rootIndex, /<code>\.txt<\/code>/u);
  assert.match(rootIndex, /kamishibai: '4\.0'/u);
  assert.match(rootIndex, /<code>\.k4\.yml<\/code>/u);
  assert.match(rootIndex, /include文/u);
  assert.doesNotMatch(rootIndex, /Source Graph/u);
  assert.match(documentIndexCss, /\.version-banner__primary:focus-visible/u);
  assert.match(rootIndex, /aria-labelledby="version-32-title"/u);
  assert.match(rootIndex, /aria-labelledby="version-40-title"/u);
});

test('links each version label and heading to its version top', () => {
  for (const {version, heading} of [
    {version: '4.0', heading: 'YAML projectと4.0 toolchainで新しく作る'},
    {version: '3.2', heading: 'TXT台本と3.2.xアプリを使い続ける'},
  ]) {
    const href = version.replace('.', '\\.');
    assert.match(
      rootIndex,
      new RegExp(
        `<a\\s+class="version-banner__label"\\s+href="${href}/"\\s+aria-label="DSL ${href}のドキュメントへ"`,
        'u',
      ),
    );
    assert.match(
      rootIndex,
      new RegExp(
        `<h2 id="version-${version.replace('.', '')}-title">\\s*<a class="version-banner__title-link" href="${href}/"[^>]*>${heading}</a`,
        'u',
      ),
    );
  }
  assert.match(documentIndexCss, /\.version-banner__label:focus-visible/u);
  assert.match(documentIndexCss, /\.version-banner__title-link:focus-visible/u);
});

test('keeps each version criterion list concise', () => {
  for (const banner of ['version-banner--40', 'version-banner--32']) {
    const bannerStart = rootIndex.indexOf(banner);
    const criteriaStart = rootIndex.indexOf('<dl class="version-banner__criteria">', bannerStart);
    const criteriaEnd = rootIndex.indexOf('</dl>', criteriaStart);
    const criteria = rootIndex.slice(criteriaStart, criteriaEnd);

    assert.ok(bannerStart >= 0);
    assert.ok(criteriaStart > bannerStart);
    assert.ok(criteriaEnd > criteriaStart);
    assert.equal((criteria.match(/<dt>/gu) ?? []).length, 2);
    assert.match(criteria, /<dt>台本形式<\/dt>/u);
    assert.match(criteria, /<dt>主な用途<\/dt>/u);
    assert.doesNotMatch(criteria, /を選ぶ場合/u);
  }
});

test('lists workshop material chronologically with explicit DSL families', () => {
  const dsl40Position = workshopIndex.indexOf('id="workshops-40"');
  const dsl32Position = workshopIndex.indexOf('id="workshops-32"');

  assert.ok(dsl40Position >= 0);
  assert.ok(dsl32Position > dsl40Position);
  assert.match(workshopIndex, /<h2 id="workshops-40">DSL 4\.0系<\/h2>/u);
  assert.match(workshopIndex, /現在公開中の資料はありません/u);
  assert.match(workshopIndex, /<h2 id="workshops-32">DSL 3\.2系<\/h2>/u);
  assert.match(workshopIndex, /<time datetime="2026-08-01">2026年8月1日<\/time>/u);
  assert.equal((workshopIndex.match(/class="document-updated"/gu) ?? []).length, 2);
  assert.equal(
    (workshopIndex.match(/<time datetime="2026-08-04">2026年8月4日<\/time>/gu) ?? []).length,
    2,
  );
  assert.match(workshopIndex, /href="2026-08-01\/"/u);
  assert.match(workshopIndex, /href="2026-08-01\/staff\/"/u);
  assert.match(workshopIndex, /href="https:\/\/www\.chibanippo\.co\.jp\/articles\/1648690"/u);
  assert.match(workshopIndex, /千葉日報オンライン（有料記事）/u);
  assert.match(workshopIndex, /ＡＩプログラミング体験会　千葉商大で親子学ぶ　市川/u);
  assert.match(workshopIndex, /<time datetime="2026-08-02">2026年8月2日<\/time>公開/u);
  const normalizedWorkshopIndex = workshopIndex.replace(/\s+/gu, ' ');
  const cucEventPosition = normalizedWorkshopIndex.indexOf(
    '[実施済み] 親子AIプログラミング体験会(千葉商科大学イベント)',
  );
  const participantMaterialPosition =
    normalizedWorkshopIndex.indexOf('「親子AIプログラミング体験会」参加者向け資料');
  assert.ok(cucEventPosition >= 0);
  assert.ok(participantMaterialPosition > cucEventPosition);
  assert.match(
    workshopIndex,
    /href="https:\/\/www\.cuc\.ac\.jp\/event\/2026\/ai_programming0801\.html"/u,
  );
  assert.match(workshopIndex, /小学生以上を対象とした「親子AIプログラミング体験会」/u);
  assert.match(workshopIndex, /AI技術を応用した紙芝居アプリ/u);
  assert.doesNotMatch(dsl32Index, /体験会資料|workshops\/2026-08-01/u);
  assert.doesNotMatch(dsl40Index, /体験会資料|workshops\/2026-08-01/u);
});

test('provides the workshop menu in every static AppBar', () => {
  for (const index of [rootIndex, dsl32Index, dsl40Index, workshopIndex, licensesIndex]) {
    assert.match(
      index,
      /href="https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-docs\/workshops\/"/u,
    );
    assert.match(index, /<main id="main-content"[^>]*tabindex="-1"/u);
  }
  assert.match(
    workshopIndex,
    /href="https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-docs\/workshops\/"\s+aria-current="page"/u,
  );
});

test('provides one rights-aware footer on every static page', () => {
  for (const index of [rootIndex, dsl32Index, dsl40Index, workshopIndex, licensesIndex]) {
    assert.equal(
      (index.match(/<footer class="site-footer" data-site-footer-version="1">/gu) ?? []).length,
      1,
    );
    const footer = index.match(/<footer class="site-footer"[\s\S]*?<\/footer>/u)?.[0] ?? '';
    assert.match(footer, /© 2026 Hiroya Kubo/u);
    assert.match(footer, /各文書・作品・素材には個別の利用条件が適用されます。/u);
    assert.match(
      footer,
      /href="https:\/\/kubohiroya\.github\.io\/turbowarp-kamishibai-docs\/licenses\/"/u,
    );
    assert.doesNotMatch(footer, /github\.com/u);
  }
  const normalizedLicensesIndex = licensesIndex.replace(/\s+/gu, ' ');
  assert.match(
    normalizedLicensesIndex,
    /Creative Commons Attribution-ShareAlike 4\.0 International/u,
  );
  assert.match(normalizedLicensesIndex, /All rights reserved\./u);
  assert.match(licensesIndex, /Urashima-walk-1/u);
  assert.match(licensesIndex, /Mozilla Public License 2\.0/u);
});

function linkLabels(actions) {
  return [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
    label.replace(/\s+/gu, ' ').trim(),
  );
}
