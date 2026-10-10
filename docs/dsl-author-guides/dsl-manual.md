# 紙芝居DSL 3.2 ファイル作成マニュアル

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: 台本作者、教材作成者、授業設計者、開発者\
対象アプリ: TurboWarp-Kamishibai 3.2.x\
受理するDSL宣言: `kamishibai=3.1`、`kamishibai=3.2`

## この文書の読み方

この文書は、紙芝居アプリ3.2系列に読み込ませる台本ファイルの書き方を、最初から順に説明するマニュアルです。前半で台本の姿と作り方の流れをつかみ、後半で個々の命令を確認する構成になっています。

初めて台本を書く方は、「紙芝居DSLとは」から「台本を組み立てる」までを通して読み、そのあと必要な命令の節を拾い読みしてください。すでに台本を書いたことがある方は、目的の節へ直接進んでかまいません。命令ごとの網羅的な仕様は[コマンドリファレンス](command-reference.md)にまとめてあり、この文書はその前段として「なぜそう書くのか」を説明します。

3.1で書かれた既存台本を引き継ぐ方は、「3.1台本との互換性」を先に読むと、書き換えが必要な箇所と、そのまま動く箇所を切り分けられます。

## 紙芝居DSLとは

紙芝居DSLは、紙芝居アプリに読み込ませるためのテキスト形式の台本です。背景、登場人物、画面上のテキスト、セリフ、音、移動、アニメーション、ポーズ認識、シーン分岐などを、1行につき1つずつ書き並べます。

DSLは「Domain Specific Language」の略で、ここでは「紙芝居を作るための専用の書き方」という意味で使います。専用の書き方をあえて用意しているのは、紙芝居として繰り返し現れる指示を短い1行で表せるようにするためです。プログラミングの知識がなくても、行を上から読めば物語の進み方が分かることを目指しています。

このDSLの大きな特徴は、紙芝居の演出だけでなく、TurboWarp TMモデルを使ったポーズ認識を物語進行に組み込めることです。見ている人が体を動かすと物語が次へ進む、という体験を台本の側から設計できます。

なお、TurboWarp-Kamishibai 3.2.xは台本冒頭の`kamishibai=3.1`と`kamishibai=3.2`をどちらも受理します。既存の3.1台本は冒頭を書き換えずに読み込めるので、この文書は新規台本を`kamishibai=3.2`で書く前提で進めます。互換性の詳細は「3.1台本との互換性」で説明します。

## ファイルの基本構造

紙芝居DSLファイルは、次のような構造です。

```text
kamishibai=3.2
setRuntimeVariable=startSceneIndex:1
setLoadingBackdrop=読み込み背景
setLoadingCostume=読み込み画像1,読み込み画像2
setPoseRecognitionSound=ポーズ認識中の効果音,認識成立時の効果音
asset=背景名,backdrop
asset=アセット名,costume:スプライト名
asset=音名,sound
asset=テキスト名,text
actor=アクター名,初期スキン
svgTextStyle=スタイル名:背景色:文字色:フォント:サイズ:配置:吹き出し方向
cover=表紙背景アセット名,表紙音声アセット名
---
# scene 1
sceneLabel=シーン名
TMPoseURL=ポーズモデルURL
action=演出
---
# scene 2
sceneLabel=別のシーン名
action=演出
```

最初の `---` より前をヘッダ部、以降をシーン部と呼びます。ヘッダ部は「舞台に何を用意するか」、シーン部は「用意したものをどう動かすか」に対応すると考えると、全体を把握しやすくなります。

| 部分 | 役割 |
|---|---|
| バージョン行 | `kamishibai=3.1`または`kamishibai=3.2`を書きます。新規台本は3.2を推奨します。必須です。 |
| ヘッダ部 | 画像、音声、テキスト、登場人物、表紙、初期変数、分岐を定義します。 |
| シーン部 | シーンラベル、背景、テキスト、移動、音、ポーズ認識、分岐などを書きます。 |
| `---` | シーンの区切りです。 |
| `#` | コメント行です。台本の説明やメモに使えます。 |

## 最小サンプル

構造が分かったところで、実際に動く最小の台本を見てみます。背景を出し、登場人物にセリフを言わせるだけの例です。

```text
kamishibai=3.2
asset=Beach,backdrop
asset=Hero,costume
asset=OpeningSound,sound
actor=Hero,Hero
cover=Beach,OpeningSound
---
# scene 1
sceneLabel=opening
action=stage:Beach
action=Hero:show:Hero:0,-60,30
action=Hero:say:こんにちは！:2
action=wait:1
```

この台本では、次の順に動きます。

1. 背景 `Beach` を表示する
2. アクター `Hero` を中央やや下に表示する
3. `こんにちは！` と2秒間言う
4. 1秒待つ

ヘッダ部で名前を付けた素材を、シーン部の`action`が名前で呼び出す。この往復が紙芝居DSLの基本形です。以降の節で扱う命令も、すべてこの形の延長にあります。

## 台本を組み立てる

命令を1つずつ覚える前に、台本を作るときの段取りを決めておくと迷いにくくなります。ここでは、物語を決めてから台本ファイルに落とすまでの流れを説明します。

### 物語をシーンに分ける

最初に、物語を5〜10個程度のシーンに分けます。1シーンは、背景が変わらず、ひとまとまりの出来事が起きる範囲を目安にします。

例:

1. 出会い
2. 移動
3. 目的地に到着
4. 重要な選択
5. 結末

各シーンで、背景、登場人物、セリフ、音、参加者の動作を決めます。参加者にポーズをとってもらう場面は、この段階で決めておくと、あとから必要なモデルや画像が見えてきます。

### 必要なアセットを洗い出す

シーンが決まったら、そこで使う素材の一覧を作ります。台本を書き始めてから素材を探すと、名前の付け直しが増えて手戻りになります。

| 種類 | 例 |
|---|---|
| 背景 | 浜辺、海、城、森、エンディング画面 |
| キャラクター画像 | 通常、驚き、喜び、困り顔、動作中 |
| 効果音 | 決定音、ジャンプ音、拍手、波の音 |
| BGM | 場面の雰囲気を作る音 |
| ポーズ用スキン | 参加者に真似してほしい姿勢の画像 |

### アセット名を決める

おすすめの命名規則:

```text
背景: Beach1, Ocean, Castle
人物: Hero-walk-1, Hero-happy, Hero-open-1
音: OpenSound, SuccessSound, OceanWave
```

この例では、参照箇所を見分けやすくするため英数字、ハイフン、アンダースコアを使用しています。名前は文字列として照合されるため、定義箇所と参照箇所で同じ表記を使います。アクション要素として使う名前に半角 `:` があると別の要素に分割され、リスト要素として使う名前に半角 `,` があると別の項目に分割されます。

用途ごとに、次のような名前の付け方をおすすめします。命名の型を決めておくと、台本を読み返したときに、その行がどの種類の素材を指しているのかが一目で分かります。

| 対象 | 例 |
|---|---|
| 背景 | `Beach1`, `Ocean`, `DragonCastle`, `End` |
| キャラクター通常 | `Urashima-walk-1` |
| キャラクター動作 | `Urashima-open-1`, `Urashima-open-2` |
| 感情 | `Urashima-surprised`, `Hero-happy` |
| 音 | `OceanWave`, `GoalCheer`, `Jump` |
| ポーズ | `help`, `ride1`, `dance2`, `open3`, `despair` |

### 小さく作って確かめる

最初に1シーンだけ作って動かし、確認してから2シーン目を足していくと、文法エラーや不足アセットをシーン単位で特定できます。紙芝居制作は、料理でいえば味見しながら作るタイプです。いきなり鍋いっぱいにしないのがコツです。

段取りが決まったら、あとはヘッダ部とシーン部を順に埋めていきます。次の節からは、それぞれで使える命令を見ていきます。

## ヘッダ部を書く

ヘッダ部では、台本全体で使う素材と登場人物、そして物語が始まる前の設定を宣言します。ここで名前を付けたものだけが、シーン部から呼び出せます。

### バージョン行

```text
kamishibai=3.2
```

台本の先頭に書きます。TurboWarp-Kamishibai 3.2.xは`kamishibai=3.1`と`kamishibai=3.2`を読み込みます。既存の3.1台本は宣言を維持したまま実行でき、新規台本には3.2を使用します。2.0の台本はそのままでは読めないため、[変更履歴](history.md)とアセット識別子を確認して3.1または3.2へ移行してください。

### アセット定義

```text
asset=アセット名,URL
```

画像、音声、テキストを登録します。外部URLのほか、`.sb3`内のコスチューム、背景、音も利用できます。

例:

```text
asset=Beach1,https://example.com/stages/Beach1.png
asset=Urashima-walk-1,https://example.com/skins/Urashima-walk-1.png
asset=OceanWave,https://example.com/sounds/OceanWave.mp3
```

プロジェクト内アセットの代表的な書式:

```text
asset=Hero,costume
asset=Hero-happy,costume:Hero
asset=Beach,backdrop
asset=OpeningSound,sound
asset=Narration,text
```

- `costume` は、アセット名と同名のスプライト／コスチュームを使います。
- `costume:スプライト名` は、そのスプライト内でアセット名と同名のコスチュームを使います。
- `backdrop` と `sound` は、アセット名と同名のステージ背景／ステージ音を使います。
- `text` は、画面に表示できる旧Text Assetを作ります。3.2ではdeprecatedですが、移行期間の互換機能として動作します。

名前を明示したい場合は、`costume:スプライト名:コスチューム名`、`backdrop:背景名`、`sound:スプライト名:音名`、`text:テキスト名` も使えます。ステージ音のスプライト名は `@stage` です。

アセット名は台本内で何度も参照します。分かりやすく、重複しない名前にしてください。

#### Loading表示を変更する

素材の読み込み中に出る画面も、台本から差し替えられます。作品の世界観に合わせたい場合に使います。

```text
asset=loading1,https://example.com/loading/loading1.png
asset=loading2,https://example.com/loading/loading2.png
asset=loading3,https://example.com/loading/loading3.png
asset=loadingBackground,https://example.com/loading/background.png
setLoadingBackdrop=loadingBackground
setLoadingCostume=loading1,loading2,loading3
```

`setLoadingBackdrop`にはLoading中に表示する背景アセット名を1件指定します。指定した背景は最初に読み込まれ、読み込み完了直後にステージへ表示されます。指定を省略した場合は、タイトル画像を残さず、組み込みの真っ黒な背景を表示します。

`setLoadingCostume`には、`asset`で定義した画像アセット名をカンマ区切りで指定します。指定した画像はLoading背景に続けて他のアセットより先に読み込まれ、その後の通常アセット読込中に、特別な組み込みスプライト`Loading`へ順番に表示されます。通常アセットの1件目では`loading1`、2件目では`loading2`、4件目では再び`loading1`というように循環します。

Loading用の背景と画像は、読込進捗の完了数と総数から除外されます。たとえばLoading背景が1件、Loading用画像が3件、通常アセットが10件なら、吹き出しは`0 / 10`から`10 / 10`まで進みます。Loading画像の指定を省略した場合は、組み込みの`Loading`コスチュームを表示します。

進捗の吹き出しは、Loading画像とは別の固定アンカーから表示されます。このため、指定画像の大きさや非透明部分の外形が異なっても、画像の切替によって吹き出し位置は変わりません。

指定名は画像アセットとして定義されている必要があります。未定義の名前を指定すると読込エラーになります。

#### ポーズ認識中の効果音を変更する

ポーズ認識は、参加者にとって「いま自分の番だ」と分かることが大切です。認識中と成立時に鳴る音は、台本から指定できます。

```text
asset=Clock Ticking,https://example.com/sounds/clock-ticking.mp3
asset=Sewing Machine,https://example.com/sounds/sewing-machine.mp3
setPoseRecognitionSound=Clock Ticking,Sewing Machine
```

`setPoseRecognitionSound`には、`asset`で定義した音声アセット名を最大2件、カンマ区切りで指定します。第1音は各ポーズの認識開始時にAsset Manager経由で再生し、認識成功またはスキップでそのポーズを終えると停止します。第2音はポーズ条件が成立したとき、「ポーズ認識」の値を更新する直前に再生します。

第2音は省略でき、従来の`setPoseRecognitionSound=Clock Ticking`も同じ動作を保ちます。コマンド自体を省略するか第1音に空文字を指定した場合、認識中の音は鳴りません。第2音が空文字の場合、認識成立時の音は鳴りません。

### アクター定義

```text
actor=アクター名,初期スキン名
```

登場人物を登録します。アクターは、`asset`で登録した画像を着替えながら舞台に立つ存在だと考えてください。

例:

```text
actor=Urashima,Urashima-walk-1
actor=Turtle,Turtle
actor=Princess,Princess
```

`action=Urashima:say:...` のように、アクションの対象として使う名前がアクター名です。

### 表紙定義

```text
cover=背景アセット名,音声アセット名
```

アプリ起動時や物語終了後に表示する表紙画面を指定します。

例:

```text
cover=Beach1,OceanWave
```

`cover` の第2引数には音声アセットを指定します。表紙で音を鳴らさない場合は、区切りのカンマを残して第2引数を空にします。アプリは第2引数が空でなく、同名のアセットが読み込み済みの場合だけ音声を再生します。

```text
cover=Beach1,
```

### ランタイム変数

```text
setRuntimeVariable=変数名:値
```

紙芝居の実行中に参照する変数へ初期値を設定します。3.2では、開始シーンや条件分岐の状態を台本から用意できます。

```text
setRuntimeVariable=startSceneIndex:1
setRuntimeVariable=takeSeaRoute:true
```

`startSceneIndex` は、最初に実行するシーン番号を指定するための予約された変数です。通常は `1` にします。

### 条件分岐の登録

物語の道筋を枝分かれさせる場合は、条件と移動先の組をヘッダ部で登録しておき、シーン部から名前で呼び出します。

```text
registerBranch=分岐名:条件1,条件2,...:シーンラベル1,シーンラベル2,...
```

条件はRuntime Expressionの式として上から順に評価され、最初に真になった条件と同じ位置のシーンラベルが選ばれます。

```text
setRuntimeVariable=takeSeaRoute:true
registerBranch=chooseRoute:takeSeaRoute,true:ocean,home
```

最後に `true` を置くと、どの条件にも一致しなかった場合の移動先を表せます。条件とシーンラベルの個数はそろえてください。

条件式では `==`、`!=`、`===`、`!==` による等価比較を使用できます。コマンド行の最初の `=` だけがキーと値の区切りになり、条件式内の `=` は保持されます。単独の `=` は条件式の演算子ではありません。

```text
setRuntimeVariable=score:1
registerBranch=chooseRoute:score == 1,true:ocean,home
```

### ポーズ案内の文言

ポーズ案内は、scene 0（最初の `---` より前）で定義できます。`ui.prompt`はランタイムが自動登録する予約済みテキストアセットなので、`asset=`は不要です。

```text
text=ui.prompt:ポーズをとろう！
```

| アセット名  | 表示場所           |
| ----------- | ------------------ |
| `ui.prompt` | ポーズ認識中の案内 |

ランタイムは物語開始時に`Pose!`へ戻してからscene 0を実行するため、別の台本を続けて読み込んでも前の文言は残りません。

`Open`、`Reload`、`About`、`Language`、台本エラー、タイトル画面は台本を読む前から必要なアプリUIです。これらは台本ではなくアプリの言語定義から表示し、標準の`（言語）`ブロックまたはメニューで選んだ日本語／英語に従います。旧台本に`text=ui.open:`、`text=ui.reload:`、`text=ui.about:`、`text=ui.invalidScript:`が残っていても、アプリUIの文言には適用されません。

## シーンを書く

ヘッダ部で舞台の道具立てが済んだら、シーン部で物語を進めます。シーンは `---` で区切ります。

```text
---
# scene 1
sceneLabel=opening
TMPoseURL=https://example.com/model/
action=stage:Beach1
action=wait:1
action=Urashima:show:Urashima-walk-1:172,-77,25
action=Urashima:say:今日は浜辺を散歩しよう。:2
```

### シーンの基本方針

シーンごとに、必要な背景、登場人物、音、セリフを指定します。アプリはシーン終了時にアクターを隠しますが、背景、画面効果、再生中の`bgm`は次のシーンへ引き継ぎます。BGMを継続する場合は、次のシーンで同じ`bgm`を指定し直す必要はありません。背景や画面効果は、意図しない持ち越しを避けるため明示することを推奨します。

言い換えると、シーンは前のシーンの状態に頼らず、そのシーンだけを読めば画面の様子が分かるように書くのが安全です。あとから順番を入れ替えたり、途中のシーンから確認したりするときに違いが出ます。

よい書き方:

```text
---
# scene 2
action=stage:Ocean
action=Urashima:show:Urashima-ride-1:170,5,25
action=bgm:Odesong
```

避けたい書き方:

```text
---
# scene 2
# 背景やアクターを出さず、前シーンから残っている前提で書く
```

### コメント行

`#` で始まる行はコメントです。

```text
# scene 1
# ここでカメを助けるポーズを入れる
```

コメントは、シーン名、演出意図、修正メモに使うと便利です。

### シーンラベル

```text
sceneLabel=opening
```

シーンへ一意の名前を付けます。`branch`、`keyInputToChangeScene`、`touchInputToChangeScene` の移動先として使います。分岐を使う台本では、すべてのシーンに重複しないラベルを付けることをおすすめします。

### TMPoseURL

```text
TMPoseURL=https://example.com/model/
```

ポーズ認識モデルのURLを指定します。ポーズ認識を使うシーンでは、原則としてそのシーン内に `TMPoseURL` を書きます。

`TMPoseURL` は、シーン内のアクション実行前に読み込まれます。そのため、次のように `action=stage` より後に書いても、実際のアクション実行前にはモデル読み込みが終わります。ただし、人間が読むときの分かりやすさを優先して、シーン冒頭に書くことをおすすめします。

```text
---
# scene 6
TMPoseURL=https://example.com/open-box-model/
action=stage:Beach2
action=Urashima:pose:Urashima-open-1,Urashima-open-2:open1,open2:OpenSound,OpenSound
```

## アクションを書く

シーンの中身は、ほとんどが`action=`で始まる行です。アクションは書かれた順に上から実行され、その並びがそのまま紙芝居の進行になります。

```text
action=対象:命令:値
action=対象:命令:値:追加値
```

大きく分けると、背景・音・待機のように舞台全体へ働きかけるアクションと、アクターに対するアクションがあります。以降では、よく使うものから順に説明します。

### 背景を変える

```text
action=stage:Beach1
```

`Beach1` は `asset=Beach1,...` で登録済みの背景画像です。

### 待つ

```text
action=wait:1.5
```

指定秒数だけ待ちます。演出の間合いを作る、もっとも基本的なアクションです。

### 音を鳴らす

```text
action=bgm:GuitarChords2
action=sound:Gong
```

`bgm` は音を鳴らして次のアクションへ進みます。`sound` は音の再生が終わるまで待ちます。

名前は `BGM` ですが、実装上は「待たずに鳴らす音」と考えると分かりやすいです。ループ再生専用ではありません。

下矢印キーでシーンをスキップしても、すでに再生中の`bgm`は継続し、シーンの残りに書かれた`bgm`も再生を開始します。現在再生待ちの`sound`は停止します。

### 画面をフェードさせる

```text
action=transition:fadeOut
action=stage:次の背景
action=transition:fadeUp
```

`fadeOut` はステージを暗くし、`fadeUp` は明るく戻します。`reset` は明るさ効果を標準値へ戻します。背景切り替えの前後に置くと場面転換を滑らかに見せられます。

白く飛ばしてから背景を切り替える場合は、次のように記述します。

```text
action=transition:fadeToWhite
action=stage:次の背景
action=transition:fadeFromWhite
```

`fadeToWhite`はステージの明るさを`+100`まで上げ、その状態を保持します。白飛び中に背景を切り替えたあと、`fadeFromWhite`で明るさを`0`へ戻すと、切替後の背景が徐々に見えるようになります。

下矢印キーでシーンをスキップした場合、残りの`transition`はアニメーションを待たず、台本に書かれた順番で最終明るさだけを適用します。たとえば残りに`fadeOut`と`fadeUp`がある場合、最終状態は`fadeUp`の明るさ`0`です。

### アクターを表示する

```text
action=Urashima:show:Urashima-walk-1:172,-77,25
```

意味:

- 対象アクター: `Urashima`
- 命令: `show`
- スキン: `Urashima-walk-1`
- x座標: `172`
- y座標: `-77`
- サイズ: `25`

座標はScratch/TurboWarpのステージ座標です。中央が `(0, 0)`、右がプラス、左がマイナス、上がプラス、下がマイナスです。

初期スキンをそのまま使う場合は、スキン名を省略して位置とサイズだけを書けます。

```text
action=Fish:show:-130,-27,70
```

### アクターを移動する

```text
action=Urashima:moveTo:40,-57,1.5
```

`x,y,秒数` を指定します。指定秒数でその位置へ滑らかに移動します。

すぐに移動したい場合は `setPosition` を使います。

```text
action=Urashima:setPosition:40,-57
```

### セリフと思考吹き出し

```text
action=Princess:say:ようこそ竜宮城へ。:2.5
action=Urashima:think:あっという間におじいさんになってしまった…:3
```

秒数を省略すると、次に変更されるまで表示されます。

`svgTextStyle`で定義した名前付きスタイルを吹き出しごとに選ぶ場合は、秒数の後にスタイル名を追加します。

```text
svgTextStyle=baloonStyle:#ffffff:#222222:Noto Sans JP:120:left:up-right

action=Hero:say:こんにちは:5.0:baloonStyle
action=Hero:think:考え中:5.0:baloonStyle
```

書式は`action=ACTOR:say|think:TEXT:SECONDS:STYLE`です。スタイル名を指定する場合は秒数を省略できません。従来のスタイル名なしの書式、空のスタイル名、未定義のスタイル名は`default`を使用します。指定秒数の経過、Rightによるアクション終了、Downによるシーンスキップのいずれでも吹き出しを消去します。

吹き出しを消したい場合は、空のセリフを使います。

```text
action=Urashima:say:
action=Princess:think:
```

### スキンを変える

```text
action=Urashima:setSkin:Urashima-surprised
```

登録済みアセットの画像に切り替えます。表情やポーズ違いの画像を用意しておくと、紙芝居らしい演出ができます。

サイズも同時に変える場合は、4つ目の要素に指定します。

```text
action=Urashima:setSkin:Urashima-surprised:45
```

### 画像や音を連続再生する

複数の画像や音を続けて再生すると、簡単なアニメーションになります。繰り返し続ける`loop`と、一度だけ流す`sequence`があります。

繰り返し再生:

```text
action=Fish:loop:Fish1,Fish2:1,1
```

一回だけ再生:

```text
action=Hero:sequence:Hero1,StepSound,Hero2:0,0.5
```

`loop` はアセット数と待ち時間の数を同じにします。最後の待ち時間の後は先頭へ戻ります。`sequence` は一回だけバックグラウンド再生し、待ち時間はアセット数より1つ少なくします。待ち時間 `0` を使うと、画像と音などを同時に開始できます。

### SVG Textでアクター自身に文字を表示する

吹き出しではなく、アクターそのものを文字として表示したい場合はSVG Textを使います。タイトル画面やナレーションの表示に向いています。

まず、シーンより前のヘッダ部で、吹き出しとSVGテキストアクターが共有する名前付きスタイルを定義します。

```text
svgTextStyle=title:#112233:#ffffff:Noto Sans JP:150:center:up
```

値の並びは`スタイル名:背景色:文字色:フォント:サイズ:配置:吹き出し方向`です。

- サイズ`100`は480×360ステージで標準14px相当です。画面サイズを変えても、ステージに対する比率を保って拡大・縮小します。
- 配置は`left`、`center`、`right`から選びます。
- 吹き出し方向は`up`、`up-right`、`right`、`down-right`、`down`、`down-left`、`left`、`up-left`から選びます。SVGテキストアクター自身には方向を適用しません。
- 同じスタイル名を再定義すると、その名前を使用中の吹き出しとSVGテキストアクターも更新されます。
- `default`を定義すると、通常の`say`、`think`、`ask`にも同じ相対サイズ、色、フォント、配置、方向を適用します。
- `say`／`think`では、`action=ACTOR:say|think:TEXT:SECONDS:STYLE`の`STYLE`から名前付きスタイルを吹き出しごとに選択できます。

登録済みアクター自身をテキスト表示へ切り替えるには、文字列とスタイル名を指定します。

```text
action=Hero:setText:タイトル\nサブタイトル:title
```

文字列中の2文字`\n`は改行へ変換されるため、2行以上の文字を表示できます。SVGへ挿入する文字列はescapeされます。アニメーションは3.2.0の対象外です。

### シーンを分岐させる

物語を枝分かれさせる方法は3通りあります。ヘッダ部で登録した条件を使う方法、キー入力で選ぶ方法、アクターへのタッチで選ぶ方法です。

登録済みの条件分岐を評価する場合:

```text
action=branch:chooseRoute
```

キー入力で移動先を選ぶ場合:

```text
action=keyInputToChangeScene:ArrowLeft,ArrowRight:leftRoute,rightRoute
```

アクターへのタッチで移動先を選ぶ場合:

```text
action=touchInputToChangeScene:LeftDoor,RightDoor:leftRoute,rightRoute
```

キー／アクターのリストとシーンラベルのリストは、同じ個数を同じ順番で書きます。入力待ちは登録後も他のアクションと並行して続き、入力されると指定ラベルのシーンへ移動します。

### ポーズ認識を入れる

ポーズ認識は、見ている人の動きで物語を進めるための仕組みです。使うシーンには、あらかじめ`TMPoseURL`でモデルを指定しておきます。

基本形:

```text
action=アクター名:pose:スキン名リスト:ポーズ名リスト:効果音リスト
```

例:

```text
action=Urashima:pose:Urashima-help-1:help:SquishPop
```

これは次の意味です。

1. `Urashima` のスキンを `Urashima-help-1` にする
2. TurboWarp TMで `help` ポーズを待つ
3. 成功したら `SquishPop` を鳴らす
4. 次のアクションへ進む

複数ポーズを連続させることもできます。

```text
action=Urashima:pose:Urashima-ride-2,Urashima-ride-1,Urashima-ride-2,Urashima-ride-1:ride2,ride1,ride2,ride1:Splash,Splash,Splash,Splash
```

この場合、スキン、ポーズ名、効果音のリストを左から順番に対応させます。

| 順番 | スキン | ポーズ名 | 効果音 |
|---|---|---|---|
| 1 | `Urashima-ride-2` | `ride2` | `Splash` |
| 2 | `Urashima-ride-1` | `ride1` | `Splash` |
| 3 | `Urashima-ride-2` | `ride2` | `Splash` |
| 4 | `Urashima-ride-1` | `ride1` | `Splash` |

どのポーズを使うかは、モデルの精度と同じくらい体験の質を左右します。参加者が迷わず真似でき、かつモデルが取り違えにくい姿勢を選んでください。

| よいポーズ | 避けたいポーズ |
|---|---|
| 腕や体の位置がはっきり違う | 似た姿勢が多い |
| 正面から分かりやすい | 横向きで見えにくい |
| 子供でもまねしやすい | 難しすぎる、危ない |
| 1〜2秒止まれる | 素早すぎる動き |

## 3.1台本との互換性

3.2は、3.1で書かれた台本をそのまま動かすことを重視した版です。新しい書き方へ一度に移行しなくても、既存の作品を壊さずに運用できます。ここでは、その境界を整理します。

### DSL宣言の互換性

TurboWarp-Kamishibai 3.2.xは、台本冒頭の`kamishibai=3.1`と`kamishibai=3.2`をどちらも正式に受理します。既存の3.1台本は、冒頭を書き換えずに読み込めます。新規に作る台本と、3.2の機能を前提に更新する台本には`kamishibai=3.2`を使用してください。`3.0`、`3.3`など、列挙されていない宣言は受理しません。

3.1宣言は互換入力として扱われるため、旧Text Assetを使用している場合のdeprecated警告を抑止しません。

### テキスト互換方針

DSL 3.2では、3.1までのText Asset構文をdeprecatedな互換機能として維持します。既存台本の`asset=名前,text`、`text=`、`textStyle=`、`action=text`、Text Assetを参照する`show`／`setSkin`は、表示・更新を含めて引き続き動作します。

旧Text Assetを使用すると、開発者コンソールへプロジェクトごとに一度`LEGACY_TEXT_ASSET_DEPRECATED`警告が出ますが、台本の実行は継続します。旧構文は少なくとも3.2系列で利用でき、削除する場合は将来のメジャーバージョンで事前に告知します。

新しいテキスト表現の移行先は[`@kubohiroya/turbowarp-svg-text@0.1.0`](https://github.com/kubohiroya/turbowarp-svg-text)です。3.2.0にはこの機能拡張が組み込まれており、旧Text Assetと併用できます。DSLでは`svgTextStyle`で名前付きスタイルを定義し、アクターの`setText`アクションや`say`／`think`の吹き出しから利用します。スタイル名を省略した吹き出しには`default`スタイルを適用します。

### 旧Text Assetを表示・更新する

ヘッダで旧Text Assetとアクターを登録し、通常の`show`で表示します。この書式は3.2でも動作しますが、新規台本ではSVG Textへの移行を検討してください。

```text
asset=Narration,text
actor=Narration,Narration
action=text:Narration:むかし
action=Narration:show:Narration:0,0,100
action=wait:2
action=text:Narration:むかし　むかし、あるところに...
```

`action=text:テキストアセット名:文字列` は、アクション列のその位置で表示内容を更新します。`wait` と組み合わせることで、同じテキストアセットの内容を時系列に沿って変更できます。空の文字列を指定すると内容を消せます。
テキストは、明るい背景と暗い背景のどちらでも読めるよう、既定では白文字に黒い縁取りで表示されます。

```text
action=text:Narration:
```

シーン直下の`text=...`も互換性のため読み込めますが、アクション列より先に処理されます。旧Text Assetを維持する台本で順次更新する場合は`action=text:...`を使用してください。ただし、予約済みの`ui.*`文言は時系列の演出ではなく初期設定なので、scene 0の`text=...`で定義します。

`textStyle=テキストアセット名:プロパティ:値`も互換機能として処理され、Asset Managerの旧Text Assetへ適用されます。旧Text AssetとSVG Textのスタイル定義は別の仕組みです。移行時は、同じ見た目になるようSVG Text側の名前付きスタイルを別途定義してください。

## 書き方の注意

ここまでの内容のうち、間違えやすい点をまとめます。台本が思った通りに動かないときは、まずこの表を確認してください。

| 注意点 | 理由 |
|---|---|
| 先頭に `kamishibai=3.1`または`kamishibai=3.2`を書く | 3.2.xアプリが対応台本か確認するためです。新規台本は3.2を推奨します。 |
| `---` でシーンを区切る | アプリがシーン単位で実行するためです。 |
| 1行に1つの命令を書く | パーサが行単位で処理するためです。 |
| 最初の `=` はコマンドの区切り | 2個目以降の `=` は値として保持されます。 |
| `:` はアクションの区切り | `say` と `think` の本文中では、コロンを全角 `：` で書きます。 |
| `,` はリストの区切り | アセット名やポーズ名には半角カンマを入れないでください。 |
| ポーズ名はTurboWarp TMモデルと一致させる | モデルのラベルと違うと認識されません。 |
| ラベル名は重複させない | 条件や入力による移動先を一意に決めるためです。 |
| 分岐の条件数と移動先数をそろえる | 同じ位置の条件とラベルを対応させるためです。 |
| 各シーンで表示状態を明示する | アクターは隠れますが、背景、画面効果、BGMは意図的に変更するまで持ち越されるためです。 |
| 音声ファイルは短めにする | `sound` は音が終わるまで待つためです。 |

## テストの進め方

確認は、文法、素材、演出の順に行うと原因を切り分けやすくなります。文法が通らなければ素材は読まれず、素材が読めなければ演出は確認できないためです。

### まず文法を確認する

- `kamishibai=3.1`または`kamishibai=3.2`がある
- `asset`, `actor`, `cover` が正しく書かれている
- `---` がある
- すべての `action` が `action=...` で始まっている
- 分岐先の `sceneLabel` が存在する

### 次にアセットを確認する

- URLをブラウザで開ける
- 画像が表示される
- 音声が再生できる
- アセット名のスペルが一致している

### 最後に演出を確認する

- 背景が意図通りに切り替わる
- アクターの位置とサイズが適切
- セリフの表示時間が読みやすい
- 音が長すぎない
- ポーズ認識が成功する
- 条件分岐、キー入力、タッチ入力が正しい移動先を選ぶ

## 読みやすい台本にするコツ

台本は一度書いて終わりではなく、実際に演じてみて手を入れる文書です。あとから読み返しやすい形にしておくと、修正の速さが変わります。

### シーン番号と内容をコメントで書く

```text
# scene 1: 浜辺でカメと出会う
```

### 演出のまとまりごとに空行を入れる

```text
action=stage:Beach1
action=wait:1

action=Urashima:show:Urashima-walk-1:172,-77,25
action=Urashima:say:今日は浜辺を散歩しよう。:2
```

### ポーズの意味が分かる名前を使う

よい例:

```text
help
open1
open2
despair
```

分かりにくい例:

```text
pose1
pose2
abc
```

## 作成チェックリスト

- [ ] 物語をシーンに分けた
- [ ] 背景画像を用意した
- [ ] 登場人物画像を用意した
- [ ] 音声アセットを用意した
- [ ] ポーズ認識モデルのURLを確認した
- [ ] `kamishibai=3.1`または`kamishibai=3.2`を書いた（新規台本は3.2）
- [ ] 旧Text Assetを残す場合、`LEGACY_TEXT_ASSET_DEPRECATED`警告と将来の移行対象であることを確認した
- [ ] `asset` をすべて書いた
- [ ] `actor` をすべて書いた
- [ ] `cover` を書いた
- [ ] 各シーンを `---` で区切った
- [ ] 分岐に使うシーンへ重複しない `sceneLabel` を付けた
- [ ] 各シーンに必要な背景とアクター表示を書いた
- [ ] ポーズ名とモデルラベルが一致している
- [ ] 条件・入力と移動先ラベルの対応を確認した
- [ ] 最初から最後まで再生確認した

## 付録: `urashima.txt` の構成例

ここまでの要素を実際に組み合わせた例として、公開中の[`urashima.txt`](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/urashima.txt)を紹介します。Web版と用途別SB3は、[浦島太郎の公開ページ](https://kubohiroya.github.io/turbowarp-kamishibai-samples/stories/urashima/)から利用できます。

| シーン | 内容 | 主な機能 |
|---|---|---|
| ヘッダ | バージョン、初期変数、アセット、アクター、表紙、ポーズ案内を定義 | `kamishibai`, `setRuntimeVariable`, `asset`, `actor`, `cover`, `text=ui.prompt` |
| opening | 導入のナレーション | テキストアセット、フェード |
| scene 1 | 浜辺で浦島がカメを助ける | 背景、セリフ、移動、ポーズ認識 |
| scene 2 | カメに乗って海を進む | 移動、連続ポーズ、効果音 |
| scene 3 | 竜宮城で姫に迎えられる | 姫の表示、セリフ、ループアニメーション、踊りポーズ |
| scene 4 | 玉手箱を受け取る | 会話、受け取りポーズ、退場 |
| scene 5 | 浜辺に戻り、村の変化に気づく | 背景変更、驚きスキン、セリフ |
| scene 6 | 玉手箱を開ける | 複数ポーズ、効果音 |
| scene 7 | 煙の中で老人になる | 同期効果音、思考、絶望ポーズ |
| scene 8 | 竜宮城の別れ | 複数アクター表示、セリフ |
| scene 9 | エンディング | 背景、完了音 |

この例は、3.2のアセット形式、シーンラベル、scene 0のポーズ案内、互換機能の`action=text:`、フェード、ループアニメーション、ポーズ認識を組み合わせた教材として使いやすいです。自分の台本を書き始める前に、近い構成のシーンを探して読むと参考になります。

## 関連ドキュメント

- [`command-reference.md`](command-reference.md): コマンドとアクションの詳細仕様
- [`history.md`](history.md): 紙芝居DSL 2.0から3.2への変更履歴
- [`user-guide.md`](../user-guides/user-guide.md): 紙芝居アプリの操作方法
- [`executive-summary-adult.md`](../user-guides/executive-summary-adult.md): 大人向け概要説明
- [`executive-summary-kids.md`](../user-guides/executive-summary-kids.md): 子供向け概要説明
- [`developer-guide.md`](../developer-guides/developer-guide.md): 成果物とビルダーの利用、開発、検証、公開の手順
- [`internal-specification.md`](../developer-guides/internal-specification.md): 汎用アプリSB3の内部構造、呼出し関係、状態遷移
