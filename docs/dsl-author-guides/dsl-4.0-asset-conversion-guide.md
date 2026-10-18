# DSL 4.0 アセット変換ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: 背景・コスチューム・音声などの素材を、SB3内、作品フォルダー、Web上の間で移し替える台本作者。\
確認日: 2026年10月18日。コマンドの基準は公開プレリリース`4.0.0-rc.22`の固定実装
[`f8048b8`](https://github.com/kubohiroya/turbowarp-kamishibai-app/commit/f8048b8c4ebd0ecd6213bb87582862034b2b88ce)です。
正式版`4.0.0`の公開を意味しません。

## 三つの素材と変換方向

**`convert-dsl4-assets`で、ローカル素材とSB3の組み込み素材を相互変換し、リモート素材をどちらへも変換できます。**
台本の`assets`に宣言した素材が対象です。SB3に含まれるすべての画像を一括抽出する用途では使いません。
素材の宣言自体は[台本作成ガイド](dsl-4.0-author-guide.md)を参照してください。

| 素材の置き方                                                      | このガイドの呼び方 | 台本での参照                 | CLIでの名前 |
| ----------------------------------------------------------------- | ------------------ | ---------------------------- | ----------- |
| (a) スプライトのコスチューム、ステージの背景・音としてSB3内に登録 | 組み込み素材       | 短形式、または`name`         | `project`   |
| (b) 作品フォルダー内のファイル・モデルフォルダー                  | ローカル素材       | `file`                       | `local`     |
| (c) HTTPSで取得するWeb上のファイル・モデル                        | リモート素材       | `delivery: remote`と`source` | `remote`    |

| 目的                                                   | 変換      | 指定           |
| ------------------------------------------------------ | --------- | -------------- |
| 外部で作った素材をTurboWarp Editorで編集する           | (b) → (a) | `--to project` |
| Editorで登録した素材を外部ファイルとして管理する       | (a) → (b) | `--to local`   |
| Web上の素材を手元へ保存して制作・配布する              | (c) → (b) | `--to local`   |
| Web上の素材をSB3の背景・コスチューム・音として登録する | (c) → (a) | `--to project` |

(a)と(b)はどちらも`delivery: embedded`です。(b)も作品をビルドするとSB3へ格納されますが、
`--to project`はTurboWarpの背景・コスチューム・音の一覧へ登録する操作です。
`build-dsl4`による配布用SB3への格納とは、目的を区別してください。

## CLIと作品を準備する

Node.js 24以上を用意し、CLIを使う作業フォルダーで版を固定してインストールします。
以降のコマンドはすべて、このフォルダーから実行します。

```sh
npm install --save-dev --save-exact @kubohiroya/turbowarp-kamishibai-app@4.0.0-rc.22
npx --no-install turbowarp-kamishibai --version
npx --no-install turbowarp-kamishibai --help
```

最初の例では、次の作品フォルダーを用意します。

```text
work/
  base.sb3
  project.source.yml
  story.k4.yml
  assets/
    beach.svg
```

`base.sb3`は、作品で使うスプライトと紙芝居ランタイムを含むベースSB3です。
新規作品なら[rc.22のGitHub Release](https://github.com/kubohiroya/turbowarp-kamishibai-app/releases/tag/v4.0.0-rc.22)の
Standard SB3を使います。既存作品では、その作品の最新の素材・スプライトを保存したSB3を使ってください。
変換後も入力のSB3と素材は保持されます。

`project.source.yml`は主台本の場所を指定します。

```yaml
formatVersion: 1
mode: external
sourceId: main
path: story.k4.yml
```

`story.k4.yml`には、まずローカル背景一つを宣言します。`assets/beach.svg`には実際のSVG画像を置いてください。

```yaml
kamishibai: '4.0'
controls:
  keymaps:
    production:
      Space: navigation.nextAction
assets:
  Beach:
    kind: backdrop
    file: assets/beach.svg
scenes:
  opening:
    - stage: Beach
    - wait: 1
```

### 共通の指定と出力

| オプション          | 意味                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `--project-root`    | 変換元の作品フォルダー                                            |
| `--source-manifest` | 使用するソース設定ファイルのパス。以下の例では明示する            |
| `--base`            | 変換対象の組み込み素材とスプライトを持つSB3                       |
| `--to`              | 変換先。`local`、`project`、`remote`のいずれか                    |
| `--asset ID`        | 変換するアセットID。複数指定でき、省略すると台本内の全素材が対象  |
| `--output-dir`      | 作品フォルダー内の、まだ存在しない出力先                          |
| `--output-name`     | 出力YAMLとSB3のファイル名の共通部分。省略時は入力台本名から決める |

既存の出力先は上書きできません。出力先は`--project-root`自身やその外側には置けません。
以降の例にある数値オプションは、ローカル変換でも省略できない上限・通信設定です。

| 必須の数値オプション          | 例の値     | 意味                                                           |
| ----------------------------- | ---------- | -------------------------------------------------------------- |
| `--max-source-manifest-bytes` | `16384`    | ソース設定ファイルの最大バイト数                               |
| `--max-remote-map-bytes`      | `65536`    | リモート対応表の最大バイト数。対応表を使わない変換でも指定する |
| `--max-base-sb3-bytes`        | `67108864` | 入力SB3の最大バイト数（64 MiB）                                |
| `--timeout-ms`                | `10000`    | リモート取得1回あたりの制限時間（ミリ秒）                      |
| `--max-redirects`             | `3`        | リダイレクトの最大回数                                         |

このほか、単一素材は既定16 MiB、素材ファイル数は256、素材合計は128 MiBまでです。
必要な場合は`--max-asset-file-bytes`、`--max-asset-files`、`--max-total-asset-bytes`で変更します。
変換には台本内の未選択素材も含むローカル素材の検査・コピーが伴うため、出力一式が上限内に収まる必要があります。

成功すると、出力先に`project.source.yml`、変換済みYAML、変換済みSB3、必要なローカル素材ができます。
CLIは変換件数と生成したファイル名を表示します。次の制作やビルドには、この出力先を新しい作品フォルダーとして使います。

## (b) → (a): ローカル素材をSB3へ登録する

準備した`work`に対して実行します。

```sh
npx --no-install turbowarp-kamishibai convert-dsl4-assets \
  --project-root work \
  --source-manifest work/project.source.yml \
  --base work/base.sb3 \
  --to project --asset Beach \
  --output-dir work/as-project --output-name story \
  --max-source-manifest-bytes 16384 \
  --max-remote-map-bytes 65536 \
  --max-base-sb3-bytes 67108864 \
  --timeout-ms 10000 --max-redirects 3
```

出力された`work/as-project/story.sb3`の背景一覧に`Beach`が登録されます。
`work/as-project/story.k4.yml`は次の参照へ変わり、シーンから使うIDは維持されます。

```yaml
assets:
  Beach:
    kind: backdrop
    name: Beach
    delivery: embedded
```

画像の元ファイルも出力側に保存されます。出力フォルダー内を確認してください。
コスチュームの場合は台本に`kind: costume`と`target: Hero`などの対象を指定し、
ベースSB3に対応するスプライトを用意します。音はステージの音の一覧へ登録されます。

## (a) → (b): SB3内の素材を取り出す

直前の出力を入力として、背景`Beach`をローカルファイルへ戻します。

```sh
npx --no-install turbowarp-kamishibai convert-dsl4-assets \
  --project-root work/as-project \
  --source-manifest work/as-project/project.source.yml \
  --base work/as-project/story.sb3 \
  --to local --asset Beach \
  --output-dir work/as-project/as-local --output-name story \
  --max-source-manifest-bytes 16384 \
  --max-remote-map-bytes 65536 \
  --max-base-sb3-bytes 67108864 \
  --timeout-ms 10000 --max-redirects 3
```

`work/as-project/as-local/assets/`配下にSVGができ、出力YAMLの参照は`name`から`file`へ変わります。
ファイル名にはアセットID由来の名前とハッシュが使われるため、生成された`file`の値をそのまま使用します。
同じ組み込み素材を別のアセットIDが参照している場合を除き、出力SB3の対応する素材登録は取り除かれます。
入力SB3は変わりません。

既存作品でも、台本が`Beach: backdrop`または`kind: backdrop`と`name`で参照していれば同じ操作ができます。
コスチュームの参照先は対象スプライト、背景と音の参照先はステージです。

## (c) → (b): リモート素材を手元へ保存する

別の作品フォルダー`work-remote`に`base.sb3`と同じ形式の`project.source.yml`を置き、
次の`story.k4.yml`を作ります。URLは利用する実際のHTTPS URLに置き換えてください。

```yaml
kamishibai: '4.0'
controls:
  keymaps:
    production:
      Space: navigation.nextAction
assets:
  RemoteBeach:
    kind: backdrop
    delivery: remote
    source:
      url: https://cdn.example.com/beach.svg
scenes:
  opening:
    - stage: RemoteBeach
    - wait: 1
```

```sh
npx --no-install turbowarp-kamishibai convert-dsl4-assets \
  --project-root work-remote \
  --source-manifest work-remote/project.source.yml \
  --base work-remote/base.sb3 \
  --to local --asset RemoteBeach \
  --output-dir work-remote/as-local --output-name story \
  --allow-host cdn.example.com \
  --max-source-manifest-bytes 16384 \
  --max-remote-map-bytes 65536 \
  --max-base-sb3-bytes 67108864 \
  --timeout-ms 10000 --max-redirects 3
```

取得した画像が出力先の`assets/`へ保存され、出力YAMLは`file`と`delivery: embedded`へ変わります。
`source`は取り除かれます。`--allow-host`も、URLに合わせたホスト名へ変更してください。
複数のホストを使う場合は繰り返し指定し、リダイレクト先のホストも許可します。

URLだけの素材は、取得時点の内容を保存します。内容を事前に固定する場合は、`source`に
`integrity`（`sha256-`に続く64桁の小文字16進SHA-256）、`contentType`、`size`を三つとも指定します。
指定した検証情報と取得内容が一致しなければ変換は失敗します。

## (c) → (a): リモート素材をSB3へ登録する

同じ`work-remote`を入力に、変換先を`project`へ変えます。

```sh
npx --no-install turbowarp-kamishibai convert-dsl4-assets \
  --project-root work-remote \
  --source-manifest work-remote/project.source.yml \
  --base work-remote/base.sb3 \
  --to project --asset RemoteBeach \
  --output-dir work-remote/as-project --output-name story \
  --allow-host cdn.example.com \
  --max-source-manifest-bytes 16384 \
  --max-remote-map-bytes 65536 \
  --max-base-sb3-bytes 67108864 \
  --timeout-ms 10000 --max-redirects 3
```

出力SB3の背景一覧へ`RemoteBeach`が登録され、出力YAMLは`name: RemoteBeach`を参照します。
取得した画像の原本は出力先の`assets/originals/`にも保存されます。
通常のローカルプレビューはリモート素材を取得しないため、プレビューしたい素材は先に`local`または`project`へ変換します。

## 変換した作品を検査してビルドする

変換出力のSB3は、更新した組み込み素材を持つ制作用のベースです。
台本を含む配布用SB3を作るには、出力YAMLと出力SB3を組にして`build-dsl4`へ渡します。
次は最初の`work/as-project`を使う例です。

```sh
npx --no-install turbowarp-kamishibai validate-dsl4 \
  --input work/as-project/story.k4.yml

npx --no-install turbowarp-kamishibai build-dsl4 \
  --project-root work/as-project \
  --source-manifest work/as-project/project.source.yml \
  --base work/as-project/story.sb3 \
  --output work/as-project/playable.sb3 \
  --control-profile production --channel bundled
```

ベースが同じchannelの作品をすでに含む場合は、内容を確認したうえで`--replace-existing`を追加します。
再変換やEditorでの保存後も、台本・素材・ベースSB3の組が一致することを確認してください。
配布前には生成した作品を開き、背景、コスチューム、音、モデルを使うシーンを再生します。

## 対応範囲と失敗時の対処

| 項目                     | 対応・制約                                         | 対処                                                                |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| `--to project`の素材種類 | `backdrop`、`costume`、`sound`                     | `image`と`recognitionModel`は`local`へ保存してビルドする            |
| 組み込み形式             | GIF、JPEG、PNG、SVG、MP3、OGG、WAV                 | WebP等は外部ツールで対応形式へ変換してから使う                      |
| コスチュームの対象       | `target`に対応するスプライトが必要                 | ベースSB3と台本の対象を確認する                                     |
| 名前の衝突               | 登録先に変換後のアセットIDと同名の素材があると失敗 | 別のIDにするか、既存素材を参照する宣言へ整理する                    |
| 複数ファイルの台本       | このコマンドにはinclude文の有効化オプションがない  | include文を含む作品を直接変換せず、検証済みの単一YAMLを別途用意する |
| 認識モデル               | `local`化はモデルフォルダーまたは対応ZIPとして扱う | コスチューム化せず、`recognitionModel`と`file`を維持する            |
| 既存の出力先             | 上書きせず失敗する                                 | 新しい出力先名を使う                                                |
| HTTPS取得の失敗          | 許可ホスト、TLS、サイズ、形式、検証情報を検査する  | URL・許可設定・診断を確認して再実行する                             |

`project`化では画像の中心座標や音声のメタデータを生成します。元のEditor固有設定まで完全に復元する
変換とは限らないため、位置や回転、音の再生も確認してください。また、独自のScratchプログラムが
背景・コスチュームを名前や番号で参照している場合、そのプログラムの参照も変換後に確認します。

ローカル出力は検証が成功した後に確定します。失敗時は診断を直し、新しい出力先へ再実行してください。
**切り戻す場合は、元の作品フォルダーと入力SB3へ戻ります。** 元入力へ生成物を上書きする必要はありません。

## 配布プロファイルを使う作品のオフライン化

配布プロファイルは、同じ作品からオンライン用・オフライン用などの配布物を選んで作る設定です。
素材宣言自体を`file`や`name`へ変えたい場合は、ここまでの`convert-dsl4-assets`を使います。
既存の配布設定とlock（素材の内容を固定する記録）を持ち、リモート宣言を保ちながらオフライン版も
作りたい場合は、`vendor-dsl4-assets`を使います。

| ツール                | 役割                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `convert-dsl4-assets` | 制作用の台本・SB3・素材一式を、新しい置き方へ変換する                        |
| `lock-dsl4-assets`    | 設定された配布元を検査し、内容のハッシュ等をlockへ記録する                   |
| `vendor-dsl4-assets`  | lockで固定済みのremoteを検証して手元へ複製し、別の設定・lockを生成する       |
| `audit-dsl4-assets`   | 指定プロファイルの配布内容とオフライン対応を、ネットワーク取得なしで検査する |

次の例は、`distribution`に作成済みの`project.assets.json`と`project.assets.lock.json`がある場合です。
通常の変換でこれらが自動作成されるわけではありません。

```sh
npx --no-install turbowarp-kamishibai vendor-dsl4-assets \
  --project-root distribution \
  --asset-config distribution/project.assets.json \
  --asset-lock distribution/project.assets.lock.json \
  --output-config distribution/project.assets.offline.json \
  --output-lock distribution/project.assets.offline.lock.json \
  --vendor-dir .kamishibai/vendor/dsl4-assets \
  --allow-host cdn.example.com \
  --max-asset-config-bytes 65536 --max-asset-lock-bytes 262144 \
  --timeout-ms 10000 --max-redirects 3
```

ミラーの場所を新しい設定とlockへ記録します。オフライン版のビルドには、それらを
`--asset-config`と`--asset-lock`へ渡し、`network: forbidden`を定義したプロファイルを
`--asset-profile`で明示します。元の設定・lockへ戻せば、元の配布方式へ切り戻せます。
設定の全文とlock生成・ビルド手順は、下記の固定した配布プロファイル仕様を参照してください。

逆方向の`--to remote`も実装されています。既に公開された同一内容の素材へ対応付ける`--remote-map`と、
SSH経由でアップロードする`--rsync-destination`＋`--remote-base-url`の二方式があります。
後者はサーバーへの書き込みを伴い、転送後に公開HTTPS URLから内容を照合します。
転送後の検証で失敗した場合も、転送済みのリモートファイルは自動削除されません。

## 実装根拠と関連資料

以下はすべてrc.22の固定commitを参照します。公開版の操作と、後続の開発版の変更を混同しないためです。

- [CLIの使用法と必須オプション](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/f8048b8c4ebd0ecd6213bb87582862034b2b88ce/src/builder/cli.ts)
- [アセット変換処理](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/f8048b8c4ebd0ecd6213bb87582862034b2b88ce/src/builder/dsl4-asset-converter.ts)
- [組み込み素材の登録・取り出し](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/f8048b8c4ebd0ecd6213bb87582862034b2b88ce/src/builder/dsl4-asset-project-material.ts)
- [変換方向、原本保持、取得失敗を検証するテスト](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/f8048b8c4ebd0ecd6213bb87582862034b2b88ce/test/dsl4-asset-converter.test.ts)
- [配布プロファイル・lock・vendorの仕様と実行例](https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/f8048b8c4ebd0ecd6213bb87582862034b2b88ce/docs/design/dsl-4-asset-distribution-profiles.md)
- [紙芝居DSL 4.0 台本作成ガイド](dsl-4.0-author-guide.md)
- [DSL 4.0 YAMLとブロック台本SB3の相互変換ガイド](dsl-4.0-block-script-conversion-guide.md)
