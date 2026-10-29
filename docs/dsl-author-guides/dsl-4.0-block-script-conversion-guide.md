# DSL 4.0 YAMLとブロック台本SB3の相互変換ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

現在の公開App・Schema・サンプルの参照版は**4.0.0-rc.71**です。[対応Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.71)のSB3を使います。CLIは[公開tagから準備する手順](dsl-4.0-block-script-conversion-guide.md#cli-from-release-source)で準備できます。同版のnpm公開状態は[4.0の入口](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)で確認し、公開済みnpmを使う場合もSB3と版を揃えてください。個別検証記録・図版の`4.0.0-rc.41`などは作成当時の版を示します。

対象: YAML台本をTurboWarpのブロックで編集し、編集結果をYAMLへ戻したい方。\
確認日: 2026年10月21日。公開プレリリース`4.0.0-rc.41`を対象にします。正式版4.0.0は未公開です。

## rc.68からの簡易方式について

asset・actor・cover・startSceneIndexの省略と、JSON不要のsay/thinkは、[簡易方式の説明](../block-author-guides/dsl-4.0-block-author-guide.md#simple-native-blocks)を参照してください。公開rc.68以降のCLI・Standard SB3・サンプルを同じ版へ揃えて使います。以下の旧版に固定した実習・検証記録とは版を区別し、現在の対応版は[4.0の入口](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)で確認してください。簡易版ではセリフをTEXT欄、秒数をSECONDS欄で編集します。旧SPEC版の編集手順と台本も引き続き利用できます。

<a id="公開サンプルをフォーム編集で開く"></a>

## 公開サンプルをTurboWarp-Plus-Editorで編集する

次のボタンから、公開済みのブロック台本SB3を日本語のTurboWarp-Plus-Editorへ直接読み込めます。

- 地震安全チュートリアルのブロック台本： <a class="twpe-edit-button" href="https://kubohiroya.github.io/turbowarp-plus-editor/editor.html?lang=ja&amp;project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-kamishibai-samples%2Fstories%2Ftutorial%2Ftutorial-blocks-4.0.sb3"><img src="https://kubohiroya.github.io/turbowarp-plus-editor/assets/icon.svg" width="32" height="32" alt="" aria-hidden="true">TurboWarp-Plus-Editorで編集</a>
- 浦島太郎のブロック台本： <a class="twpe-edit-button" href="https://kubohiroya.github.io/turbowarp-plus-editor/editor.html?lang=ja&amp;project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-kamishibai-samples%2Fstories%2Furashima%2Furashima-blocks-4.0.sb3"><img src="https://kubohiroya.github.io/turbowarp-plus-editor/assets/icon.svg" width="32" height="32" alt="" aria-hidden="true">TurboWarp-Plus-Editorで編集</a>

拡張の読み込み確認では、名前と配布元を確認し、「必要」と表示された「サンドボックスなし」を明示的に選んで「OK」を押します。
アイコンの意味、選べない理由、拒否・キャンセルの操作は[機能拡張セキュリティの説明](../user-guides/user-guide-4.0.md#extension-security)を参照してください。
ステージのコードにある専用定義ブロックの白い書類アイコンを押すと、JSONをフォームで編集できます。
編集後は、EditorのファイルメニューからSB3をコンピューターへ保存します。

## 最初に利用する版を確認する

公開rc.41には、実命令ブロックの生成・読取、ラベルとincludeBlocks、8種類の定義ブロック、
専用定義のフォーム編集、組み込み台本からの直接再生が含まれます。
rc.41では、8種類の定義フォームに加え、`recognize actor [TARGET] pose steps [STEPS]`の
`STEPS`を編集する「ポーズ認識の手順」フォームを利用できます。各手順の`pose`は必須、`skin`・`sound`は任意です。
以前に作ったSB3の編集用拡張は自動更新されません。rc.71のCLIで編集用SB3を再生成してください。
Node.js 24.0.0以上で公開CLIを版固定して使います。公開npmパッケージを使う場合は、本体リポジトリのcheckoutや`build:lib`は不要です。公開tagから準備する場合は、後述のビルド手順に従います。
旧rc.22のハットとYAML全文を文字列で持つ方式は、rc.41の読取対象ではありません。元YAMLから再生成してください。

## 二つのコマンドの使い分け

| 目的                                | コマンド           | 必要な入力                          | 出力                                            |
| ----------------------------------- | ------------------ | ----------------------------------- | ----------------------------------------------- |
| SB3内の台本ブロックをYAMLへ書き出す | `export-block-dsl` | 台本宣言を含むSB3                   | 単一の`.k4.yml`、またはinclude文がある場合はZIP |
| YAMLからブロック台本SB3を作る       | `author-block-dsl` | YAML台本、ランタイム入りのベースSB3 | 編集・再生できるSB3                             |

対象は、本アプリの台本宣言ハットから接続されたブロックです。ハットは、台本の始まりを示す先頭の
ブロックを指します。Stage（ステージ）の名前が空の宣言がルートです。名前付き宣言はStage/Spriteに置ける
モジュールで、includeBlocksから参照します。通常のScratchプログラム全体をYAMLへ翻訳するコマンドではありません。

rc.41のブロック台本SB3は、緑の旗で起動してタイトルを閉じると、その台本から物語を開始します。
編集後に物語を開始し直すと現在のブロックを読み直します。実行中の自動反映ではありません。
再生後は赤い停止ボタンで止め、フォームの値を保存してから緑の旗を押し、タイトルを閉じます。
rc.41では、前の再生のカメラ許可が保留されていても、古い開始処理を待たずに再起動できます。
不正な台本は診断を表示し、ファイル選択へ自動で切り替えません。
file素材には対応するアセットバンドルがSB3内に必要です。素材の準備は下の「file素材を含む台本を準備する」と
[台本作成ガイド](dsl-4.0-author-guide.md)を参照してください。

<a id="cli-from-release-source"></a>

### 公開tagのCLIを使う場合

Node.js 24.0.0以上とpnpm 11の環境で、作業用フォルダーに公開tagのCLIを固定します。rc.71のGitHub ReleaseとSB3に揃えて、次の手順で公開tagのソースをビルドしてローカル導入します。同版のnpm公開状態は[4.0の入口](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)で確認できます。mainや別作業ブランチは使いません。
以下は公開rc.71で、素材を使わない単一台本を生成・書き戻しする例です。
`base.sb3`には[rc.71のGitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.71)から
取得したStandard SB3を使用します。YAMLとベースSB3は、次のコマンドを実行するフォルダーへ置きます。
rc.41は`ajv@8.20.0`を実行時依存に含むため、Ajvの追加導入は不要です。

```sh
git clone --depth 1 --branch v4.0.0-rc.71 https://github.com/kubohiroya/turbowarp-kamishibai-app.git .tools/kamishibai-rc71
pnpm --dir .tools/kamishibai-rc71 install --frozen-lockfile
pnpm --dir .tools/kamishibai-rc71 run build:lib
npm install --save-dev --save-exact ./.tools/kamishibai-rc71
npx --no-install turbowarp-kamishibai --version

npx --no-install turbowarp-kamishibai author-block-dsl \
  --input story.k4.yml --base base.sb3 --output story-blocks.sb3

npx --no-install turbowarp-kamishibai export-block-dsl \
  --input story-blocks.sb3 --output-dir exported --name story
```

include文がない台本なら、最後のコマンドは`exported/story.k4.yml`を生成します。
`--name`を省略すると、入力SB3のファイル名から出力名を決めます。
`--output`は生成するSB3のファイル名、`--output-dir`はYAMLの出力先フォルダーです。

<a id="cli-ajv-workaround"></a>

### rc.23・rc.25でAjvが見つからずCLIが起動しない場合

この節は、公開`4.0.0-rc.23`・`4.0.0-rc.25`を固定して使う環境向けです。
rc.41は`ajv@8.20.0`を実行時依存に含むため、以下の追加導入は不要です。

旧版を新規導入すると、`--version`や`export-block-dsl`などが
`ERR_MODULE_NOT_FOUND`で停止し、`ajv/dist/2020.js`が見つからないことがあります。
rc.23・rc.25の公開パッケージは実行時にAjv 8を使いますが、開発用依存にしか宣言されておらず、
CLIの利用側に必要な依存が導入されないためです。

旧版を使い続ける場合は、CLIをインストールした作業用フォルダーで、次を追加実行します。
CLI本体や台本は変更しません。

```sh
npm install --save-dev --save-exact ajv@8.20.0
npx --no-install turbowarp-kamishibai --version
```

表示が利用中の固定版（`4.0.0-rc.23`または`4.0.0-rc.25`）のままであることを確認し、
書き出し・検査・ビルドを再実行します。CLIの版を下げる必要はありません。
既存の公開rc.23・rc.25の依存宣言は、後続版で修正しても変わりません。
新規導入では前節のrc.71を使ってください。

## 実命令ブロックを編集して書き戻す

以下も、上で公開rc.71をインストールした作業用フォルダーで実行します。
各コマンドは`npx --no-install`でローカルの固定CLIを使います。

### 1. 最小台本を準備する

```sh
mkdir -p output/block-script
npx --no-install turbowarp-kamishibai --version
```

表示が`4.0.0-rc.71`であることを確認します。

`output/block-script/story.k4.yml`をUTF-8で保存します。この例は素材やカメラを使いません。

```yaml
kamishibai: '4.0'
controls:
  keymaps:
    production:
      Space: navigation.nextAction
scenes:
  opening:
    - wait: 1
    - goto: ending
  ending:
    - wait: 0
```

ルートからの再生は`production`を選ぶため、この名前の操作プロファイルを定義します。
例では`Space`を`navigation.nextAction`へ割り当てます。空のキーマップはSchemaで受理しません。

ランタイム入りのベースSB3を`output/block-script/base.sb3`として置きます。
ベースは新規の空白Scratchプロジェクトではなく、公開Standard SB3など、紙芝居ランタイムが入ったものを選びます。

### 2. YAMLをブロック台本SB3へ変換する

```sh
npx --no-install turbowarp-kamishibai author-block-dsl \
  --input output/block-script/story.k4.yml \
  --base output/block-script/base.sb3 \
  --output output/block-script/story-blocks.sb3
```

生成前にYAMLの構文・参照関係を検査します。不正な台本は生成に失敗します。
正常な場合は、シーンごとのまとまりの内側に`wait`、`goto`などの実命令ブロックを接続したSB3ができます。

### 3. TurboWarpでブロックを編集して保存する

1. <a class="twpe-edit-button" href="https://kubohiroya.github.io/turbowarp-plus-editor/editor.html?lang=ja"><img src="https://kubohiroya.github.io/turbowarp-plus-editor/assets/icon.svg" width="32" height="32" alt="" aria-hidden="true">TurboWarp-Plus-Editorで編集</a>を開き、ファイルメニューから
   `output/block-script/story-blocks.sb3`を読み込みます。既存の作品を編集している場合は先に保存してください。
2. 拡張の名前と配布元を確認し、「必要」と表示された「サンドボックスなし」を選んで「OK」を押します。
3. ステージのコードを選び、台本ハットからつながるシーンのまとまりを探します。
   ルートのハットは`kamishibai [4.0] []`で、名前欄を空にします。旧`when kamishibai DSL source`は廃止しています。
   `opening`の内側に「1秒待つ」「endingへ移動する」に相当する命令があり、`ending`にも待機命令があります。
4. `opening`の待機時間を`1`から`2`へ変更します。命令の追加・削除・並べ替えも、同じシーンの内側で接続して行えます。
5. ファイルメニューからコンピューターへ保存し、保存されたファイルを
   `output/block-script/story-edited.sb3`へ移動します。次の手順では、この編集後のファイルを指定します。

緑の旗を押すことは書き戻しの条件ではありません。ハット自体はイベントとして発火せず、ランタイムと
変換CLIがブロックの入力と接続を読み取ります。緑の旗で起動してタイトルを閉じ、変更した待機時間でも再生を確認します。台本ハットから切り離した命令は書き出されません。
シーン名を変更した場合は、`goto`や入力経路の参照先も変更してください。

### 4. 編集後のSB3からYAMLへ書き戻す

```sh
npx --no-install turbowarp-kamishibai export-block-dsl \
  --input output/block-script/story-edited.sb3 \
  --output-dir output/block-script/exported --name story

npx --no-install turbowarp-kamishibai validate-dsl4 \
  --input output/block-script/exported/story.k4.yml --format pretty
```

`output/block-script/exported/story.k4.yml`を開きます。例の編集なら、次のように`opening`の待機時間が`2`になります。
引用符や字下げが元のYAMLと違っていても、命令と値を確認します。

```yaml
kamishibai: '4.0'
controls:
  keymaps:
    production:
      Space: navigation.nextAction
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

## file素材を含む台本を準備する

`author-block-dsl`はfile素材の実体を新しく埋め込む処理ではありません。
まずYAMLと元の素材からアセットバンドル入りのSB3を作り、そのSB3を`--base`にしてブロック台本を生成します。
以下は単一台本の例です。`file`は`--project-root`で指定したフォルダーからの相対位置に揃えます。
登場人物を使う場合は、台本のアクターIDと同名のScratchスプライトを先にベースSB3へ用意します。
`build-dsl4`はfile素材や`actors`宣言からScratchスプライトを新規生成しません。

```sh
npx --no-install turbowarp-kamishibai build-dsl4 \
  --base output/block-script/base.sb3 \
  --project-root output/block-script --source story.k4.yml \
  --output output/block-script/story-assets.sb3 \
  --control-profile production --channel bundled --replace-existing

npx --no-install turbowarp-kamishibai author-block-dsl \
  --input output/block-script/story.k4.yml \
  --base output/block-script/story-assets.sb3 \
  --output output/block-script/story-blocks.sb3
```

生成物はベースの素材bundleを保持し、空名ルートの台本から直接再生できます。元の素材フォルダーも保持します。
セリフ・待機・シーン接続などの編集は、同じSB3で物語を開始し直して確認できます。
file素材を追加したり、そのパス・内容を変更したりした場合は、編集後SB3から最新のYAMLを書き出し、
元の素材フォルダーに置いて検査します。単一台本なら、次のように元の`story.k4.yml`とは別名で保存します。

```sh
npx --no-install turbowarp-kamishibai export-block-dsl \
  --input output/block-script/story-edited.sb3 \
  --output-dir output/block-script --name form-edited

npx --no-install turbowarp-kamishibai validate-dsl4 \
  --input output/block-script/form-edited.k4.yml --format pretty

npx --no-install turbowarp-kamishibai build-dsl4 \
  --base output/block-script/story-edited.sb3 \
  --project-root output/block-script \
  --source form-edited.k4.yml \
  --output output/block-script/story-rebuilt.sb3 \
  --control-profile production --channel bundled --replace-existing
```

書き出しと検査に成功してから、編集後SB3を`--base`、書き出したYAMLを`--source`へ渡します。
`--source`は`--project-root`内のファイル名で、`file`の参照先も同じフォルダーからの相対位置に揃えます。
公開rc.71のCLIは、`--source`を省略すると外部YAMLを探すため、元の`project.source.json`に記録された
編集前の台本を読み込むことがあります。元のYAMLを再利用せず、最新の書き戻し結果を明示してください。
検査に失敗した場合は、古いYAMLを代わりにビルドしません。
実習手順は[ブロック版チュートリアル](../tutorials/create-blocks.md)を参照してください。

## ラベルとincludeBlocksで台本を分割する

公開rc.71のCLIで生成・読取・書き戻しを行います。

### 1. include付きのYAMLを準備する

同じフォルダーに、主台本`story.k4.yml`と参照先`shared.k4.yml`を置きます。
主台本にだけ`kamishibai: '4.0'`を書きます。

```yaml
# story.k4.yml
kamishibai: '4.0'
include: shared.k4.yml
controls:
  keymaps:
    production:
      Space: navigation.nextAction
scenes:
  opening:
    - goto: ending
```

```yaml
# shared.k4.yml
scenes:
  ending:
    - wait: 1
```

### 2. ラベル付きブロック台本を生成する

```sh
npx --no-install turbowarp-kamishibai author-block-dsl \
  --input output/block-script/story.k4.yml \
  --base output/block-script/base.sb3 \
  --output output/block-script/story-blocks.sb3
```

Stageに、ラベルが空欄の主台本と`shared.k4.yml`というラベルの別台本を並べます。
概念上は次の配置です。`scene`の内側には実際の命令ブロックが入ります。

```text
kamishibai [4.0] []
  includeBlocks [shared.k4.yml]
  scene [opening]
    goto [ending]

kamishibai [4.0] [shared.k4.yml]
  scene [ending]
    wait [1]
```

`kamishibai [4.0] [ラベル]`が台本ソースの入口と版・識別名の宣言を兼ねます。
再生開始やイベント受信のブロックではありません。旧`when kamishibai DSL source`と併用しません。

ベースは公開rc.41のランタイムを埋め込んだSB3を使います。file素材がある場合は、先に対応bundleを埋め込んだSB3を使います。
ランタイムを外部URLから参照するベースは使えません。ベース自体や公開済み配布物は書き換えません。

入れ子のincludeもたどり、各ファイルを別の台本宣言にします。
自動生成するラベルは、入力した主台本のフォルダーを基準にした相対ソースパスです。
`chapters/intro.k4.yml`内の`include: ../shared.k4.yml`なら、参照ラベルは`shared.k4.yml`になります。
素材の`file:`も同じプロジェクト基準へ補正し、モジュールを平らなファイル構成へ戻しても参照先の意味を維持します。
素材ファイル自体はYAMLのZIPへ同梱されません。入力プロジェクトの素材を保持してください。

### 3. TurboWarpで編集・保存する

- 同じStageに複数の台本を置けます。名前付き台本をSpriteへ移しても、同じSB3内ならラベルで参照できます。
- ラベルは大文字・小文字や空白を区別する完全一致です。日本語も使えます。空文字以外のラベルはSB3全体で一意にします。
- Stage上の名前が空の宣言を1個だけルートにします。名前付き宣言だけなら、1個でもルート不在のエラーです。
  ラベル空欄の宣言は各targetに1個までです。Sprite上の既存の空名宣言は従来のモジュール読取互換を保ち、ルートにはしません。
- `includeBlocks`は台本宣言直下へ接続します。シーンや命令の内側には置けません。宣言直下ではシーンの前後に置けます。
  参照は物語開始時やCLIの処理時に台本全体を合成するincludeです。その位置で再生を中断して別台本を呼び出す命令ではありません。
- 複数の`includeBlocks`は接続順に処理します。YAMLのincludeと同じ合成規則を使い、同名シーンなどを上書きしません。
- ラベルを`共通`へ変更したら、参照元の`includeBlocks`も`共通`へ変更します。参照を自動で付け替える機能はありません。
- `ending`の待機時間を`1`から`2`へ変更し、`story-edited.sb3`として保存します。

### 4. 分割YAMLへ書き戻す

```sh
npx --no-install turbowarp-kamishibai export-block-dsl \
  --input output/block-script/story-edited.sb3 \
  --output-dir output/block-script/exported --name story
```

出力は`exported/story-k4.zip`です。展開すると、この例では次の2ファイルになります。

```text
story-k4/
  story.k4.yml
  blocks-0001.k4.yml
```

主台本のincludeは`blocks-0001.k4.yml`を指し、そのファイルの`ending`には`wait: 2`が書かれます。
参照関係とモジュールの分割を保ち、主台本へ全命令を展開してしまうことはありません。
ラベルをファイルパスとして直接使わず、空でないラベルの辞書順に`blocks-0001.k4.yml`などの名前を割り当てます。
ラベルの改名や追加で連番が変わる場合も、includeは対応する出力先へ書き換わります。
既存のラベルなし台本のファイル名や`--name`の出力名と衝突した場合はエラーにします。

展開後の主台本を`author-block-dsl --input`へ渡せば、再びブロック台本を生成できます。
再生用SB3は、書き戻したYAMLから次のようにビルドできます。例ではZIPを`exported/`へ展開済みとします。

```sh
npx --no-install turbowarp-kamishibai build-dsl4 \
  --base output/block-script/base.sb3 \
  --project-root output/block-script/exported/story-k4 \
  --source story.k4.yml --enable-source-includes \
  --max-source-files 64 --max-total-source-bytes 1048576 --max-include-depth 32 \
  --output output/block-script/story-play.sb3 \
  --control-profile production --channel bundled --replace-existing
```

素材がある台本では、補正された`file:`が指すファイルを、このプロジェクトの同じ相対位置に配置します。
`validate-dsl4`は単一ソースの検証なので、include付き主台本だけの検証では参照先を合成しません。
分割後の検証には、include対応の生成・export・buildを使います。

### エラー・上限・切り戻し

存在しないラベル、空の参照ラベル、重複ラベル、自己参照・循環、壊れた接続はエラーです。
ラベルへScratch変数や式を差し込むことはできません。参照されない台本が残っている場合もYAML exportは失敗します。
新しいハットのバージョン欄は文字列`4.0`に固定します。ラベル欄のない既存台本は空文字として扱います。
台本の入口は`kamishibai [4.0] [ラベル]`ハットに統一します。旧`when kamishibai DSL source`や旧YAML文字列方式の読取互換はありません。
旧SB3は元のYAMLから再生成してください。旧ハットを前段に置く構成にはしません。

生成CLIの既定上限は64ファイル、各ソース1 MiB、合計4 MiB、include深さ32です。
`--max-source-files`・`--max-source-bytes`・`--max-total-source-bytes`・`--max-include-depth`で指定します。
共通frontendの合成後ソース上限は1 MiB以内です。ブロック読取では宣言数256、各targetのブロック数8192にも上限があります。

問題があれば元の分割YAMLと編集後のSB3を退避し、新しいinclude生成を使わず、以前のCLIで単一台本を生成します。
この追加による通常ランタイムの配布物の置換や、既存作品の自動移行は行いません。

## 補助ブロックとJSON入力

命令には既存ランタイムの29種類のcore actionブロックを使います。台本の構造や、命令の標準入力にない属性は、
生成SB3に同梱する編集用拡張「Kamishibai Block Script」の補助ブロックで保持します。
これらは生成SB3の編集用拡張に属し、通常ランタイムのcore actionの数とは分けて扱います。

| 補助ブロック                                                 | 編集する内容                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `kamishibai`（#883）                                         | バージョン4.0とラベル（既定は空文字）。台本の先頭。                |
| `includeBlocks`（#883）                                      | 同じSB3の名前付き台本への参照。宣言直下に接続する。                |
| `scene`                                                      | シーン名とシーン属性。内側へ命令を接続する。                       |
| `asset`、`control`、`actor`、`textStyle`、`variable`（#886） | 名前付き定義。`NAME`とJSONの`VALUE`を入力する。                    |
| `cover`、`loading`、`recognition`（#886）                    | 台本に一つの設定。名前欄なしでJSONの`VALUE`を入力する。            |
| `property`                                                   | 旧形式と専用ブロックのない設定の保持用。新パレットでは非表示。     |
| `actionOptions`                                              | 安定IDや追加属性。内側の実命令と一緒に移動する。                   |
| `customAction`                                               | 登録済みの独自命令の対象・名前・JSON引数。対応する登録情報が必要。 |

JSONは、`{"seconds": 2}`のように名前と値を記述する形式です。
既存ブロックの`SPEC`・`ROUTES`・`STEPS`は公開契約どおりJSONを使います。
`actionOptions`で、実命令の入力値を重ねて指定することはできません。
入力欄とJSONの意味は[ランタイム ブロックリファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-block-reference.md)を参照してください。

## 種類別定義ブロックと旧SB3の移行

公開rc.71のCLIは素材を`asset`、登場人物を`actor`などの専用ブロックで生成します。
例えば`asset`は`NAME`に`HeroIdle`、`VALUE`に`"costume:Hero"`を、`actor`は
`NAME`に`Hero`、`VALUE`に`"HeroIdle"`を入力します。`NAME`にJSONパスや引用符は不要です。
`control`はキーマップごとに1個、`variable`の値は数値・真偽値・文字列です。
フォームは対応Editorの`blockEditorDialogs=1`で有効になります。編集用拡張をサンドボックスなしで読み込み、
配置した専用ブロックの左端の書類アイコンを押します。古い編集用SB3は、専用ブロックを持つものも含め、
公開rc.71のCLIでYAMLへ書き戻して再生成してください。
8種類の実フォーム画面・用途・入力例は[ブロック版ガイド](../block-author-guides/dsl-4.0-block-author-guide.md#種類別の定義ブロック)を参照してください。

`story property [PATH] = JSON [VALUE]`は旧形式の読取と、専用ブロックがない設定の保持に使います。
新しい編集用拡張のパレットでは非表示です。素材やアクターの新規登録には、上の専用ブロックを使います。
`branches`、`bubbleStyles`、`bubbleClosePolicies`、`presentation`、`audio`は引き続き生成済みの
`story property`を編集します。`PATH`は1〜2要素のJSON配列、`VALUE`はJSON値です。
名前付き項目がない明示的な空マッピングも、この形式で保持します。

旧`story property`を含む編集用SB3は、公開rc.71のCLIの`export-block-dsl`でYAMLへ戻し、
`author-block-dsl`で再生成すると専用ブロックへ移行できます。古いSB3に埋め込まれた編集用拡張は
パレットが自動更新されないため、CLIを更新するだけでは専用ブロックを追加できません。
旧ハットやYAML全文の文字列方式は読取対象外なので、元のYAMLから再生成します。

同じ名前の定義、`cover`などの単一設定の重複、旧`story property`と専用ブロックによる
同じ範囲への書込はエラーです。改名時には、命令などの参照先も作者が変更します。
元のYAMLと編集前SB3を保持してください。切り戻す場合は、専用ブロックの編集結果を対応CLIでYAMLへ
退避してから、変更前CLIでそのYAMLから再生成します。専用ブロックを含むSB3は旧CLIでの読取を保証しません。

<a id="section-roundtrip"></a>

## オン／オフを保持して往復する（本体PR #903対応）

公開rc.71のCLIとベースSB3は、本体[PR #903](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/903)の
「この部分を使う［オン／オフ］」に対応しています。操作と実画面は
[ブロック版ガイド](../block-author-guides/dsl-4.0-block-author-guide.md#use-section)を参照してください。
旧rc.23には`--block-sections`と対応する読み取り処理がありません。

### 対応するCLIとベースSB3を準備する

前節の公開rc.71のCLIを版固定した作業用フォルダーで実行します。CLIは最初に公開tagから一度ビルドし、以後は同じ固定CLIを使います。
公開rc.71のStandard SB3を`base.sb3`として用意し、元の台本・SB3を保持してください。
以下は素材を使わない単一台本`story.k4.yml`を使う例です。台本は前の最小例のように`production`のキーマップを定義します。
まず台本を組み込んだベースを生成し、編集用拡張のパレット表示を有効にします。

```sh
npx --no-install turbowarp-kamishibai build-dsl4 \
  --base base.sb3 --project-root . --source story.k4.yml \
  --output section-base.sb3 --control-profile production --channel bundled --replace-existing

npx --no-install turbowarp-kamishibai author-block-dsl \
  --input story.k4.yml --base section-base.sb3 --output section-blocks.sb3 --block-sections true
```

`sourceSections`は生成時に固定するパレット表示フラグで、既定falseです。
`--block-sections true`は新規ブロックをパレットに表示します。古いベースへこの指定だけを加えても、
そのベースの再生ランタイムは更新されません。rc.71のベースを使ってください。
file素材やScratchスプライトがある作品は、前節の素材準備の条件も適用します。

<a id="section-appearance-cli"></a>

### グレー表示・絵文字メニューを使う

「✅ オン／🚫 オフ」、専用グレー、オフ範囲の灰色・斜線背景は、
[本体PR #909](https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/909)で追加した表示です。
公開rc.41にも含まれるため、前節でインストールしたCLIをそのまま使えます。
CLIは最初に公開tagから一度ビルドし、以後は同じ固定CLIを使います。前節で生成した`section-base.sb3`と同じ台本を使い、
次のように編集用SB3を生成します。

```sh
npx --no-install turbowarp-kamishibai author-block-dsl \
  --input story.k4.yml --base section-base.sb3 --output section-blocks.sb3 --block-sections true
```

公開rc.41のランタイムで直接再生でき、保存値や復元用コメントの形式は従来と同じです。
書き戻したYAMLから再生成するときも、同じ公開rc.71のCLIを使います。
rc.25以前のCLIで生成すると、オン／オフの意味を保ったまま以前の表示になります。
エディターの`Scratch.gui.getBlockly()` APIがない場合は、専用色と絵文字セレクタを表示し、
オフ範囲の灰色・斜線装飾は追加しません。

### 編集・保存・書き戻し・再生成

1. `section-blocks.sb3`をEditorで開き、命令列または定義列を囲み、オン／オフを選びます。
2. ファイルメニューから`section-edited.sb3`として保存します。
3. 同じ対応CLIでYAMLへ書き戻し、必要ならそのYAMLから再生成します。

```sh
npx --no-install turbowarp-kamishibai export-block-dsl \
  --input section-edited.sb3 --output-dir section-exported --name story

npx --no-install turbowarp-kamishibai author-block-dsl \
  --input section-exported/story.k4.yml --base section-base.sb3 \
  --output section-restored.sb3 --block-sections true
```

実行する命令・定義は通常のYAML、無効部分と囲み構造はサイズ制限付きの
`# kamishibai-block-sections-v1:`復元用コメントに入ります。オンなら1・2・3秒、オフなら1・3秒と
なる待機の例でも、2秒の命令を復元できます。元のYAMLのコメント・引用符・空行を保存する機能ではありません。

本文を独立に編集して復元状態と食い違った場合は、`K4-BLOCK-SOURCE-SECTION-STATE-001`で止めます。
SB3を保持してブロック側で編集するか、YAML直接編集へ移る場合はSB3を退避してから復元用コメントを削除します。
削除後のYAMLではオフ部分と囲み構造が失われます。旧CLIによる往復では、編集状態の保持を保証しません。

切り戻しは`--block-sections false`で新規パレット表示を隠します。保存済みブロックの読取互換性は残ります。
旧rc.23へ戻る場合は、有効部分のYAMLと対応版で保存した編集用SB3を別々に退避し、旧版用のSB3を再生成してください。

## include文・対象形式・書き戻しの制約

- **YAMLからの生成:** 公開rc.41では、前節のラベル付き宣言とincludeBlocksでinclude付き台本を生成できます。
- **SB3からの書き出し:** `export-block-dsl`は、Stageの主台本とSpriteの参照台本を読み取れます。
  include文がある場合は、主台本と参照先を`story-k4.zip`へまとめ、内部の`story-k4/`へ保存します。
  参照されない台本、重複、参照先不明、循環はエラーになります。
- **対象形式:** 公開rc.71のCLIは新ハット配下の実ブロックだけを読み取ります。旧ハットとYAML文字列方式は非対応です。
  元のYAMLから新形式を生成し、同じ公開rc.71のCLIで編集結果を書き戻します。
- **対象のSB3:** 実行用の「台本埋め込みSB3」に台本宣言がない場合、このコマンドでは書き出せません。
- **保持するもの:** 台本の命令・順序・値を保持します。通常のYAMLコメント、空行、引用符の種類は保持しません。オン／オフの復元情報だけは専用コメントとして書き出します。
- **入力の制約:** 動的なScratchの変数・リストや式は評価しません。ブロック数・入力長にも上限があります。

編集せずに往復した台本を機械比較するときは、`validate-dsl4 --format canonical-json`で得る正規形を使います。
編集して値を変えた場合は、正規形にもその差分が出ることを確認します。

## 変換に失敗したとき

| 表示・状態                       | 確認すること                                                           |
| -------------------------------- | ---------------------------------------------------------------------- |
| `K4-BLOCK-SOURCE-MISSING-001`    | Stageに名前が空のルート台本が1個あるか。名前付きだけになっていないか。 |
| `K4-BLOCK-SOURCE-GRAPH-001`      | シーン内の接続、重複した宣言、使っているブロックの種類を確認する。     |
| `K4-BLOCK-SOURCE-LABEL-001`      | 参照ラベルが空欄・未定義でないか。入力が静的な文字列か。               |
| `K4-BLOCK-SOURCE-CYCLE-001`      | includeBlocksの自己参照・循環を解消する。                              |
| `K4-BLOCK-SOURCE-DUPLICATE-001`  | ラベル・入口・出力ファイル名の重複を解消する。                         |
| `K4-BLOCK-SOURCE-VERSION-001`    | 新しい台本ハットのバージョン欄を文字列4.0にする。                      |
| `K4-BLOCK-SOURCE-REMOVED-001`    | 旧ハットは非対応。元のYAMLから新ハットのSB3を再生成する。              |
| JSONのエラー                     | 引用符・カンマ・括弧を確認する。JSON中の文字列には二重引用符を使う。   |
| シーンや素材の参照エラー         | 改名したシーンや素材に合わせ、命令側の参照も変更する。                 |
| 命令単位のブロックが生成されない | 固定CLIが4.0.0-rc.71か確認し、旧YAMLから再生成する。                   |

不正な編集結果から、それらしいYAMLを生成することはありません。表示された原因を修正し、編集後のSB3を保存して再実行します。

## 関連資料

- [公開チュートリアルの素材入りブロック台本SB3](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/tutorial/tutorial-blocks-4.0.sb3)
- [公開浦島太郎の素材入りブロック台本SB3](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/urashima-blocks-4.0.sb3)

- [DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md)
- [DSL 4.0ランタイム ブロックリファレンス](../turbowarp-programmer-guides/dsl-4.0-runtime-block-reference.md)
- [ソフトウェアメンテナンスガイド](../developer-guides/developer-guide-4.0.md)
- [文書Issue #180: 標準4形式とブロック台本](https://github.com/kubohiroya/turbowarp-kamishibai-docs/issues/180)
- [本体Issue #881: 実命令ブロックの生成と編集結果の書き戻し](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/881)

- [本体Issue #883: ラベル付き台本とincludeBlocks](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/883)
- [本体Issue #886: 種類別の定義ブロック](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/886)
- [本体Issue #891: 専用定義ブロックのフォーム編集](https://github.com/kubohiroya/turbowarp-kamishibai-app/issues/891)

## DSL 4.0 RC改訂の物語反復と条件分岐

`if`／`repeat`／`forEach`の専用囲み、型付き参照、各回の一覧表は、App 4.0.0-rc.44以降のStandardで利用できます。
[作者ガイドの4.0 RC改訂仕様](dsl-4.0-author-guide.md)に構文・一覧編集・上限・中断・切戻しをまとめました。
宣言は4.0のままです。rc.43以前は対応しないため、ベースSB3・台本・CLIの対応版を揃えます。
Standardは起動時固定で物語制御を有効にします。低水準APIの既定OFFと明示的な無効化は維持します。
通常の対応CLIで変換・検証・build・previewでき、追加の実験flagは不要です。旧runnerとの混在は拒否します。現在の公開版は4.0.0-rc.71です。CLIとベースSB3を同じrc.71へ揃えます。CLIは[公開tagから準備する手順](dsl-4.0-block-script-conversion-guide.md#cli-from-release-source)で準備できます。同版のnpm公開状態は[4.0の入口](https://kubohiroya.github.io/turbowarp-kamishibai-docs/4.0/)で確認し、公開済みnpmを使う場合もSB3と版を揃えてください。
標準Scratch制御ブロックは引き続き非対応です。

[三人の訪問](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/three-visits/)で、TurboWarp-Plus-Editorの一覧フォーム・保存／キャンセル・再生を試せます。非対応ブロックの診断には日本語名・ステージ／スプライト名を表示し、該当箇所へ移動・強調できます。
