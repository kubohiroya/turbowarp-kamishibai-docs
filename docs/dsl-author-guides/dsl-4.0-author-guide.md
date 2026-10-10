# 紙芝居DSL 4.0 台本作成ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: DSL 4.0の台本作者、教材作成者、授業設計者、開発者\
扱う台本: 先頭に`kamishibai: '4.0'`と書く4.0用の台本

このガイドは、台本へ場面や機能を加えるときに、必要な項目を調べるための文書です。最初の作品を
一つ完成させたい方は、先に入門チュートリアル[「紙芝居を作る」](../tutorials/create.md)を使ってください。
本書を最初から最後まで読む必要はありません。

最初に出てくる言葉は、次の意味です。

| 言葉                | このガイドでの意味                                                       |
| ------------------- | ------------------------------------------------------------------------ |
| YAML台本            | 場面、セリフ、動きなどを、項目と字下げで記録するテキストファイル         |
| 作品フォルダー      | 台本、画像、音声、ポーズ用データをまとめて置くフォルダー                 |
| 素材（asset）       | 作品で使う画像、音声、衣装、ポーズ用データ                               |
| 命令（action）      | 背景を変える、話す、動くなど、場面の中で順番に実行する指示               |
| プレビュー          | 完成ファイルを作る前に、ブラウザーで動きや変更を確かめること             |
| 検査                | 台本の書き方や参照先に問題がないかを確認すること                         |
| SB3の作成（ビルド） | 台本と素材を、TurboWarpやScratchで開ける一つの作品ファイルへまとめること |
| Schemaリファレンス  | 台本の各項目について、使える値や必須条件を検索するための仕様一覧         |

## 公開プレリリースと文書基準

文書状態: 公開プレリリースrc.8の固定実装基準を説明する台本作成ガイド\
調査基準: TurboWarp-Kamishibai `29c0dea`（`v4.0.0-rc.8`）、2026年8月20日

> **配布状態との区別:** 2026年8月20日時点で`v4.0.0-rc.8`はprereleaseとして公開されていますが、
> 正式な`v4.0.0`ではありません。ポーズoverlayはrc.8と、同版がexact pinするTurboWarp TM 1.12.0で利用できます。

このガイドと[紙芝居DSL 4.0 Schemaリファレンス](dsl-4.0-schema-reference.md)は、同じ完成版の実装を
調査基準にしています。Schemaはruntime実装から生成するものではありません。どの実装がどこまで入っているか、
根拠となる資料はどれかを確認したい方は、巻末の「付録: 実装基準と実装根拠」を参照してください。

## チュートリアルと本書の使い分け

入門チュートリアル「紙芝居を作る」は、配布されたひな形を一つ変更して、最初の作品を
完成させるための短い実習です。本書のすべての書き方や命令を順に読む前提ではありません。

| 資料                               | 対象読者                                       | 前提                                  | 完了するとできること                                                   | 次に使う資料                       |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 入門チュートリアル「紙芝居を作る」 | 初めて4.0の台本を書く方                        | 大人向け概要、配布されたひな形        | セリフの変更、画面確認、エラー修正、完成したSB3の再生                  | 本書の必要な節、Schemaリファレンス |
| 本書「台本作成ガイド」             | 作品の機能を広げる作者、教材作成者、授業設計者 | 4.0の概要、またはチュートリアルの完了 | 作品の配置、台本の分割、命令、入力、エラーへの対処を必要な範囲で調べる | Schemaリファレンス、開発者向け文書 |
| Schemaリファレンス                 | 項目や命令の値・必須条件を検索する方           | 調べたい項目が分かっていること        | 台本に書ける正確な値と制約を確認する                                   | 入門手順は扱わない                 |

チュートリアルがまだ公開されていない間は、最短経路を「大人向け概要 → 本書の記法 → 最小台本 →
作品フォルダーへファイルを置く → ブラウザーで確認する → エラーを直す → 作成時のチェックリスト」とします。チュートリアル
公開後は、最初の作品を完成させる目的ならチュートリアルを先に使い、機能を追加するときだけ本書の該当節へ
移ります。どちらの場合も、本書を最初から最後まで通読する必要はありません。

## このガイドの読み進め方

初めて台本を書く場合は、次の順序で進めてください。Schemaリファレンスは最初から通読せず、手順の途中で
項目や命令の詳細が必要になったときに参照します。

| 段階 | 本書で読む範囲                                       | 到達点                   |
| ---- | ---------------------------------------------------- | ------------------------ |
| 1    | DSL 4.0の記法、最小台本                              | 一つの場面を読める       |
| 2    | 作品フォルダー、YAMLの規則、名前、素材、登場人物     | 台本と素材の対応を作れる |
| 3    | 表紙、入力、見た目、場面、命令                       | 短い作品を書ける         |
| 4    | 安定した識別名、ブラウザーでの確認、総合サンプル     | 変更を安全に確認できる   |
| 5    | エラー表示、チェックリスト                           | 配布前に台本を検査できる |
| 補足 | 必要なときだけ、台本の分割、すべての命令、詳細な制約 | 作品の機能を広げられる   |

<figure class="concept-flow"><figcaption>台本を段階的に完成させる順序</figcaption><div class="concept-flow__track"><span>最小台本</span><b aria-hidden="true">→</b><span>台本と素材を配置</span><b aria-hidden="true">→</b><span>場面と命令を追加</span><b aria-hidden="true">→</b><span>台本を検査</span><b aria-hidden="true">→</b><span>ブラウザーで確認</span><b aria-hidden="true">→</b><span>SB3を作成</span></div><p class="concept-flow__note"><strong>エラーが出た場合:</strong> 表示されたファイルと行を直してから、もう一度検査します。</p></figure>

すでに3系作品がある方は、先に
[3系作品の変換ガイド](dsl-3.2-to-4.0-conversion-guide.md)で別ファイルへ変換し、
生成されたYAMLを本書の「最小台本」「作品フォルダーへファイルを配置する」「診断と安全停止」と照合してください。
実装状況や公開状況を調べる必要がある場合は、巻末の「付録: 実装基準と実装根拠」を参照してください。台本を書くだけなら、そのまま「最小台本」へ進めます。

## DSL 4.0の記法

DSL 4.0は制限付きYAML 1.2で記述します。引数には名前が付き、背景、位置、時間などの意味を
台本から読み取れます。一つの項目には命令を一つだけ書きます。

```yaml
- Hero.show:
    skin: HeroHappy
    x: 0
    y: -60
    scale: 30
```

標準のファイル名の末尾は`.k4.yml`、版の宣言は`kamishibai: '4.0'`です。場面は`scenes`の下へ、
命令は一つのキーを持つ項目として書きます。複数の指定値は`x`、`y`、`seconds`のような名前で表します。

## 最小台本

ファイルをUTF-8で保存します。新規projectでは短い`.k4.yml`を推奨します。

```yaml
kamishibai: '4.0'

assets:
  Beach: backdrop
  HeroIdle: costume:Hero

actors:
  Hero: HeroIdle

scenes:
  opening:
    - stage: Beach
    - Hero.say:
        text: こんにちは！
        seconds: 2
    - wait: 1
```

この台本は、次の内容を表します。

1. `Beach`をプロジェクト内の背景として登録する
2. `HeroIdle`を`Hero`用のコスチュームとして登録する
3. `Hero`アクターの初期コスチュームを`HeroIdle`にする
4. 最初の`opening`シーンで背景を変更する
5. `Hero`が2秒間話し、1秒待つ

`kamishibai`と`scenes`だけがトップレベルの必須項目です。`scenes`には一つ以上のシーンが必要です。
通常実行は、`scenes`へ最初に書いたシーンから始まり、明示的な遷移がなければ記述順に次のシーンへ
進みます。これはYAMLのmapping一般の保証ではなくDSL 4.0固有の規則です。sceneの並べ替えに関する注意は
[「sceneの記述順を保つ」](#sceneの記述順を保つ)を参照してください。

## 作品フォルダーへファイルを配置する

一般作者向けの最小構成では、YAML、画像、音声をプロジェクトルート直下へ置けます。ポーズモデルだけは複数のファイルを
一つの束として扱うため、モデル単位のディレクトリにまとめます。

```text
tutorial-story/
├── project.source.json
├── story.k4.yml
├── ocean.svg
├── hero-happy.svg
├── opening.mp3
├── rescue-pose/
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
└── chapters/
    ├── rescue.k4.yml
    └── rescue-background.svg
```

`assets/`、`images/`、`sounds/`、`pose-models/`等の分類用ディレクトリは必須ではありません。作品が大きく
なった場合に任意で使用できます。単一ソースまたはプロジェクトルートの`story.k4.yml`で宣言した`file: ocean.svg`は
プロジェクトルートの`ocean.svg`を示します。読み込み先ソースで宣言したアセットは、そのソースのディレクトリを基準に
解決します。

Web Previewで選択するのはYAML fileではなく`tutorial-story/`に当たるプロジェクトルートのディレクトリです。
Web Previewはプロジェクトルート直下の`project.source.json`を読み、次の規則でYAMLを一つに決定します。

- 新規の作品フォルダーではプロジェクトルート直下の`story.k4.yml`を`path`へ明示する
- `path`省略時は後方互換の既定値`story.kamishibai.yaml`を使用する
- 別名を指定する場合も、プロジェクトルート直下にある、正式な拡張子を持つファイル名だけを使用する
- `stories/main.k4.yml`のようにディレクトリを含むエントリーパスは使用しない
- ディレクトリ内のDSLソースを走査して推測しない
- manifestが不正な場合は既定値へfallbackせず、診断を表示する

新規の作品フォルダーでは、`project.source.json`へ次のようにエントリーソースを明示します。

```json
{
  "formatVersion": 1,
  "mode": "external",
  "sourceId": "main",
  "path": "story.k4.yml"
}
```

正式に受理する拡張子は`.k4.yml`、`.k4.yaml`、`.kamishibai.yml`、`.kamishibai.yaml`です。短い
`.k4.yml`を新規ソースの推奨表記とし、長い表記は既存の作品フォルダーとの互換性のため維持します。
`build-dsl4`は`--source-manifest`でこのmanifestを指定し、`validate-dsl4 --input`は検証するYAMLを
直接指定します。

## 台本を複数ファイルへ分ける（`include`）

`dsl4SourceIncludes`を起動時に明示ONにすると、エントリーソースのinclude文から複数ソースを読み込み、
一つの台本として合成できます。`include`は一件の文字列またはlistで指定します。

```yaml
# story.k4.yml
include:
  - chapters/rescue.k4.yml

kamishibai: '4.0'
assets:
  Ocean:
    kind: backdrop
    file: ocean.svg
scenes:
  opening:
    - goto: rescue
```

```yaml
# chapters/rescue.k4.yml
assets:
  RescueBackground:
    kind: backdrop
    file: rescue-background.svg
scenes:
  rescue:
    - stage: RescueBackground
```

`chapters/rescue.k4.yml`の`file: rescue-background.svg`は、宣言元を基準に
`chapters/rescue-background.svg`へ解決されます。絶対パス、URL、backslash、プロジェクトルート外へのescapeと
プロジェクトルート外のsymlinkは、ソースまたはアセットのバイト列を読む前に拒否されます。

include文には次の規則があります。

- `kamishibai`はエントリーソースだけに書き、読み込み先ソースへ重ねて宣言しない
- 同じnamespaceの同じIDは、内容が同じでも複数ソースへ宣言しない
- `cover`、`loading`、`poseRecognition`、`controls`などの単一設定は読み込んだ全ファイルで一度だけ宣言する
- プロジェクトルート優先、include順による後勝ち、shadowingはなく、全宣言を確定してから参照を解決する
- include cycleは経路付き`K4-INCLUDE-CYCLE`で停止する
- 一つのソース、ソース件数、全ファイルの合計バイト数、合成後バイト数、include depthに有限上限を設ける

`include`はSchema検証の前に処理するinclude文で、合成後の台本から取り除かれます。
全ソースと参照するローカルアセットを二回安定取得し、同じ世代の同一性になった場合だけプレビューへ反映します。
途中保存、ソースだけ新しい状態、アセットだけ新しい状態は実行中の世代を置き換えません。build成果物は
合成後ソース、宣言元の論理ソースID／range、ローカルアセットを保持する自己完結SB3で、端末の絶対パスや
ブラウザーのファイルハンドルを保存しません。

CLIプレビューでinclude文を使う場合は`--enable-source-includes`を指定し、`--max-source-bytes`、
`--max-source-files`、`--max-total-source-bytes`、`--max-include-depth`とasset上限を有限値で指定します。
機能フラグがOFFの場合は単一ソース経路を維持します。

## ファイル全体の構造

合成後の台本で使用できるトップレベルキーは次のものだけです。表にないキーは警告ではなくエラーに
なります。`include`は前節のinclude文の前処理だけが受理し、JSON Schemaのトップレベルfieldではありません。

| キー              | 必須 | 役割                                              |
| ----------------- | ---- | ------------------------------------------------- |
| `kamishibai`      | 必須 | 文字列`'4.0'`を指定する                           |
| `assets`          | 任意 | 背景、音、costume、ポーズモデル、UI画像を登録する |
| `actors`          | 任意 | アクターと初期コスチュームを対応付ける            |
| `cover`           | 任意 | 表紙の背景とBGMを指定する                         |
| `textStyles`      | 任意 | SVG Textの名前付きスタイルを定義する              |
| `bubbleStyles`        | 任意 | say／thinkの名前付き吹き出しstyleを定義する       |
| `bubbleClosePolicies` | 任意 | say／thinkの名前付き終了条件を定義する            |
| `variables`           | 任意 | 物語で使う変数の初期値を定義する                  |
| `loading`             | 任意 | 読み込み中の背景とコスチューム列を指定する        |
| `poseRecognition`     | 任意 | ポーズ認識、プレビュー表示、任意の操作UIを設定する   |
| `controls`            | 任意 | 実行環境ごとの操作キーを定義する                  |
| `branches`            | 任意 | 順序付きの条件分岐を登録する                      |
| `scenes`              | 必須 | 一つ以上のシーンとアクションを記述する            |

推奨する並び順は表の順番です。YAMLのmappingの字下げには空白を使用し、タブは使いません。

## YAMLを書くときの規則

DSL 4.0はYAMLをそのまま受け入れるのではなく、安全に、そして常に同じ結果へ解析できる範囲へ絞って使います。ここでは、その制限のうち台本を書くときに必ず出会うものをまとめます。

### バージョンは文字列で書く

```yaml
kamishibai: '4.0'
```

引用符のない`4.0`はYAMLの数値として解釈されるため、DSL 4.0として受理されません。

### アクションはlistとして並べる

各アクションは`-`で始め、一つのアクションmappingにはキーを一つだけ書きます。

```yaml
scenes:
  opening:
    - stage: Beach
    - wait: 1
```

次のように二つの命令を一つの項目へまとめることはできません。

```yaml
# エラー
- stage: Beach
  wait: 1
```

### 単一引数だけ短く書ける

意味が一つに決まるアクションにはscalarの短形式があります。

```yaml
- stage: Beach
- bgm: OpeningSound
- wait: 1
- goto: ending
- Hero.setSkin: HeroHappy
```

位置と時間のように意味の異なる値が複数ある場合は、名前付きmappingを使用します。

```yaml
- Hero.moveTo:
    x: 40
    y: -57
    seconds: 1.5
```

`[40, -57, 1.5]`のような位置引数listは受理されません。

### 長い文字列はblock scalarで書ける

```yaml
- Caption.setText:
    text: |-
      海へ出発！
      1か2を押してください
    style: title
```

`|-`の次の行から字下げした範囲が文字列になります。

### YAMLの一部機能は使用できない

DSL 4.0では、安全で決定的に解析するため、次の機能を禁止します。

- duplicate key
- anchorとalias
- merge key
- custom tag
- 一つのファイル内の複数YAML文書

コメントには`#`を使用できます。色の`#112233`、条件式、記号を含む文字列など、YAMLの解釈が
紛らわしい値は引用符で囲んでください。

## 名前の規則

アクター、テキストスタイル、変数、分岐、`stableId`などの構文識別子には、Unicodeの文字、数字、
`_`、`-`を使用できます。先頭は文字または`_`にします。

```yaml
assets:
  Beach_1: backdrop
  主人公-通常: costume:主人公
```

次の名前は使用できません。

```yaml
# 先頭が数字
actors:
  1stActor: HeroIdle

# 空白を含む
variables:
  player score: 0

# actor actionの区切りとして予約された`.`を含む
actors:
  main.hero: HeroIdle
```

日本語名はUnicode NFCで保存します。大文字と小文字は別の識別子として扱われます。

アセットIDとシーンIDはScratch上の名前をそのまま保持する空でない文字列で、空白や記号も使用できます。
値をtrim、alias化、Unicode正規化しません。YAMLとして解釈が曖昧になる名前は引用符で囲みます。

```yaml
assets:
  'Beach / evening': backdrop
scenes:
  'Scene 1: opening': []
```

`bubbleStyles`と`bubbleClosePolicies`の名前も内部の空白や日本語を使用できます。ただし、先頭・末尾の
空白、改行、tab、制御文字は使用できません。

## 素材（asset）を登録する

### 短形式

すでにSB3へ埋め込まれているアセットを、アセットIDと同じ名前で参照する場合に使用します。

```yaml
assets:
  Beach: backdrop
  HeroIdle: costume:Hero
  OpeningSound: sound
```

| 書式              | 意味                           |
| ----------------- | ------------------------------ |
| `backdrop`        | ステージの同名背景             |
| `costume:ActorID` | 指定アクターの同名コスチューム |
| `sound`           | ステージの同名音               |

### 名前付き形式

埋め込み済みアセットの実名がアセットIDと異なる場合は`name`を使います。ビルダー入力のローカルfileを
使用する場合は`file`を使います。`name`と`file`はどちらか一方だけを指定します。

```yaml
assets:
  Ocean:
    kind: backdrop
    file: ocean.svg
    loading: lazy

  HeroHappy:
    kind: costume
    target: Hero
    name: happy

  OpeningSound:
    kind: sound
    name: Opening Theme
    loading: eager

  救助Pose:
    kind: poseModel
    file: rescue-pose
    loading: lazy

  CameraMenuButton:
    kind: image
    file: select-camera.svg
    loading: eager
```

`kind`に指定できる値は`backdrop`、`costume`、`sound`、`poseModel`、`image`です。`costume`には
`target`が必須です。`poseModel`と`image`には`name`を使用できません。`image`はapp shellが表示する
カメラプレビューの操作 icon用であり、Scratch spriteやcostumeを追加する機能ではありません。

bitmapのbackdropとcostumeは`bitmapResolution: 1`または`2`で論理解像度を指定できます。省略時は`1`です。
SVGなどのベクター素材には表示上の効果がないため、元素材の種類に合わせて使用してください。

`file`は宣言を書いたソースのディレクトリを基準に解決する、安全なPOSIX相対パスです。プロジェクトルート直下のentry
ソースではプロジェクトルート基準になります。次の値は使用できません。

- `/ocean.svg`のような絶対パス
- `C:\ocean.svg`のようなWindows絶対パスやバックスラッシュ
- `./ocean.svg`、`../ocean.svg`のような`.`または`..` segment
- `https://example.com/ocean.svg`のようなURI

基準仕様では、ビルダーがfileのバイト列を成果物へ埋め込み、実行環境からのネットワーク取得を不要にします。
include文を使う場合は、正規化後のパスとsymlink実体の両方がプロジェクトルート内であることをバイト列の読込前に確認します。

SB3の初期容量を抑えたいassetは、`delivery: remote`と`source.url`でHTTPS URLを指定できます。
検証情報を省略した場合は取得時点の内容を使います。内容を固定する場合は`integrity`、`contentType`、`size`を
三つとも指定します。一部だけの指定はSchema errorです。poseModelのURLは通常のTurboWarp TMのディレクトリ、検証情報を
指定したURLはmodel archiveを指します。ネットワークなしで固定して使う場合はローカルの`file`を指定し、ビルダーで
SB3へ埋め込みます。

### eagerとlazy

名前付きアセットには`loading: eager`または`loading: lazy`を指定できます。省略時と短形式は
`eager`です。

- `eager`: 実行開始時に準備する
- `lazy`: 必要なシーンへの遷移が決まってから先読みし、シーン開始までに準備する

`delivery: embedded`なら`lazy`でもアセット自体は配布成果物へ埋め込みます。remote poseModelは必要時に
URLから取得します。scene開始時に準備が終わっていない場合は
Loading表示で待ち、準備に失敗した場合はそのsceneのアクションを開始せず診断を表示する設計です。
カメラプレビューの操作から参照する`image`はプレビュー開始時に必要なため、`loading: eager`だけを使用します。
`lazy`のcontrol画像参照は意味検証でエラーになります。

## 登場人物（Actor）を登録する

`actors`では、アクターIDと初期コスチュームを対応付けます。

```yaml
assets:
  HeroIdle: costume:Hero
  HeroHappy: costume:Hero
  TurtleIdle: costume:Turtle

actors:
  Hero: HeroIdle
  Turtle: TurtleIdle
```

初期コスチュームは`costume`アセットであり、その`target`がアクターIDと一致している必要があります。
アクションでは`Hero.show`、`Turtle.say`のように、アクターIDと命令を`.`でつなぎます。

## 表紙、読み込み表示、ポーズ認識、カメラ映像を設定する

ここまでで素材と登場人物がそろいました。次は、物語が始まる前と、物語の外側に出る画面の設定です。いずれもトップレベルのキーとして一度だけ書き、シーンごとに書き分けるものではありません。

### 表紙

```yaml
cover:
  backdrop: Beach
  bgm: OpeningSound
```

`backdrop`は必須で、背景アセットを指定します。`bgm`は任意で、音アセットを指定します。

### 読み込み中の表示

```yaml
assets:
  LoadingBackground: backdrop
  Loading1: costume:Loading
  Loading2: costume:Loading

loading:
  backdrop: LoadingBackground
  costumes: [Loading1, Loading2]
```

`loading`を記述する場合は、背景と一つ以上のコスチュームが必要です。`costumes`は同じ意味の値の集合なので
YAML listで指定します。

### ポーズ認識音

```yaml
poseRecognition:
  idleSound: ClockTicking
  chargeSound: Success
```

`idleSound`と`chargeSound`はそれぞれ任意です。両方を省略した無音、片方だけ、両方を指定した設定を
受理します。指定する場合、参照先は音アセットでなければなりません。音を省略してもsequence、selection、
feedback、navigation、プレビューは独立して設定できます。

### Poseモデルの初期化方法

sceneをskipしたり遷移先を変更したりする作品では、不要になったモデル初期化をcancelして、直近で必要な
モデルだけを準備できます。

```yaml
poseRecognition:
  modelInitialization:
    policy: latest-needed
    parallel: true
```

`policy: latest-needed`は重い初期化を実行中1件、最新待機1件までに制限します。Aの初期化中にB、Cの順で
要求が変わった場合、Bを開始せず、Aを安全境界でcancelしてCだけを開始します。poseを使わないsceneへ
skipした場合は待機要求を破棄し、新しいモデル初期化を開始しません。

`parallel: true`では、cameraの起動とモデル準備、モデル記述子の復号・SHA検証とclassifier loadなど、
依存関係のない処理を重ねます。最初の認識だけがcameraと登録済みモデルの両方を待ちます。モデル初期化の
cancelだけでcameraは停止しません。

省略時は`policy: legacy`、`parallel: false`です。これは従来動作へ設定だけで戻せる安全な既定値です。
`latest-needed`の実行にはTurboWarp TM 1.10.0以降が必要です。公開プレリリース4.0.0-rc.8はTurboWarp TM 1.12.0をexact pinします。

### カメラ映像の表示と操作

story全体の左右反転既定と、必要な操作UIを`poseRecognition.preview`へ記述します。

```yaml
assets:
  ShowMirroredButton:
    kind: image
    file: ui/show-mirrored.svg
    loading: eager
  ShowUnmirroredButton:
    kind: image
    file: ui/show-unmirrored.svg
    loading: eager
  CameraMenuButton:
    kind: image
    file: ui/select-camera.svg
    loading: eager

poseRecognition:
  idleSound: ClockTicking
  chargeSound: Success
  preview:
    mirroring: mirrored
    controls:
      mirroring:
        position: top-center
        opacity: 0.8
        assets:
          showMirrored: ShowMirroredButton
          showUnmirrored: ShowUnmirroredButton
      cameraMenu:
        position: bottom-center
        opacity: 0.8
        buttonAsset: CameraMenuButton
```

`mirroring`は`mirrored`または`unmirrored`で、省略時は従来表示と同じ`mirrored`です。これはpreview
canvasの見た目だけを変更し、認識へ渡すframe、pose confidence、sequence／selection判定を変更しません。

`controls`には左右反転buttonとcamera選択menuの一方または両方を記述します。配置は
`top-center`、`bottom-center`、`left-center`、`right-center`と四隅の8 anchor、`opacity`は0〜1です。
同じanchorでは左右反転button、camera menuの順に並びます。controlを省略した場合はUIを生成せず、
暗黙の標準iconも補いません。buttonには台本画像とは別にlocale対応の名前、focus表示、keyboard操作を
app shellが提供します。

camera menuは開くたびに利用可能な入力を列挙します。`default`、`front`、`back`と検出済みcameraを
選べますが、端末固有の物理device IDは台本、StoryDocument、`variables`へ保存しません。opaqueなIDと
UIの選択状態はapp shellがsession内だけで保持し、camera切替失敗時は以前のcameraと表示へ戻します。
起動時固定・既定OFFの`dsl4CameraPreviewControls`がOFFならcontrol画像、DOM、listener、上流camera APIへ
接続しません。

#### ポーズの関節とボーンを重ねる

認識中の17関節と12本の標準ボーンをカメラプレビューへ重ねる場合は、
`poseRecognition.preview.overlay`を記述します。

```yaml
poseRecognition:
  preview:
    mirroring: mirrored
    overlay:
      visible: true
      jointStyles:
        leftWrist:
          color: '#ff00aa'
          opacity: 0.8
          radius: 6
        rightWrist:
          color: '#ff00aa'
          radius: 6
      boneStyle:
        color: '#00e5ff'
        opacity: 0.9
        width: 3
      minimumConfidence: 0.5
      confidenceScaling:
        jointOpacity: true
        jointRadius: false
        boneOpacity: true
        boneWidth: false
```

`jointStyles`では次の17個のPoseNet関節名をkeyにし、円の`color`、`opacity`、`radius`から必要な値だけを
上書きします。

`nose`、`leftEye`、`rightEye`、`leftEar`、`rightEar`、`leftShoulder`、`rightShoulder`、
`leftElbow`、`rightElbow`、`leftWrist`、`rightWrist`、`leftHip`、`rightHip`、`leftKnee`、
`rightKnee`、`leftAnkle`、`rightAnkle`

関節の既定値は`color: '#00e5ff'`、`opacity: 1`、`radius: 4`です。`boneStyle`は12本で共通し、
既定値は`color: '#00e5ff'`、`opacity: 0.9`、`width: 3`です。opacityは0〜1、radiusとwidthは
0以上の有限値にします。空白だけのcolorは使用できません。

`minimumConfidence`は0〜1で、省略時は`0.5`です。関節は自身のconfidenceがこの値未満なら隠れ、
ボーンは両端のどちらか一方でも未満なら隠れます。`confidenceScaling`の四項目は省略時にすべて`false`です。
`true`にした関節のopacity／radiusはその関節のconfidenceを、ボーンのopacity／widthは両端のうち低い
confidenceを倍率として、0から設定値まで変化します。この表示設定は認識入力や判定値を変更しません。

`overlay`を書いた場合の`visible`は省略時に`true`です。一方、`overlay`自体を省略した既存のDSL 4.0台本は
従来互換で非表示になります。overlayだけを隠しても認識は継続します。カメラプレビューを隠すとoverlayも隠れ、
認識停止では描画が消え、camera停止ではSVG要素も破棄されます。表示はpreviewの配置と左右反転に追従します。

実行にはTurboWarp TM 1.12.0以降が必要です。DSL runtimeは同版のcomposition APIだけを呼び、独自の描画実装を
持ちません。専用機能フラグはなく、すべてのruntime profileで同じように利用できます。問題時は
`overlay`設定を台本から削除すると、既存台本と同じ非表示へ戻せます。

## SVG Textを設定する

DSL 4.0の標準テキスト表現はSVG Textです。最初に`textStyles`で名前付きスタイルを定義します。

```yaml
textStyles:
  title:
    background: '#112233'
    color: '#ffffff'
    font: Noto Sans JP
    size: 150
    align: center
```

| 項目         | 値                        |
| ------------ | ------------------------- |
| `background` | 背景色を表す文字列        |
| `color`      | 文字色を表す文字列        |
| `font`       | 空でないフォント名        |
| `size`       | 0より大きい数値           |
| `align`      | `left`、`center`、`right` |

アクター自身へテキストを表示するときは`setText`を使います。

```yaml
- Caption.setText:
    text: おしまい
    style: title
```

行形式のText Asset commandは4.0 core schemaにありません。`textStyles`と`Actor.setText`を使用してください。

## セリフの見た目（bubble style）を設定する

`Actor.say`と`Actor.think`で同じ吹き出し表現を再利用するときは、トップレベルの`bubbleStyles`へ
名前付きの部分styleを定義します。style名には内部の空白や日本語も使用できます。

```yaml
bubbleStyles:
  Typing:
    characterIntervalSeconds: 0.05
    characterSound: Typewriter
    noSoundCharacters: '「」'
    restCharacters: '、。…'
    restCharacterIntervalSeconds: 0.5
  Hero style:
    styles:
      - Typing
    textStyle: title
    placement: FOOTER_LIKE
    visualStyle: NARRATION
```

style定義の`styles`配列で既存styleを記載順に合成し、その定義自身の値で上書きできます。循環参照、
未定義style、同じstyleの重複指定はエラーです。各styleは部分設定にでき、文字送りの相互依存は合成後の
effective styleに対して検査します。

`characterIntervalSeconds`はUnicode grapheme cluster一つを表示してから次を表示するまでの秒数です。
`characterSound`は各文字のsound、`noSoundCharacters`は文字音を鳴らさない文字、`restCharacters`は
表示後の間隔を`restCharacterIntervalSeconds`へ置き換える文字です。

`textStyle`、`placement`、`visualStyle`、`portrait`、`continueIndicator`で吹き出しを構成できます。
さらに`reveal`、`audio`、`showAnimation`、`hideAnimation`、`visibleAnimations`で段階表示、音、animationを
指定できます。各fieldの列挙値と必須条件はSchemaリファレンスの「吹き出しstyle」を参照してください。

styleには本文、終了条件、吹き出し開始時の音声を含めません。`text`、`closePolicy`、`seconds`、
`waitFor`、`startSound`はセリフ側の設定です。見た目の`bubbleStyles`と終了条件の
`bubbleClosePolicies`は別のregistryとして扱います。

## 吹き出しを閉じる条件（bubble close policy）を設定する

同じ終了条件を複数の`Actor.say`／`Actor.think`で使う場合は、トップレベルの`bubbleClosePolicies`へ
名前を付けて定義し、actionの`closePolicy`で1件だけ参照します。

```yaml
bubbleClosePolicies:
  after-3-seconds:
    seconds: 3
  user-advance:
    waitFor: advance
  advance-or-timeout:
    seconds: 10
    waitFor: advance

scenes:
  opening:
    - Hero.say:
        text: 次へ進みます
        closePolicy: user-advance
```

- `seconds`だけなら、吹き出しの表示開始から指定秒数後に閉じます。
- `waitFor: advance`だけなら、Stageのprimary pointer／tapまたは修飾キーなしの任意キー入力で閉じます。
- 両方なら、入力とtimeoutのうち先に成立した方で閉じます。

policyの継承や合成はありません。`closePolicy`と、同じaction内の`seconds`／`waitFor`は併用できません。
未定義のpolicy名は`K4-REF-001`です。従来のinline指定は引き続き使えるので、一度しか使わない条件まで
無理に名前へ切り出す必要はありません。

runtimeはaction開始前にpolicyを既存の`seconds`／`waitFor`へ展開します。live reloadの途中ですでに表示中の
セリフは開始時に解決した値を使い続け、更新したpolicyは次に開始する物語の世代から適用されます。

## 変数と条件分岐を設定する

物語の途中で選択の結果を覚えておき、あとの場面で道を分けたい場合は、変数と分岐を組み合わせます。変数はトップレベルの`variables`で初期値を宣言し、分岐は`branches`で条件と移動先の組を登録してから、シーンの中で名前で呼び出します。

### 変数

```yaml
variables:
  score: 1
  takeSeaRoute: false
  playerName: ななし
```

初期値に使用できる型はstring、number、booleanだけです。list、mapping、`null`、式を初期値には
使用できません。実行中に値を変更する処理はruntimeまたは登録済みactionが担当し、宣言時の型と異なる値へ
暗黙変換しません。

`variables`は物語の意味を持つ値だけに使います。cameraの物理device ID、プレビューのボタンの選択状態、
DOM node、listener、Object URLはapp shell所有の一時状態であり、story変数やScratch変数へ写さないでください。

### 分岐

分岐は上から順に条件を評価し、最初に真になった移動先を選びます。最後の規則は必ず`else`にします。

```yaml
branches:
  rescueResult:
    - if: 'score == 1'
      goto: seaRoute
    - if: takeSeaRoute
      goto: seaRoute
    - else: ending
```

条件式は文字列として記述します。`if`と`goto`は同じmappingへ書き、`else`は分岐内に一つだけ、末尾へ
置きます。すべての移動先シーンが定義済みでなければなりません。

4.0.0-rc.8では、条件式は`branch` action開始時点のトップレベル`variables:`を不変snapshotとして参照します。
ASCIIのbare nameは`score == 1`のように書けます。日本語や`-`などbare nameにできない文字を含む名前は、
`vars["救助回数"] >= 2`のように完全一致のstring literalで指定します。Stage／sprite変数、Temporary Variables、
`ポーズ認識`、`チャージ`は条件式へ自動では入りません。

シーンから分岐を実行します。

```yaml
- branch: rescueResult
```

条件式の評価器と利用できる演算は、利用するreleaseのDSL 4.0機能一覧で確認してください。

## 操作キーを設定する

`controls`では、development用とproduction用など、実行環境ごとに完全なkeymapを定義できます。

```yaml
controls:
  keymaps:
    development:
      Space: navigation.nextAction
      Enter: navigation.nextScene
      ArrowLeft: history.previousAction
      ArrowUp: history.previousScene
      ArrowDown: history.nextScene
    production:
      Space: rehearsal.skipPose
```

ビルダーは`controlProfile`を明示的に一つ選び、選択されたprofileのkeymapだけを有効にする設計です。
profile間の継承、merge、fallbackはありません。

使用できるnavigation commandは次の8個です。

| command                  | 動作                                   |
| ------------------------ | -------------------------------------- |
| `navigation.nextAction`  | 通常実行として次のアクションへ進む     |
| `navigation.nextScene`   | 通常実行として次のシーンへ進む         |
| `rehearsal.skipPose`     | 現在のpose stepを完了する              |
| `rehearsal.skipAction`   | 現在のactionを最終状態へ進める         |
| `rehearsal.skipScene`    | 現在のsceneを安全な最終状態へ進める    |
| `history.previousAction` | 実行履歴上の前のアクションへ移動する   |
| `history.previousScene`  | 実行履歴上の前のシーンの先頭へ移動する |
| `history.nextScene`      | 実行履歴上の次のシーンの先頭へ移動する |

キー名には`KeyboardEvent.code`を使用します。`Space`、`Enter`、方向キー、`Digit0`〜`Digit9`、
`KeyA`〜`KeyZ`、`Numpad0`〜`Numpad9`、`F1`〜`F12`などがschemaで列挙されています。
`Shift+Space`のようなmodifierとの組み合わせは使用できません。

選択profileに`history.*`が一つでもある場合だけ、時系列historyを有効にします。history移動で実行位置は
変わりますが、物語の変数や表示状態を完全に巻き戻す機能ではありません。同じ物理キーを`controls`と
作品内の`keyInputToChangeScene`へ重ねて割り当てないでください。

`rehearsal.skipPose`はpose action内の次stepへ進み、`rehearsal.skipAction`は現在のaction全体、
`rehearsal.skipScene`は現在のsceneを完了します。これらは実行履歴を移動しません。keymapへ明示したprofileで
だけ有効になります。

## シーンを書く

`scenes`の下には、シーンIDをキーとしてシーンを並べます。シーンの書き方には、アクション列だけを書く短形式と、シーン固有の設定を添える長形式の二つがあります。どちらで書いても、検証後には同じ内部表現へ正規化されます。

### 短形式

シーン固有の設定が不要なら、アクション列を直接書きます。

```yaml
scenes:
  opening:
    - stage: Beach
    - wait: 1
```

### 長形式

ポーズモデルなどのシーン固有設定がある場合は、`actions`を持つmappingにします。

```yaml
scenes:
  rescue:
    poseModel: 救助Pose
    posePreview:
      mirroring: unmirrored
    actions:
      - stage: Ocean
      - Hero.pose:
          steps:
            - pose: help
              skin: HeroHelp
              sound: Success
```

長形式では`actions`が必須です。`poseModel`、`posePreview`とアクションを同じ階層へ混在させず、
アクションは必ず`actions`のlistへ入れます。`posePreview.mirroring`はそのsceneだけの上書きです。次に入る
sceneへ指定がなければstory既定へ戻り、前sceneの値を持ち越しません。短形式と長形式は、検証後に同じ
内部の`SceneNode`へ正規化されます。

### sceneの記述順を保つ

`scenes` mappingでは、ソースへ書いたscene keyの順番が通常実行のscene順です。最初のsceneから開始し、
`goto`、`branch`、入力action等が別sceneを選ばない限り、scene末尾では次に書いたsceneへ進みます。

YAML 1.2一般ではmappingのkey順にapplication上の意味はありません（[YAML 1.2.2 Mapping Key Order](https://yaml.org/spec/1.2.2/#3221-mapping-key-order)）。
DSL 4.0は例外として、ソースYAMLの
serialization treeに現れる`scenes`のpair順を実行順に使用します。これは「YAMLをobjectへ変換すれば
常に記述順になる」という意味ではありません。

scene keyをアルファベット順や数値順へ並べ替えるYAML formatter、serializer、editorを使用しないでください。
並べ替え後もSchema検証には成功しますが、台本の実行順が変わります。DSL 4.0対応toolは保存時にscene keyを
sortせず、読み込みと書き出しを繰り返しても同じ順序を保持する必要があります。

現行frontendはYAMLをJavaScript objectへ変換してからsceneを配列化するため、`"10"`、`"2"`等の数字だけの
scene IDでは記述順を保証できません。これは意図したDSL仕様ではなく既知の実装制約です。修正されるまでは
`scene10`、`scene2`のように数字以外を含むscene IDを使用してください。

## 舞台への命令（Global action）

Global actionはアクター名を付けずに記述します。

| action                    | 短形式または主な引数          | 役割                              |
| ------------------------- | ----------------------------- | --------------------------------- |
| `stage`                   | 背景ID                        | 背景を変更する                    |
| `bgm`                     | 音ID                          | BGMの再生を依頼する               |
| `sound`                   | 音ID                          | 効果音の再生を依頼する            |
| `wait`                    | 0以上の秒数                   | 指定時間待つ                      |
| `debugger`                | `null`                        | development debugの停止境界を置く |
| `broadcastMessageAndWait` | message名                     | message receiverの完了を待つ      |
| `transition`              | `effect`、`seconds`           | 見た目の遷移効果を実行する        |
| `goto`                    | シーンID                      | 指定シーンへ移動する              |
| `branch`                  | 分岐ID                        | 条件分岐を評価して移動する        |
| `keyInputToChangeScene`   | キーからシーンへのmapping     | キー入力を待って移動する          |
| `touchInputToChangeScene` | アクターからシーンへのmapping | タッチ入力を待って移動する        |
| `poseInputToChangeScene`  | ポーズからシーンへのmapping   | 最初に認識したポーズで移動する    |

### 背景、音、待機

```yaml
- stage: Beach
- bgm: OpeningSound
- sound: Success
- wait: 1.5
```

`wait`は0以上です。背景と音のIDは、使用箇所に合う`kind`のアセットを参照します。

### debug停止とTurboWarp message

```yaml
- debugger:
- broadcastMessageAndWait: playMiniGame
- broadcastMessageAndWait:
    stableId: endingEffects
    message: showEndingEffects
```

`debugger`はdevelopment debug実行でaction開始前に停止する境界です。引数やactor prefixは指定できません。
production／埋め込み作品では副作用のないno-opとして直ちに完了します。

`broadcastMessageAndWait`はScratch／TurboWarpの「メッセージを送って待つ」に相当します。指定messageで開始した
receiver threadがすべて終了してから次actionへ進みます。終了しないreceiverを持つmessageには使用しないでください。

### 画面効果

```yaml
- transition:
    effect: fadeOut
    seconds: 0.5
```

`transition`は見た目の効果だけを実行し、シーンを移動しません。移動が必要なら、次に`goto`または
`branch`を書きます。`effect`は識別子であり、実際に利用できる効果名はTurboWarp接続側の実装契約で
確定します。

### シーン移動

```yaml
- goto: ending
- branch: rescueResult
```

参照するシーンまたは分岐は、同じ台本内で定義済みでなければなりません。

### キー入力による移動

```yaml
- keyInputToChangeScene:
    Digit1: rescue
    Digit2: ending
```

`stableId`を付ける場合は、経路を`routes`の下へ移します。

```yaml
- keyInputToChangeScene:
    stableId: routeSelection
    routes:
      Digit1: rescue
      Digit2: ending
```

### タッチ入力による移動

```yaml
- touchInputToChangeScene:
    Hero: rescue
    Caption: ending
```

左側には登録済みアクター、右側には登録済みシーンを指定します。

## 登場人物への命令（Actor action）

Actor actionは`ActorID.command`をキーにします。

| action                     | 必須引数                                 | 役割                                       |
| -------------------------- | ---------------------------------------- | ------------------------------------------ |
| `Actor.show`               | `skin`、`x`、`y`、`scale`                | コスチューム、位置、倍率を指定して表示する |
| `Actor.hide`               | なし                                     | アクターを非表示にする                     |
| `Actor.setTransparency`    | 0〜100または`from`、`to`、`seconds`      | 幽霊効果を即時設定または線形に変化させる   |
| `Actor.moveTo`             | `x`、`y`、`seconds`                      | 任意のeasingで指定位置へ移動する           |
| `Actor.say`／`Actor.think` | `text`と、`closePolicy`または`seconds`／`waitFor` | セリフまたは思考を表示する             |
| `Actor.setSkin`            | コスチュームID                           | コスチュームを変更する                     |
| `Actor.setLayer`           | `front`／`back`／相対layer数             | アクターの重なり順を変更する               |
| `Actor.loop`               | `steps`                                  | コスチューム列を繰り返す                   |
| `Actor.setText`            | `text`、`style`                          | SVG Textを更新する                         |
| `Actor.pose`               | `steps`                                  | ポーズを順に認識してcostumeと音を適用する  |

### 表示する

```yaml
- Hero.show:
    skin: HeroHappy
    x: 0
    y: -60
    scale: 30
```

`scale`は0より大きい数値です。`skin`は、そのアクターを`target`とするコスチュームアセットを
指定します。

### 非表示にする

```yaml
- Hero.hide: {}
```

visible stateをfalseにします。透明度effectとは別で、次の`Actor.show`が同じactorを再表示します。

### 透明度を変える

即時設定では0〜100の数値を直接指定できます。

```yaml
- Hero.setTransparency: 50
```

`0`は完全不透明、`50`はScratch／TurboWarpの「幽霊の効果を50にする」、`100`は完全透明です。
値の反転や換算は行いません。`stableId`を付ける場合は名前付きの`transparency`形式を使います。

```yaml
- Hero.setTransparency:
    stableId: heroHalfTransparent
    transparency: 50
```

`from`、`to`、`seconds`を指定すると、透明度を線形に変化させます。

```yaml
- Hero.setTransparency:
    from: 0
    to: 50
    seconds: 1
    background: true
```

`background`を省略するか`false`にすると完了まで待ち、`true`では`from`を同期適用した直後に
次actionへ進みます。途中でskip、停止、再開始、破棄された場合や、同じactorへ次の透明度変化を始める場合は、
先の変化を`to`へ確定してtimerを回収します。

### 移動する

```yaml
- Hero.moveTo:
    x: 40
    y: -57
    seconds: 1.5
    easing: easeInOut
```

`seconds`は0以上です。`easing`は`linear`、`easeIn`、`easeOut`、`easeInOut`から選び、省略時は
`linear`です。XとYへ同じ補間率を使い、0秒、完了、skip時は指定した終点へ確定します。

### セリフと思考を表示する

```yaml
- Hero.say:
    text: 助けに行こう
    closePolicy: advance-or-timeout
    styles:
      - Typing
      - Hero style
    startSound: HeroGreetingVoice
- Hero.think:
    text: どうしよう……
    closePolicy: user-advance
    characterIntervalSeconds: 0.1
    characterSound: Typewriter
```

`closePolicy`はトップレベルの`bubbleClosePolicies`に定義した名前です。`seconds`だけなら表示開始から指定秒数後、
`waitFor: advance`だけならprimary pointer／tapまたは有効な任意キーの入力後に完了します。
policyまたはinlineで両方を指定すると、入力とtimeoutのうち先に成立した方で完了します。
speech開始に使った同じ入力、interactive UI、IME composition、modifier shortcut、key repeatは
advanceとして再利用しません。

一度だけ使う終了条件は従来どおりinlineにも書けます。

```yaml
- Hero.say:
    text: 3秒だけ表示します
    seconds: 3
```

`styles`には`bubbleStyles`の名前を1件以上のYAML配列で指定します。記載順に合成し、最後にaction内の
文字送りfieldを適用します。同じstyleの重複、未定義style、単数形`style`はエラーです。styleを使わない
inline形式も使用できます。

`startSound`は吹き出し表示開始時に1回再生し、speech完了、入力、timeout、cancelで停止します。
文字送り途中に入力またはtimeoutした場合は、残り全文を文字音と文字別休止なしで即時表示して完了します。
`Actor.say`と`Actor.think`は同じlifecycleを使い、吹き出しの種類だけが異なります。

### コスチュームを変える

```yaml
- Hero.setSkin: HeroHelp
```

`stableId`を付ける場合は名前付き形式を使用します。

```yaml
- Hero.setSkin:
    stableId: heroRescueSkin
    skin: HeroHelp
    scale: 100
```

`scale`を指定すると、costumeを適用した後に正のサイズ百分率を設定します。

### 重なり順を変える

```yaml
- Hero.setLayer: front
- Guide.setLayer: -1
```

`front`／`back`は絶対位置、正の数値は前方、負の数値は後方への相対移動です。

### コスチュームを繰り返す

```yaml
- Hero.loop:
    steps:
      - skin: HeroWalk1
        seconds: 0.2
      - skin: HeroWalk2
        seconds: 0.2
```

先頭skinを直ちに適用し、各秒数後に次のskinへ進むbackground loopです。少なくとも一つの`seconds`は
0より大きくします。同じactorの`setSkin`、runtime停止、environment破棄でloopを終了します。

### SVG Textを更新する

```yaml
- Caption.setText:
    text: おしまい
    style: title
```

### ポーズを認識する

```yaml
- Hero.pose:
    steps:
      - pose: help
        skin: HeroHelp
        sound: Success
      - pose: jump
        skin: HeroHappy
        sound: Success
```

`steps`は一つ以上必要です。各項目は、順に認識する`pose`、認識後に表示する`skin`、再生する`sound`を
一組として持ちます。シーン側の長形式で`poseModel`も指定してください。

## 再読み込みに備えて`stableId`を付ける

`stableId`は、台本のlive reloadで変更前後の同じアクションを特定するための任意IDです。通常の台本で
すべてのアクションへ付ける必要はありません。付ける場合は文書全体で一意にします。

```yaml
- wait:
    stableId: waitBeforeEnding
    seconds: 1
```

`stableId`は名前付きmappingにだけ指定できます。`wait: 1`のようなscalar短形式へ追加することは
できません。

## 保存した変更をブラウザーの確認画面へ反映する

Issue #390のWeb Previewでは、対応ブラウザーで「プロジェクトを開く」を押し、プロジェクトルートをread-onlyで
選択します。Web Previewに組込みeditorはなく、YAMLとassetは任意の外部editorで変更します。選択した
ディレクトリハンドルはsession中だけ保持し、YAML、manifest、SB3、user設定へ保存しません。

最初の正常なYAMLはreload選択を挟まず先頭から開始します。その後に`story.k4.yml`を保存すると、
Web Previewは一定間隔で変更を検出し、書込み途中ではない安定した状態を解析・検証します。正常な
候補だけが次の再開位置の選択へ進みます。

1. 先頭から
2. 現在のsceneから
3. 現在のactionから

現在のactionから再開できるかは、actionが一意でreplay-safeかなどの条件で決まります。`stableId`は
変更前後の同じactionを特定しやすくしますが、すべてのactionへ付ける必要はありません。YAMLが不正、
missing、unstableの場合は現在実行中のimmutable snapshotを置き換えず、診断を表示して次の保存を待ちます。
pageがbackgroundの場合はブラウザーのタイマー制限により検出が遅れることがあります。

### 手元の素材を追加・更新する

Issue #391の候補仕様では、`backdrop`、`costume`、`sound`、`poseModel`について次をlive reload対象に
します。

- 既存アセットID、kind、パスを維持したままファイル内容だけを更新する
- 新しい一意なアセットIDとローカルファイル／pose model bundleを追加し、同じ候補YAMLから参照する

新しいファイルを先に置いても、YAMLを先に保存してもかまいません。両方が揃ってstableになり、ソース、
アセットの参照関係、ファイル内容、参照関係の検証がすべて成功した場合だけ、一つの不変の候補として
一括で反映します。途中のファイル、pose model bundleの一部、検証に失敗したアセットだけを部分反映
しません。参照されていないファイルは無視し、プロジェクトルート全体を再帰走査せず、activeまたは候補YAMLが宣言した
宣言どおりのパスだけを読みます。

次の変更は同じlive reloadへ混ぜず、full rebuildの対象です。

- 既存アセットIDの削除／rename
- 既存assetのkind／パスの変更
- 既存pose modelのbundle構成変更
- base SB3、app shell、extension、ビルダー設定、control profileの変更

### TurboWarp Editor内の作品素材

`HeroHappy: costume:Hero`のような短形式や、`name`を使うアセットはローカルファイルではなく、base SB3内の
プロジェクト内アセットを参照します。同一TurboWarp Editor／同一VMで既存costumeを編集した場合は、同じrenderer
skinの更新として実行中表示へ即時反映されることがあります。これはWeb Previewが一括反映するアセット候補
ではなく、再読み込みの確認画面、安全境界、巻き戻しの対象にもなりません。

costumeの削除後の同名追加、import、renameによる自動再bindは保証しません。別Editor／別VMで保存した
base SB3も実行中VMへ自動反映されず、full rebuildが必要です。YAML保存と同時期にproject costumeを編集しても、
両者を一つのtransactionへ束ねるatomicityは保証しません。

production用にbuildした自己完結SB3には、ディレクトリハンドル、poll timer、候補、reload dialog状態を
含めません。watchとlive reloadは開発プレビューだけの機能です。

## 総合サンプル

次の例は、アセット、表紙、SVG Text、bubble style、変数、keymap、分岐、入力、ポーズ認識を一つの台本へ
まとめたものです。利用するreleaseでDSL 4.0と必要な機能フラグを有効にして実行します。

```yaml
kamishibai: '4.0'

assets:
  Beach: backdrop
  Ocean:
    kind: backdrop
    file: ocean.svg
    loading: lazy
  HeroIdle: costume:Hero
  HeroHappy: costume:Hero
  HeroHelp: costume:Hero
  CaptionIdle: costume:Caption
  OpeningSound: sound
  ClockTicking: sound
  Success: sound
  Typewriter: sound
  HeroGreetingVoice: sound
  HeroThinkingVoice: sound
  ShowMirroredButton:
    kind: image
    file: show-mirrored.svg
    loading: eager
  ShowUnmirroredButton:
    kind: image
    file: show-unmirrored.svg
    loading: eager
  CameraMenuButton:
    kind: image
    file: select-camera.svg
    loading: eager
  救助Pose:
    kind: poseModel
    file: rescue-pose
    loading: lazy

actors:
  Hero: HeroIdle
  Caption: CaptionIdle

cover:
  backdrop: Beach
  bgm: OpeningSound

textStyles:
  title:
    background: '#112233'
    color: '#ffffff'
    font: Noto Sans JP
    size: 150
    align: center

bubbleStyles:
  Typing:
    characterIntervalSeconds: 0.05
    characterSound: Typewriter
    noSoundCharacters: '「」'
    restCharacters: '、。…'
    restCharacterIntervalSeconds: 0.5
  Hero style:
    styles:
      - Typing
    textStyle: title
    placement: FOOTER_LIKE

bubbleClosePolicies:
  user-advance:
    waitFor: advance
  advance-or-timeout:
    seconds: 8
    waitFor: advance

variables:
  score: 1
  takeSeaRoute: false

poseRecognition:
  idleSound: ClockTicking
  chargeSound: Success
  preview:
    mirroring: mirrored
    overlay:
      visible: true
      boneStyle:
        color: '#00e5ff'
        opacity: 0.9
        width: 3
      minimumConfidence: 0.5
    controls:
      mirroring:
        position: top-center
        opacity: 0.8
        assets:
          showMirrored: ShowMirroredButton
          showUnmirrored: ShowUnmirroredButton
      cameraMenu:
        position: bottom-center
        opacity: 0.8
        buttonAsset: CameraMenuButton

controls:
  keymaps:
    development:
      Space: navigation.nextAction
      ArrowLeft: history.previousAction
      ArrowUp: history.previousScene
      ArrowDown: history.nextScene
    production:
      Space: rehearsal.skipPose

branches:
  rescueResult:
    - if: 'score == 1'
      goto: seaRoute
    - if: takeSeaRoute
      goto: seaRoute
    - else: ending

scenes:
  opening:
    - stage: Beach
    - bgm: OpeningSound
    - Caption.setText:
        stableId: openingTitle
        text: |-
          海へ出発！
          1か2を押してください
        style: title
    - Hero.show:
        skin: HeroHappy
        x: 0
        y: -60
        scale: 30
    - Hero.setTransparency:
        from: 100
        to: 0
        seconds: 0.5
    - Hero.say:
        text: 助けに行こう
        closePolicy: advance-or-timeout
        styles:
          - Hero style
        startSound: HeroGreetingVoice
    - keyInputToChangeScene:
        Digit1: rescue
        Digit2: ending

  rescue:
    poseModel: 救助Pose
    posePreview:
      mirroring: unmirrored
    actions:
      - stage: Ocean
      - Hero.setSkin: HeroHelp
      - Hero.pose:
          steps:
            - pose: help
              skin: HeroHelp
              sound: Success
            - pose: jump
              skin: HeroHappy
              sound: Success
      - branch: rescueResult

  seaRoute:
    - Hero.moveTo:
        x: 40
        y: -57
        seconds: 1.5
        easing: easeInOut
    - Hero.think:
        text: 海路で帰ろう……
        closePolicy: user-advance
        startSound: HeroThinkingVoice
    - transition:
        effect: fadeOut
        seconds: 0.5
    - goto: ending

  ending:
    - stage: Beach
    - Caption.setText:
        text: おしまい
        style: title
```

## 診断と安全停止

DSL 4.0のソースフロントエンドは、YAMLを読み込んだあと、構造と参照関係の検証が成功するまでアセット準備や
アクション実行を始めません。診断にはcode、severity、ソースID、行・列、Story Pathが含まれます。

| code                          | 主な意味                                            |
| ----------------------------- | --------------------------------------------------- |
| `K4-YAML-*`                   | YAML構文または禁止機能の使用                        |
| `K4-VERSION-001`              | `kamishibai`が文字列`'4.0'`ではない                 |
| `K4-SCHEMA-001`               | 型、必須field、構造がschemaと一致しない             |
| `K4-SCHEMA-UNKNOWN-KEY`       | schemaにないキーを使用した                          |
| `K4-ID-INVALID` / `K4-ID-001` | 識別子の文字規則またはUnicode NFC違反               |
| `K4-REF-001`                  | 参照先が未定義                                      |
| `K4-REF-002`                  | 参照先アセットの`kind`が用途と一致しない            |
| `K4-REF-003`                  | コスチュームの`target`がアクターと一致しない        |
| `K4-ASSET-001`                | `file`が安全なローカル相対パスではない              |
| `K4-BRANCH-001`               | 分岐の末尾が`else`ではない                          |
| `K4-STABLE-ID-001`            | `stableId`が文書内で重複している                    |
| `K4-KEY-UNSUPPORTED`          | 対応外のキーやmodifierを指定した                    |
| `K4-KEY-001`                  | navigation keymapと作品内キー入力が衝突した         |
| `K4-INCLUDE-CYCLE`            | include文による読み込み関係に循環がある             |
| `K4-INCLUDE-LIMIT-001`        | ソース件数、合計バイト数、include深度の上限超過       |
| `K4-SOURCE-SIZE-001`          | ソース一件のバイト数が上限を超えた                    |
| `K4-DECLARATION-DUPLICATE`    | include文で読み込んだファイル内で同じ宣言が重複した |

runtime接続後は、action、scene、branch、port、戻り値などの実行時エラーにも`K4-RUNTIME-*`診断を
使用します。入力バイト数、YAML node数、nesting深度、scalar長、シーン数、アクション数、アセット数、
診断数には安全上の有限上限があります。include文の各上限はpreview／buildのCLI引数とhost設定で明示し、
一件のソースと全ファイルの合計／合成後ソースを別の責務として検証します。

## 作成時のチェックリスト

- [ ] ファイルをUTF-8で保存し、新規ソースでは`.k4.yml`を使用した
- [ ] 先頭が`kamishibai: '4.0'`になっている
- [ ] トップレベルとactionに未知のキーがない
- [ ] インデントに空白を使い、一つのaction itemへ命令を一つだけ書いた
- [ ] IDが文字または`_`で始まり、Unicode NFCになっている
- [ ] 背景、音、コスチューム、ポーズモデルの`kind`が参照箇所と一致している
- [ ] ポーズoverlayを使う場合、関節名、opacity、radius、width、minimumConfidenceが範囲内である
- [ ] コスチュームの`target`が使用するアクターと一致している
- [ ] `file`が宣言元sourceからproject内へ解決できる安全な相対パスになっている
- [ ] `include`にcycle、プロジェクトルート外のパス、同じnamespaceの重複宣言がない
- [ ] すべてのシーン、分岐、スタイル、アセット参照が定義済みである
- [ ] 各分岐の最後に一つだけ`else`がある
- [ ] `stableId`が文書全体で重複していない
- [ ] navigation用キーと作品内の遷移キーが衝突していない
- [ ] YAML以外の行形式commandを混在させていない
- [ ] 利用するreleaseでDSL 4.0と必要な機能フラグが有効であることを確認した

## 付録: 実装基準と実装根拠

ここから先は、公開状況や実装の追跡が必要な方のための付録です。台本を書くうえでは読み飛ばせます。

2026年8月20日のrc.8固定基準では、次の実装がTurboWarp-Kamishibaiへ入っています。

- 制限付きYAMLの解析、JSON Schema検証、参照関係の意味検証
- 行・列とStory Pathを保持するSource Map、`K4-*`診断
- 検証後の台本をimmutableな`StoryDocument`へ正規化するソースフロントエンド
- action実行、分岐、シーン遷移、停止を扱うpure runtime controller
- control profileの解決、キー入力adapter、時系列history reducer、runtime navigation control
- カメラプレビューのstory既定、scene固有の非stickyな左右反転指定、任意の操作UI
- TurboWarp TM 1.12.0を使う、関節とボーンのSVG overlay設定
- `Actor.say`／`Actor.think`の入力待ち、文字送り、音、portrait、animation、名前付き`bubbleStyles`
- `bubbleClosePolicies`と`closePolicy`による、秒数・入力待ち・両者のraceの名前付き再利用
- `Actor.moveTo`の`linear`、`easeIn`、`easeOut`、`easeInOut`
- `Actor.setTransparency`の即時指定、foreground／backgroundの線形変化
- `broadcastMessageAndWait`、`debugger`、`Actor.hide`／`setLayer`／`loop`
- rehearsal skip、bitmap論理解像度、asset／sceneのliteral ID
- include文で複数ソースを決定的に合成する処理、宣言元相対asset解決、自己完結SB3 packaging
- Web／CLIプレビューのtransactional reload、Source Map、packaging後のsource origin復元
- navigation入力と作品内input actionを一つのsemantic consumerへ限定する入力arbitration

builder、TurboWarp runtime surface、ブラウザー／CLIプレビューを含むend-to-end実装は完成しています。
ただし、完成した機能の一部は起動時固定・既定OFFの機能フラグで段階導入されます。実装完成は、
すべての公開releaseで自動的に有効になることを意味しません。

### 実装根拠を確認する場合

仕様の正本は、`turbowarp-kamishibai-app`リポジトリの
[紙芝居DSL 4.0 表層仕様](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/docs/design/dsl-4-surface.md)と
[JSON Schema](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/schema/dsl-4.schema.json)です。
カメラプレビュー操作UIは[Issue #388](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/388)、
ポーズoverlayは[Issue #624](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/624)、
`bubbleStyles`は[Issue #476](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/476)以降、
`Actor.moveTo.easing`は[Issue #398](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/398)、
`Actor.setTransparency`は[Issue #406](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/406)、
include文の複数ファイル対応は[Issue #417](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/417)から
上記commitまでにmergeされています。プロジェクトディレクトリ選択とYAML live reloadは
[Issue #390](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/390)、ローカルアセットの追加・内容更新のlive reloadは
[Issue #391](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/391)で実装されています。

## 関連資料

- [紙芝居DSL 4.0 Schemaリファレンス](dsl-4.0-schema-reference.md): 固定Schemaに基づくfield、型、制約、action一覧
- [DSL 4.0ランタイム変数ガイド](dsl-4.0-runtime-variable-guide.md): 実行中に参照できる変数と、その扱い方
- [3系作品の変換ガイド](dsl-3.2-to-4.0-conversion-guide.md): 3系の台本を4.0のYAMLへ変換する手順
- [紙芝居DSL 4.0 リリース履歴](dsl-4.0-history.md): 版ごとの追加機能と変更点
- [DSL 4.0表層仕様](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/docs/design/dsl-4-surface.md): 4.0の規範的な作者向け構文
- [DSL 4.0 JSON Schema](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/schema/dsl-4.schema.json): 機械可読な構造仕様
- [DSL 4.0 include文の複数ファイル対応](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/docs/design/dsl-4-source-include-preview.md): include、transaction、有限上限、rollback
- [DSL 4.0 ポーズoverlay実装 Issue #624](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/624): Schema、TurboWarp TM 1.12.0 composition API mapping、YAML opt-in、rollback
- [DSL 4.0総合fixture](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/29c0deadcb98badf94a0244c479ca896dc71f842/test/fixtures/dsl4/valid/comprehensive.kamishibai.yaml): schemaと意味検証を通る総合例
