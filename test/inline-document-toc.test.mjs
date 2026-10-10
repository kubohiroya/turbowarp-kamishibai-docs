import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {
  createInlineDocumentHtml,
  createTocHtmlFromHeadings,
  updateStandalonePublicationManifest,
} from '../scripts/inline-document-toc.mjs';
import {injectSiteAppBar} from '../scripts/site-appbar.mjs';

const tocStyles = readFileSync(new URL('../site/document-toc.css', import.meta.url), 'utf8');

const article = `<!doctype html><html lang="ja"><head><title>Guide</title></head><body><section class="level1"><h1 id="guide">Guide</h1><section class="level2"><h2 id="start">Start</h2></section></section></body></html>`;
const toc = `<!doctype html><html lang="ja"><head><title>Guide</title></head><body><h1>Guide</h1><nav id="toc" role="doc-toc"><h2>目次</h2><ol><li data-section-level="1"><a href="document.html#guide">Guide</a><ol><li data-section-level="2"><a href="document.html#start">Start</a><ol><li data-section-level="3"><a href="document.html#detail">Detail</a></li></ol></li></ol></li></ol></nav></body></html>`;

test('combines the generated table of contents and article into one HTML document', () => {
  const combined = createInlineDocumentHtml(article, toc, {
    scriptHref: '../../../document-toc.js',
    stylesheetHref: '../../../document-toc.css',
  });

  assert.match(combined, /<body class="has-inline-toc">/u);
  assert.match(combined, /<nav id="toc" class="document-toc document-toc--css-numbered"/u);
  assert.match(combined, /<details class="document-toc__panel" open>/u);
  assert.match(combined, /<main id="main-content" class="document-content" tabindex="-1">/u);
  assert.match(combined, /href="#start"/u);
  assert.doesNotMatch(combined, /href="document\.html#/u);
  assert.equal((combined.match(/<h1 id="guide">/gu) ?? []).length, 1);
  assert.doesNotMatch(combined, />Guide<\/a><ol>/u);
  assert.match(combined, /src="\.\.\/\.\.\/\.\.\/document-toc\.js"/u);
  assert.match(combined, /href="\.\.\/\.\.\/\.\.\/document-toc\.css"/u);
});

test('preserves dollar replacement patterns in article content', () => {
  const articleWithPattern = `<!doctype html><html lang="ja"><head><title>Guide</title></head><body><section class="level1"><h1 id="guide">Guide</h1><section class="level2"><h2 id="pattern">Pattern</h2><code>^[a-z0-9!#$&amp;^_.+-]+$</code></section></section></body></html>`;
  const combined = createInlineDocumentHtml(articleWithPattern, toc, {
    scriptHref: '../../../document-toc.js',
    stylesheetHref: '../../../document-toc.css',
  });

  assert.match(combined, /<code>\^\[a-z0-9!#\$&amp;\^_\.\+-\]\+\$<\/code>/u);
  assert.equal((combined.match(/<h1 id="guide">/gu) ?? []).length, 1);
});

test('keeps the existing main landmark when the shared AppBar is installed', () => {
  const combined = createInlineDocumentHtml(article, toc, {
    scriptHref: '../../../document-toc.js',
    stylesheetHref: '../../../document-toc.css',
  });
  const withAppBar = injectSiteAppBar(combined, '../../../', {
    pathname: '/turbowarp-kamishibai-docs/4.0/guides/example/',
  });

  assert.equal((withAppBar.match(/id="main-content"/gu) ?? []).length, 1);
  assert.match(withAppBar, /<a class="skip-link" href="#main-content">/u);
  assert.match(withAppBar, /<body class="has-inline-toc site-document">/u);
});

test('combines a workshop cover and article while keeping separate Viewer sources', () => {
  const cover = `<!doctype html><html lang="ja"><head><title>Workshop</title></head><body data-publication-section="cover"><section><h1 id="cover">Workshop</h1><nav class="cover-navigation"><a href="toc.html">目次へ</a></nav></section></body></html>`;
  const workshopArticle = `<!doctype html><html lang="ja"><head><title>Workshop body</title></head><body data-publication-section="body"><section><h1 id="chapter">1. Chapter</h1></section></body></html>`;
  const workshopToc = `<!doctype html><html lang="ja"><body><nav id="toc"><h2>目次</h2><ol><li data-section-level="1"><a href="cover.html#cover">0. Cover</a></li><li data-section-level="1"><a href="tmpose-workshop.html#chapter">1. Chapter</a></li></ol></nav></body></html>`;
  const combined = createInlineDocumentHtml([cover, workshopArticle], workshopToc, {
    scriptHref: '../../document-toc.js',
    stylesheetHref: '../../document-toc.css',
    fragmentSourceFilenames: ['cover.html', 'tmpose-workshop.html'],
    labelsIncludeNumbers: true,
    unwrapSingleDocumentRoot: false,
  });

  assert.match(combined, /document-toc--explicit-labels/u);
  assert.match(combined, /<h1 id="cover">Workshop<\/h1>/u);
  assert.match(combined, /<h1 id="chapter">1\. Chapter<\/h1>/u);
  assert.match(combined, /href="#cover"/u);
  assert.match(combined, /href="#chapter"/u);
  assert.doesNotMatch(combined, /href="tmpose-workshop\.html#/u);
  assert.doesNotMatch(combined, /cover-navigation/u);
});

test('creates a hierarchical screen table of contents from staff article headings', () => {
  const staffArticle = `<!doctype html><html><body><h1 id="staff">Staff guide</h1><h1 id="one">1. First</h1><h2 id="one-one">1.1 Detail</h2><h3 id="one-one-one"><ruby>補足<rt>ほそく</rt></ruby></h3><h1 id="two">2. Second</h1></body></html>`;
  const generated = createTocHtmlFromHeadings(staffArticle, {skipFirstHeading: true});

  assert.doesNotMatch(generated, /href="#staff"/u);
  assert.match(generated, /href="#one"/u);
  assert.match(generated, /href="#one-one"/u);
  assert.match(generated, /href="#one-one-one"/u);
  assert.match(generated, /<ruby>補足<rt>ほそく<\/rt><\/ruby>/u);
  assert.match(
    generated,
    /data-section-level="1"[\s\S]*?<ol><li data-section-level="2"[\s\S]*?<ol><li data-section-level="3"/u,
  );
});

test('keeps only the article in the Viewer reading order', () => {
  const manifest = updateStandalonePublicationManifest(
    JSON.stringify({
      readingOrder: [
        {url: 'index.html', name: '目次', rel: 'contents'},
        {url: 'document.html', name: 'Guide'},
      ],
      resources: ['theme.css'],
    }),
    {indexFilename: 'index.html', articleFilename: 'document.html'},
  );
  const publication = JSON.parse(manifest);

  assert.deepEqual(publication.readingOrder, [{url: 'document.html', name: 'Guide'}]);
  assert.deepEqual(publication.resources, ['index.html', 'theme.css']);
});

test('preserves workshop Viewer reading order when the screen index is only a resource', () => {
  const manifest = updateStandalonePublicationManifest(
    JSON.stringify({
      readingOrder: [
        {url: 'cover.html', rel: 'cover'},
        {url: 'toc.html', rel: 'contents'},
        {url: 'workshop.html'},
      ],
      resources: ['theme.css'],
    }),
    {indexFilename: 'index.html', articleFilename: 'workshop.html'},
  );
  const publication = JSON.parse(manifest);

  assert.deepEqual(publication.readingOrder, [
    {url: 'cover.html', rel: 'cover'},
    {url: 'toc.html', rel: 'contents'},
    {url: 'workshop.html'},
  ]);
  assert.deepEqual(publication.resources, ['index.html', 'theme.css']);
});

test('shares fixed desktop and collapsible mobile tree styles across publications', () => {
  assert.match(tocStyles, /@media \(min-width: 1100px\)[\s\S]*?#toc\s*\{[\s\S]*?position: fixed/u);
  assert.match(tocStyles, /#toc\s*\{[\s\S]*?position: relative/u);
  assert.match(
    tocStyles,
    /#toc\.document-toc--explicit-labels li\s*\{[\s\S]*?grid-template-columns: 1\.65rem minmax\(0, 1fr\)/u,
  );
  assert.match(tocStyles, /#toc\.document-toc--explicit-labels li > a\s*\{\s*grid-column: 2/u);
  assert.match(tocStyles, /\.document-content a,[\s\S]*?overflow-wrap: anywhere/u);
  assert.match(tocStyles, /@media \(prefers-reduced-motion: reduce\)/u);
  assert.match(tocStyles, /:focus-visible/u);
});
