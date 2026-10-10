# 紙芝居DSL 3.2から4.0への変換ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: DSL 3.1／3.2の既存台本をDSL 4.0へ移行する方\
対象コマンド: `tm-kamishibai convert-dsl4`\
文書状態: 固定実装基準を説明する変換ガイド（正式リリースの操作資料ではない）\
調査基準: TurboWarp-Kamishibai `29c0dea`（4.0.0-rc.8）、2026年8月20日

このガイドは、すでに3.1／3.2の台本を持っている方のための移行手順です。初めてTurboWarp紙芝居を使う方や、
4.0で最初の作品を作る方は、先に[大人向け概要](../user-guides/executive-summary-adult-4.0.md)と
[「紙芝居を作る」チュートリアル](../tutorials/create.md)をお読みください。

> **配布状態との区別:** 2026年8月20日時点で`v4.0.0-rc.8`はprereleaseとして公開されていますが、
> 正式な`v4.0.0`ではありません。
> `convert-dsl4`を含むパッケージのリリースを使用し、利用中のパッケージで`pnpm exec tm-kamishibai --help`を
> 実行して、コマンド一覧に`convert-dsl4`があることを確認してください。

`convert-dsl4`は、行ごとに命令を書く3.2の台本を、4.0のYAML台本へ一度だけ変換するコマンドです。
3.1の台本も読み込めますが、変換結果には確認が必要な箇所を「警告」として表示します。

元の台本は変更しません。変換に成功した場合だけ新しいYAMLを保存し、エラー時は書きかけの出力を残しません。
まず元の作品とは別のファイル名を指定し、警告と実行結果を確認してください。

## このガイドの位置づけ

このガイドは、DSL 3.1／3.2の文法を説明し直す資料でも、4.0の全項目を説明する資料でもありません。
既存TXT台本を安全にYAMLへ変換し、4.0作者向けの作業へ引き渡すところまでを扱います。

<figure class="concept-flow"><figcaption>既存作品を4.0の制作手順へ引き渡す</figcaption><div class="concept-flow__track"><span>3.1／3.2のTXT<br>元ファイルを保持</span><b aria-hidden="true">→</b><span>convert-dsl4<br>別ファイルへ変換</span><b aria-hidden="true">→</b><span>4.0のYAML<br>警告を確認</span><b aria-hidden="true">→</b><span>台本作成ガイドで確認</span><b aria-hidden="true">→</b><span>検査・画面確認・SB3作成</span></div><p class="concept-flow__note"><strong>変換または検査に失敗した場合:</strong> 元ファイルを変更せず、表示された問題に対応する入力または生成YAMLを修正します。</p></figure>

変換前は本書の「自動変換を停止する入力」まで確認し、変換後は
[紙芝居DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md)の最小台本、作品フォルダーの配置、エラー表示の順に読みます。
項目の型や必須条件を調べるときだけ、検索用のSchemaリファレンスを使用します。

## 基本コマンド

必要なパッケージを導入した作品フォルダーで実行します。

```bash
pnpm exec tm-kamishibai convert-dsl4 \
  --input source.txt \
  --output story.k4.yml
```

`TMPoseURL`は既定でlazy remote poseModelへ変換されます。内容を固定した自己完結SB3を作る場合だけ、
`--pose-models`でローカルのモデルディレクトリへ置き換えます。

```bash
pnpm exec tm-kamishibai convert-dsl4 \
  --input source.txt \
  --output story.k4.yml \
  --pose-models pose-models.json
```

| option               | 必須 | 内容                                                                     |
| -------------------- | ---- | ------------------------------------------------------------------------ |
| `--input FILE`       | 必須 | UTF-8のDSL 3.1／3.2台本。BOM、CRLF、CRは読み込み時に正規化します。       |
| `--output FILE`      | 必須 | 生成するDSL 4.0 YAML。入力と同じpathは指定できません。                   |
| `--pose-models FILE` | 任意 | 内容固定時に`TMPoseURL`をローカルのポーズモデル素材へ置換するJSONファイルです。 |

相対パスは、コマンドを実行したディレクトリを基準に解決されます。新しいDSL 4.0のソースには短い`.k4.yml` suffixを
推奨しますが、互換の拡張子である`.k4.yaml`、`.kamishibai.yml`、`.kamishibai.yaml`も使用できます。

## 変換される内容

converterは、次の構造をDSL 4.0に対応する形へ変換します。

- backdrop、costume、sound、actor
- cover、runtime variable、Loading表示、ポーズ認識音
- SVG Text style、branch、scene
- DSL 4.0 coreに対応するglobal actionとactor action

次のように意味を決める必要がある変換は、元ファイルの行・列と、安定した診断コードを含む警告を
標準エラー出力へ表示します。

- DSL 3.1を3.2互換の文法として解釈した場合
- runtime variableのスカラー型を推論した場合
- costumeを論理的なactorへ付け替えた場合
- 旧DSLに秒数指定がないtransitionを0秒として明示した場合

対応表と各診断の分類は、実装リポジトリの
[DSL 3.1／3.2からDSL 4.0への移行仕様](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/283daadeffa5d11ab4510daa66f60168277dafea/docs/design/dsl-4-migration.md)を
参照してください。

## 自動変換を停止する入力

意味を保てない入力ではエラーを返し、YAMLを部分出力しません。主な例は次のとおりです。

- 旧Text Asset、`TMPoseURL`以外の検証情報を確定できないremote／cacheの素材
- 秒数なしの永続`say`／`think`、style付き`say`／`think`、`hide`など同じ意味を保証できないaction
- 4.0で必須のcharge soundがないpose recognition設定
- `TMPoseURL`がないpose scene、不正または空の`TMPoseURL`、空のpose名
- 要素数が異なるbranch／key／touch inputのparallel list、最後の無条件遷移がないbranch
- scene内の`setRuntimeVariable`、1以外の`startSceneIndex`
- 非zeroの`poseIdle`、独自action、不正なarity、曖昧なcolon区切り

旧Text Assetは、[DSL 4.0移行仕様の手動移行例](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/283daadeffa5d11ab4510daa66f60168277dafea/docs/design/dsl-4-migration.md#5-%E6%97%A7text-asset%E3%81%8B%E3%82%89svg-text%E3%81%B8%E3%81%AE%E6%89%8B%E5%8B%95%E7%A7%BB%E8%A1%8C)に
従ってSVG Text actorへ移します。独自のScratch blockやSB3のblock graphは入力台本から推測せず、
converterもblockを生成・変更しません。

## ポーズモデルの配布方法を選ぶ

変換で一つだけ判断が必要なのが、ポーズモデルをどう配るかです。公開URLのモデルをそのまま参照するか、
モデルを作品へ取り込んで内容を固定するかを選びます。

### 既定: 公開URLのモデルをそのまま参照する

`--pose-models`を指定しない場合、converterは`TMPoseURL`を次の通常のremote poseModelへ変換します。
DSL 4.0のposeModelは、`delivery: remote`と`source.url`だけの通常のTurboWarp TM directory参照に対応します。
converterはこの変換でネットワーク取得やキャッシュ参照を行わず、integrity等も要求しません。実行時には、URLで公開されている
その時点のモデルを読み込みます。

```yaml
assets:
  PoseModel1:
    kind: poseModel
    delivery: remote
    source:
      url: https://example.com/models/rescue/
    loading: lazy
```

手軽な反面、公開元のモデルが差し替えられると作品の動作も変わります。教材として長く使う作品では、
次の方法で内容を固定することを検討してください。

### 内容を固定する

内容固定、オフライン実行、または自己完結SB3が必要な場合は、model directoryをproject内へ取得してから
`--pose-models`を指定します。JSONのkeyは台本に書かれた`TMPoseURL`との完全一致です。

```json
{
  "https://example.com/models/rescue/": {
    "id": "RescuePose",
    "file": "rescue-pose",
    "loading": "lazy"
  }
}
```

- `id`はDSL 4.0のasset IDです。Unicode NFCの有効な識別子を指定します。
- `file`はプロジェクトルート基準の安全なPOSIX相対パスです。絶対パス、URI、バックスラッシュ、`.`／`..` segmentは
  使用できません。
- `loading`は`eager`または`lazy`です。省略できます。
- converterはURLを取得せず、指定したローカルパスだけを生成YAMLへ記録します。ビルダーがモデルのバイト列を
  SB3へ埋め込みます。

remoteのまま内容を固定する方法もあります。
[Schemaリファレンスのremote asset source](dsl-4.0-schema-reference.md#remote-asset-source)に
従い、単一archive URLと`integrity`、`contentType`、`size`をすべて指定します。ただし、
モデルディレクトリをローカル素材として取得して埋め込む方法を推奨します。

元の3.2台本は保存し、変更後のYAMLを必ず`validate-dsl4`とpreviewで確認してください。

### ポーズ関連の変換で起きること

sceneで`Actor:pose`を使っているのに`TMPoseURL`がない場合はerrorです。
3.1／3.2の`Actor:pose`は候補から1件を選ぶactionではありません。converterはpose名の順にすべて成立させる
`Actor.pose.steps`へ変換します。pose数より少ないskin／soundは省略し、余分な要素はwarning付きで除外します。

Async Inputで候補から1件を選ぶ処理は、3.1／3.2テキストDSLのactionではなくSB3のblock graph側の
機能です。converterはこの処理を推測せず、`poseInputToChangeScene`を生成しません。

headerの`poseRecog`は`sequence.confidenceThreshold`へ変換します。旧runtimeは0.1秒ごとに100を目標として
`confidence × poseCharge`を加えるため、`poseCharge`は
`sequence.fullConfidenceHoldSeconds = 10 / poseCharge`へ変換します。`poseIdle=0`は変換できますが、
非zero値は旧runtimeだけがconfidenceを乗算するためerrorです。

## エラー表示と終了状態

正常時は生成先を標準出力へ表示します。警告とエラーは標準エラー出力へ
`source:line:column: severity [code] message`形式で表示します。

```text
Converted /project/story.k4.yml
```

```text
/project/source.txt:2:1: warning [K4-CONVERT-VARIABLE-TYPE] ...
```

| status | 意味                                                    |
| ------ | ------------------------------------------------------- |
| `0`    | 変換成功。警告がある場合も生成YAMLを出力します。     |
| `1`    | 変換エラー。新規出力を作らず、既存出力を変更しません。   |
| `2`    | オプション不足や未知のオプションなど、コマンドの使い方が正しくありません。 |

## 変換後に確認する

生成YAMLを本番と同じフロントエンドで検証します。`--max-source-bytes`には作品で許容する有限上限を
指定してください。現行実装で指定できる最大値は262144 bytesです。

```bash
pnpm exec tm-kamishibai validate-dsl4 \
  --input story.k4.yml \
  --max-source-bytes 262144 \
  --format pretty
```

次に[紙芝居DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md)に従って作品フォルダーを配置し、プレビューで
scene遷移、表示、音、ポーズ認識、作品固有blockとの関係を確認します。問題があれば生成YAMLと4.0成果物だけを
破棄し、元台本を3.2のランタイムで継続できます。

## プログラムから変換する（JavaScript API）

副作用なしで文字列を変換する場合は、パッケージのexportを使用します。

```js
import {convertDsl32ToDsl4} from '@kubohiroya/turbowarp-kamishibai-app/converter';

const result = convertDsl32ToDsl4(sourceText, {
  sourceId: 'source.txt',
  poseModels,
});

if (result.ok) {
  console.log(result.yaml);
} else {
  console.error(result.diagnostics);
}
```

`convertDsl32ToDsl4`はファイル入出力を行わず、`ok`、正規化した`source`、変換後の`document`／`yaml`、
`diagnostics`を返します。ファイルを一括で変換するAPIが必要な場合は、同じexportの
`convertDsl32File({inputPath, outputPath, poseModelMapPath})`を使用します。

## 関連資料

- [紙芝居DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md): 変換後の作品フォルダーの配置、プレビュー、ビルド、実行確認
- [紙芝居DSL 4.0 Schemaリファレンス](dsl-4.0-schema-reference.md): field、型、remote assetを含む制約
- [DSL 3.1／3.2からDSL 4.0への移行仕様](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/283daadeffa5d11ab4510daa66f60168277dafea/docs/design/dsl-4-migration.md): 対応表、診断分類、rollback境界
- [`convert-dsl4`実装Issue #276](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/276): CLIとpure APIの受け入れ条件
