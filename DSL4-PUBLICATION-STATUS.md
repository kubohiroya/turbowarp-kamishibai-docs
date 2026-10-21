# DSL 4.0 文書・公開状態の表記基準

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

実装、配布先のchannel、推奨安定版、サンプルの生成基準、確認済みの証跡を分けて説明します。

| 状態             | 意味                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| 実装基準         | 固定commitとSchemaで照合した仕様                                        |
| 公開プレリリース | prereleaseとして公開された候補版。npmのdist-tagだけで安定版と判定しない |
| 安定版           | リリースで安定運用向けに推奨される版。npmのlatestとは別に確認する       |
| 公開サンプル基準 | サンプル作品、スターター、Web版を生成したruntimeの版                    |
| 文書状態         | どの実装・成果物・画面を説明するかと、未確認の範囲                      |

## 現在の公開版

現在の公開appとSchemaの出典は`sources/dsl4/app-release.json`から取得する。
Pages公開前にRCを含む最新DSL 4.0 Releaseを解決し、同じtagのcommit・release metadata・
SB3のサイズとSHA-256を照合する。npmが404の場合は未公開として表示し、それ以外の取得失敗では公開を止める。
公開サイトの`app-release.json`と`build-info.json`に実際の依存情報を保存する。
Schema変更が日本語Annotationと適合しない場合も公開を止め、説明の更新を必要とする。

手書き本文・画面・サンプルの対象版は各資料で明記した版を維持する。
appの新しいリリースだけを理由に、資料の対象版や過去の検証結果を一括で書き換えない。
4.0文書の先頭に現在の公開版と本文の対象版を区別する案内を表示する。

## 2026年10月21日の確認結果（rc.41）

- 現行の公開プレリリースは`v4.0.0-rc.41`、公開runtimeのcommitは`7bd9a2b34bf7b0cf2f8992cdfe27d0ae55f9224b`。npmの`next`もrc.41です。正式版`v4.0.0`は未公開、推奨安定版は3.2.3です。
- samplesのベース・再生用/編集用ビルダー・各配布物をrc.41へ統一しました。公開20ファイルのsize/SHA-256を生成物と照合しました。実行commit・Pages run・成果物の値は`user-guide-4.0-public-surfaces.json`へ記録します。
- 台本ファイルと関連素材を対象にした「更新検知」、共通カメラ入口、HTMLのDock配置・自動非表示を現行UIとして説明します。公開HTMLの実画面と撮影条件は`runtime-ui-rc41.json`に記録しています。
- サンプルのWeb再生、10場面174命令のEditor表示、フォーム編集・保存・YAMLの意味照合、ブロック台本の直接再生を自動検証しました。カメラは模擬入力です。rc.41の実カメラ・実ポーズ測定は未実施です。

## 2026年10月19日の確認結果（rc.25時点の履歴）

- 公開runtimeの実装基準は公開プレリリース`v4.0.0-rc.25`のcommit
  [`a68f8dc4d38b4609c8387192d3be0376963735e3`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/a68f8dc4d38b4609c8387192d3be0376963735e3)。公開Schemaとその出典は`sources/dsl4/dsl-4.0-rc.25.schema.json`と`sources/dsl4/release-source-lock-4.0-rc.25.json`に固定する。
- GitHub Releaseとnpm `@kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.25`は公開済み。npmの`next`と`latest`はいずれもrc.25を指す。
- 正式版`v4.0.0`は未公開。推奨安定版は`v3.2.3`。
- Standard SB3は[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.25)と[Pages](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/kamishibai-4.0.0-rc.25.sb3)から取得できる。6,923,215 bytes、SHA-256は`d6b8d73e27685ac8359a17ade7c5c9cb4596ab22413eae9bf33d060351d0ab29`。
- 浦島太郎、私の浦島太郎、チュートリアルのサンプル作品、スターター、Web版はrc.25基準。samples PR #179、commit `c01ad9eb664b198ba7d421fa0e784cd99fdf56bf`、Pages run `39207776239`で公開し、配布16ファイルのsizeとSHA-256を照合した。starterとaddition kitも同じrc.25入力から再生成した。
- 上流samplesの全63テスト、Web作品、実TurboWarp Editorでの表示・編集・保存・ブロック台本の直接再生を確認した。カメラの自動検証は模擬入力であり、rc.25の実カメラ・実ポーズ測定は未実施。

公開URL、size／checksum、照合方法、未確認範囲は
[`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)へ記録する。
rc.10の旧manifestと実機確認は`previousVerification`、rc.22の公開確認は履歴として保存し、rc.25の実機成功へ読み替えない。

## 公開runtimeとSchemaの固定

現在のSchemaは`app-release.json`に記録する公開commitを基準にする。
rc.25時点のSchemaとruntimeは同じ公開commit `a68f8dc4d38b4609c8387192d3be0376963735e3`を基準とした。
以前の実装基準`450a5bb`とSchemaのバイト列は同一だが、rc.25ではportraitの`placement`、`offset`、
`cornerRadius`も公開配布物で利用できる。旧rc.23以前のSchemaとsource lockは当時の記録として保持する。
構造に項目があることだけで実行対応を判定せず、固定runtimeとそのテストも照合する。

公開rc.25の変換CLIは`TMPoseURL`と互換表記`TMURL`を受理する。
旧rc.10〜rc.22で`TMPoseURL`が`K4-CONVERT-COMMAND-UNSUPPORTED`になる場合だけ、
変換用コピーを`TMURL`へ直す。元の3.2台本は変更しない。

## 現行文書へ反映する契約

台本は`kamishibai: '4.0'`のまま、認識設定は`recognition`、モデルassetのkindとシーンのモデル参照は
`recognitionModel`を使う。`recognitionMode: image`と`imageInputToChangeScene`も固定Schemaに含まれる。
表示・BGMのcrossfade、BGMの音量と停止、台本変数を書き換えるcore action、`Actor.setText`のルビを説明する。
`Actor.say`／`Actor.think`のtextは文字列のまま。吹き出し終了条件は`bubbleClosePolicies`と`closePolicy`を使う。

rc.25のブロック台本は公開CLIで生成・書き戻しできる。Stage上の名前が空の`kamishibai [4.0] []`を
ルートとし、名前付き台本は`includeBlocks`から参照する。ハット自体はScratchのイベントとして発火せず、
ランタイムが起動時と開始し直すときに接続されたブロックを読み取る。緑の旗で起動し、タイトルを閉じると
その台本の物語を開始する。編集しただけで実行中の物語へ自動反映するわけではない。
file素材を使う作品は対応する素材バンドルを同梱する。新しいfile素材の追加・変更には再ビルドが必要。

Standard bundleはAsset Cache、Camera Source、Teachable Machine 3.5.1等を同梱する。
カメラはCamera Sourceが所有し、認識側はleaseを使う。プレビューと推論入力の経路を区別し、
タイトルでのカメラ許可は対応ブラウザー・機能フラグ・ポーズ作品の条件が揃った場合だけ表示する。

ローカルプレビューはリモートassetを取得しない。rc.25の失敗ダイアログ、ブラウザーでの
OFFLINE／CORS／CONNECT、CLIでのTLS診断を説明し、ブラウザーのCONNECTを証明書障害の確定診断としない。

## 履歴・画像・検証の保存

旧RCのtag、checksum、測定結果、撮影版は変更しない。旧画面には版を明示し、現在の画面と同一と説明しない。
生成Schemaリファレンスは固定snapshotと日本語annotationから再生成する。
各読者向けの本文へ現行仕様を書き、過去の履歴だけを現行説明の代わりにしない。

## 更新手順

1. 固定tagをcommitへ解決し、コード・テスト・リリースノート・Schemaを照合する。
2. GitHub Release、npm registry、公開サンプルmanifestをそれぞれ確認する。
3. 実装基準、公開プレリリース、推奨安定版、npm channel、公開サンプル基準を分けて記録する。
4. 本文・snapshot・annotation・生成物・関連テストを同じ変更で揃える。
5. 影響する検証と通常HTML／Viewer等の表示を確認し、実行SHA・件数・旧結果の適用範囲・未確認項目をIssueへ記録する。
6. 問題時は文書変更をrevertし、直前の確認済み基準へ戻す。公開済みRCのバイト列は差し替えない。
