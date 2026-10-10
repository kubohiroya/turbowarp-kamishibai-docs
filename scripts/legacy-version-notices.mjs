import path from 'node:path';

import {documentationConfig} from '../docs/config.mjs';
import {writeFileIfChanged} from './build-freshness.mjs';
import {injectSiteAppBar} from './site-appbar.mjs';

const documentationSiteRoot = 'https://kubohiroya.github.io/turbowarp-kamishibai-docs/';

export function legacyPublicationEntries() {
  const documentEntries = documentationConfig.documents.map((document) => {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    return {
      title: document.title,
      version: document.version,
      legacyDirectory: path.posix.join(document.legacyOutputDirectory, basename),
      targetDirectory: path.posix.join(document.outputDirectory, basename),
    };
  });

  return documentEntries;
}

export function renderLegacyVersionNotice(entry) {
  const targetUrl = `${documentationSiteRoot}${entry.targetDirectory}/`;
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${entry.title}の新しいDSL ${entry.version}版URLをご案内します">
    <title>移転のお知らせ | ${entry.title}</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #fff8ee; color: #3f302b; }
      main { width: min(760px, calc(100% - 32px)); margin: 64px auto; padding: clamp(24px, 6vw, 48px); border: 1px solid #dbc9bb; border-left: 10px solid #963f2f; border-radius: 10px; background: #fffdf8; }
      h1 { margin: 0 0 1rem; font-size: clamp(1.8rem, 6vw, 2.8rem); }
      p { line-height: 1.8; }
      .legacy-version { color: #963f2f; font-weight: 800; letter-spacing: 0.06em; }
      .legacy-target { overflow-wrap: anywhere; font-family: ui-monospace, monospace; }
      .legacy-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1.5rem; }
      .legacy-actions a { display: inline-flex; min-height: 44px; padding: 0 15px; align-items: center; border: 1px solid #963f2f; border-radius: 7px; color: #963f2f; font-weight: 800; text-decoration: none; }
      .legacy-actions a:first-child { background: #963f2f; color: white; }
      .legacy-actions a:focus-visible { outline: 3px solid #963f2f; outline-offset: 4px; }
    </style>
  </head>
  <body>
    <main>
      <p class="legacy-version">DSL ${entry.version}版へ移動しました</p>
      <h1>${entry.title}</h1>
      <p>
        この文書はversion別の公開folderへ移動しました。旧URLから自動転送は行いません。
        内容と対象versionを確認して、次の新しいURLへ進んでください。
      </p>
      <p class="legacy-target"><a href="${targetUrl}">${targetUrl}</a></p>
      <div class="legacy-actions">
        <a href="${targetUrl}">DSL ${entry.version}版で開く</a>
        <a href="${documentationSiteRoot}">紙芝居DSLの版を選ぶ</a>
      </div>
    </main>
  </body>
</html>
`;
}

export function renderLegacyPublicationManifest(entry) {
  return {
    '@context': ['https://schema.org', 'https://www.w3.org/ns/pub-context'],
    type: 'Book',
    name: `${entry.title}（移転のお知らせ）`,
    inLanguage: 'ja',
    readingOrder: [
      {
        url: 'document.html',
        name: `DSL ${entry.version}版の新しいURL`,
        type: 'LinkedResource',
        encodingFormat: 'text/html',
      },
    ],
  };
}

export async function writeLegacyVersionNotices(outputRoot) {
  const entries = legacyPublicationEntries();
  for (const entry of entries) {
    const directory = path.join(outputRoot, entry.legacyDirectory);
    const notice = renderLegacyVersionNotice(entry);
    const relativeRoot = path.relative(directory, outputRoot).split(path.sep).join('/');
    const assetBase = relativeRoot === '' ? '' : `${relativeRoot}/`;
    const index = injectSiteAppBar(notice, assetBase, {
      pathname: `/turbowarp-kamishibai-docs/${entry.legacyDirectory}/`,
    });
    const document = injectSiteAppBar(notice, assetBase, {
      pathname: `/turbowarp-kamishibai-docs/${entry.legacyDirectory}/document.html`,
    });
    await Promise.all([
      writeFileIfChanged(path.join(directory, 'index.html'), index),
      writeFileIfChanged(path.join(directory, 'document.html'), document),
      writeFileIfChanged(
        path.join(directory, 'publication.json'),
        `${JSON.stringify(renderLegacyPublicationManifest(entry), null, 2)}\n`,
      ),
    ]);
  }
  return entries;
}
