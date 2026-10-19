# TurboWarp紙芝居ドキュメント

このリポジトリは、[TurboWarp紙芝居](https://github.com/kubohiroya/turbowarp-kamishibai-app)の
一般文書、紙芝居DSL作成者向け文書、開発者向け文書、体験会資料を管理し、
独立したGitHub Pagesとして公開するためのリポジトリです。

文書sourceは、現行 `turbowarp-kamishibai-app` の履歴上にある旧 repository 名のPR #238 merge commit
`8166edb3a8b7ed360685bdcd6534c000054105bd`から履歴付きで移設しています。
同commitで`docs/design/`、`docs/development/`に残っていた開発者向け3文書も、
読者別ディレクトリへ追加移設しています。文書の表示順は`docs/config.mjs`で管理し、
ファイル名には旧来の番号接頭辞を付けません。

## 公開サイトの役割

- `turbowarp-kamishibai-app`: アプリ本体と、アプリ・文書・サンプルへ移動する公開入口
- `turbowarp-kamishibai-docs`: 全文書のHTMLとVivliostyle Viewer、体験会資料のPDF
- `turbowarp-kamishibai-samples`: サンプル台本と実行可能な作品

公開入口は `https://kubohiroya.github.io/turbowarp-kamishibai-app/` に固定します。
このリポジトリのPagesは `https://kubohiroya.github.io/turbowarp-kamishibai-docs/` を予定しています。

ドキュメントサイトの公開rootは版選択バナーだけを表示します。ワークショップ、サンプル、
ダウンロードへの共通導線はAppBarと公式トップで提供し、版固有の文書一覧は混在させず、
次の専用topで提供します。

- `/3.2/`: TXT台本、3.2.xアプリ、既存作品・教材を保守するための文書
- `/4.0/`: YAML project、include文、preview／build toolchainで新しく制作するための文書
- `/workshops/`: 体験会資料を開催時期とDSL系列ごとに一覧表示する独立した入口

各版固有文書の通常HTML（`index.html`）、Viewer用本文（`document.html`）、
`publication.json`、local assetは、
`/3.2/`または`/4.0/`以下へ生成します。以前のversion番号なしURLには自動転送を置かず、
対応する新URLと版選択rootを案内するページを残します。以前のVivliostyle Viewer URLが参照する
`publication.json`も、同じ移転案内を表示するWeb Publicationとして維持します。

## 文書の分類

移設元の`docs/general/`をそのまま再現せず、読者と用途により次のように分割します。

| ディレクトリ              | 対象読者                                |
| ------------------------- | --------------------------------------- |
| `docs/user-guides/`       | 一般利用者、保護者、教員、体験参加者    |
| `docs/tutorials/`         | DSL 4.0を順番に遊ぶ人・作る人           |
| `docs/dsl-author-guides/` | 紙芝居DSLで作品を作成・移行する人       |
| `docs/developer-guides/`  | アプリ、SB3、機能拡張を保守・開発する人 |
| `docs/workshops/`         | 体験会の参加者、スタッフ、運営者        |

具体的なファイル対応、依存境界、実施記録は[MIGRATION.md](MIGRATION.md)を参照してください。
`docs/tutorials/`と4.0文書は公開プレリリース`4.0.0-rc.23`を公開runtime基準にします。
Schemaリファレンスと公開runtimeは同じrc.23のcommit `2f2889f`へ固定し、旧rc.22のSchemaは履歴snapshotとして保存します。
`/4.0/tutorials/`系列へ配置し、4.0一覧から「紙芝居を遊ぶ」「紙芝居を作る」へ案内します。
公開サンプル、スターター、Web版のmanifestもrc.23基準です。samplesのWeb・実Editorでの直接再生と公開12ファイルのhashを確認済みです。実カメラ・実ポーズは再検証していません。
固定commit、取得先、照合方法、過去の検証の適用範囲は`DSL4-PUBLICATION-STATUS.md`と
`sources/dsl4/user-guide-4.0-public-surfaces.json`に記録します。

本文の用語、コード表記、固有概念の初出説明、図表の使い分けは
[TurboWarp紙芝居ドキュメント表記ガイド](WRITING-STYLE.md)に従います。
DSL 4.0の固定実装、正式リリース、公開画面、文書状態の区別は
[DSL 4.0 文書・公開状態の表記基準](DSL4-PUBLICATION-STATUS.md)で管理します。
概念図の通常HTML、狭幅、印刷、フラグメントの確認結果は
[DSL 4.0 概念図・フラグメントQA記録](DSL4-DIAGRAM-QA.md)へ記録します。
公開rc.5から再現したDSL 4.0実画面と、source、runtime、live reload transactionの実装追跡図は
[DSL 4.0 実装ビジュアル記録](DSL4-IMPLEMENTATION-VISUALS.md)で管理します。

## 開発

Node.js 24.0.0以降とpnpm 11を使用します。

```bash
pnpm install
pnpm check
```

`pnpm build`は、増分buildと生成物検証を実行します。生成だけを実行する場合は
`pnpm build:publications`、全publicationを強制的に再生成する場合は
`pnpm build:publications:full`（検証も含める場合は`pnpm build:full`）を使用します。

増分buildはpublication種別に依存しない共通処理で、Markdown、そこから参照する図版、
共通theme、font、Vivliostyle設定、build scriptを入力として収集します。完了markerの
`build-info.json`と必須出力のうち最も古い更新日時を、入力の最も新しい更新日時と比較し、
必須出力の欠落、metadata不一致、または新しい入力があるpublicationだけを再生成します。
同じ内容の共通assetと後処理済みHTMLは再書き込みしません。

各文書のWeb Publicationは`dist/`へ生成します。PDFを生成するのは
`docs/workshops/`配下の体験会資料だけで、公開用PDFを`dist/`、確認用PDFを
`output/pdf/`へ出力します。
移設元の固定情報と機能拡張一覧は
[`sources/turbowarp-kamishibai-app.json`](sources/turbowarp-kamishibai-app.json)で管理します。

### DSLリファレンスの保守と出版

DSL 3系とDSL 4.0では、リファレンスの正本と保守方法を分けます。

公開サイトではDSL 3.2とDSL 4.0を並列の正式サポート対象として扱い、版ごとの専用セクションと
専用ページを提供します。既存のTXT台本と3.2.xを保守する場合は3.2、新しいYAML project、
include文、preview／build toolchainで制作する場合は4.0を選びます。

- DSL 3系（現行実装が受理する宣言は3.1／3.2）: 過去リリースから引き継いだ手書きMarkdown
  [`docs/dsl-author-guides/command-reference.md`](docs/dsl-author-guides/command-reference.md)を、
  このリポジトリで引き続き保守します。
- DSL 4.0: 上流JSON Schemaの固定snapshot、source lock、日本語Annotationから
  [`docs/dsl-author-guides/dsl-4.0-schema-reference.md`](docs/dsl-author-guides/dsl-4.0-schema-reference.md)を
  決定的に生成します。

どちらのMarkdownも`pnpm build`で同じVivliostyle Web Publication工程へ入力し、通常のHTML版
（各公開ディレクトリの`index.html`）とVivliostyle Viewer版（`publication.json`）を同時に
用意します。通常HTMLは目次と本文を同一ページに収め、広い画面では目次を左上へ固定し、
見出しの子階層を展開・折りたたみできるツリーとして表示します。Viewerのreading orderには
`document.html`だけを含め、統合HTMLとの二重表示を防ぎます。DSL 3系をJSON Schemaへ置き換えたり、
DSL 4.0と同じ生成方式へ擬似的に統一したりはしません。

2026年8月1日のワークショップ資料も、参加者向けは表紙・目次・本文、スタッフ向けは目次・本文を
それぞれ通常HTMLの`index.html`へ統合します。画面用の目次ツリーは一般文書と同じCSS／JavaScriptを
共有します。ViewerとPDFでは統合HTMLをreading orderへ入れず、参加者向けの表紙・目次・本文と、
スタッフ向けの本文だけという既存の組版単位を維持します。

「TurboWarp紙芝居 アプリ・教材・ツールチェインガイド」も3.2版と4.0版を別のMarkdownとして保守し、
それぞれに通常HTML版とVivliostyle Viewer版を用意します。3.2版は`/3.2/`、4.0版は`/4.0/`以下の
独立した開発者向けpublicationとして提供し、以前のversion番号なしURLには移転案内を残します。

release smokeも3.x版と4.0版を別のMarkdown、URL、publicationとして保守します。4.0版は
[`docs/developer-guides/release-smoke-4.0.md`](docs/developer-guides/release-smoke-4.0.md)と
[`sources/dsl4/release-smoke-4.0-candidate.json`](sources/dsl4/release-smoke-4.0-candidate.json)を正本にし、
候補commit、Schema、feature flag、SB3、Web版、実機確認、release-stop、rollbackを一組で固定します。

操作説明書も3.x版と4.0版を別のMarkdown、URL、publicationとして保守します。4.0版は
[`docs/user-guides/user-guide-4.0.md`](docs/user-guides/user-guide-4.0.md)と
[`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)を正本にし、
一般向け本文には開始、入力、終了、再実行、失敗時の復旧を、機械可読データには公開URL、版、checksum、
実機確認を分けて記録します。

リリース履歴も3.x版と4.0版を別のMarkdown、URL、publicationとして保守します。4.0版は
[`docs/dsl-author-guides/dsl-4.0-history.md`](docs/dsl-author-guides/dsl-4.0-history.md)と
[`sources/dsl4/release-history-4.0.json`](sources/dsl4/release-history-4.0.json)を正本にし、実装・検証済みcandidateと
tag、GitHub Release、npm、production Pagesの正式公開状態を分けて追跡します。

4.0の素材の置き方を変更する手順は、
[DSL 4.0 アセット変換ガイド](docs/dsl-author-guides/dsl-4.0-asset-conversion-guide.md)で保守します。
組み込み素材とローカル素材の相互変換、リモート素材の取り込み、変換後のビルドと切り戻しを扱い、
`/4.0/dsl-author-guides/dsl-4.0-asset-conversion-guide/`へHTML・Viewer用本文を生成します。

### DSL 4.0 Schemaリファレンスの生成

DSL 4.0のリファレンスは、上流JSON Schemaの固定snapshot、source lock、日本語Annotationから
決定的に生成します。現在は、規範JSON Schema、表層仕様、適合実装・testを含むDSL 4.0完成commitを
同一revisionとして固定します。Schemaはruntime実装から生成しません。通常のbuildはnetworkへ接続せず、
固定snapshotだけを読みます。Schema外でcompose前に処理するinclude文の作者向け契約は、
固定した表層仕様と適合実装・testを根拠に台本作成ガイドで管理します。

```bash
pnpm docs:dsl4:check
pnpm docs:dsl4:generate
pnpm docs:dsl4:sync -- --repository ../turbowarp-kamishibai-app --commit <commit>
```

上流を更新するときだけ`docs:dsl4:sync`を明示的に実行します。このコマンドは指定commitから
`schema/dsl-4.schema.json`を取得し、SHA-256とsource URLをlock fileへ記録してからリファレンスを
再生成します。生成Markdownは直接編集せず、日本語の説明、掲載順、例は
[`sources/dsl4/annotations.ja.json`](sources/dsl4/annotations.ja.json)で変更します。

準備は[Issue #1](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/1)、
本文移設は[Issue #3](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/3)、
残存文書と生成機構の移設は[Issue #5](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/5)で管理します。

## ライセンス

- 一般・DSL作成者・開発者向け文書、共有画像とその生成物: CC BY-SA 4.0
- 体験会資料とその生成物: Copyright © 2026 Hiroya Kubo. All rights reserved.
- 明示的に列挙したbuild script、site shell、設定、テスト: MPL-2.0

このリポジトリ全体に適用される単一のライセンスはありません。ファイルごとの正確な
適用範囲は[LICENSES.md](LICENSES.md)を参照してください。

4.0の作者向け入口は、台本ブロック、台本DSL、台本作りの詳細資料に分けています。
各作成経路に「紙芝居を作る」と「紙芝居DSL 4.0 台本作成ガイド」を置き、既存のDSL版URLは維持します。
ブロック図版は`sources/dsl4-authoring-blocks.json`から`node scripts/render-authoring-blocks.mjs`で再生成できます。
命令単位の編集と空名ルートからの直接再生は、公開プレリリース4.0.0-rc.23を基準にします。素材入りのブロック台本SB3を開き、緑の旗で起動してタイトルを閉じると再生できます。
