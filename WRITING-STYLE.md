# TurboWarp紙芝居ドキュメント表記ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

このガイドは、一般向け・台本作者向け・開発者向け文書で、同じ概念を同じ言葉で説明するための基準です。
コード、コマンド、設定キー、API名、ファイル名は実物の表記を優先し、本文の説明は日本語を基本にします。

## 基本方針

- 最初に現れる固有概念は、日本語による短い説明を添える
- 一般的な説明では、日本語の語を使う。例: プロジェクト、ソース、素材、プレビュー、ビルド
- コード上の名前は翻訳しない。例: `project.source.json`、`validate-dsl4`、`StoryDocument`
- YAMLのキーや値はコード表記にする。例: `assets`、`scenes`、`recognitionModel`
- 英語の略語は、必要なら最初に意味を補う。例: CLI（コマンドラインインターフェース）
- 同じ段落で日本語表記と英語表記を無目的に切り替えない

## 推奨する表記

| 概念               | 本文で使う表記           | コード・固有名として残す例              |
| ------------------ | ------------------------ | --------------------------------------- |
| 作品を構成する一式 | プロジェクト             | `project.source.json`、`--project-root` |
| 台本などの入力     | ソース                   | `sourceFilename`                        |
| 複数台本の読み込み | include文                | `include`                               |
| 画像・音・モデル   | 素材、アセット           | `assets`、`recognitionModel`            |
| 制作中の表示確認   | プレビュー               | Web Preview、`preview-dsl4`             |
| 配布物の生成       | ビルド                   | `build-dsl4`                            |
| 実行部分           | ランタイム               | `RuntimeController`                     |
| 撮影機器・映像     | カメラ、カメラプレビュー | `cameraPreview`                         |
| 実行される処理     | プログラム               | 関数名・クラス名                        |
| 作品の区切りと命令 | シーン、アクション       | `scenes`、Action Schema                 |
| 検証に使う定義     | スキーマ                 | JSON Schema、`schema/dsl-4.schema.json` |
| 公開する版         | リリース                 | リリースタグ、バージョン番号            |

## 名称と識別子

製品名、repository slug、npm package、Extension ID、opcode prefixは別の概念として扱います。
通常本文では現行名称だけを使い、旧称や旧slugは履歴、migration input、source provenanceで必要な場合だけ
code表記または明示的な履歴説明として残します。

| 区分               | 現行表記                       | 使う場所                                |
| ------------------ | ------------------------------ | --------------------------------------- |
| 英語製品名         | TurboWarp-Kamishibai           | 英語本文、公開サイト、repository説明    |
| 日本語一般名称     | TurboWarp紙芝居                | 日本語本文、文書タイトル、公開サイト    |
| 認識拡張の名称     | TurboWarp Teachable Machine    | ポーズ認識拡張を人間向けに説明する本文  |
| Extension ID       | `kubohiroyatm`                 | SB3、migration guide、互換性matrix      |
| Opcode prefix      | `kubohiroyatm_...`             | SB3内部、migration guide、tool出力      |
| アプリrepository   | `turbowarp-kamishibai-app`     | GitHub URL、Pages URL、clone先directory |
| 文書repository     | `turbowarp-kamishibai-docs`    | このrepositoryと文書Pages               |
| サンプルrepository | `turbowarp-kamishibai-samples` | サンプル台本、Web版、公開manifest       |

- 一般本文で旧製品名を現在の入口として使わない
- current URLとhistorical URLを区別し、historical linkには履歴・移設元・固定snapshotの説明を添える
- code identifier、CLI binary、npm package名は翻訳しない
- generated schema reference、release history、固定snapshotはhandwritten置換せず、必要ならannotationや移行ガイドで説明する
- versioned snapshotの事実とcurrent guideの推奨を混同しない

## DSL 4.0の固有概念

- **include文**: 一般向け・作者向け文書で、別の台本ファイルを読み込む構文とその処理を説明する表記
- **Source Graph**: 実装資料で、`createDsl4SourceGraph`など内部の型・関数・データ構造を説明する必要がある場合だけ使う固有名
- **StoryDocument**: 構文・スキーマ・参照関係の検証を終え、実行に渡せる正規化済みの台本
- **世代（generation）**: 同じ時点で安定して取得したソースと素材の組。以後は「世代」と書く
- **候補（candidate）**: 検証中で、まだ正常な実行状態を置き換えていない入力の組。以後は「候補」と書く
- **プラットフォームアダプター**: カメラ、音、TurboWarpなど、実行環境固有の機能をランタイムへ接続する境界

## 図表

- 三つ以上の段階、役割、分岐の関係を文章だけでは追いにくい場合に図表を使う
- 文書内の短い直線的な流れは、HTMLの`concept-flow`を使う
- 分岐、循環、複数経路を示す必要がある場合はMermaidを検討する
- 実装の状態遷移やsequenceを静的図にする場合は、`title`、`desc`、本文の同値説明を持つSVGを使う
- 図だけに情報を閉じず、直後の本文でも要点を説明する
- 狭い画面と印刷でも、矢印と各段階の対応が崩れないことを確認する

## 確認方法

変更後は`pnpm check`を実行します。用語の回帰テストは、説明文へ英単語が再混入しやすい代表箇所だけを
対象にします。コード例や正規の固有名まで機械的に置換しないでください。
