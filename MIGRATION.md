# TurboWarp紙芝居ドキュメント移設計画

## 目的

`tmpose-kamishibai`から文書のsource、画像、Vivliostyle build、文書検証を分離します。
アプリの公開トップは移設元リポジトリに残し、このリポジトリは文書だけを独立して
build・公開できる状態にします。

移設元は`tmpose-kamishibai` PR #238のmerge commit
`8166edb3a8b7ed360685bdcd6534c000054105bd`です。文書関連pathの履歴を
`git filter-repo`で抽出し、このリポジトリへmergeしています。

## 移設後の分類と対応表

### 紙芝居を見る人向けドキュメント

| 現在のパス                                       | 移設先候補                                             |
| ------------------------------------------------ | ------------------------------------------------------ |
| `docs/general/01-executive-summary-adult.md`     | `docs/user-guides/executive-summary-adult.md`          |
| `docs/general/02-executive-summary-kids.md`      | `docs/user-guides/executive-summary-kids.md`           |
| `docs/general/03-user-guide.md`                  | `docs/user-guides/user-guide.md`                       |
| `docs/general/09-application-materials-guide.md` | `docs/developer-guides/application-materials-guide.md` |

### 台本を作る人向けドキュメント

| 現在のパス                             | 移設先候補                                    |
| -------------------------------------- | --------------------------------------------- |
| `docs/general/04-dsl-manual.md`        | `docs/dsl-author-guides/dsl-manual.md`        |
| `docs/general/05-command-reference.md` | `docs/dsl-author-guides/command-reference.md` |
| `docs/general/history.md`              | `docs/dsl-author-guides/history.md`           |

### アプリを開発する人向けドキュメント

| 現在のパス                                  | 移設先候補                                            |
| ------------------------------------------- | ----------------------------------------------------- |
| `docs/general/06-developer-guide.md`        | `docs/developer-guides/developer-guide.md`            |
| `docs/general/07-internal-specification.md` | `docs/developer-guides/internal-specification.md`     |
| `docs/general/08-extension-guide.md`        | `docs/developer-guides/extension-guide.md`            |
| `docs/design/dsl-3.1-diagnostics.md`        | `docs/developer-guides/dsl-3.1-diagnostics-design.md` |
| `docs/development/dependency-audit.md`      | `docs/developer-guides/dependency-audit.md`           |
| `docs/development/release-smoke.md`         | `docs/developer-guides/release-smoke.md`              |

移設先では読者別ディレクトリを順序の正本とし、旧`01-`から`09-`の番号接頭辞は
ファイル名と公開URLから外します。表示順は`docs/config.mjs`で管理します。

`extension-guide.md`と関連する8ページ概要文書は、PR #238で完成した内容を取り込んでいます。
設計レビュー、依存監査、release smokeは一般文書とは別pathに残っていたため、
本体の文書生成機構を撤去する前に開発者向け文書として追加移設します。

### 体験会資料

`docs/workshops/`以下は、年度・開催日単位の構造を保って`docs/workshops/`へ移します。
参加者用、表紙、スタッフ用の関係と共有画像への参照を維持します。

## 本文以外に移設または再構成する対象

本文移設時に、次の範囲を文書リポジトリの責務として再構成します。

- `docs/images/`のうち一般文書・体験会資料が利用する画像
- 文書licenseと画像の出典・帰属情報
- Vivliostyle設定、theme、ふりがな設定
- HTML、PDF、publication manifestの生成処理
- 生成HTMLへ共通AppBarを注入する処理と、`site-shell`、favicon
- 文書構成、内部リンク、画像、PDFページ数、licenseを検証するtest
- 文書サイトのindexとGitHub Pages deployment workflow

アプリ、SB3、TurboWarp Packagerによるアプリ生成、サンプル作品生成は移設しません。

## リポジトリ間の依存境界

双方向のhyperlinkは許容し、buildとreleaseの循環依存は作りません。

- `tmpose-kamishibai`は、この文書Pagesとsamples Pagesへリンクする
- この文書は、アプリの公開URL、repository、固定commitまたはreleaseを参照できる
- この文書は、具体例としてsamplesの公開URLと台本を参照できる
- samplesは、利用するアプリのversionまたはcommitを固定する
- アプリのreleaseは、docs Pagesまたはsamples Pagesのdeployment完了を必須条件にしない

文書buildがアプリのmetadataを必要とする場合は、移設元の`main`を暗黙に取得せず、
採用commitをlock fileへ記録して取得します。文書中のリンク切れや互換性はCIで検査しますが、
他リポジトリのreleaseを相互に待つworkflowにはしません。

## 移設の実施条件

次をすべて満たしたため、本文移設を開始しました。

1. `tmpose-kamishibai`の機能拡張ガイド作成が完了している
2. 同時に進行している関連文書とnavigation変更が完了している
3. 移設元として採用する`tmpose-kamishibai`のcommit SHAが確定している
4. 移設前の全ドキュメントbuildとtestが成功している
5. 既存Pages URL、移設後URL、redirect対象の一覧が確定している

## 移設手順

1. 採用する移設元commitをIssueへ記録する
2. 文書sourceと必要な履歴を一時branchへ取り込む
3. 対応表に従って4分類へ配置し、内部リンクと画像パスを機械的に更新する
4. 文書build依存、設定、theme、検証testを移す
5. 旧repository固有のapp build依存を明示的な入力または固定snapshotへ置き換える
6. HTML、PDF、Viewer、全内部リンク、全画像、ページ数を検証する
7. このリポジトリのPagesを有効化する
8. `tmpose-kamishibai`の公開トップから新しい文書Pagesへリンクする
9. 旧`/tmpose-kamishibai/docs/`へ移転案内と必要なredirectを残す
10. 新旧サイトを確認してから、移設元の文書source削除を別PRで行う

履歴は、移設元repositoryから文書source、画像、theme、Vivliostyle設定、文書indexに
関係するpathだけを`git filter-repo`で抽出して取り込みました。本文の単純copyではなく、
PR #238以前の文書変更を新repositoryから追跡できます。

## 検証項目

- すべての文書が意図した読者分類に一度だけ所属する
- Markdownの相対リンクと画像参照が解決できる
- Vivliostyle HTMLとPDFが既存版と同等に生成される
- 固定ページ数を持つ文書は期待ページ数と一致する
- workshopのふりがな、表紙、目次、スタッフ資料が維持される
- app、docs、samplesの公開リンクが相互に到達できる
- 旧URLに必要な移転案内またはredirectがある
- Pages deploymentが文書リポジトリ内で完結する

## ロールバック

新しいPagesを無効化し、`tmpose-kamishibai`の既存文書公開を継続します。
移設元の文書sourceは、新サイトの検証が完了するまで削除しません。移設後の削除を
実施した後も、削除PRをrevertすれば旧buildへ戻せる状態を保ちます。
