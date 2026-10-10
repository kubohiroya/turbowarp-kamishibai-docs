import {readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {renderSiteHeader, replaceSiteNavigation} from './site-navigation.mjs';

const siteRoot = 'https://kubohiroya.github.io/turbowarp-kamishibai-app/';
const rightsUrl = 'https://kubohiroya.github.io/turbowarp-kamishibai-docs/licenses/';

function renderSiteAppBar(assetBase, pathname, {includeContentAnchor = true} = {}) {
  const contentAnchor = includeContentAnchor
    ? '\n<div id="main-content" class="site-content-anchor" tabindex="-1"></div>'
    : '';
  return `${renderSiteHeader({
    assetBase,
    site: 'turbowarp-kamishibai-docs',
    pathname,
  })}${contentAnchor}`;
}

function renderSiteFooter(assetBase) {
  return `<footer class="site-footer" data-site-footer-version="1">
  <div class="site-footer__inner">
    <a class="site-footer__brand" href="${siteRoot}">
      <img class="site-footer__symbol" src="${assetBase}favicon.png" width="36" height="36" alt="">
      <span>TurboWarp紙芝居</span>
    </a>
    <div class="site-footer__legal">
      <p>© 2026 Hiroya Kubo</p>
      <p class="site-footer__notice">各文書・作品・素材には個別の利用条件が適用されます。</p>
      <a class="site-footer__rights" href="${rightsUrl}">ライセンス・権利表示</a>
    </div>
  </div>
</footer>`;
}

function addBodyClass(bodyTag) {
  const classAttribute = bodyTag.match(/\bclass=(["'])(.*?)\1/iu);
  if (!classAttribute) {
    return bodyTag.replace(/<body\b/iu, '<body class="site-document"');
  }

  const classes = classAttribute[2].split(/\s+/u);
  if (classes.includes('site-document')) return bodyTag;
  return bodyTag.replace(
    classAttribute[0],
    `class=${classAttribute[1]}${classAttribute[2]} site-document${classAttribute[1]}`,
  );
}

export function injectSiteAppBar(
  source,
  assetBase,
  {pathname = '/turbowarp-kamishibai-docs/'} = {},
) {
  const hasAppBar = /<header\b[^>]*\bclass=(["'])[^"']*\bsite-header\b[^"']*\1/iu.test(source);
  const hasFooter = /<footer\b[^>]*\bclass=(["'])[^"']*\bsite-footer\b[^"']*\1/iu.test(source);
  if (hasAppBar && hasFooter) {
    return replaceSiteNavigation(source, {
      site: 'turbowarp-kamishibai-docs',
      pathname,
    });
  }

  let updated = source;
  if (!hasAppBar) {
    const assets = [
      `<link rel="icon" type="image/png" sizes="256x256" href="${assetBase}favicon.png">`,
      `<link rel="stylesheet" href="${assetBase}site-shell.css">`,
      `<script type="module" src="${assetBase}site-shell.js"></script>`,
    ].join('\n  ');
    updated = updated.replace(/<\/head>/iu, `  ${assets}\n</head>`);
    if (updated === source) {
      throw new Error(
        'Cannot install the site AppBar because the document does not contain </head>.',
      );
    }

    updated = updated.replace(/<body\b[^>]*>/iu, addBodyClass);
    const withAppBar = updated.replace(
      /<body\b[^>]*>/iu,
      (bodyTag) =>
        `${bodyTag}\n${renderSiteAppBar(assetBase, pathname, {
          includeContentAnchor: !/\bid=(["'])main-content\1/iu.test(updated),
        })}`,
    );
    if (withAppBar === updated) {
      throw new Error(
        'Cannot install the site AppBar because the document does not contain <body>.',
      );
    }
    updated = withAppBar;
  }

  if (!hasFooter) {
    const withFooter = updated.replace(/<\/body>/iu, `${renderSiteFooter(assetBase)}\n</body>`);
    if (withFooter === updated) {
      throw new Error(
        'Cannot install the site footer because the document does not contain </body>.',
      );
    }
    updated = withFooter;
  }
  return updated;
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

export async function installSiteAppBars(directory, siteRootDirectory) {
  const htmlFiles = await findHtmlFiles(directory);
  let installedCount = 0;
  const installedPaths = [];

  for (const htmlFile of htmlFiles) {
    const source = await readFile(htmlFile, 'utf8');
    const relativeRoot = path
      .relative(path.dirname(htmlFile), siteRootDirectory)
      .split(path.sep)
      .join('/');
    const assetBase = relativeRoot === '' ? '' : `${relativeRoot}/`;
    const relativePath = path.relative(siteRootDirectory, htmlFile).split(path.sep).join('/');
    const pathname =
      relativePath === 'index.html'
        ? '/turbowarp-kamishibai-docs/'
        : `/turbowarp-kamishibai-docs/${relativePath.replace(/(?:index\.html)?$/u, '')}`;
    const updated = injectSiteAppBar(source, assetBase, {pathname});
    if (updated !== source) {
      await writeFile(htmlFile, updated);
      installedCount += 1;
      installedPaths.push(relativePath);
    }
  }

  return {htmlCount: htmlFiles.length, installedCount, installedPaths};
}
