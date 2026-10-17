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

## 2026年10月17日の確認結果

- 実装基準は公開プレリリース`v4.0.0-rc.22`のcommit
  [`f8048b8c4ebd0ecd6213bb87582862034b2b88ce`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/f8048b8c4ebd0ecd6213bb87582862034b2b88ce)。Schemaの固定値は`sources/dsl4/source-lock.json`に記録する。
- GitHub Releaseとnpm `@kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.22`を照合した。npmの`next`と`latest`はいずれもrc.22を指す。
- 正式版`v4.0.0`は未公開。rc.22のリリースノートが示す推奨安定版は`v3.2.3`。
- Standard SB3の取得先は[GitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.22)。6,911,464 bytes、SHA-256は`3731ed3a58c000d40f65057fbe5e27b340bae915df11e863fd55c98ba061b5c9`。
- Pagesの`downloads/kamishibai-4.0.0-rc.22.sb3`は確認時に404だった。未確認のPages配布を成功と記録せず、本文では取得確認済みのGitHub Releaseへ案内する。
- 浦島太郎、私の浦島太郎、チュートリアルの公開manifestはいずれもrc.22の同じruntime commitを参照する。サンプル作品、スターター、Web版はrc.22基準の公開manifestと照合したが、今回それぞれのバイト列の再hashや再生・実カメラ検証は行っていない。

公開URL、manifest由来のsize／checksum、照合方法、未確認範囲は
[`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)へ記録する。
rc.10の旧manifestと実機確認は`previousVerification`に保存し、rc.22の実機成功として利用しない。

## 現行文書へ反映する契約

台本は`kamishibai: '4.0'`のまま、認識設定は`recognition`、モデルassetのkindとシーンのモデル参照は
`recognitionModel`を使う。`recognitionMode: image`と`imageInputToChangeScene`も固定Schemaに含まれる。
表示・BGMのcrossfade、BGMの音量と停止、台本変数を書き換えるcore action、`Actor.setText`のルビを説明する。
`Actor.say`／`Actor.think`のtextは文字列のまま。吹き出し終了条件は`bubbleClosePolicies`と`closePolicy`を使う。

Standard bundleはAsset Cache、Camera Source、Teachable Machine 3.5.1等を同梱する。
カメラはCamera Sourceが所有し、認識側はleaseを使う。プレビューと推論入力の経路を区別し、
タイトルでのカメラ許可は対応ブラウザー・機能フラグ・ポーズ作品の条件が揃った場合だけ表示する。

ローカルプレビューはリモートassetを取得しない。rc.22の失敗ダイアログ、ブラウザーでの
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
