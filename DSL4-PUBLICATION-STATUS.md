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

## 2026年10月19日の確認結果

- 公開runtimeの実装基準は公開プレリリース`v4.0.0-rc.23`のcommit
  [`2f2889fe9df88548a92b0925ca3008c5c62682e5`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/2f2889fe9df88548a92b0925ca3008c5c62682e5)。公開Schemaとその出典は`sources/dsl4/dsl-4.0-rc.23.schema.json`と`sources/dsl4/release-source-lock-4.0-rc.23.json`に固定する。
- GitHub Releaseとnpm `@kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.23`は公開済み。npmの`next`と`latest`はいずれもrc.23を指す。
- 正式版`v4.0.0`は未公開。推奨安定版は`v3.2.3`。
- Standard SB3は[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.23)と[Pages](https://kubohiroya.github.io/turbowarp-kamishibai-app/downloads/kamishibai-4.0.0-rc.23.sb3)から取得できる。6,922,003 bytes、SHA-256は`ecbb74f950f74236a0bbe38c6b821745d8d100fc02075c634881ab1d837c7998`。
- 浦島太郎、私の浦島太郎、チュートリアルのサンプル作品、スターター、Web版はrc.23基準。samples PR #173、commit `d8deecfbd46b69a6787ec9e5deea936b8b54f0f0`、Pages run `39188793571`で公開し、配布12ファイルのsizeとSHA-256を照合した。starterとaddition kitは再生成して同じバイト列であることを確認した。
- 上流samplesの全57テスト、Web作品、実TurboWarp Editorでの表示・編集・保存・ブロック台本の直接再生を確認した。カメラの自動検証は模擬入力であり、rc.23の実カメラ・実ポーズ測定は未実施。

公開URL、size／checksum、照合方法、未確認範囲は
[`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)へ記録する。
rc.10の旧manifestと実機確認は`previousVerification`、rc.22の公開確認は履歴として保存し、rc.23の実機成功へ読み替えない。

## 公開runtimeとSchemaの固定

現行Schemaとruntimeは同じ公開commit `2f2889fe9df88548a92b0925ca3008c5c62682e5`を基準にする。
以前の実装基準`450a5bb`とSchemaのバイト列は同一だが、rc.23ではportraitの`placement`、`offset`、
`cornerRadius`も公開配布物で利用できる。旧rc.22のSchemaとsource lockは当時の記録として保持する。
構造に項目があることだけで実行対応を判定せず、固定runtimeとそのテストも照合する。

公開rc.23の変換CLIは`TMPoseURL`と互換表記`TMURL`を受理する。
旧rc.10〜rc.22で`TMPoseURL`が`K4-CONVERT-COMMAND-UNSUPPORTED`になる場合だけ、
変換用コピーを`TMURL`へ直す。元の3.2台本は変更しない。

## 現行文書へ反映する契約

台本は`kamishibai: '4.0'`のまま、認識設定は`recognition`、モデルassetのkindとシーンのモデル参照は
`recognitionModel`を使う。`recognitionMode: image`と`imageInputToChangeScene`も固定Schemaに含まれる。
表示・BGMのcrossfade、BGMの音量と停止、台本変数を書き換えるcore action、`Actor.setText`のルビを説明する。
`Actor.say`／`Actor.think`のtextは文字列のまま。吹き出し終了条件は`bubbleClosePolicies`と`closePolicy`を使う。

rc.23のブロック台本は公開CLIで生成・書き戻しできる。Stage上の名前が空の`kamishibai [4.0] []`を
ルートとし、名前付き台本は`includeBlocks`から参照する。ハット自体はScratchのイベントとして発火せず、
ランタイムが起動時と開始し直すときに接続されたブロックを読み取る。緑の旗で起動し、タイトルを閉じると
その台本の物語を開始する。編集しただけで実行中の物語へ自動反映するわけではない。
file素材を使う作品は対応する素材バンドルを同梱する。新しいfile素材の追加・変更には再ビルドが必要。

Standard bundleはAsset Cache、Camera Source、Teachable Machine 3.5.1等を同梱する。
カメラはCamera Sourceが所有し、認識側はleaseを使う。プレビューと推論入力の経路を区別し、
タイトルでのカメラ許可は対応ブラウザー・機能フラグ・ポーズ作品の条件が揃った場合だけ表示する。

ローカルプレビューはリモートassetを取得しない。rc.23の失敗ダイアログ、ブラウザーでの
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
