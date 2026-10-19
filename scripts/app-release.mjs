import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {generateDsl4Reference} from './generate-dsl4-reference.mjs';

const repository = 'kubohiroya/turbowarp-kamishibai-app';
const repositoryUrl = `https://github.com/${repository}`;
const api = `https://api.github.com/repos/${repository}`;
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function releaseVersion(release) {
  const match = /^v(4\.0\.(\d+))(?:-rc\.(\d+))?$/u.exec(release.tag_name);
  if (!match || release.draft || !release.published_at) return null;
  return {
    version: release.tag_name.slice(1),
    patch: Number(match[2]),
    rc: Number(match[3] ?? Infinity),
  };
}

/** Select RCs explicitly; GitHub's latest endpoint excludes prereleases. */
export function selectAppRelease(releases) {
  const eligible = releases
    .map((release) => ({release, version: releaseVersion(release)}))
    .filter(({version}) => version !== null)
    .sort((a, b) => b.version.patch - a.version.patch || b.version.rc - a.version.rc);
  assert(eligible.length > 0, 'No published DSL 4.0 release is available.');
  return eligible[0].release;
}

/** Verify every upstream input before allowing any local publication files to change. */
export async function resolveAppRelease({
  fetchImplementation = fetch,
  token = process.env.GH_TOKEN,
} = {}) {
  async function request(url, {allowMissing = false} = {}) {
    const headers = url.startsWith('https://api.github.com/')
      ? {
          Accept: 'application/vnd.github+json',
          ...(token ? {Authorization: `Bearer ${token}`} : {}),
        }
      : {};
    const response = await fetchImplementation(url, {headers, signal: AbortSignal.timeout(60000)});
    if (allowMissing && response.status === 404) return null;
    assert(response.ok, `Cannot read upstream input: ${url} (HTTP ${response.status}).`);
    return response;
  }
  const releases = [];
  for (let page = 1; ; page += 1) {
    assert(page <= 100, 'Release pagination exceeded its limit.');
    const batch = await (await request(`${api}/releases?per_page=100&page=${page}`)).json();
    assert(Array.isArray(batch), 'Release list must be an array.');
    releases.push(...batch);
    if (batch.length < 100) break;
  }
  const release = selectAppRelease(releases);
  const stableReleases = releases
    .filter(
      (entry) =>
        !entry.draft &&
        !entry.prerelease &&
        entry.published_at &&
        /^v\d+\.\d+\.\d+$/u.test(entry.tag_name),
    )
    .sort((a, b) => {
      const av = a.tag_name.slice(1).split('.').map(Number);
      const bv = b.tag_name.slice(1).split('.').map(Number);
      return bv[0] - av[0] || bv[1] - av[1] || bv[2] - av[2];
    });
  const version = releaseVersion(release).version;
  const commit = await (
    await request(`${api}/commits/${encodeURIComponent(release.tag_name)}`)
  ).json();
  assert.match(commit.sha, /^[a-f0-9]{40}$/u);
  const raw = `https://raw.githubusercontent.com/${repository}/${commit.sha}`;
  const [metadata, packageJson, schemaSource] = await Promise.all([
    request(`${raw}/release-metadata/${version}.json`).then((response) => response.json()),
    request(`${raw}/package.json`).then((response) => response.json()),
    request(`${raw}/schema/dsl-4.schema.json`).then((response) => response.text()),
  ]);
  assert.equal(metadata.version, version, 'Release metadata version differs from its tag.');
  assert.equal(packageJson.version, version, 'CLI version differs from its release.');
  assert.equal(metadata.publication.github.tag, release.tag_name);
  assert.match(metadata.sourceIdentity, /^sha256:[a-f0-9]{64}$/u);
  const artifact = metadata.artifact;
  assert.equal(artifact.filename, `kamishibai-${version}.sb3`);
  assert.equal(
    artifact.url,
    `${repositoryUrl}/releases/download/${release.tag_name}/${artifact.filename}`,
  );
  assert.match(artifact.sha256, /^[a-f0-9]{64}$/u);
  assert(Number.isSafeInteger(artifact.size) && artifact.size > 0);
  const asset = release.assets.find(({name}) => name === artifact.filename);
  assert(asset, 'The newest release has no Standard SB3; refusing to use an older release.');
  assert.equal(asset.size, artifact.size, 'Release asset size differs from metadata.');
  if (asset.digest) assert.equal(asset.digest, `sha256:${artifact.sha256}`);
  const bytes = Buffer.from(await (await request(artifact.url)).arrayBuffer());
  assert.equal(bytes.length, artifact.size, 'Downloaded SB3 size differs.');
  assert.equal(sha256(bytes), artifact.sha256, 'Downloaded SB3 hash differs.');
  JSON.parse(schemaSource);
  const npmResponse = await request(
    `https://registry.npmjs.org/@kubohiroya%2Fturbowarp-kamishibai-app/${version}`,
    {allowMissing: true},
  );
  const npm = npmResponse ? await npmResponse.json() : null;
  if (npm) {
    assert.equal(npm.name, packageJson.name);
    assert.equal(npm.version, version);
  }
  const schema = {
    repository,
    sourceKind: 'commit',
    commit: commit.sha,
    commitDate: commit.commit.committer.date,
    schemaPath: 'schema/dsl-4.schema.json',
    schemaSha256: sha256(schemaSource),
    schemaUrl: `${repositoryUrl}/blob/${commit.sha}/schema/dsl-4.schema.json`,
    surfaceSpecificationUrl: `${repositoryUrl}/blob/${commit.sha}/docs/design/dsl-4-surface.md`,
    snapshotLicense: 'MPL-2.0',
  };
  const lock = {
    formatVersion: 1,
    checkedOn: new Date().toISOString().slice(0, 10),
    repository,
    version,
    tag: release.tag_name,
    commit: commit.sha,
    publishedAt: release.published_at,
    prerelease: release.prerelease,
    latestStableRelease: stableReleases[0]?.tag_name ?? null,
    officialDsl4Release: stableReleases.find((entry) => releaseVersion(entry))?.tag_name ?? null,
    releaseUrl: `${repositoryUrl}/releases/tag/${release.tag_name}`,
    artifact,
    sourceIdentity: metadata.sourceIdentity,
    schema,
    npm: {
      published: npm !== null,
      url: `https://www.npmjs.com/package/${packageJson.name}/v/${version}`,
    },
  };
  return {lock, schemaSource};
}

export function renderAppReleaseStatus(lock) {
  const npm = lock.npm.published
    ? `<a href="${lock.npm.url}">同じ版のnpmパッケージ</a>も公開済みです。`
    : '同じ版のnpmパッケージは未公開です。CLIの導入は各ガイドの対応版を確認してください。';
  return `<section class="release-status" aria-labelledby="release-status-title">
  <p class="release-status__eyebrow">アプリの公開リリースから自動取得</p>
  <h2 id="release-status-title">${lock.version}を公開しています</h2>
  <p><a href="${lock.artifact.url}">${lock.version}のStandard SB3</a>と
    <a href="${lock.releaseUrl}">リリースノート</a>を確認できます。
    ${lock.prerelease ? 'この版は検証用の公開プレリリースです。' : 'この版は正式リリースです。'}${npm}</p>
  <p>公開サンプルや本文・図版の対象版は、それぞれに記載しています。
    最新アプリと同じ版であることを確認してから利用してください。
    初めて試す方は<a href="tutorials/play/">「紙芝居を遊ぶ」チュートリアル</a>から始めてください。
    過去版の記録は<a href="dsl-author-guides/dsl-4.0-history/">リリース履歴</a>で確認できます。</p>
</section>`;
}

export function injectAppReleaseNotice(html, pathname, lock) {
  if (!pathname.startsWith('/turbowarp-kamishibai-docs/4.0/')) return html;
  const withoutOld = html.replace(
    /\s*<aside\b[^>]*data-app-release-notice[^>]*>[\s\S]*?<\/aside>\s*/gu,
    '',
  );
  if (pathname === '/turbowarp-kamishibai-docs/4.0/') return withoutOld;
  const notice = `<aside data-app-release-notice="${lock.version}" class="app-release-notice" aria-label="アプリの公開版">
    <p>現在の公開アプリは<a href="${lock.releaseUrl}">${lock.version}</a>です。
    本文・図版は各文書に記載した版を対象とします。
    配布状況とダウンロードは<a href="https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/">4.0の入口</a>で確認できます。</p>
  </aside>`;
  return withoutOld.replace(
    /(<header\b[^>]*class="site-header"[\s\S]*?<\/header>)/u,
    `$1\n${notice}\n`,
  );
}

export async function syncAppRelease(options = {}) {
  const {lock, schemaSource} = await resolveAppRelease(options);
  const {format, resolveConfig} = await import('prettier');
  const files = new Map([
    ['sources/dsl4/app-release.json', `${JSON.stringify(lock, null, 2)}\n`],
    ['sources/dsl4/source-lock.json', `${JSON.stringify(lock.schema, null, 2)}\n`],
    ['sources/dsl4/dsl-4.schema.json', schemaSource],
  ]);
  const indexPath = path.join(projectRoot, 'site/4.0/index.html');
  const index = await readFile(indexPath, 'utf8');
  assert.equal((index.match(/<section class="release-status"/gu) ?? []).length, 1);
  files.set(
    'site/4.0/index.html',
    await format(
      index.replace(
        /<section class="release-status"[\s\S]*?<\/section>/u,
        renderAppReleaseStatus(lock),
      ),
      {...(await resolveConfig(indexPath)), parser: 'html'},
    ),
  );
  let changed = false;
  for (const [filename, contents] of files) {
    const output = path.join(projectRoot, filename);
    const previous = await readFile(output, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (previous !== contents) {
      await writeFile(output, contents);
      changed = true;
    }
  }
  await generateDsl4Reference();
  console.log(`App release ${lock.tag}: ${changed ? 'updated' : 'unchanged'} (${lock.commit}).`);
  return changed;
}

export async function publishedAppReleaseDiffers(current, {fetchImplementation = fetch} = {}) {
  const response = await fetchImplementation(
    'https://kubohiroya.github.io/turbowarp-kamishibai-docs/app-release.json',
    {signal: AbortSignal.timeout(60000), cache: 'no-store'},
  );
  assert(
    response.ok || response.status === 404,
    `Cannot compare published app dependency (HTTP ${response.status}).`,
  );
  const published = response.status === 404 ? null : await response.json();
  return JSON.stringify(published) !== JSON.stringify(current);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(process.argv.length, 2, 'Usage: node scripts/app-release.mjs');
  const changed = await syncAppRelease();
  let publish = changed;
  // Scheduled runs compare with deployed bytes, which can be newer than this checkout.
  if (process.env.COMPARE_PUBLISHED_APP_RELEASE === 'true') {
    const current = JSON.parse(
      await readFile(path.join(projectRoot, 'sources/dsl4/app-release.json'), 'utf8'),
    );
    publish = await publishedAppReleaseDiffers(current);
  }
  if (process.env.GITHUB_OUTPUT) {
    const {appendFile} = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${publish}\n`);
  }
}
