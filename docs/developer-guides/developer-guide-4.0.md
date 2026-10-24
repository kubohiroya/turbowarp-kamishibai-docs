# 紙芝居アプリ 4.0 ソフトウェアメンテナンスガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリース`4.0.0-rc.25`の固定実装基準を説明する保守資料\
調査基準: TurboWarp-Kamishibai `a68f8dc`、2026年10月19日

> **配布状態との区別:** `v4.0.0-rc.25`はnpm `next`、GitHub prerelease、Pagesのダウンロード導線として
> 公開済みです。安定版の推奨は`3.2.3`で、正式版`v4.0.0`は未公開です。

本書はソフトウェアを変更・公開する開発者向けであり、アプリの使い方や台本作成の入門書ではありません。
初めて4.0を知る方は[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、作品を作る方は
[台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)へ進んでください。本書で使う内部用語は、先に
[内部仕様書の用語表](internal-specification-4.0.md#terminology)で確認できます。

このガイドは、TurboWarp紙芝居のDSL 4.0 source frontend、runtime、platform adapter、preview、ビルド、
リリースを変更・検証・公開するソフトウェア開発者向けの作業資料です。対象となる実装基準は
`kubohiroya/turbowarp-kamishibai-app`のコミット
[`a68f8dc4d38b4609c8387192d3be0376963735e3`](https://github.com/kubohiroya/turbowarp-kamishibai-app/tree/a68f8dc4d38b4609c8387192d3be0376963735e3)
です。本書中のpath、command、artifact名は、このコミットで確認しています。

本書では、`kubohiroya/turbowarp-kamishibai-app`を「本体リポジトリ」、
`kubohiroya/turbowarp-kamishibai-docs`を「文書リポジトリ」と呼びます。DSLのfieldとactionを調べる場合は
[紙芝居DSL 4.0 Schemaリファレンス](../dsl-author-guides/dsl-4.0-schema-reference.md)、作品の配置と記述方法を
調べる場合は[紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)を参照してください。

## Schemaと公開runtimeの二つの基準

公開runtimeの調査基準は`4.0.0-rc.25`（`a68f8dc4`）です。Schemaリファレンスも同じ公開commitへ固定し、portraitの`placement`、`offset`、`cornerRadius`はrc.25で利用できます。
公開版の入力を検査するときは`sources/dsl4/dsl-4.0-rc.25.schema.json`を使い、
現行Schemaの出典は`sources/dsl4/source-lock.json`で確認します。旧版の検証結果を現行版へ読み替えません。

## このガイドの読み進め方

4.0の実装全体を初めて調べる場合は、先に
[アプリ・教材・ツールチェインガイド](application-materials-guide-4.0.md)でprojectからruntimeまでの流れを
確認してください。本書はその全体像を、実際の変更・検証・リリース作業へ対応させる入口です。

| 順序 | 読む範囲                                          | 目的                                 |
| ---- | ------------------------------------------------- | ------------------------------------ |
| 1    | 保守境界、Schemaとsource lock、repository構成     | 変更の正本とtestを選ぶ               |
| 2    | feature flag、project、validate、preview、ビルド  | 正常な制作・配布経路を再現する       |
| 3    | Source Graph transaction、ブラウザー／CLI adapter | スナップショットとplatform境界を守る |
| 4    | 検証matrix、リリース、rollback                    | 変更を安全に公開・切り戻す           |

本書を一度通読した後は、次の「最初に保守境界を判断する」を索引として使います。内部の型と状態遷移は
[内部仕様書](internal-specification-4.0.md)、外部パッケージとの接続は
[機能拡張・プラットフォーム統合ガイド](extension-guide-4.0.md)、失敗時の副作用禁止と停止順序は
[台本診断・安全停止 設計レビュー](dsl-4.0-diagnostics-design.md)で深掘りします。

## 最初に保守境界を判断する

変更対象ごとの正本と、最初に確認する場所は次のとおりです。

| 変更対象                          | 正本／入口                                         | 最初に確認するtest                                   |
| --------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| DSLのfield、型、必須性            | `schema/dsl-4.schema.json`                         | `test/dsl4-schema.test.ts`                           |
| YAML parse、canonicalize、診断    | `src/dsl4/source-frontend.ts`                      | `test/dsl4-validate-cli.test.ts`                     |
| `include`、compose、source origin | `src/dsl4/source-graph-frontend.ts`                | `test/dsl4-source-graph-frontend.test.ts`            |
| scene実行と再開                   | `src/dsl4/runtime-controller.ts`                   | `test/dsl4-runtime-controller.test.ts`               |
| live reload                       | `src/dsl4/live-reload-session.ts`                  | `test/dsl4-live-reload-session.test.ts`              |
| Browser Previewのsource／asset    | `src/dsl4/browser-preview-*-adapter.ts`            | `test/dsl4-browser-preview-*-adapter.test.ts`        |
| CLI Preview                       | `src/builder/dsl4-local-preview-*.js`              | `test/dsl4-local-preview-cli.test.ts`                |
| 自己完結SB3                       | `src/builder/dsl4-build*.js`                       | `test/dsl4-build-cli.test.ts`                        |
| Standard Runtime release          | `scripts/sb3/dsl4-downloadable-release.ts`         | `test/dsl4-downloadable-release.test.ts`             |
| 配布一覧とchecksum                | `scripts/download-catalog.ts`                      | `scripts/sb3/downloadable-releases.ts`のビルド時検査 |
| 公開リファレンス                  | 文書リポジトリの`sources/dsl4/`と`docs/config.mjs` | `pnpm docs:dsl4:check`、`pnpm check`                 |

Schema、source frontend、StoryDocument、runtimeを同時に変更する必要がある場合も、互換性の判断を一つの
大きな差分へ隠しません。Schemaとfixture、frontend、semantic validator、runtime、adapterの順に小さく分け、
各PRに受け入れ基準とrollbackを記録します。

## rc.25の保守境界

本体はTypeScript strict・Vitest・Viteを使用し、公開subpathはcompile済みの`dist/`を指します。
`src/`内部への直接importを公開APIとしません。ソースの相対importに`.js`が残っていても、調査対象のファイルは`.ts`です。

Standard productionは`dsl4TurboWarpStateSurface`・`dsl4ExpressionRuntimeState`・crossfade・カメラ操作UI等を明示的にONにします。
汎用defaultがOFFであることと、配布profileで使えることを混同しないでください。台本変数はcore actionで更新し、
旧提案の書込queueや専用書込flagを追加しません。

素材はAsset Cache、カメラはCamera Sourceが所有します。Teachable Machine 3.5.1はleaseした映像から認識し、
プレビューと推論入力を分離します。DOM controlsの接続ができないhostは`K4-HOST-PREVIEW-CONTROLS-001`で拒否します。

CLIは`validate-dsl4 --format canonical-json`・`author-block-dsl`・`export-block-dsl`でYAML／ブロック台本を往復できます。
公開rc.25は実命令ブロックの生成・編集後の書き戻しに対応します。`kamishibai [4.0] [ラベル]`ハットと`includeBlocks`、include付きYAMLの生成・読取・分割exportに対応します。
旧`when kamishibai DSL source`と旧YAML文字列方式の生成・読取互換は廃止します。
コマンド例、編集・保存の手順、include文の制約は
[YAMLとブロック台本SB3の相互変換ガイド](../dsl-author-guides/dsl-4.0-block-script-conversion-guide.md)を参照してください。
ローカルプレビューはリモートassetを取得せず、rc.25では失敗ダイアログを表示します。
リモート取得のOFFLINE／CORS／CONNECTとCLIのTLS診断、sandbox内で許可した場合の案内を確認します。

## 規範Schemaとsource lockを守る

DSL 4.0の構造仕様は、本体リポジトリの`schema/dsl-4.schema.json`が規範です。runtime codeからSchemaを
生成しません。それぞれの基準内では表層仕様、Schema、適合実装、testを同じ上流revisionで扱います。
公開runtimeとSchemaを同じrc.25のcommitへ固定し、旧版の検証記録と区別します。

文書リポジトリは上流revisionを次の二つで固定します。

- `sources/dsl4/source-lock.json`: repository、コミット、Schema path、SHA-256、参照URL
- `sources/dsl4/dsl-4.schema.json`: 固定コミットから取得した規範Schemaのスナップショット

公開用`docs/dsl-author-guides/dsl-4.0-schema-reference.md`は、このスナップショットと
`sources/dsl4/annotations.ja.json`から決定的に生成します。生成Markdownやスナップショットを直接書き換えて
上流との差を隠してはいけません。

上流を更新するときだけ、文書リポジトリで次を実行します。以下は実装Schema基準を再現する例です。
公開rc.25の検査には同じcommitの`sources/dsl4/dsl-4.0-rc.25.schema.json`を使います。旧rc.22のsnapshotは当時の記録として保持します。

```bash
pnpm docs:dsl4:sync -- \
  --repository ../turbowarp-kamishibai-app \
  --commit a68f8dc4d38b4609c8387192d3be0376963735e3
pnpm docs:dsl4:check
git diff -- \
  sources/dsl4/source-lock.json \
  sources/dsl4/dsl-4.schema.json \
  docs/dsl-author-guides/dsl-4.0-schema-reference.md
```

新しいコミットへ進める場合は`--commit`をその完成revisionへ置き換えます。同期後はSchema差分だけでなく、
表層仕様、fixture、frontend、runtime、release artifactが同じrevisionに含まれることを確認します。

## 開発環境を準備する

固定コミットの本体CLIと文書のビルドにはNode.js 24.0.0以上とpnpm 11を使用します。それぞれのrepository rootでロックファイルを使用して依存を復元します。

```bash
corepack enable
pnpm install --frozen-lockfile
```

本体リポジトリでは、最初に固定release sourceとquick suiteが正常であることを確認します。

```bash
pnpm sb3:dsl4-release:check
pnpm verify:quick
```

文書リポジトリでは、Schemaスナップショットと生成referenceの同期を確認します。

```bash
pnpm docs:dsl4:check
pnpm test
```

## リポジトリ構成を把握する

本体リポジトリのDSL 4.0保守領域は次のとおりです。

| path                                         | 責務                                                               |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `schema/dsl-4.schema.json`                   | DSL 4.0の機械可読な規範Schema                                      |
| `src/dsl4/source-frontend.ts`                | YAML parse、Schema検証、意味検証、StoryDocument生成                |
| `src/dsl4/source-graph.ts`                   | 到達可能source、cycle、path、有限上限を検証したSource Graph        |
| `src/dsl4/source-graph-frontend.ts`          | 複数sourceのcompose、重複診断、source origin保持                   |
| `src/dsl4/story-document.ts`                 | 正規化したStoryDocumentとsource range、deep freeze                 |
| `src/dsl4/runtime-controller.ts`             | scene、action、navigation、asset lifecycleの実行制御               |
| `src/dsl4/live-reload-session.ts`            | quiesce、candidate、再開位置、コミット、旧sessionのdispose         |
| `src/dsl4/platform/`                         | actor、media、pose、SVG Text、asset managerへのport／adapter       |
| `src/dsl4/browser-turbowarp-platform.ts`     | ブラウザー上のTurboWarp platform composition                       |
| `src/dsl4/browser-preview-source-adapter.ts` | Browser Previewのread-only source選択と安定読込                    |
| `src/dsl4/browser-preview-asset-adapter.ts`  | Browser Previewのlocal asset snapshot                              |
| `src/dsl4/browser-preview-runtime-bridge.ts` | preview protocolとbrowser-owned runtimeの接続                      |
| `src/builder/dsl4-validate.ts`               | `validate-dsl4`の診断出力                                          |
| `src/builder/dsl4-build.ts`                  | source、asset、runtime componentのmemory内ビルド                   |
| `src/builder/dsl4-build-output.ts`           | disk candidateの再検証とatomic 導入                                |
| `src/builder/dsl4-local-preview-command.ts`  | `preview-dsl4 --watch`のlifecycle                                  |
| `src/builder/dsl4-local-preview-host.ts`     | loopback transport、session token、watcher                         |
| `bin/turbowarp-kamishibai.mjs`               | 公開CLI entrypoint                                                 |
| `release-metadata/4.0.0-rc.25.json`          | rc.25の状態、source identity、artifact、公開先                     |
| `scripts/sb3/dsl4-downloadable-release.ts`   | Standard Runtime release sourceの決定的生成と検査                  |
| `scripts/download-catalog.ts`                | `kamishibai-4.0.0-rc.25.sb3`のバージョン、source identity、SHA-256 |
| `test/fixtures/dsl4/`                        | Schema、adapter、リリース契約のfixture                             |

文書リポジトリでは、次の境界を保ちます。

| path                                                 | 責務                                            |
| ---------------------------------------------------- | ----------------------------------------------- |
| `sources/dsl4/source-lock.json`                      | 上流コミットとSchema SHA-256のlock              |
| `sources/dsl4/dsl-4.schema.json`                     | 上流規範Schemaの固定スナップショット            |
| `sources/dsl4/annotations.ja.json`                   | 生成referenceの日本語説明と掲載順               |
| `docs/dsl-author-guides/dsl-4.0-schema-reference.md` | 生成された公開reference                         |
| `docs/dsl-author-guides/dsl-4.0-author-guide.md`     | 作者向けのproject、Source Graph、action利用契約 |
| `docs/developer-guides/developer-guide-4.0.md`       | 本書                                            |
| `docs/config.mjs`                                    | バージョン別publicationの正本                   |
| `site/4.0/index.html`                                | DSL 4.0公開topの静的導線                        |

`dist/`は両repositoryとも生成物です。変更の正本にせず、ビルド後の検査対象として扱います。

## feature flagを起動時スナップショットとして扱う

DSL 4.0のflagは`src/dsl4/feature-flags.ts`で列挙し、`dsl4DefaultFeatureFlags`ではすべて`false`です。
`resolveDsl4FeatureFlags()`は起動時に未知keyと依存関係を検査し、deep freezeしたスナップショットを返します。
実行中にflag objectを変更して一部だけを切り替えません。

rc.25の`sourceSections`は、runtime flagとは別の編集用パレット設定です。
`src/dsl4/structured-block-source.ts`の`dsl4BlockAuthoringDefaultFeatureFlags`で既定`false`とし、
`author-block-dsl --block-sections true`で「この部分を使う」ブロックを表示します。
保存済みブロックの読取は表示設定にかかわらず対応します。`false`へ戻すと新規生成時のパレットで非表示になります。
YAMLの実行用Schemaにfieldを追加せず、無効部分の復元状態はサイズ制限付きコメントへ保存します。
確認testは`test/dsl4-block-source-sections.test.ts`です。切戻しは元SB3を保存し、有効部分を書き出して旧版で利用します。

主な依存関係は次のとおりです。

- `dsl4AppShell`は`dsl4Runtime`を必要とする
- `dsl4SourceIncludes`は`dsl4Runtime`を必要とする
- `dsl4WebPreviewAdapter`は`dsl4Runtime`と`dsl4AppShell`を必要とする
- `dsl4WebPreviewAssetLiveReload`はruntime、app shell、Web Preview adapterを必要とする
- `dsl4PreviewReloadOverlay`はruntimeとapp shellを必要とする
- `dsl4SpeechAdvanceTypewriter`はruntimeを必要とする

`build-dsl4`と`preview-dsl4`のSource Graph経路は`--enable-source-includes`を指定したときだけ有効になり、
source件数、graph合計byte数、include depthの有限上限も必須になります。問題を切り分ける場合はflagを既定OFFへ
戻し、単一sourceでruntime、adapter、artifactの基線を確認します。flagの既定値自体を文書変更と一緒に変えません。

## projectとsource manifestを準備する

CLI previewとビルドは、project rootとroot直下の`project.source.json`を明示的に受け取ります。新しいprojectは
entry sourceを`path`へ記録します。

```json
{
  "formatVersion": 1,
  "mode": "external",
  "sourceId": "main",
  "path": "story.k4.yml"
}
```

`path`を省略した場合だけ`story.kamishibai.yaml`を使用します。entryはroot直下のbasenameに限り、ディレクトリ、
絶対path、URI、`..`を受理しません。初回の正常な`build-dsl4`は、verified remote asset cacheを作品単位で
分離する`cacheId`と`cacheDatabaseName`をマニフェストへatomicに追記します。既存identityは台本名を変更しても
再生成しません。

## validateを実行する

`validate-dsl4`はproductionと同じcanonicalizer、Schema、semantic validator、diagnostic modelで一つのYAMLを
検証します。`--max-source-bytes`を省略できません。pretty形式は人が読み、JSON形式はCIやeditorが処理します。
4.0.0-rc.12以前のpackageでは、コマンド名は`tm-kamishibai`です（rc.13以降も互換aliasとして使えます）。

```bash
pnpm exec turbowarp-kamishibai validate-dsl4 \
  --input project/story.k4.yml \
  --max-source-bytes 65536 \
  --format pretty
```

終了statusは、成功が`0`、source診断が`1`、optionや内部契約の問題が`2`です。JSON envelopeはsource text、AST、
端末の絶対pathを出力しません。

`include`はJSON Schemaのfieldではなく、Schema検証前のSource Graph directiveです。そのため複数source全体は、
`validate-dsl4`へ`include`付きentryを直接渡すのではなく、次節の`preview-dsl4`または`build-dsl4`で
`--enable-source-includes`とgraph上限を指定して検証します。

## CLI Previewを実行する

`preview-dsl4 --watch`はNode側でprojectを監視し、development-only browser runtimeをmemory内に構築します。
固定コミットの公開CLIでは、base SB3、project root、source manifest、control profile、channel、sourceとassetの
有限上限がすべて必須です。

```bash
pnpm exec turbowarp-kamishibai preview-dsl4 \
  --watch \
  --base base.sb3 \
  --project-root project \
  --source-manifest project/project.source.json \
  --control-profile production \
  --channel bundled \
  --max-source-bytes 65536 \
  --max-asset-file-bytes 16777216 \
  --max-asset-files 64 \
  --max-total-asset-bytes 67108864 \
  --enable-source-includes \
  --max-source-files 32 \
  --max-total-source-bytes 262144 \
  --max-include-depth 8 \
  --port 0
```

includeを使わないprojectでは、`--enable-source-includes`と三つのgraph上限をまとめて外します。`--port 0`は
OSに空いているloopback portを選択させます。hostは`127.0.0.1`または`::1`にだけbindし、許可originと
one-use session tokenを検査します。CLIはbrowser runtime-ready acknowledgmentを受け取るまでreadyを表示しません。
SIGINT／SIGTERM、ブラウザー切断、full rebuild要求ではwatcher、transport、runtimeを有限時間で終了します。

YAMLだけの変更はcandidate generationとしてlive reloadします。base SB3、asset bundle、app shell、runtime、
ビルダー設定、source path／ID、control profileを含むartifact fingerprintが変わった場合は、部分reloadを続けず
full rebuildとしてcommandを再起動します。

## 自己完結SB3をビルドする

配布candidateは`build-dsl4`で一つの`.sb3`へ出力します。次の例はSource Graphを有効にする場合の完全なCLI契約です。

```bash
pnpm exec turbowarp-kamishibai build-dsl4 \
  --base base.sb3 \
  --project-root project \
  --source-manifest project/project.source.json \
  --output dist/story.sb3 \
  --control-profile production \
  --channel bundled \
  --max-source-bytes 65536 \
  --max-asset-file-bytes 16777216 \
  --max-asset-files 64 \
  --max-total-asset-bytes 67108864 \
  --enable-source-includes \
  --max-source-files 32 \
  --max-total-source-bytes 262144 \
  --max-include-depth 8
```

`--channel bundled`はproduction player／Packager、`--channel unbundled`はTurboWarp editorで使用する保存面です。
両channelは同じsource descriptorとintegrityを検証します。同じchannelのcomponentがbase SB3にある場合は既定で
拒否し、意図的に置き換えるときだけ`--replace-existing`を指定します。

ビルドは次の順序を一つのcandidateに対して行います。

1. project rootとsource manifestを検証し、entry sourceを二回安定取得する
2. Source Graphを使う場合は全nodeを有限上限内で読み、cycleと重複を診断してcomposeする
3. production frontendでcanonical sourceとdeep-frozen StoryDocumentを生成する
4. 宣言元sourceを基準にlocal assetを安定取得し、一つのasset snapshotを作る
5. source descriptor、runtime artifact、asset bundleをbase SB3へ格納する
6. memory内の生成projectをloaderで再検証する
7. disk candidateを再読込し、byte一致とruntime componentを再検証する
8. 成功した`.sb3`だけを出力先へatomicに設置する

失敗時は以前の出力を維持し、途中candidateを残しません。`project.source.json`へ初回cache identityを追記する場合も
temporary fileからrenameします。

### 自己完結の境界

Standard SB3は`kubohiroyakamishibairuntime4`を一度だけ登録し、次を内包します。

- embedded extension code `extensions/kubohiroyakamishibairuntime4.js`
- canonical YAML source descriptorとsource integrity
- control profileから解決したruntime artifact
- local `delivery: embedded` assetのbyte列、マニフェスト、bundle integrity
- Source Graph使用時の宣言元source IDとrange

端末の絶対path、ブラウザーのfile handle、preview token、reload candidate、modal状態を保存しません。local sourceと
embedded assetだけを使う成果物は、実行時にextension codeや作品assetをremote取得しません。

`delivery: remote`は明示的な例外です。通常のrecognitionModelではHTTPS TurboWarp Teachable Machine ディレクトリ URLを保存します。
検証付きremoteではURL、SHA-256 integrity、Content-Type、sizeを保存し、いずれもasset byte列は
SB3へ含めません。「自己完結」はsource、runtime code、runtime artifact、
embedded assetの境界を指し、remote deliveryを選んだ作品の完全offline動作を意味しません。内容を固定する
recognitionModelはlocal `file`へ変換して埋め込みます。remote extension codeと
remote previewは常に禁止します。

### TurboWarp Teachable Machine上流との責務境界

rc.25は`@kubohiroya/turbowarp-teachable-machine@3.5.1`をexact pinします。カメラ映像はCamera Sourceが所有し、
TurboWarp Teachable Machineはleaseした映像を認識に使います。推論用canvas、Canvas2D context、
TensorFlow.jsへのreadback、SVG overlay要素はTurboWarp Teachable Machineが所有します。DSL runtimeは公開Composition APIへ
正規化済みoverlay設定を渡すだけで、TurboWarp Teachable MachineのDOM、canvas、TensorFlow.js内部実装を検査・patchしません。
CPU推論時のChromium readback警告は性能根拠のない抑制をせず許容し、回帰判定は実時間、動作、解放で行います。

## Source Graph transactionとimmutable snapshotを保つ

`include`はentryから到達するsourceだけをdiscovery orderで読みます。source数、1 sourceのbyte数、graph合計byte数、
include depth、compose後byte数に独立した有限上限を適用します。絶対path、root外へのescape、シンボリックリンクによるescape、cycle、
同じnamespaceの同じID、`kamishibai`等の単一設定の重複はcandidateを実行する前に失敗します。

compose後は`include`を取り除いたcanonical sourceをfrontendへ渡し、StoryDocumentに各StoryPathの`sourceId`と
source rangeを保持します。local assetの相対pathはentryではなく宣言元sourceを基準に解決します。これにより、
included fileへ宣言を移動した場合も診断とasset参照を元のsourceへ戻せます。

Previewでは、entry pathとdiscovery order内の全canonical sourceからgeneration identityを作ります。一つでも
読込中に変化した場合、古いgenerationと新しいgenerationを混ぜません。frontend結果とStoryDocumentはdeep freezeし、
runtimeやadapterが正規化済みtreeを直接書き換えないようにします。

live reloadは次の境界で行います。

1. 新しいsource resultを`stage`し、無効なら現在のruntimeを維持して診断だけを更新する
2. 有効なcandidateでは現在actionを`quiesce`し、再開可能なscene／actionと変数スナップショットを得る
3. reload planと作者の再開選択を確定する
4. 新sessionを開始してcandidateを`commit`する
5. コミット成功後にだけ旧sessionをdisposeする
6. quiesce、start、コミットが失敗した場合はcandidateを破棄し、可能なら旧sessionをresumeする

asset reloadもprepare、activate、acknowledge、旧generationのreleaseの順でtransactionを行います。ただし、source保存と
複数asset保存を一つのfilesystem transactionに束ねるatomicityは保証しません。各スナップショットが安定するまで待ち、source
generationとasset generationを混同しないことが重要です。

## browser adapterとCLI adapterの責務を分ける

Browser PreviewとCLI Previewはproduction source frontend、generation protocol、runtime componentを共有しますが、
I/Oの所有者は分けます。

| 境界          | Browser Preview                                                      | CLI Preview                                                 |
| ------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| project選択   | File System Access APIでディレクトリをread-only選択                  | `--project-root`と`--source-manifest`を明示                 |
| 安定読込      | `browser-preview-source-adapter.js`とasset adapter                   | Node filesystem loaderと`dsl4-preview-watch.js`             |
| transport     | ブラウザー内のpreview protocol                                       | loopback-only HTTP／event streamとsession token             |
| runtime所有者 | browser-owned実TurboWarp runtime                                     | browser-owned実TurboWarp runtime。Node hostはVMを所有しない |
| 書込          | project、YAML、SB3を書き換えない                                     | preview中はprojectやSB3を書き換えない                       |
| production外  | ディレクトリhandle、overlay、reload preferenceをartifactへ保存しない | host、token、watcher、browser bundleをproductionへ含めない  |

platform coreはfilesystem、DOM、カメラ、TurboWarp VMへ直接依存しません。`src/dsl4/platform/`のportへactor、media、
SVG Text、pose、asset lifecycleを注入し、`browser-turbowarp-platform.ts`でブラウザー実装をcomposeします。platform APIを
変更した場合はcore unit testだけでなく、browser fixtureとadapter contractを実行します。

## 変更対象別の検証matrix

変更したpathに対応する行をすべて実行し、最後に標準checkへ合流します。

| 変更対象                                    | 必須の自動検証                                                                                                                                                                                                                 | 追加smoke                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Schema、normalization、semantic diagnostics | `pnpm exec vitest run test/dsl4-schema.test.ts test/dsl4-validate-cli.test.ts test/dsl4-expression-diagnostic-boundaries.test.ts`                                                                                              | valid／invalid fixtureのpretty・JSON診断               |
| Source Graph、origin、limits                | `pnpm exec vitest run test/dsl4-source-graph.test.ts test/dsl4-source-graph-frontend.test.ts test/dsl4-source-include-build.test.ts test/dsl4-source-limits.test.ts`                                                           | included sourceを保存し、active generation維持を確認   |
| runtime controller、action、navigation      | `pnpm exec vitest run test/dsl4-runtime-controller.test.ts test/dsl4-action-scope-integration.test.ts test/dsl4-navigation-session.test.ts`                                                                                    | entry、分岐、戻る、停止を一作品で確認                  |
| live reload、immutable generation           | `pnpm exec vitest run test/dsl4-live-reload-session.test.ts test/dsl4-live-reload-quiesce.test.ts test/dsl4-preview-source-graph-generation.test.ts`                                                                           | 構文error保存後も直前generationが動くことを確認        |
| asset lifecycle、transaction                | `pnpm exec vitest run test/dsl4-asset-reload-transaction.test.ts test/dsl4-platform-asset-session.test.ts test/dsl4-runtime-asset-lifecycle.test.ts`                                                                           | 失敗candidateで旧assetが維持されることを確認           |
| Browser Preview source／asset adapter       | `pnpm exec vitest run test/dsl4-browser-preview-source-adapter.test.ts test/dsl4-browser-preview-asset-adapter.test.ts test/dsl4-browser-asset-reload-pipeline.test.ts`                                                        | ディレクトリ再選択、permission取消、途中保存           |
| CLI Preview host／transport                 | `pnpm exec vitest run test/dsl4-local-preview-cli.test.ts test/dsl4-local-preview-host.test.ts test/dsl4-preview-transport-policy.test.ts`                                                                                     | runtime-ready、SIGINT、ブラウザー切断、full rebuild    |
| カメラ、pose、feedback、overlay             | `pnpm exec vitest run test/dsl4-camera-preview-controls.test.ts test/dsl4-pose-action-port.test.ts test/dsl4-pose-feedback-presenter.test.ts test/dsl4-tmpose-model-adapter.test.mjs test/dsl4-platform-asset-session.test.ts` | カメラ許可、mirroring、overlay、model解放              |
| ビルド、component storage、自己完結SB3      | `pnpm exec vitest run test/dsl4-build-cli.test.ts test/dsl4-one-shot-build.test.ts test/dsl4-packaged-runtime-component.test.ts test/dsl4-source-sb3-storage.test.ts`                                                          | networkなしでembedded作品を起動                        |
| Standard Runtime、capability pin、リリース  | `pnpm exec vitest run test/dsl4-capability-bundle-release-contract.test.ts test/dsl4-extension-pins.test.ts test/dsl4-downloadable-release.test.ts`                                                                            | `kamishibai-4.0.0-rc.25.sb3`のchecksumとTurboWarp起動  |
| Web Preview E2E                             | `pnpm e2e`                                                                                                                                                                                                                     | Chromiumでsource変更、asset変更、overlay、cleanup      |
| npmパッケージのsurface                      | `pnpm pack:check`、`pnpm release:check`                                                                                                                                                                                        | tarballに`src/builder/`、`src/dsl4/*.js`、Schemaを確認 |
| 文書、publication、公開導線                 | 文書リポジトリで`pnpm check`                                                                                                                                                                                                   | `/4.0/`のHTMLとVivliostyle Viewerを開く                |

本体リポジトリの最終回帰は次です。

```bash
pnpm verify:full
```

固定コミットでは、このcommandが`sb3:check`、lint、format、typecheck、full test、E2E、siteビルド、
`pack:check`を順に実行します。失敗した工程をIssueの運用ログへ`blocked:`として記録し、合格するまでリリースへ
進みません。

## リリースを作成する

公開前のcandidate固定、Browser／CLI Preview、production SB3／Web版、実カメラ・実ポーズ、release-stop、
証跡の保存は[DSL 4.0 release smoke](release-smoke-4.0.md)を正本とします。本節はrelease sourceを作る順序、
同書は作成したcandidateを公開してよいか判定する手順を担当します。

DSL 4.0 Standard Runtimeは、source-composedされた`kubohiroyakamishibairuntime4`と、完全固定したcapability
パッケージから作ります。rc.25ではタグ、`release-metadata/4.0.0-rc.25.json`、GitHub Releaseの
`kamishibai-4.0.0-rc.25.sb3`を不変の公開記録として管理します。現行branchへ展開済みrelease sourceを重複保持しません。
composite IDは`kubohiroyakamishibai4`で、29個のcore actionは
可視blockとして、読取状態17個を加えます。Runtimeは計46個、Standard bundle全体は200個です。内部の10 blockは非表示で登録されます。

リリースは次の順で行います。

1. capabilityパッケージを各repositoryで検証してリリースする
2. 本体の`package.json`と`pnpm-lock.yaml`をexactなバージョンとintegrityへ更新する
3. `LICENSES.md`のattributionとパッケージのprovenanceを同期する
4. Standard Runtime ID、29個の可視core action、17個の読取状態blockと10個の非表示block、remote code禁止をcontract testで確認する
5. `pnpm verify:full`を完走する
6. `release-metadata/<version>.json`をcandidateとして作り、source identityと成果物を生成する
7. source identityと成果物が正本と一致することを`pnpm release:dsl4:check`で確認する
8. `scripts/download-catalog.ts`のバージョン、`sourceCommit`、`buildDate`、SHA-256を更新する
9. `pnpm release:dsl4:freeze`でタグ対象のコミットとartifactを固定する
10. `pnpm release:check`でnpm 公開内容をdry runする
11. GitHub Actions、download、パッケージ、Pagesの公開結果を確認してからIssueを完了する

rc.25のrelease metadataと成果物を検査するcommandは次です。公開済みartifactを再生成して差し替えません。

```bash
pnpm release:dsl4:check
pnpm verify:full
pnpm release:check
git diff --exit-code -- release-metadata/4.0.0-rc.25.json
```

安定版へ進める場合は、generator内のリリース ディレクトリ、パッケージ バージョン、download catalogを同じバージョンへ更新して
から実行します。既存バージョンのrelease sourceやcatalog checksumを、異なるbyte列のまま再利用しません。

PRには少なくとも次を記録します。

- 上流コミットと変更したSchema／source／adapter path
- 実行したtargeted testと`pnpm verify:full`の結果
- `kamishibai-4.0.0-rc.25.sb3`のSHA-256とsource identity
- Browser／CLI Preview、カメラ、pose、offline smokeの対象
- feature flagの既定値とrollback方法
- パッケージ、artifact、Pagesの公開順

## rollbackする

公開前に検証が失敗した場合は、新しいartifactを公開しません。package／lock pin、release source、download catalogを
直前のコミットへ戻し、feature flagを既定OFFにした状態で`pnpm verify:full`を再実行します。

公開後に問題が見つかった場合は、次の順で影響を止めます。

1. 問題のあるsurfaceのflagを起動時スナップショットでOFFにする
2. npmの`next`を直前版へ戻し、PagesとGitHub prereleaseへ注意事項を追加する
3. パッケージとロックファイルを直前のexact pinへ戻す
4. 公開済みrc.25は上書きせず、修正版を新しいバージョンとしてビルドする
5. `pnpm verify:full`と代表smokeを再実行する
6. Pagesを再公開し、Issueとrelease noteへ影響範囲を記録する

npmへ公開済みのversionは上書きせず、必要に応じてdeprecateと修正版バージョンを使用します。Source Graphだけを止める
場合は`dsl4SourceIncludes`をOFFにし、`--enable-source-includes`を外した単一source経路へ戻します。Browser Previewの
問題ではpreview adapterをOFFにしても、検証済み自己完結SB3のproduction runtimeを同時に変更しません。

文書だけをrollbackする場合は、本書のMarkdown、`docs/config.mjs`の4.0 publication、`site/4.0/index.html`のカード、
対応する回帰testだけをrevertします。他の4.0文書と固定Schemaスナップショットは残します。

## 完了条件

DSL 4.0の保守変更は、次をすべて満たしたときに完了です。

- 規範Schema、source lock、実装コミットの関係が説明できる
- 変更したpathから必要なunit、contract、ブラウザー、artifact testを特定して実行した
- Source Graphの有限上限、source origin、transaction、immutable generationを壊していない
- Browser Preview、CLI Preview、production runtimeの所有境界を混ぜていない
- local embedded assetを含む自己完結SB3を再読込して検証した
- remote assetを使う場合はoffline境界とintegrity検証を明記した
- feature flagは既定OFFで、起動時スナップショットとrollbackを確認した
- `pnpm verify:full`、release candidateのchecksum、代表smokeをIssueへ記録した
- publication、通常HTML、Vivliostyle Viewerの4.0専用URLを確認した

## DSL 4.0 RC改訂の物語反復と条件分岐

`if`／`repeat`／`forEach`の専用囲み、型付き参照、各回の一覧表は、App 4.0.0-rc.44以降のStandardで利用できます。
[作者ガイドの4.0 RC改訂仕様](../dsl-author-guides/dsl-4.0-author-guide.md)に構文・一覧編集・上限・中断・切戻しをまとめました。
宣言は4.0のままです。rc.43以前は対応しないため、ベースSB3・台本・CLIの対応版を揃えます。
Standardは起動時固定で物語制御を有効にします。低水準APIの既定OFFと明示的な無効化は維持します。
通常の対応CLIで変換・検証・build・previewでき、追加の実験flagは不要です。旧runnerとの混在は拒否します。現在の公開版は4.0.0-rc.51です。CLIとベースSB3を同じrc.51へ揃えます。CLIは[公開tagから準備する手順](../dsl-author-guides/dsl-4.0-block-script-conversion-guide.md#cli-from-release-source)で準備できます。同版のnpm公開状態は[4.0の入口](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)で確認し、公開済みnpmを使う場合もSB3と版を揃えてください。
標準Scratch制御ブロックは引き続き非対応です。

[三人の訪問](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/three-visits/)で、公開Editorの一覧フォーム・保存／キャンセル・再生を試せます。非対応ブロックの診断には日本語名・ステージ／スプライト名を表示し、該当箇所へ移動・強調できます。

## rc.51の配布・資源管理

rc.51は共有素材のownerと保持予算/LRU、publication読込時の常駐予算、章間の素材ファイル重複排除、次章remote動画の検証済みcacheへの先読みを含みます。先読みはmaterializeせず、章遷移の失敗・cancel時には現章の再生を保持します。これらはDSL 4.0の改訂であり、新しいURLスイッチは不要です。

CLIの`build-dsl4 --distribution-profile compiled`、または`buildDsl4RuntimeComponent({distributionProfile: 'compiled'})`で、YAMLや作者用hatを含めず検証済みStory IRを配布できます。既定の`source` profileは従来どおりです。`compiled`は暗号化ではなく、`sealed`は未提供です。編集用の原本YAML・素材は別途保持してください。

本版の依存はCamera Source 0.19.2、Teachable Machine 3.5.5です。npm rc.51は未公開のため、前節の公開tagから対応CLIをbuildし、rc.51のSB3と組み合わせます。詳細は[rc.51リリースノート](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/v4.0.0-rc.51/docs/releases/v4.0.0-rc.51.md)と[compiled配布仕様](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/v4.0.0-rc.51/docs/design/dsl-4-compiled-distribution.md)を参照してください。

## rc.51のcompiled保存とsealed配布 {#compiled-sealed-rc51}

Standardのメニューでは通常の配布用SB3の作成と「YAMLなし」の作成を選べます。publicationでは「Save SB3 without YAML / YAMLなしでSB3を保存」を選びます。compiledは検証済みStory IRを保存する形式で、暗号化ではありません。元のYAMLや編集用ファイルは別に保持してください。

台本・素材をパスワードで保護して配布する場合は、rc.51のCLIで`build-dsl4`に`--distribution-profile sealed --sealed-password-env KAMISHIBAI_SEALED_PASSWORD`を指定します。パスワードは環境変数へ設定し、SB3や公開リポジトリには記録しません。sealed生成はCLIのみで、StandardメニューのYAMLなし保存はcompiledです。生成に使ったパスワードを受け手へ別経路で伝えてください。暗号化は再生中の画面・素材の複製を防ぐ保証ではありません。

受け手がsealed作品を公開EditorやPlayerで開くとパスワード入力画面が表示されます。誤入力時は再試行でき、「キャンセル」で中断できます。成功したパスワードは同じ作品の再起動用にページ内のメモリで再利用し、永続保存しません。公開元の作品・パスワードが正しいことを確認してから入力してください。

rc.51はpublicationの解放失敗後もcleanup ownerを保持し、disposeの競合を直列化して再試行します。後続のcreation cleanup作業はこの版へ含めません。
