# DSL 4.0 YAMLとブロック台本SB3の相互変換ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: YAML台本をTurboWarpのブロックで編集し、編集結果をYAMLへ戻したい方。\
確認日: 2026年10月17日。コマンドの公開版基準は`4.0.0-rc.22`、命令単位のブロック生成・読取は
[本体Issue #881](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/881)の未公開の開発版を対象にします。

## 最初に利用する版を確認する

**実命令ブロックを編集する手順には、Issue #881の修正を含む開発版が必要です。**
この修正は確認時点でローカル作業ツリーにあり、公開npm版には含まれていません。公開版rc.22を
インストールするだけでは、後述するシーンごとの命令ブロックを生成できません。

| 機能                                           | 公開版rc.22                              | Issue #881の開発版                                   |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| `author-block-dsl`                             | YAML全文を宣言ブロックの文字列入力へ保存 | シーンごとに実命令ブロックを接続して配置             |
| `export-block-dsl`                             | 従来の台本宣言を読み取り、YAMLを出力     | 従来形式に加え、編集した実命令ブロックからYAMLを復元 |
| シーン内の命令を追加・削除・並べ替えて書き戻す | 対応しない                               | 対応する                                             |

修正の公開版が決まるまでは、この表を公開済みの機能一覧と読み替えないでください。
開発版の利用環境を持たない場合は、次節の公開CLIの使い方と対応範囲を確認してください。

## 二つのコマンドの使い分け

| 目的                                | コマンド           | 必要な入力                          | 出力                                            |
| ----------------------------------- | ------------------ | ----------------------------------- | ----------------------------------------------- |
| SB3内の台本ブロックをYAMLへ書き出す | `export-block-dsl` | 台本宣言を含むSB3                   | 単一の`.k4.yml`、またはinclude文がある場合はZIP |
| YAMLからブロック台本SB3を作る       | `author-block-dsl` | YAML台本、ランタイム入りのベースSB3 | 編集用のSB3                                     |

対象は、本アプリの台本宣言ハットから接続されたブロックです。ハットは、台本の始まりを示す先頭の
ブロックを指します。Stage（ステージ）の宣言が主台本、Sprite（スプライト）の宣言が参照可能な別台本です。
通常のScratchプログラム全体をYAMLへ翻訳するコマンドではありません。

ブロック台本SB3は、台本を読む・編集するためのソースです。作品の再生用SB3を作る場合は、編集後の
台本を`build-dsl4`へ渡します。素材を含む作品のビルドは[台本作成ガイド](dsl-4.0-author-guide.md)を参照してください。

### 公開CLIを使う場合

Node.js 22.18.0以上の環境で、作業用フォルダーにCLIの版を固定してインストールします。
以下は公開rc.22の例で、生成される台本は従来の文字列方式です。
`base.sb3`には[rc.22のGitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.22)から
取得したStandard SB3を使用します。YAMLとベースSB3は、次のコマンドを実行するフォルダーへ置きます。

```sh
npm install --save-dev --save-exact @kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.22
npx --no-install turbowarp-kamishibai --version

npx --no-install turbowarp-kamishibai author-block-dsl \
  --input story.k4.yml --base base.sb3 --output story-blocks.sb3

npx --no-install turbowarp-kamishibai export-block-dsl \
  --input story-blocks.sb3 --output-dir exported --name story
```

include文がない台本なら、最後のコマンドは`exported/story.k4.yml`を生成します。
`--name`を省略すると、入力SB3のファイル名から出力名を決めます。
`--output`は生成するSB3のファイル名、`--output-dir`はYAMLの出力先フォルダーです。

## 開発版で実命令ブロックを編集して書き戻す

以下の手順は、Issue #881の修正を含む本体リポジトリの作業ツリーで実行します。
公開版を入れたフォルダーで`npx`を実行する方法とは切り替え、各コマンドを同じ開発版CLIで実行してください。

### 1. 開発版CLIと最小台本を準備する

本体リポジトリの直下で依存を復元し、CLIをビルドします。`output/block-script`を作業用フォルダーにします。

```sh
pnpm install --frozen-lockfile
pnpm run build:lib
mkdir -p output/block-script
node bin/turbowarp-kamishibai.mjs --version
```

開発版は公開版と同じ版番号を表示する場合があります。`--version`だけで修正の有無を判定せず、
Issue #881の修正がその作業ツリーに含まれることを確認してください。

`output/block-script/story.k4.yml`をUTF-8で保存します。この例は素材やカメラを使いません。

```yaml
kamishibai: '4.0'
scenes:
  opening:
    - wait: 1
    - goto: ending
  ending:
    - wait: 0
```

ランタイム入りのベースSB3を`output/block-script/base.sb3`として置きます。
ベースは新規の空白Scratchプロジェクトではなく、公開Standard SB3など、紙芝居ランタイムが入ったものを選びます。

### 2. YAMLをブロック台本SB3へ変換する

```sh
node bin/turbowarp-kamishibai.mjs author-block-dsl \
  --input output/block-script/story.k4.yml \
  --base output/block-script/base.sb3 \
  --output output/block-script/story-blocks.sb3
```

生成前にYAMLの構文・参照関係を検査します。不正な台本は生成に失敗します。
正常な場合は、シーンごとのまとまりの内側に`wait`、`goto`などの実命令ブロックを接続したSB3ができます。

### 3. TurboWarpでブロックを編集して保存する

1. [TurboWarp Editor](https://turbowarp.org/editor)を開き、ファイルメニューから
   `output/block-script/story-blocks.sb3`を読み込みます。既存の作品を編集している場合は先に保存してください。
2. 拡張の読み込みを許可し、ランタイムの案内が出た場合は「サンドボックスなしで実行する」を有効にして開き直します。
3. ステージのコードを選び、`when kamishibai DSL source`からつながるシーンのまとまりを探します。
   `opening`の内側に「1秒待つ」「endingへ移動する」に相当する命令があり、`ending`にも待機命令があります。
4. `opening`の待機時間を`1`から`2`へ変更します。命令の追加・削除・並べ替えも、同じシーンの内側で接続して行えます。
5. ファイルメニューからコンピューターへ保存し、保存されたファイルを
   `output/block-script/story-edited.sb3`へ移動します。次の手順では、この編集後のファイルを指定します。

緑の旗を押すことは書き戻しの条件ではありません。台本宣言は自動実行されず、保存されたブロックの入力と接続を
変換CLIが読み取ります。台本ハットから切り離した命令は書き出されません。
シーン名を変更した場合は、`goto`や入力経路の参照先も変更してください。

### 4. 編集後のSB3からYAMLへ書き戻す

```sh
node bin/turbowarp-kamishibai.mjs export-block-dsl \
  --input output/block-script/story-edited.sb3 \
  --output-dir output/block-script/exported --name story

node bin/turbowarp-kamishibai.mjs validate-dsl4 \
  --input output/block-script/exported/story.k4.yml --format pretty
```

`output/block-script/exported/story.k4.yml`を開きます。例の編集なら、次のように`opening`の待機時間が`2`になります。
引用符や字下げが元のYAMLと違っていても、命令と値を確認します。

```yaml
kamishibai: '4.0'
scenes:
  opening:
    - wait: 2
    - goto: ending
  ending:
    - wait: 0
```

書き戻したYAMLには、命令の入力変更・追加・削除・順序変更、シーン名・順序変更が反映されます。
元のYAML全文を別に保存して、その文字列へ戻す方式ではありません。
元ファイルはそのままにし、確認した書き戻し結果を次の制作に使ってください。

## 補助ブロックとJSON入力

命令には既存ランタイムの29種類のcore actionブロックを使います。台本の構造や、命令の標準入力にない属性は、
生成SB3に同梱する編集用拡張「Kamishibai Block Script」の補助ブロックで保持します。
これらをrc.22のランタイムパレットの公開ブロック数へ加えないでください。

| 補助ブロック    | 編集する内容                                                       |
| --------------- | ------------------------------------------------------------------ |
| `scene`         | シーン名とシーン属性。内側へ命令を接続する。                       |
| `property`      | 素材や変数などの台本設定。PATHはJSON配列、VALUEはJSON値。          |
| `actionOptions` | 安定IDや追加属性。内側の実命令と一緒に移動する。                   |
| `customAction`  | 登録済みの独自命令の対象・名前・JSON引数。対応する登録情報が必要。 |

JSONは、`{"seconds": 2}`のように名前と値を記述する形式です。
既存ブロックの`SPEC`・`ROUTES`・`STEPS`は公開契約どおりJSONを使います。
`actionOptions`で、実命令の入力値を重ねて指定することはできません。
入力欄とJSONの意味は[ランタイム ブロックリファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-block-reference.md)を参照してください。

## include文・互換性・書き戻しの制約

- **YAMLからの生成:** `author-block-dsl`は、公開版・開発版ともinclude文付きの新規生成には未対応です。
- **SB3からの書き出し:** `export-block-dsl`は、Stageの主台本とSpriteの参照台本を読み取れます。
  include文がある場合は、主台本と参照先を`story-k4.zip`へまとめ、内部の`story-k4/`へ保存します。
  参照されない台本、重複、参照先不明、循環はエラーになります。
- **従来形式:** 開発版でも、宣言ブロック内へYAML文字列を保持する従来形式を読み取れます。
  新形式を従来のCLIへ渡すことはできません。同じ修正を含むCLIで生成と書き戻しを行います。
- **対象のSB3:** 実行用の「台本埋め込みSB3」に台本宣言がない場合、このコマンドでは書き出せません。
- **保持するもの:** 台本の命令・順序・値を保持します。YAMLのコメント、空行、引用符の種類は保持しません。
- **入力の制約:** 動的なScratchの変数・リストや式は評価しません。ブロック数・入力長にも上限があります。

編集せずに往復した台本を機械比較するときは、`validate-dsl4 --format canonical-json`で得る正規形を使います。
編集して値を変えた場合は、正規形にもその差分が出ることを確認します。

## 変換に失敗したとき

| 表示・状態                       | 確認すること                                                         |
| -------------------------------- | -------------------------------------------------------------------- |
| `K4-BLOCK-SOURCE-MISSING-001`    | ステージに台本宣言ハットがあるか。実行用SB3と取り違えていないか。    |
| `K4-BLOCK-SOURCE-GRAPH-001`      | シーン内の接続、重複した宣言、使っているブロックの種類を確認する。   |
| JSONのエラー                     | 引用符・カンマ・括弧を確認する。JSON中の文字列には二重引用符を使う。 |
| シーンや素材の参照エラー         | 改名したシーンや素材に合わせ、命令側の参照も変更する。               |
| 命令単位のブロックが生成されない | 公開rc.22と開発版のCLIを混同していないか確認する。                   |

不正な編集結果から、それらしいYAMLを生成することはありません。表示された原因を修正し、編集後のSB3を保存して再実行します。

## 関連資料

- [DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md)
- [DSL 4.0ランタイム ブロックリファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-block-reference.md)
- [ソフトウェアメンテナンスガイド](../developer-guides/developer-guide-4.0.md)
- [文書Issue #180: 標準4形式とブロック台本](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/180)
- [本体Issue #881: 実命令ブロックの生成と編集結果の書き戻し](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/881)
