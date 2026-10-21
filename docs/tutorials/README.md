# DSL 4.0 チュートリアル公開管理

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリース`4.0.0-rc.25`のブラウザー完結作者flowとrc.25公開サンプルの管理\
関連Issue: [ブラウザー作者flow #118](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/118) / [本体実装 #555](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/555) / [正式公開 #111](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/111) / [準備 #31](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/31)

読者向け入口: [TurboWarp紙芝居 4.0 ドキュメント](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)

このREADMEは、チュートリアルを公開する人のための管理メモです。初めて紙芝居を遊ぶ人や台本を作る人は、
上の読者向け入口から始めてください。

このディレクトリは、公開プレリリース`4.0.0-rc.25`を作者用実行環境とするチュートリアル本文、
スクリーンショット台帳、4.0ドキュメント一覧への公開計画を保持します。公開中のsample成果物もrc.25から
再生成し、作者用runtimeの版とsample成果物の完全性情報を別々に固定します。

3ページを`docs/config.mjs`へ登録し、4.0トップには「紙芝居を遊ぶ」を見る人向け、
「紙芝居を作る」を台本ブロック版・台本DSL版の各カテゴリーへ直接置きます。
「チュートリアル」という独立カテゴリーや統合一覧カードは設けません。
旧総合入口は内容を重複掲載せず、4.0トップへ転送します。公開時も
AppBarへ独立した「チュートリアル」項目は追加せず、各ページでは既存の「ドキュメント」を現在地にします。

## 公開時の情報設計

| URL                      | 役割                | source                          |
| ------------------------ | ------------------- | ------------------------------- |
| `/4.0/tutorials/`        | `/4.0/`への互換転送 | `site/4.0/tutorials/index.html` |
| `/4.0/tutorials/play/`   | 紙芝居を遊ぶ        | [play.md](play.md)              |
| `/4.0/tutorials/create/` | 紙芝居を作る        | [create.md](create.md)          |

初版のチュートリアルはWeb操作を正本とし、PDFを公開しません。詳細な仕様、全field、全action、
移行、開発者向け手順は既存ドキュメントへリンクし、チュートリアルへ重複掲載しません。

[publication-plan.json](publication-plan.json)を公開先、4.0一覧での項目数、AppBarの現在地、
activation gate、ロールバック方針の正本とします。4.0トップでは「紙芝居を遊ぶ」を
「紙芝居を見る人向けドキュメント」、「紙芝居を作る」を「台本DSLで台本を作る人向けドキュメント」に
直接置きます。各チュートリアルの入口リンクも4.0トップへ戻します。

ブロック版は`/4.0/tutorials/create-blocks/`へ置き、「台本ブロックで台本を作る人向けドキュメント」へ掲載します。
同じカテゴリーに[ブロック版ガイド](../block-author-guides/dsl-4.0-block-author-guide.md)を置きます。
相互変換、変数、Schema、履歴、3系からの移行は「台本作りについて詳しく知りたい人向けドキュメント」へまとめます。

ブロック版は公開rc.25で利用できます。既存のブラウザー作者flowの撮影当時のgateを
ブロック編集の公開済み判定へ流用しません。図版は実装の接続と入力値を描き直した説明図です。

## 台本作成ガイドとの役割分担

「紙芝居を作る」は、最初の作品を完成させるための最短経路です。対象読者は初めてDSL 4.0を書く方で、
固定starterを変更し、TurboWarp Editor内のpreview、自動検証、診断修正、menu build、SB3再生までを一回通します。全構文、全action、
include文、複雑な分岐、custom action、runtimeやextensionの開発は扱いません。

「紙芝居DSL 4.0 台本作成ガイド」は、入門後に必要な機能を調べる作者、教材作成者、授業設計者のための
検索可能な詳細資料です。最初から全ページを通読する資料ではなく、チュートリアルの各stepから必要な節へ
移ります。Schemaリファレンスはさらに狭く、field、型、必須性、制約を検索する資料です。

チュートリアルの後は、作者ガイドの「記法」「最小台本」「作品フォルダーへファイルを配置する」
「Web Preview」「診断と安全停止」へ進みます。画面名、URL、操作画像は公開RCと固定fixtureへ
対応付けています。

## サンプルとYAMLの正本

「遊ぶ」と「作る」が使う最小作品、starter、画像、音声、pose bundle、Web版、SB3は、
`turbowarp-kamishibai-samples`を正本とします。この文書リポジトリやチュートリアル本文へ、完全なsample YAMLや
配布物を複製して保守しません。

チュートリアル内のYAMLは、概念を説明する短い抜粋です。sample repositoryについて、
固定commit、starter version、artifact URL、integrity、licenseを台帳へ記録し、本文の手順と配布物が同じ入力から生成されたことを
確認しています。作者ガイド内の最小例・総合例は構文と契約を説明する例であり、チュートリアルsampleの
代替正本ではありません。

## 読者と完了条件

| チュートリアル | 対象                     | 想定時間 | 完了条件                                                                            |
| -------------- | ------------------------ | -------: | ----------------------------------------------------------------------------------- |
| 紙芝居を遊ぶ   | 初めて紙芝居を再生する人 | 10〜15分 | サンプルを開き、ポーズ認識を経て最後まで再生できる                                  |
| 紙芝居を作る   | 初めてDSL 4.0を書く人    | 60〜90分 | starterをbrowser previewで変更し、診断修正とmenu buildを経て自己完結SB3を再生できる |

台本DSL版の作者はScratchブロックを追加しません。DSL版の「作る」は外部YAML正本とアセットを編集し、
標準templateのblock graphを変更しないゼロブロック作者フローを前提にします。

## チュートリアル用作品

「遊ぶ」と「作る」は、同じ最小作品を利用します。正式なsource、asset、生成設定、Web版、SB3、
ライセンスは`turbowarp-kamishibai-samples`で管理し、この文書リポジトリへ複製しません。

最小作品は次の条件を満たすものとします。

- 3シーン程度で最後まで短時間に再生できる
- 背景1〜2件、アクター1件、セリフ、待機、画面遷移を含む
- 同梱済みポーズモデルによるポーズ認識を1件含む
- project source、配布SB3、Web版を同じ固定入力から生成できる
- assetと生成物のversion、integrity、licenseを固定できる
- 初めての人が変更する範囲と、配布側が用意する範囲を分離できる
- root直下の`story.kamishibai.yaml`、画像、音声と、model単位のpose bundle directoryで構成できる
- `addition-kit`に追加背景、追加見本、背景・見本・ポーズ場面のYAML抜粋を同梱できる

浦島太郎全編を直接教材にせず、教室で「地震だ！」と気づき、自分の身を守るために丈夫な机の下へ入り、
両手で頭を守る独立した小さな作品を使用します。Teachable Machineでのモデル作成は初版の対象外とし、
浦島太郎最終場面の「ひざまずいて両手で頭を抱える」姿勢と身体形状が一致する検証済みモデルをstarterへ同梱します。

## スクリーンショット

[screenshots.json](screenshots.json)を画像台帳の正本とします。各画像にはID、対応step、用途、
想定caption、alt text案、file名、依存するrelease gateを記録します。

YAMLはコピー可能なcode blockを正本とします。画像はTurboWarp Editorでの画面操作、正常状態、
失敗状態を示す補助として使用します。CLI commandは高度な利用者向けの任意手順だけに置きます。

### rc.41の現行基準

現在の操作説明と公開サンプルは`4.0.0-rc.41`を対象にします。appの公開commitは`7bd9a2b34bf7b0cf2f8992cdfe27d0ae55f9224b`です。samplesのベース・再生用/編集用ビルダーと配布物を同じ版へ揃え、公開20ファイルをsize/SHA-256で照合しています。

「更新検知」・カメラ・Dock設定は公開rc.41 HTMLの実画面を追加し、撮影条件と画像hashを`sources/dsl4/runtime-ui-rc41.json`へ記録しています。背景は操作確認用のYAML台本で、チュートリアルの作品場面ではありません。旧画像は以下の撮影時の版の証跡として残し、rc.41の実画面へ読み替えません。

### 過去の確認基準（rc.25）

2026年10月19日時点の本文・公開サンプルは`4.0.0-rc.25`を対象にしました。実装commitは`a68f8dc4d38b4609c8387192d3be0376963735e3`、
公開SB3のSHA-256は`d6b8d73e27685ac8359a17ade7c5c9cb4596ab22413eae9bf33d060351d0ab29`です。
npm packageは`@kubohiroya/turbowarp-kamishibai-app`です。GitHub ReleaseのSB3とnpm配布物は取得して照合しました。
サンプル3作品の公開manifestと、samples commit `c01ad9eb664b198ba7d421fa0e784cd99fdf56bf`の
Pages deploy run `39207776239`を確認しています。Web作品と実Editorでのブロック台本の直接再生、公開16ファイルのsize/hashを照合済みです。実カメラ・実ポーズ測定は未実施です。

現行の正本は[公開状態の表記基準](../../DSL4-PUBLICATION-STATUS.md)と
[公開状態データ](../../sources/dsl4/user-guide-4.0-public-surfaces.json)です。
以下のスクリーンショット・旧gateの成功結果は撮影当時の版に帰属し、rc.25の検証へ読み替えません。

### 過去の実装追跡（rc.8）

2026-08-20時点では、全23 core action block、browser preview、Bubble 0.10.0、TurboWarp Teachable Machine 1.12.0、
ポーズoverlayを含む公開rc.8の固定実装を
[`29c0dea`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/29c0deadcb98badf94a0244c479ca896dc71f842)
で確認しています。rc.8を対象とする`browser-authoring` gateを`published`、`ready: true`として追跡します。

既存スクリーンショット台帳にはrc.5で撮影した固定画像を歴史的証跡として残します。画像内の旧version表示は
rc.8のartifact integrityを示すものではなく、現在のrelease情報は本文とmachine-readable manifestを正本にします。

浦島太郎、my-urashima、チュートリアル用最小作品の4.0 Web版、SB3、integrityはsamples PR #126、
publication commit `236fe4ac09e17aaaaa0fb0fd1f8ebdc173073c7f`、Pages deploy run `32368656029`で
公開済みです。
公開surfaceは[操作説明書のmachine-readable manifest](../../sources/dsl4/user-guide-4.0-public-surfaces.json)へ
固定しています。チュートリアル用starterとaddition kitも同じrelease入力から生成され、実ファイルの
sizeとSHA-256を公開manifestと照合しました。`tutorial-sample` gateは`published`、`ready: true`です。

DSL `4.0.0-rc.8`は公開プレリリースとして固定済みです。annotated `v4.0.0-rc.8` tag、
[npm `next`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.8)、
[GitHub prerelease](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.8)、
[Pages](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/)を
[turbowarp-kamishibai-app #647](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/647)で照合し、
SB3 SHA-256を`91d7f594aaf922450fba359a90c7c26e7c1dfda51cf002534cb4605dbb0d7041`へ固定しました。
`dsl4-release` gateは`published`、`ready: true`です。安定版`4.0.0`ではなく、公開済みRCを
チュートリアルの対象releaseとして扱います。

reload overlayは上流の
[撮影引き継ぎ契約](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/087dfa526e967bb2cc38af3f5b5a795355de7739/docs/design/dsl-4-preview-reload-overlay.md#tutorial-screenshot-handoff)と
[fixture](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/087dfa526e967bb2cc38af3f5b5a795355de7739/test/fixtures/dsl4/preview-reload-overlay-screenshot.json)
を正本にします。作者用の開始、directory open、診断、build menuは、本体の
`test/fixtures/dsl4/browser-authoring-menu.html`から実際のmenu／error indicator moduleを読み込んで撮影します。
Google Chrome 151.0.7922.137（Chromium）を1280 × 720 CSS px、DPR 1で使用し、
fixtureの表示言語を`ja-JP`、motionを固定して、
実人物や実カメラ映像、local source pathを
画像へ含めません。

### 開発者向けの固定実装追試

固定実装を追試する開発者・文書メンテナーは、
[DSL 4.0 rc.8実装のローカル追試](../developer-guides/dsl4-implementation-walkthrough.md)を使用します。
runtime `29c0dea`、公開rc.8 SB3、任意の作業用projectからlocal previewを起動し、valid source、
runtimeタイトル、invalid candidate、復旧、内部実装図を一続きで確認できます。samples repositoryは使用しません。

この追試で参照する3画像は#157のrc.5実装スナップショットです。チュートリアル画像とはIDと用途を分けます。
追試経路は開発者向け資料として公開し、AppBarへ独立項目は追加しません。

想定する保存先は次のとおりです。

```text
docs/images/tutorials/dsl4/play/
docs/images/tutorials/dsl4/create/
```

## 公開導線とAppBar

[navigation-contract.json](navigation-contract.json)を5項目AppBarの正本とします。契約とレンダラーは
`@kubohiroya/turbowarp-kamishibai-docs`のバージョン付きビルド依存として提供し、他の2リポジトリは
同じ契約スナップショットをビルド時に検証します。

```text
トップ → ドキュメント → ワークショップ → 作品 → ダウンロード
```

`/workshops/`と配下では「ワークショップ」、それ以外のドキュメントサイトでは「ドキュメント」だけを
現在地にします。各サイトは実行時に外部HTMLやJavaScriptを取得せず、静的生成物へナビゲーションを
埋め込みます。チュートリアル公開時もこの5項目と3リポジトリの契約は変更しません。

レンダラー`scripts/site-navigation.mjs`は生成物です。正本は
`turbowarp-kamishibai-samples`の`scripts/site-navigation.ts`で、同リポジトリの
`pnpm build:site-navigation`が`.mjs`を書き出します。生成にはNode自身の型剥がしを使い、
仕上げに本リポジトリの`.prettierrc.json`と同じ設定でPrettierを通すため、生成物は3リポジトリの
`scripts/site-navigation.mjs`とバイト単位で一致します。**このファイルを直接編集しないでください。**
描画を変えるときは`.ts`を編集して再生成し、生成された`.mjs`を3リポジトリへ配布します。
手編集は`turbowarp-kamishibai-samples`の`pnpm check:site-navigation`が検出します。Prettierの設定を
変更する場合は、生成器側の設定も合わせる必要があります。

## Capture gate完了記録

[screenshots.json](screenshots.json)の全gateを完了し、次の情報を固定しています。

- DSL 4.0の公開versionと対象commit
- Standard Web playerとapp shellの配置、状態、文言
- チュートリアル用サンプルURLとstarter artifact
- 非埋め込みStandard SB3のdirectory選択、YAML／additive asset live reload、診断UI
- 2段階reload dialogの再開位置、適用範囲、8方向anchorと衝突回避
- pose feedback presenter
- camera preview、mirroring、camera選択UIの採用範囲
- 作者用メニューの「配布用SB3を作る」、保存状態、CLI fallback
- viewport、device pixel ratio、browser version
- 実人物と実カメラを使わない合成fixture、背景、個人情報除去方針

## 公開手順

1. `play/`と`create/`のHTMLを生成し、最初から最後まで追試する
2. 4.0トップの該当カテゴリへ2項目が直接掲載されることを確認する
3. AppBarの項目数を変えず、既存の「ドキュメント」が現在地になることを確認する
4. Pages公開後に2ページ、画像、公開サンプルへのリンクと旧入口からの転送を確認する

## 関連資料

- [紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)
- [DSL 4.0 Schemaリファレンス準備 Issue #29](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/29)
- [source channelとゼロブロック作者フロー #258](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/258)
- [capability・Bundle・release境界 #266](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/266)
- [4.0.0-rc.23の公開 #895](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/895)
- [4.0.0-rc.23のサンプル同期 #172](https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/172)
- [チュートリアル用最小作品・starter・addition kit #94](https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/94)
- [poseModel asset lifecycle #327](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/327)
- [Web PreviewとYAML live reload #390](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/390)
- [local assetの追加・内容更新live reload #391](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/391)
- [共通reload overlay #394](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/394)
- [pose認識進捗表示 #383](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/383)
- [camera preview操作UI #388](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/388)

- [4.0.0-rc.25の公開](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/900)
- [4.0.0-rc.25のサンプル同期](https://github.com/kubohiroya/turbowarp-kamishibai-samples/issues/175)
