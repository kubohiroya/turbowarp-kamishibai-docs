import {parse} from 'yaml';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {
  appReleaseCheckSummary,
  injectAppReleaseNotice,
  publishedAppReleaseDiffers,
  renderAppReleaseStatus,
  resolveAppRelease,
  selectAppRelease,
} from '../scripts/app-release.mjs';

const repository = 'kubohiroya/turbowarp-kamishibai-app';
const repoUrl = `https://github.com/${repository}`;
const api = `https://api.github.com/repos/${repository}`;
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const makeRelease = (tag, extra = {}) => ({
  tag_name: tag,
  published_at: '2026-10-20T00:00:00Z',
  prerelease: tag.includes('-'),
  draft: false,
  assets: [],
  ...extra,
});

function upstream({npmStatus = 404, corrupt = false, version = '4.0.0-rc.30'} = {}) {
  const commit = 'a'.repeat(40);
  const schema = '{"type":"object"}\n';
  const bytes = Buffer.from('verified-public-sb3');
  const tag = `v${version}`;
  const artifact = {
    filename: `kamishibai-${version}.sb3`,
    url: `${repoUrl}/releases/download/${tag}/kamishibai-${version}.sb3`,
    size: bytes.length,
    sha256: sha256(bytes),
  };
  const release = makeRelease(tag, {
    assets: [{name: artifact.filename, size: bytes.length, digest: `sha256:${artifact.sha256}`}],
  });
  const raw = `https://raw.githubusercontent.com/${repository}/${commit}`;
  const routes = new Map(
    /** @type {[string, any][]} */ ([
      [`${api}/releases?per_page=100&page=1`, [release, makeRelease('v3.2.3')]],
      [`${api}/commits/${tag}`, {sha: commit, commit: {committer: {date: '2026-10-20T00:00:00Z'}}}],
      [
        `${raw}/release-metadata/${version}.json`,
        {
          version,
          state: 'frozen',
          sourceIdentity: `sha256:${'b'.repeat(64)}`,
          artifact,
          publication: {github: {tag}},
        },
      ],
      [`${raw}/package.json`, {name: '@kubohiroya/turbowarp-kamishibai-app', version}],
      [`${raw}/schema/dsl-4.schema.json`, schema],
      [`${raw}/schema/dsl-4-narrative-control.schema.json`, null],
      [artifact.url, corrupt ? Buffer.from('x'.repeat(bytes.length)) : bytes],
      [
        `https://registry.npmjs.org/@kubohiroya%2Fturbowarp-kamishibai-app/${version}`,
        {
          name: '@kubohiroya/turbowarp-kamishibai-app',
          version,
        },
      ],
    ]),
  );
  const calls = [];
  const fetchImplementation = async (url, options) => {
    calls.push({url, options});
    assert(routes.has(url), `Unexpected upstream URL: ${url}`);
    const value = routes.get(url);
    const status =
      value === null ? 404 : url.startsWith('https://registry.npmjs.org/') ? npmStatus : 200;
    return new Response(
      typeof value === 'string'
        ? value
        : Buffer.isBuffer(value)
          ? new Uint8Array(value)
          : JSON.stringify(value),
      {status},
    );
  };
  return {routes, calls, fetchImplementation, release, artifact, commit, schema};
}

test('selects numeric RC versions, excludes drafts, and gives stable 4.0 precedence', () => {
  const releases = ['v3.2.3', 'v4.0.0-rc.9', 'v4.0.0-rc.30', 'v4.1.0'].map((tag) =>
    makeRelease(tag),
  );
  releases.push(makeRelease('v4.0.0-rc.99', {draft: true}));
  releases.push(makeRelease('v4.0.0-rc.98', {published_at: null}));
  assert.equal(selectAppRelease(releases).tag_name, 'v4.0.0-rc.30');
  assert.equal(selectAppRelease([...releases, makeRelease('v4.0.0')]).tag_name, 'v4.0.0');
  assert.equal(selectAppRelease([...releases, makeRelease('v4.0.1-rc.1')]).tag_name, 'v4.0.1-rc.1');
  assert.throws(() => selectAppRelease([makeRelease('v3.2.3')]), /No published DSL/u);
});

test('verifies tag, metadata, schema and bytes while keeping GitHub and npm states separate', async () => {
  const fixture = upstream();
  const {lock, schemaSource} = await resolveAppRelease({...fixture, token: 'test-token'});
  assert.equal(lock.commit, fixture.commit);
  assert.equal(lock.schema.commit, lock.commit);
  assert.equal(lock.schema.schemaSha256, sha256(schemaSource));
  assert.equal(lock.artifact.sha256, fixture.artifact.sha256);
  assert.equal(lock.latestStableRelease, 'v3.2.3');
  assert.equal(lock.officialDsl4Release, null);
  assert.equal(lock.npm.published, false);
  for (const {url, options} of fixture.calls) {
    assert.equal(
      options.headers.Authorization,
      url.startsWith('https://api.github.com/') ? 'Bearer test-token' : undefined,
    );
  }
});

test('reads all release pages before selecting the newest version', async () => {
  const fixture = upstream();
  fixture.routes.set(
    `${api}/releases?per_page=100&page=1`,
    Array.from({length: 100}, () => makeRelease('v3.2.3')),
  );
  fixture.routes.set(`${api}/releases?per_page=100&page=2`, [fixture.release]);
  const {lock} = await resolveAppRelease(fixture);
  assert.equal(lock.version, '4.0.0-rc.30');
});

test('fails on a corrupt newest artifact instead of using an older release', async () => {
  await assert.rejects(
    resolveAppRelease(upstream({corrupt: true})),
    /Downloaded SB3 (?:size|hash) differs/u,
  );
  const fixture = upstream();
  fixture.release.assets = [];
  await assert.rejects(resolveAppRelease(fixture), /newest release has no Standard SB3/u);
});

test('fails when tagged source version or published digest does not match', async () => {
  const fixture = upstream();
  fixture.release.assets[0].digest = `sha256:${'0'.repeat(64)}`;
  await assert.rejects(resolveAppRelease(fixture));
  const mismatch = upstream();
  mismatch.routes.set(
    `https://raw.githubusercontent.com/${repository}/${mismatch.commit}/package.json`,
    {version: '4.0.0-rc.25'},
  );
  await assert.rejects(resolveAppRelease(mismatch), /CLI version differs/u);
});

test('npm outage stops publication; only a real 404 means unpublished', async () => {
  await assert.rejects(resolveAppRelease(upstream({npmStatus: 503})), /HTTP 503/u);
  const {lock} = await resolveAppRelease(upstream({npmStatus: 200}));
  assert.equal(lock.npm.published, true);
  assert.ok(renderAppReleaseStatus(lock).includes(lock.npm.url));
  const stable = await resolveAppRelease(upstream({version: '4.0.0', npmStatus: 200}));
  assert.equal(stable.lock.officialDsl4Release, 'v4.0.0');
  assert.match(renderAppReleaseStatus(stable.lock), /正式リリースです/u);
});

test('current entry does not claim that old sample bytes use the app release version', async () => {
  const {lock} = await resolveAppRelease(upstream());
  const html = renderAppReleaseStatus(lock);
  assert.ok(html.includes(lock.artifact.url));
  assert.match(html, /npmパッケージは未公開/u);
  assert.doesNotMatch(html, /npmjs\.com/u);
  assert.match(html, /公開サンプルや本文・図版の対象版/u);
});

test('adds an idempotent current-release notice only to DSL 4.0 documents', async () => {
  const {lock} = await resolveAppRelease(upstream());
  const original = '<body><header class="site-header">nav</header><main>rc.25の説明</main></body>';
  const pathname = '/turbowarp-kamishibai-docs/4.0/tutorials/play/';
  const first = injectAppReleaseNotice(original, pathname, lock);
  assert.match(first, /現在の公開アプリは/u);
  assert.match(first, /rc\.25の説明/u);
  assert.equal(injectAppReleaseNotice(first, pathname, lock), first);
  assert.equal(injectAppReleaseNotice(original, '/turbowarp-kamishibai-docs/3.2/', lock), original);
});

test('publication workflows resolve the app before verification and deployment', () => {
  const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  for (const name of ['ci', 'pages']) {
    const workflow = read(`.github/workflows/${name}.yml`);
    assert.ok(
      workflow.indexOf('pnpm docs:app:sync') <
        workflow.indexOf(name === 'ci' ? 'pnpm lint' : 'pnpm check'),
    );
  }
  const pages = read('.github/workflows/pages.yml');
  assert.match(pages, /schedule:/u);
  assert.match(pages, /repository_dispatch:/u);
  assert.match(pages, /if: needs\.build\.outputs\.publish == 'true'/u);
});

test('scheduled updates compare against the deployed release rather than a stale checkout', async () => {
  const {lock} = await resolveAppRelease(upstream());
  assert.equal(
    await publishedAppReleaseDiffers(lock, {
      fetchImplementation: async () => Response.json(lock),
    }),
    false,
  );
  assert.equal(
    await publishedAppReleaseDiffers(lock, {
      fetchImplementation: async () => Response.json({...lock, version: '4.0.0-rc.25'}),
    }),
    true,
  );
  assert.equal(
    await publishedAppReleaseDiffers(lock, {
      fetchImplementation: async () => new Response('', {status: 404}),
    }),
    true,
  );
  await assert.rejects(
    publishedAppReleaseDiffers(lock, {
      fetchImplementation: async () => new Response('', {status: 503}),
    }),
    /HTTP 503/u,
  );
});

test('pins the narrative structure schema to the same verified release commit without requiring npm', async () => {
  const fixture = upstream({version: '4.0.0-rc.44'});
  const source = '{"$id":"dsl-4-narrative-control","type":"object"}\n';
  fixture.routes.set(
    `https://raw.githubusercontent.com/${repository}/${fixture.commit}/schema/dsl-4-narrative-control.schema.json`,
    source,
  );
  const {lock, narrativeSchemaSource} = await resolveAppRelease(fixture);
  assert.equal(lock.narrativeSchema.commit, lock.commit);
  assert.equal(lock.narrativeSchema.sha256, sha256(source));
  assert.equal(narrativeSchemaSource, source);
  assert.equal(lock.npm.published, false);
});

test('dependency check summary distinguishes no change, update and checkout comparison', async () => {
  const {lock} = await resolveAppRelease(upstream());
  const options = {changed: false, comparedWithPublished: true, checkedAt: '2026-10-23T12:00:00Z'};
  const unchanged = appReleaseCheckSummary(lock, options);
  assert.match(unchanged, /公開済みmanifest/u);
  assert.match(unchanged, /差分なし/u);
  assert.ok(unchanged.includes(lock.commit));
  assert.ok(unchanged.includes(lock.artifact.sha256));
  assert.ok(unchanged.includes(options.checkedAt));
  assert.match(unchanged, /公開完了はdeploy jobと公開URL/u);
  assert.match(appReleaseCheckSummary(lock, {...options, changed: true}), /差分あり/u);
  assert.match(
    appReleaseCheckSummary(lock, {...options, comparedWithPublished: false}),
    /checkoutのsnapshot/u,
  );
});

test('release polling retains manual recovery and skips deployment when a scheduled check has no change', () => {
  const workflow = parse(
    readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8'),
  );
  assert.ok('workflow_dispatch' in workflow.on);
  assert.ok('repository_dispatch' in workflow.on);
  const [minute, ...rest] = workflow.on.schedule[0].cron.split(' ');
  assert.deepEqual(rest, ['*', '*', '*', '*']);
  const minutes = minute
    .split(',')
    .map(Number)
    .sort((a, b) => a - b);
  assert.ok(minutes.every((value) => Number.isInteger(value) && value > 0 && value < 60));
  const gaps = minutes.map((value, index) => (minutes[index + 1] ?? minutes[0] + 60) - value);
  assert.ok(Math.max(...gaps) <= 30, 'A skipped poll needs another opportunity within the hour.');
  assert.match(workflow.jobs.build.outputs.publish, /github.event_name != 'schedule'/u);
  assert.match(workflow.jobs.build.outputs.publish, /steps.release.outputs.changed == 'true'/u);
  assert.match(workflow.jobs.deploy.if, /needs.build.outputs.publish == 'true'/u);
});
