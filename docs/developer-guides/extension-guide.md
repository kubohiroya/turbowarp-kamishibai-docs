# TurboWarp紙芝居 3.2 機能拡張ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。引用図版には各出典の条件が適用されます。

<p class="extension-overview-kicker">全34ページ。16個の機能拡張を、1拡張につき2ページの見開きで図解する</p>

<div class="extension-reading-key"><section><strong>左ページ・青</strong><span>機能拡張そのもの</span><small>公式ドキュメントに基づく動作・入力・出力・制約</small></section><section><strong>右ページ・橙</strong><span>TurboWarp紙芝居での利用例</span><small>なぜ必要か、実プロジェクトのどこでどう使うか</small></section></div>

`kamishibai=3.1`と`kamishibai=3.2`の台本を動かす3.2.xアプリは、次の16機能拡張を利用します。
読む順番は実行時の読込順ではなく、**Gallery由来 → TurboWarp標準 → 外部埋め込み → アプリ内蔵**です。

<nav class="extension-index-grid" aria-label="機能拡張一覧">
<a href="#extension-consoles"><strong>Consoles</strong><code>sipcconsole</code><span>Gallery｜consoleへ実行記録</span></a>
<a href="#extension-temporary-variables"><strong>Temporary Variables</strong><code>lmsTempVars2</code><span>Gallery｜処理中の状態を共有</span></a>
<a href="#extension-text-operators"><strong>Text</strong><code>strings</code><span>Gallery｜台本文字列を解析</span></a>
<a href="#extension-local-storage"><strong>Local Storage</strong><code>localstorage</code><span>Gallery｜台本と設定を保存</span></a>
<a href="#extension-more-timers"><strong>More Timers</strong><code>lmsTimers</code><span>Gallery｜複数のタイマーを計測</span></a>
<a href="#extension-files"><strong>Files</strong><code>files</code><span>Gallery｜TXT台本を選択</span></a>
<a href="#extension-animated-text"><strong>Animated Text</strong><code>text</code><span>Gallery｜文字を描画・演出</span></a>
<a href="#extension-translate"><strong>Translate</strong><code>translate</code><span>TurboWarp標準｜表示言語を取得</span></a>
<a href="#extension-asset-manager"><strong>Asset Manager</strong><code>kubohiroyaassetmanager</code><span>外部埋め込み｜assetとLoading</span></a>
<a href="#extension-kubohiroyatm"><strong>TurboWarp Teachable Machine</strong><code>kubohiroyatm</code><span>外部埋め込み｜pose認識</span></a>
<a href="#extension-text-lines"><strong>Text Lines</strong><code>kubohiroyatextlines</code><span>外部埋め込み｜台本を行へ分割</span></a>
<a href="#extension-runtime-expression"><strong>Runtime Expression</strong><code>kubohiroyaruntimeexpression</code><span>外部埋め込み｜分岐条件を評価</span></a>
<a href="#extension-svg-text"><strong>SVG Text</strong><code>kubohiroyasvgtext</code><span>npm埋め込み｜相対サイズの文字表示</span></a>
<a href="#extension-async-input"><strong>Async Input</strong><code>kubohiroyaasyncinput</code><span>外部埋め込み｜key・touch入力</span></a>
<a href="#extension-kamishibai-runtime"><strong>Kamishibai Runtime</strong><code>kubohiroyakamishibairuntime</code><span>アプリ内蔵｜台本を事前検査</span></a>
<a href="#extension-web-link"><strong>Web Link</strong><code>kubohiroyaweblink</code><span>アプリ内蔵｜公式URLを開く</span></a>
</nav>

<p class="extension-overview-note"><strong>2種類の数え方:</strong> このガイドは保守するソース単位で16個を説明します。一方、bundle版SB3では、そのうち4個を<code>tmbundle</code>という1個のIDにまとめます。詳しくは次ページを参照してください。</p>

<p class="extension-source extension-overview-source">右ページの実画面例はTurboWarp Editorを高解像度で撮影し、SVG Textだけは公開済み図解ガイドを撮影しています。詳しい呼出し関係は<a href="internal-specification.md">内部仕様書</a>、更新手順は<a href="developer-guide.md">メンテナンスガイド</a>を参照してください。</p>

## 4拡張を1つのIDへまとめる {#extension-bundle .extension-sheet .extension-bundle-sheet}

<p class="extension-spread-label">2 / 34　sb3-toolchainのbundle</p>

<p class="extension-meta"><span>生成時の変換</span><code>tmbundle</code><span>4 components → 1 ID</span></p>

このガイドで説明する16個は、更新・検査する**論理上の機能拡張**です。
sb3-toolchainでbundle版SB3を生成すると、相互に動的opcode参照を行う4個だけを、**1個の複合機能拡張**へまとめます。

<div class="extension-bundle-visual"><div class="extension-bundle-members"><strong>保守する4個のソース</strong><span><code>kubohiroyaassetmanager</code> Asset Manager</span><span><code>text</code> Animated Text</span><span><code>kubohiroyakamishibairuntime</code> Kamishibai Runtime</span><span><code>kubohiroyasvgtext</code> SVG Text</span></div><div class="extension-bundle-arrow"><b>sb3-toolchain</b><span>ビルド時だけ変換</span><strong>→</strong></div><div class="extension-bundle-result"><small>bundle版SB3で見えるID</small><strong>tmbundle</strong><span>1 embedded data URL</span><span>1 register()</span><span>1 permission unit</span></div></div>

<div class="extension-count-compare"><section><small>このガイド／source</small><strong>16</strong><span>論理上の機能拡張</span></section><b>→</b><section><small>bundle版SB3</small><strong>13</strong><span>読込ID</span></section><p>bundle外12個 + <code>tmbundle</code> 1個</p></div>

<div class="extension-columns"><section><p class="extension-subhead">sourceは展開したまま</p><ul><li>4拡張を個別に更新・検査</li><li>GitHub／npmの固定由来を保持</li><li><code>check</code>／<code>sync</code>も個別に実行</li></ul></section><section><p class="extension-subhead">生成物だけを集約</p><ul><li>opcodeとstorageをmember別にnamespace化</li><li>member間の動的opcode参照も変換</li><li>復元用capsuleにより展開可能</li></ul></section></div>

<p class="extension-note"><strong>重要:</strong> 16個の機能が13個へ減るわけではありません。実装を統合するのではなく、配布するSB3の読込・登録単位だけをまとめる仕組みです。依存のないGallery拡張、Translate、TurboWarp Teachable Machineなど12個はbundleの外に残ります。</p>

<figure class="extension-dependency-map"><figcaption><strong>実行時の直接依存関係</strong><span>矢印の先の拡張APIを呼び出す。bundleへの所属とは別の関係です。</span></figcaption><div class="extension-dependency-rows"><div class="extension-dependency-row"><span class="extension-dependency-from">Kamishibai Runtime</span><b>→</b><div><span>Asset Manager</span><span>Runtime Expression</span><span>Temporary Variables</span><span class="extension-dependency-optional">Translate<small>言語fallback</small></span><span class="extension-dependency-optional">Animated Text<small>SVG失敗時</small></span></div></div><div class="extension-dependency-row"><span class="extension-dependency-from">Asset Manager</span><b>→</b><div><span>Temporary Variables</span><span>Animated Text</span></div></div><div class="extension-dependency-row"><span class="extension-dependency-from">Runtime Expression</span><b>→</b><div><span>Temporary Variables</span></div></div><div class="extension-dependency-row"><span class="extension-dependency-from">Async Input</span><b>→</b><div><span>Temporary Variables</span><span class="extension-dependency-optional">TurboWarp Teachable Machine<small>poseInputは現在OFF</small></span></div></div></div><div class="extension-dependency-legend"><span>実線: 現行アプリの利用経路で必要</span><span>破線: fallback／既定OFFの任意経路</span></div><p>Consoles、Text、Local Storage、More Timers、Files、Text Lines、TurboWarp Teachable Machine、SVG Text、Web Linkは、他拡張を直接呼ばず、Stageのblockとruntime変数を介して連携します。</p></figure>

<p class="extension-source">出典: <a href="https://github.com/kubohiroya/sb3-toolchain/blob/b3f4b9aa3ed3ede363700be815fe522f6a47df0b/docs/extension-bundles.md">sb3-toolchain: Extension bundles</a>、<a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/embedded-extensions.json">Version 3.2.0 埋め込みmanifest</a>、<a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/tree/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/extensions">依存APIの実装</a></p>

## Consoles — ログ・警告・エラー・計測結果をブラウザーコンソールへ出力する {#extension-consoles .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 1 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>sipcconsole</code><span>開発支援</span></p>

ブラウザーの開発者ツールにあるJavaScript consoleへ、値をlog、warn、errorなどの種類で出力する拡張です。
group、経過時間の計測、consoleの消去もblockから操作でき、実行中の処理をまとまりと時系列で追跡できます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-consoles.svg" alt="TurboWarp Extension GalleryのConsolesバナー"></figure>

<figure class="extension-flow"><figcaption>配布ソースの機能要約：記録の種類とconsole上の整理</figcaption><div><span>log / info<br>warn / error</span><b>→</b><span>group・timerで整理</span><b>→</b><span>ブラウザーのconsole</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">記録する</p><ul><li>通常値、情報、warning、error</li><li>複数値の結合と整形</li><li>開発者ツールへ即時出力</li></ul></section><section><p class="extension-subhead">追跡する</p><ul><li>処理をgroup化</li><li>timerの開始・終了</li><li>前回のconsoleを消去</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/-SIPC-/consoles.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/-SIPC-/consoles.js">配布ソース</a></p>

## Consolesで台本の実行状況をログへ記録し、停止した処理を突き止める {#extension-consoles-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 1 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>紙芝居はasset読込、scene進行、入力待ちが非同期に重なります。画面だけでは「どの台本行まで進み、どこで止まったか」が分かりにくいため、観客向け表示を汚さずに制作者が舞台裏を追える記録経路が必要です。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-consoles.png" alt="TurboWarp Editorのexec scene定義冒頭で、scene context設定に続いて2つのConsolesログを実行する画面"><figcaption>「exec scene # …」の入口。scene contextを設定し、区切りとscene番号・labelを2つのlogへ記録する順序が分かる範囲だけを示します。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>いつ使う?</strong><span>scene開始、待機、asset生成、Actor処理の節目。</span></section><section><strong>何が分かる?</strong><span>どのcommandまで進み、どこで止まったか。</span></section><section><strong>異常時</strong><span>Kamishibai RuntimeのSVGと同じ原因をconsoleにも残す。</span></section></div>

<p class="extension-note"><strong>このアプリでの役割:</strong> 緑の旗で古いconsoleを消し、<code>journal</code>で進行、<code>error</code>で異常を記録します。表示用errorと開発用logを混ぜないことが重要です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>exec scene # %s with %s</code>）</p>

## Temporary Variables — 実行範囲の異なる一時変数を作成・共有する {#extension-temporary-variables .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 2 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>lmsTempVars2</code><span>状態管理</span></p>

Scratch変数を増やさず、処理の途中だけ必要な名前付き値を保持します。
一つのcustom block内だけのthread variableと、project全体で共有するruntime variableを使い分けます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-temporary-variables.svg" alt="TurboWarp Extension GalleryのTemporary Variablesバナー"></figure>

<figure class="extension-flow"><figcaption>配布ソースの機能要約：値を置く場所で寿命と共有範囲が変わる</figcaption><div><span>custom blockの呼出し</span><b>→</b><span>thread variable<br>その実行だけ</span><b>／</b><span>runtime variable<br>project全体</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">thread variable</p><ul><li>blockの実行stackに所属</li><li>再帰や同時実行で値を分離</li><li>処理終了後に捨てられる</li></ul></section><section><p class="extension-subhead">runtime variable</p><ul><li>全target・拡張から共有</li><li>名前で作成・更新・削除</li><li>project停止時までの一時値</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/Lily/TempVariables2.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/Lily/TempVariables2.js">配布ソース</a></p>

## Temporary Variablesで処理ごとの一時値を分け、同時実行による上書きを防ぐ {#extension-temporary-variables-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 2 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>同じsceneの中でも複数のActorや入力処理が並行します。途中値を通常のScratch変数へ集めると別の実行が上書きし、変数一覧も膨らみます。呼出しごとの値はthreadへ、sceneや拡張をまたぐ合図だけはruntimeへ置くことで、状態の混線を防げます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-temporary-variables.png" alt="TurboWarp Editorのcreate asset定義から、asset解析に使うthread variableブロックだけを切り出した画面"><figcaption>「create asset」の解析部分。indexからasset、skin、resourceIdへ値を受け渡すthread variableの連鎖です。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>局所値</strong><span>assetName、address、引数番号をthreadへ置く。</span></section><section><strong>共有値</strong><span>scene、入力状態、Loading進捗をruntimeへ置く。</span></section><section><strong>連携</strong><span>Runtime ExpressionとAsync Inputが同じruntime値を読む。</span></section></div>

<p class="extension-note"><strong>注意:</strong> runtime variableも永続保存ではありません。再起動後に残す値はLocal Storageを使い、green flag時にruntimeへ戻します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>create asset</code>）</p>

## Text — 文字列を検索・分割・置換する {#extension-text-operators .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 3 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>strings</code><span>文字列処理</span></p>

文字や文章を検索、分割、置換、比較、trimするための文字列演算拡張です。
「含むか」を調べるだけでなく、区切りごとの項目取得、部分文字列、文字種変換などを値blockとして組み合わせられます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-text.svg" alt="TurboWarp Extension GalleryのTextバナー"></figure>

<figure class="extension-flow"><figcaption>公式Galleryと配布ソースの要約：文字列を調べ、必要な形へ作り直す</figcaption><div><span>元のtext</span><b>→</b><span>検索・count・比較</span><b>／</b><span>split・replace・trim</span><b>→</b><span>値／整形済みtext</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">形を調べる</p><ul><li>文字数と出現回数</li><li>前方・後方一致</li><li>厳密な文字列比較</li></ul></section><section><p class="extension-subhead">値を取り出す</p><ul><li>区切り文字でsplit</li><li>部分文字列</li><li>前後の空白をtrim</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/text.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/text.js">配布ソース</a></p>

## Textで台本のコマンド名と引数を、区切り文字から読み取る {#extension-text-operators-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 3 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>紙芝居DSLは、人が直接編集できる一続きのtextです。専用parserをJavaScript側へ隠すのではなく、どの区切りを探し、どの引数を取り出したかをTurboWarpのblockとして読める形にすると、台本仕様と実装を制作者が照合しやすくなります。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-text.png" alt="TurboWarp EditorのselectValue定義から、Text拡張で区切り文字と項目を扱うreturn部分だけを切り出した画面"><figcaption>「selectValue # …」の中核。区切り文字の出現数を調べ、指定項目をtrimして返す2つの分岐です。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>command</strong><span><code>asset=...</code>の最初の<code>=</code>を境界にする。</span></section><section><strong>引数</strong><span>comma区切りの指定位置を取得する。</span></section><section><strong>比較</strong><span>空文字・command名・action名を厳密に照合する。</span></section></div>

<p class="extension-note"><strong>区別:</strong> このTextは文字列演算の<code>strings</code>です。Stageへ文字を描くAnimated Text（ID: <code>text</code>）とは別物です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>selectValue # %s separated by %s from %s</code>）</p>

## Local Storage — 文字列をブラウザーへ保存・取得・削除する {#extension-local-storage .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 4 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>localstorage</code><span>永続保存</span></p>

ブラウザーの保存領域に、project固有のnamespaceで文字列を保持します。
Scratch変数と違い、ページを閉じた後でも次回起動時に読み戻せます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-local-storage.svg" alt="TurboWarp Extension GalleryのLocal Storageバナー"></figure>

<figure class="extension-flow"><figcaption>公式ドキュメントの図解要約：namespaceでprojectごとの保存領域を分ける</figcaption><div><span>key + plain text</span><b>→</b><span>project namespace</span><b>→</b><span>ブラウザーのstorage</span><b>→</b><span>reload後も取得</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">できること</p><ul><li>plain textの保存・取得・削除</li><li>namespace単位の全削除</li><li>別windowでの変更検知</li></ul></section><section><p class="extension-subhead">性質と制約</p><ul><li>通常変数より書込が遅い</li><li>Web版は容量が小さい</li><li>同じnamespaceは互いに上書き</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/local-storage.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/docs/local-storage.md">公式ドキュメント</a></p>

## Local Storageで選んだ台本と言語設定を保存し、次回起動時に復元する {#extension-local-storage-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 4 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>体験会で選んだ台本や表示言語がreloadのたびに消えると、参加者は作品をプレイするより再設定に時間を取られます。小さな設定と台本文字列だけを保存し、次回は前回の続きから始められるようにします。カメラ映像や認識途中の値は保存しません。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-local-storage.png" alt="TurboWarp EditorのstartStory処理から、Local Storageの名前空間設定とscript保存だけを切り出した画面"><figcaption>名前空間を<code>kamishibai</code>に定め、runtimeのscriptをstorageへ書く、隣接した2ブロックです。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>起動時</strong><span>保存済み言語を読み、なければTranslateへ進む。</span></section><section><strong>台本選択</strong><span>Filesで開いたtextを保存し、reloadで再利用する。</span></section><section><strong>UI操作</strong><span>言語変更時に保存値とruntime値を同時更新する。</span></section></div>

<p class="extension-note"><strong>注意:</strong> 同じprojectを複数tabで開くと、後から保存したwindowが値を上書きする可能性があります。小さな設定と台本文字列だけを対象にします。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: green flag）</p>

## More Timers — 複数の名前付きタイマーを個別に管理する {#extension-more-timers .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 5 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>lmsTimers</code><span>時間管理</span></p>

標準timerを一つだけでなく、文字列で名付けた複数のタイマーとして並行管理します。
各timerを個別に開始、pause、resume、reset、増減、削除できるため、重なった処理の経過時間を独立して扱えます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-more-timers.svg" alt="TurboWarp Extension GalleryのMore Timersバナー"></figure>

<figure class="extension-flow"><figcaption>公式Galleryと配布ソースの要約：名前ごとに独立したtimerのlife cycle</figcaption><div><span>start / reset</span><b>→</b><span>pause / resume<br>値を読む・増減</span><b>→</b><span>remove</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">個別timer</p><ul><li>名前で作成・照会</li><li>pause／resume</li><li>reset、増減、削除</li></ul></section><section><p class="extension-subhead">複数のタイマー</p><ul><li>互いの値を上書きしない</li><li>存在する名前を確認</li><li>必要なら全timerを削除</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/Lily/MoreTimers.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/Lily/MoreTimers.js">配布ソース</a></p>

## More Timersで待機時間を計測しながら、利用者のスキップ操作にも応答する {#extension-more-timers-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 5 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>標準の「待つ」だけでは、待機中に観客がskipしても、その時間が終わるまでsceneを進められません。名前付きtimerの値とskipの両方を短いloopで確認すれば、予定時間を守りながら操作にもすぐ反応できます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-more-timers.png" alt="TurboWarp Editorのwait定義から、More Timersの開始、値取得、削除を含む接続部分だけを切り出した画面"><figcaption>「wait seconds」のtimer部分。開始／reset、経過値の監視、最後の削除までを一続きで示します。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>通常終了</strong><span>指定秒数へ達したらloopを抜ける。</span></section><section><strong>skip</strong><span>runtimeのskip状態でもloopを抜ける。</span></section><section><strong>後片付け</strong><span>どちらの終了でも名前付きtimerを削除する。</span></section></div>

<p class="extension-note"><strong>設計上の要点:</strong> Scratchの長い「待つ」ブロックに任せず、短いloopでtimerとskipを同時に監視します。これによりプレイ中の操作へすぐ反応できます。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>wait %s seconds</code>）</p>

## Files — ローカルファイルの読込みとダウンロードを行う {#extension-files .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 6 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>files</code><span>ファイル入力</span></p>

利用者が選択またはdrag & dropしたlocal fileを、textまたはdata URLとしてprojectへ渡す拡張です。
逆にproject内の値をfilename付きでdownloadでき、ブラウザーのfile pickerとTurboWarpのblockを橋渡しします。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-files.svg" alt="TurboWarp Extension GalleryのFilesバナー"></figure>

<figure class="extension-flow"><figcaption>公式Galleryと配布ソースの要約：local fileを値へ、値をdownloadへ</figcaption><div><span>click / drop</span><b>→</b><span>file picker</span><b>→</b><span>text / data URL<br>+ filename</span><b>↔</b><span>download</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">入力</p><ul><li>拡張子・MIME type指定</li><li>text／data URL</li><li>cancel時は空文字</li></ul></section><section><p class="extension-subhead">出力</p><ul><li>filename付きdownload</li><li>ブラウザー内で完結</li><li>明示的な利用者操作から開始</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/files.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/files.js">配布ソース</a></p>

## Filesで参加者が選んだTXT台本を、埋め込み台本と同じ検査・実行経路へ渡す {#extension-files-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 6 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>このアプリの体験会を実施する場合を想定すると、参加者が書いたTXT台本をその場ですぐ試してもらいたい一方、どのような技量・経験を持った参加者が集まるかがわからず時間的制約もある状況では、台本ごとにWebへ公開したりアプリを作り直したりはできません。端末上のfileを利用者のclickで選び、埋め込み台本と同じ検査・実行経路へ渡す入口になります。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-files.png" alt="TurboWarp Editorの初期化処理から、Filesのモード設定と直後のshowTitle broadcastだけを切り出した画面"><figcaption>ファイル選択を「すぐにセレクターを開く」に設定してから、title画面を表示する2ブロックです。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>UiItem</strong><span>menu buttonの操作からpickerを開く。</span></section><section><strong>runtime</strong><span>選択した全文を<code>script</code>へ渡す。</span></section><section><strong>合流</strong><span>埋め込み台本と同じpreflight・asset登録へ進む。</span></section></div>

<p class="extension-note"><strong>安全性:</strong> pickerは利用者clickに続いて開きます。cancelで空文字になった場合は、保存済み台本を勝手に置き換えません。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（UiItem: <code>runUiItemAction</code>）</p>

## Animated Text — 文字列をスプライトの見た目として描画・アニメーションする {#extension-animated-text .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 7 / 7　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>text</code><span>文字描画</span></p>

spriteへ文字専用のrenderer skinを作り、font、色、幅、配置、outlineを設定して表示する拡張です。
文章をtyping、rainbow、zoom、shakeなどで演出でき、Scratch LabのAnimated Text実験と互換性があります。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-animated-text.svg" alt="TurboWarp Extension GalleryのAnimated Textバナー"></figure>

<figure class="extension-flow"><figcaption>公式Galleryと配布ソースの要約：textをspriteの見た目へ変換する</figcaption><div><span>text + font<br>色・幅・配置</span><b>→</b><span>renderer skin</span><b>→</b><span>spriteへ表示</span><b>→</b><span>animation</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">style</p><ul><li>font、色、outline</li><li>幅、折返し、align</li><li>spriteのskinとして描画</li></ul></section><section><p class="extension-subhead">animation</p><ul><li>typing</li><li>rainbow、zoom</li><li>shakeなどの演出</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/lab/text.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/lab/text.js">配布ソース</a></p>

## Animated Textで台詞やメニューの文字列を画面へ描画する {#extension-animated-text-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 7 / 7　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>台詞、menu、prompt、診断文は台本や言語によって変わるため、すべてを事前にcostumeへ描いておくことはできません。実行時の文字列をStage上の見た目に変換すれば、同じUI部品を内容だけ差し替えて再利用できます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-animated-text.png" alt="TurboWarp EditorのStageから、Asset Managerで文字assetを登録しstyleを設定する接続部分だけを切り出した画面"><figcaption>実プロジェクトでは、文字をAsset Managerへ登録し、font・color・width・alignを設定します。ここに見える青いblockはAsset Managerであり、Animated Textの呼出しはその内部で行われます。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>project側</strong><span>Asset Managerでtext assetとstyleを登録する。</span></section><section><strong>内部呼出し</strong><span><code>text_setFont</code>等のopcodeをruntimeから取得する。</span></section><section><strong>描画時</strong><span><code>text_setText</code>／<code>text_animateText</code>でskinを作る。</span></section></div>

<p class="extension-note"><strong>重要:</strong> 接続済みscriptにAnimated Text blockはありません。Asset Managerが表示時に<code>text_setFont</code>、<code>text_setColor</code>、<code>text_setWidth</code>、<code>text_setText</code>／<code>text_animateText</code>をprogrammaticに呼ぶ依存関係です。</p>

<p class="extension-note"><strong>DSL 3.2:</strong> この経路は旧Text Assetのdeprecated互換機能として少なくとも3.2系列で維持します。3.2.0には<a href="https://github.com/kubohiroya/turbowarp-svg-text">turbowarp-svg-text</a>も組み込まれており、新旧を併用できます。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（text asset登録・style設定）、内部実装: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/extensions/kubohiroyaassetmanager.js#L1491-L1503">Asset ManagerからAnimated Text opcodeを取得する処理</a></p>

## Translate — 文章を翻訳し、閲覧環境の言語を取得する {#extension-translate .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">TurboWarp標準 1 / 1　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>TurboWarp標準</span><code>translate</code><span>表示言語</span></p>

Scratch／TurboWarp標準の翻訳拡張です。文章と翻訳先の言語を指定するblockに加え、viewerで選択中の言語を返します。
翻訳結果とviewer languageは別のreporterであり、後者は通信せずに現在のlocale名を取得します。

<div class="extension-concept-hero"><div class="extension-icon">文<br><small>Language</small></div><div><strong>翻訳とviewer言語を別々に取得</strong><p>文章の翻訳結果と、現在のTurboWarp UIが使う言語名をreporterとして返します。</p></div></div>

<figure class="extension-flow"><figcaption>scratch-vm実装の要約：二つの独立したreporter</figcaption><div><span>text + target language</span><b>→</b><span>translation</span><b>／</b><span>viewer locale</span><b>→</b><span>language名</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">翻訳reporter</p><ul><li>入力textと翻訳先を指定</li><li>対応言語から選択</li><li>結果を文字列で返す</li></ul></section><section><p class="extension-subhead">language reporter</p><ul><li>viewerのlocaleを取得</li><li>通信を必要としない</li><li>UI初期値の判断に使える</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/scratch-vm/blob/c4823421cb7c17d8d8a89878851ce1668c26a21f/src/extensions/scratch3_translate/index.js">固定scratch-vmのTranslate実装</a></p>

## Translateで閲覧環境の言語を取得し、初期表示へ反映する {#extension-translate-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">TurboWarp標準 1 / 1　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>初めて開いた利用者には日本語か英語のどちらかを提示する必要がありますが、選択前には保存値がありません。そこでviewerの言語を一度だけ「最初の推測」に使い、その後は利用者自身の選択を優先します。台本文を自動翻訳するための利用ではありません。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-translate.png" alt="TurboWarp Editorの初期化条件から、Translateの言語reporterと親のor条件だけを切り出した画面"><figcaption>保存済み言語がないときの条件内にあるTranslateの「言語」reporter。日本語／英語の初期判定に使います。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>優先1</strong><span>Local Storageに保存済みの利用者選択。</span></section><section><strong>優先2</strong><span>Translateのviewer language。</span></section><section><strong>結果</strong><span>runtime変数を通して全UIへbroadcast。</span></section></div>

<p class="extension-note"><strong>方針:</strong> ブラウザーのlocaleを毎回強制せず、利用者が一度選んだUI言語を優先します。Translateは初期値を決める補助です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: green flag）</p>

## Asset Manager — 異なる場所・種類の素材を名前付きで管理・操作する {#extension-asset-manager .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 1 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaassetmanager</code><span>0.4.1</span></p>

Web上の画像・音声、SB3内のcostume・backdrop・sound、実行時textを一つの名前付き登録簿で扱います。
登録後は素材の置き場所や種類に応じた処理を拡張が選び、共通のasset名で表示、再生、animation、cacheを操作できます。

<div class="extension-concept-hero"><div class="extension-icon">A<br><small>Assets</small></div><div><strong>素材の住所を隠す登録簿</strong><p>URL、project内素材、textを同じasset名へまとめ、Stage・Actor・音声へ配ります。</p></div></div>

<figure class="extension-flow"><figcaption>公式図解ガイドの要約：異なる素材を一つの登録簿から適切な出力先へ</figcaption><div><span>Web URL<br>project内素材<br>動的text</span><b>→</b><span>名前 + 種類を登録<br>Web素材はcache</span><b>→</b><span>sprite / Stage<br>sound / Actor timeline</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">読込</p><ul><li>種類判定と取得</li><li>IndexedDB cache</li><li>Loading用の素材を先行</li></ul></section><section><p class="extension-subhead">利用</p><ul><li>Stage／sprite skin</li><li>音声再生・停止</li><li>Actor loop／sequence</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-asset-manager/ja/">Asset Manager図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-asset-manager/tree/c55e65787eed21d2e70b96a28dd6705d118f9995">固定commit c55e657</a></p>

## Asset Managerで台本指定の素材を読み込み、名前で背景・登場人物・音を操作する {#extension-asset-manager-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 1 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>紙芝居の作者には、素材がURLかSB3内のcostumeかを意識せず「Hero」「海」「鐘」のような名前で台本を書いてほしいからです。登録と読込を一か所へ集めることで、local素材は通信なしで速く使い、Web素材はcacheし、Loading進捗も同じ単位で数えられます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-asset-manager.png" alt="TurboWarp Editorのcreate asset定義から、Asset Managerの読込確認、登録、背景設定だけを切り出した画面"><figcaption>読込完了を待ち、resourceをassetとして登録し、Loading用なら背景へ反映する接続部分です。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>開始前</strong><span>Loading backdropとcostumeを先に登録。</span></section><section><strong>登録中</strong><span>台本の全assetを名前・addressで登録。</span></section><section><strong>実行中</strong><span>同じ名前で背景、Actor、音、textを操作。</span></section></div>

<p class="extension-note"><strong>address例:</strong> <code>costume:Actor:hero1</code>、<code>backdrop:sea</code>、<code>sound:Stage:bell</code>。project内参照はsprite名と素材名を正確に指定します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>create asset</code>）</p>

## TurboWarp Teachable Machine — 学習済みモデルでカメラ映像のポーズを認識する {#extension-kubohiroyatm .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 2 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyatm</code><span>1.4.0</span></p>

Teachable Machine Pose modelとカメラ映像を接続し、現在のpose名とconfidenceをTurboWarpの値として返します。
model、camera、preview、predictionを別々に開始・停止できます。

<div class="extension-concept-hero"><div class="extension-icon">◎<br><small>Pose</small></div><div><strong>身体の動きを数値と名前へ</strong><p>カメラ映像から骨格を推定し、Teachable Machineで学習したposeごとのconfidenceを返します。</p></div></div>

<figure class="extension-flow"><figcaption>公式図解ガイドの要約：1枚の映像から現在値と時間でならした値へ</figcaption><div><span>カメラ映像</span><b>→</b><span>姿勢推定<br>keypoints</span><b>→</b><span>TM classifier</span><b>→</b><span>label・confidence<br>蓄積score</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">現在の認識</p><ul><li>pose labelとconfidence</li><li>すばやい動きへ即時反応</li><li>camera previewを配置</li></ul></section><section><p class="extension-subhead">時間を含む認識</p><ul><li>confidenceを蓄積・減衰</li><li>一瞬の揺れを平滑化</li><li>開始・停止を個別管理</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-teachable-machine/ja/">TurboWarp Teachable Machine図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-teachable-machine/tree/08fe0cf9da061b1eba75297b8ee187d68549eed4">固定commit 08fe0cf</a></p>

## TurboWarp Teachable Machineで観客のポーズを認識し、物語を進める入力として扱う {#extension-kubohiroyatm-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 2 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>このアプリでは、観客がkeyやbuttonを押すだけでなく、物語に合わせて体を動かすこと自体が入力になります。学習済みmodel、camera、preview、認識loopを別々に管理できるため、必要なsceneだけでcameraを使い、poseが十分確かになった時に物語を進められます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-tmpose.png" alt="TurboWarp Editorから、TurboWarp Teachable Machineの認識開始とcamera preview表示を呼ぶ2つの補助定義だけを切り出した画面"><figcaption><code>start pose recog</code>と<code>start camera preview</code>。各custom blockが対応するTurboWarp Teachable Machine blockを1つずつ呼びます。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>scene準備</strong><span><code>TMPoseURL</code>でmodelをload。</span></section><section><strong>action</strong><span>指定poseのscoreが閾値を超えるまで反復。</span></section><section><strong>終了</strong><span>skip、scene終了、stopでpredictionとcameraを停止。</span></section></div>

<p class="extension-note"><strong>実行条件:</strong> camera権限とHTTPSが必要です。modelとTensorFlow／Teachable Machine libraryの取得にはnetwork接続を使います。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>setTMPoseURL</code> / <code>exec pose</code>）</p>

## Text Lines — 複数行の文字列を行単位で取得・リスト化する {#extension-text-lines .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 3 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyatextlines</code><span>0.1.1</span></p>

長いtextを改行位置で分割し、行数、指定行、Scratch listとして扱います。
LF、CRLF、CRを同じ改行として正規化するため、台本を作ったOSに依存しません。

<div class="extension-concept-hero"><div class="extension-icon">≡<br><small>Lines</small></div><div><strong>一つのtextを物理行へ</strong><p>元sourceの行番号を保ったまま、preflightと実行loopへ渡します。</p></div></div>

<figure class="extension-flow"><figcaption>公式図解ガイドの要約：1つの入力から用途別の3つの結果を得る</figcaption><div><span>複数行text</span><b>→</b><span>LF / CRLF / CR<br>を正規化</span><b>→</b><span>行数<br>指定した1行<br>list全置換</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">入力</p><ul><li>LF、CRLF、CR</li><li>空行を含む全文</li><li>UTF-8の台本文字列</li></ul></section><section><p class="extension-subhead">出力</p><ul><li>行数</li><li>1始まりの指定行</li><li>list全置換</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-text-lines/ja/">Text Lines図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-text-lines/tree/8655d764cf3af0d783ba6f138086db927abd3570">固定commit 8655d76</a></p>

## Text Linesで台本を行ごとに分け、エラー表示を元のTXTの行番号へ対応させる {#extension-text-lines-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 3 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>台本のerrorを直す人にとって最も役立つ手掛かりは、元のTXTと一致する行番号です。OSごとの改行差を吸収しつつ、検査と実行が同じ物理行のlistを使えば、「表示された行」と「直すべき行」がずれません。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-text-lines.png" alt="TurboWarp Editorのcreate sceneList定義から、Text LinesでsceneBlockをlinesへ展開する周辺だけを切り出した画面"><figcaption>scene単位に切り出した文字列を、Text Linesの1 blockで<code>lines</code> listへ展開する部分です。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>preflight</strong><span>物理行番号とcommandを一緒に検査。</span></section><section><strong>実行</strong><span>同じ<code>lines</code> listをscene生成へ渡す。</span></section><section><strong>診断</strong><span>errorの行番号を元TXTへ正確に対応。</span></section></div>

<p class="extension-note"><strong>listの扱い:</strong> 書込blockは追記ではなく全置換です。前回台本の行が残らないため、reloadしても行番号がずれません。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>create sceneList</code>）</p>

## Runtime Expression — 一時変数を参照する制限付き条件式を安全に評価する {#extension-runtime-expression .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 4 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaruntimeexpression</code><span>0.2.0</span></p>

Temporary Variablesのruntime値を、JavaScriptに似た制限付き条件式から参照し、true／falseを返します。
任意codeを実行せず、許可した比較、論理、算術、括弧だけを評価します。

<div class="extension-concept-hero"><div class="extension-icon">{?}<br><small>Expr</small></div><div><strong>状態を真偽値と変化eventへ</strong><p><code>score &gt;= 3 && hasKey</code>のような式を検査して評価し、必要ならfalse／trueの変化をbroadcastします。</p></div></div>

<figure class="extension-flow"><figcaption>公式図解ガイドの要約：現在の判定と、判定結果が変わった時の通知</figcaption><div><span>runtime variables<br>+ 条件式</span><b>→</b><span>制限付きparser</span><b>→</b><span>true / false</span><b>／</b><span>false↔true時だけ<br>broadcast</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">条件reporter</p><ul><li>比較、論理、算術、括弧</li><li><code>vars["日本語名"]</code></li><li>代入・関数呼出しは禁止</li></ul></section><section><p class="extension-subhead">条件付きbroadcast</p><ul><li>最初の状態を記憶</li><li>結果が変化した時だけ通知</li><li>IDで置換・解除・timeout</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-runtime-expression/ja/">Runtime Expression図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-runtime-expression/tree/7e2bd99fa57fa9f0cbe6b91306b4c53322f00aa3">固定commit 7e2bd99</a></p>

## Runtime Expressionで台本の条件式を安全に評価し、最初に成立した場面へ進む {#extension-runtime-expression-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 4 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>台本作者は「scoreが3以上なら次のsceneへ」のような分岐を書きたい一方、外部台本から任意のJavaScriptを動かしてはいけません。読める条件式の形を保ちつつ、許可した演算だけを現在のruntime値へ適用する安全な境界になります。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-runtime-expression.png" alt="TurboWarp Editorのexec branch action定義で、condition文字列を取り出し、Runtime Expressionで評価して次の条件へ進む画面"><figcaption>branch条件を1件ずつ読むloop。thread variableへ式を取り出し、<code>condition</code> reporterで現在のruntime値に対して評価してから次の条件へ進みます。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>登録</strong><span><code>registerBranch</code>が式とscene labelを保持。</span></section><section><strong>評価</strong><span>上から順にruntime値を使って判定。</span></section><section><strong>決定</strong><span>最初にtrueとなった遷移先だけを採用。</span></section></div>

<p class="extension-note"><strong>二段階の安全性:</strong> Kamishibai Runtimeが実行前にsyntaxを検査し、scene移動時にRuntime Expressionが現在値で評価します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>exec branch action</code>）</p>

## SVG Text — 名前付きスタイルで相対サイズの吹き出しとSVG文字を描画する {#extension-svg-text .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 5 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>npm埋め込み</span><code>kubohiroyasvgtext</code><span>0.1.0</span></p>

背景色、文字色、font、相対font size、配置、吹き出し方向を名前付きstyleとして定義し、say／think bubbleとsprite自身のSVG text skinで共有する拡張です。文字列中の<code>\n</code>を複数のSVG <code>tspan</code>へ変換します。

<div class="extension-concept-hero"><div class="extension-icon">Aa<br><small>SVG</small></div><div><strong>画面と一緒に拡大する文字</strong><p>size 100を480×360 stageの14px相当とし、stage寸法が変わっても相対的な大きさを保ちます。</p></div></div>

<figure class="extension-flow"><figcaption>公式図解ガイドの要約：一つのstyleを二つの表示方法へ適用する</figcaption><div><span>名前付きstyle<br>+ 複数行text</span><b>→</b><span>stage scaleで再計算</span><b>→</b><span>say / think bubble</span><b>／</b><span>SVG text actor</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">style</p><ul><li>背景色・文字色・font</li><li>size 1〜1000、左右／中央揃え</li><li>上下左右と斜めの8方向</li></ul></section><section><p class="extension-subhead">再描画</p><ul><li>stage size変更へ追従</li><li>同名styleの再定義へ追従</li><li>0.1.0ではanimationなし</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-svg-text/ja/">SVG Text日本語図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-svg-text/tree/v0.1.0">固定release v0.1.0</a>、<a href="https://www.npmjs.com/package/@kubohiroya/turbowarp-svg-text/v/0.1.0">npm 0.1.0</a></p>

## SVG Textで吹き出しとテキストアクターの見た目を共有する {#extension-svg-text-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 5 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>大きなstageや全画面表示で吹き出しだけが相対的に小さくならないことに加え、登場人物に従属するbubbleではなく、タイトルやナレーションをActor自身として配置したいからです。同じstyle名を使えば、別々の表示方法でも配色と文字設計を揃えられます。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-svg-text.png" alt="SVG Text日本語図解ガイドにある複数行のsay、think、SVGテキストアクターの使用例"><figcaption>公開済み日本語ガイドの3つの使用例。<code>\n</code>で改行し、同じ名前付きstyleを吹き出しとSVG text actorへ適用します。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>header</strong><span><code>svgTextStyle</code>で共通styleを定義。</span></section><section><strong>Actor</strong><span><code>setText</code>でActor自身をSVG文字へ変更。</span></section><section><strong>bubble</strong><span><code>say|think:TEXT:SECONDS:STYLE</code>で個別に選択。</span></section></div>

<p class="extension-note"><strong>DSL 3.2:</strong> <code>svgTextStyle</code>で定義したstyleを、<code>setText</code>または<code>action=ACTOR:say|think:TEXT:SECONDS:STYLE</code>から使います。後者は内部で<code>sayWithStyle</code>／<code>thinkWithStyle</code>を呼び、STYLE省略時は<code>default</code>を使います。旧Text Assetもdeprecated互換として維持します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>svgTextStyle</code>、Actor: <code>setText</code>）、<a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/pull/270">スタイル付きsay／think実装PR</a>、図版: <a href="https://kubohiroya.github.io/turbowarp-svg-text/ja/">SVG Text日本語ガイド</a></p>

## Async Input — キー・タッチ・カスタム入力を値更新と通知へ接続する {#extension-async-input .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 6 / 6　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaasyncinput</code><span>0.2.0</span></p>

key、sprite／cloneのtouch、任意機能のpose入力を、Temporary Variablesのruntime値更新とbroadcastへ接続します。
bindingは登録したtargetが所有し、値を更新してから受信scriptの完了を待たずにmessageを送ります。

<div class="extension-concept-hero"><div class="extension-icon">↯<br><small>Input</small></div><div><strong>異なる入力を同じeventの形へ</strong><p>key、touch、poseを「runtime値を更新し、必要ならmessageを送る」target所有のbindingへ揃えます。</p></div></div>

<figure class="extension-flow"><figcaption>公式READMEの要約：入力をtarget所有のbindingから共通経路へ流す</figcaption><div><span>key / touch<br>pose（任意）</span><b>→</b><span>target-owned binding</span><b>→</b><span>runtime値を先に更新</span><b>→</b><span>broadcast<br>待機しない</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">登録</p><ul><li>KeyboardEvent.code</li><li>sprite／clone／Actor名</li><li>代入または算術更新</li></ul></section><section><p class="extension-subhead">解除</p><ul><li>cover表示</li><li>scene境界</li><li>target削除・stop</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/kubohiroya/turbowarp-async-input/blob/3ecd7ff406b86fd957333ae4978cec118322ebd1/README.md">Async Input公式README</a>、<a href="https://github.com/kubohiroya/turbowarp-async-input/tree/3ecd7ff406b86fd957333ae4978cec118322ebd1">固定commit 3ecd7ff</a></p>

## Async Inputでキー・画面タッチ・ポーズ入力を、競合しない場面遷移へまとめる {#extension-async-input-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 6 / 6　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>key、画面のActor、poseごとに「入力を待つ」scriptを増やすと、同時発火やsceneをまたいだ古い待機が競合します。入力源は違ってもruntime値とbroadcastへ合流させ、最初に成立した操作の後で残りを解除できる構造が必要です。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-async-input.png" alt="TurboWarp EditorのkeyInputToChangeScene定義から、Async Input listenerと引数準備を含む接続部分だけを切り出した画面"><figcaption>keyとscene labelを対応付け、listenerがruntime更新とbroadcastを行う1回分のloopです。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>key</strong><span>物理keyからscene labelを選ぶ。</span></section><section><strong>touch</strong><span>画面のActor名から同じ遷移へ合流。</span></section><section><strong>競合</strong><span>最初の入力で解決し、残りのlistenerを解除。</span></section></div>

<p class="extension-note"><strong>後片付け:</strong> 登録はtargetごとに所有されます。sceneをまたいだ古いlistenerが次の場面で発火しないよう、境界で必ず停止します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>keyInputToChangeScene</code>）</p>

## Kamishibai Runtime — 紙芝居DSLを事前検査し、構造化診断とSVGを生成する {#extension-kamishibai-runtime .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">アプリ内蔵 1 / 2　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>アプリ内蔵</span><code>kubohiroyakamishibairuntime</code><span>DSL診断</span></p>

紙芝居DSL 3.1／3.2を実行前に検査し、旧Text Assetのdeprecated警告と、失敗時の分類済み診断・SVG error画面を作るproject専用拡張です。
正常な台本の実行は置き換えず、副作用を始めてよいかだけを判定します。

<div class="extension-concept-hero"><div class="extension-icon">✓<br><small>Preflight</small></div><div><strong>安全に失敗する入口</strong><p>cameraや音声を始める前に、version、command、参照、条件式をまとめて検査します。</p></div></div>

<figure class="extension-flow"><figcaption>内部仕様の要約：副作用を始める前に段階的に検査し、構造化した結果を返す</figcaption><div><span>DSL + project</span><b>→</b><span>version・構文</span><b>→</b><span>scene / asset参照<br>address・条件式</span><b>→</b><span>実行許可<br>／ SVG診断</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">検査</p><ul><li>version、command、action</li><li>scene／asset参照</li><li>addressと条件式syntax</li></ul></section><section><p class="extension-subhead">診断</p><ul><li>error code</li><li>行・列</li><li>source抜粋とSVG文字</li></ul></section></div>

<p class="extension-source">出典: <a href="internal-specification.md">紙芝居アプリ 3.2 内部仕様書</a>、<a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/extensions/kubohiroyakamishibairuntime.js">内蔵拡張ソース</a></p>

## Kamishibai Runtimeで素材読込やカメラ開始の前に台本を検査し、エラーを表示する {#extension-kamishibai-runtime-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">アプリ内蔵 1 / 2　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>外部から読み込む台本には、綴り間違いだけでなく、存在しないsceneや素材、危険なaddressが含まれ得ます。asset取得やcamera開始の後で失敗すると、利用者には半端な画面しか残りません。プレイ前に止め、直す行と理由を読める形で示します。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-kamishibai-runtime.png" alt="TurboWarp EditorのstartStory処理から、Kamishibai Runtimeのvalidateと直後の初期化だけを切り出した画面"><figcaption><code>startStory</code>直後にvalidateし、成功した場合だけskip状態の初期化やcamera開始へ進む順序を示します。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>位置</strong><span><code>startStory</code>直後、asset／cameraより前。</span></section><section><strong>失敗</strong><span>背景作業を始めず、promptへSVG診断を表示。</span></section><section><strong>成功</strong><span>従来のStage custom block群へ処理を返す。</span></section></div>

<p class="extension-note"><strong>責任境界:</strong> DSL parser／実行器全体ではありません。実行前の限定preflightと、利用者が直せる診断表示に責任を絞っています。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（Stage: <code>startStory</code>）</p>

## Web Link — HTTPS URLを検証し、新しいタブで開く {#extension-web-link .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">アプリ内蔵 2 / 2　機能拡張そのもの 1 / 2</p>

<p class="extension-meta"><span>アプリ内蔵</span><code>kubohiroyaweblink</code><span>外部navigation</span></p>

受け取ったURLを検証し、ブラウザーの新しいタブで開くproject専用の小さな拡張です。
任意schemeを許可せず、HTTPS URLへの明示的なnavigationだけをblock化します。

<div class="extension-concept-hero"><div class="extension-icon">↗<br><small>HTTPS</small></div><div><strong>アプリの外へ出る一つの安全な扉</strong><p>絶対URL、HTTPS、noopener／noreferrerを確認してから新しいtabを開きます。</p></div></div>

<figure class="extension-flow"><figcaption>内部仕様の要約：文字列を検証し、開いたtabと元projectを分離する</figcaption><div><span>URL文字列</span><b>→</b><span>絶対URLとしてparse</span><b>→</b><span>https:だけ許可</span><b>→</b><span>new tab<br>noopener / noreferrer</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">許可</p><ul><li>絶対URL</li><li><code>https:</code></li><li>利用者clickからの呼出し</li></ul></section><section><p class="extension-subhead">拒否</p><ul><li><code>http:</code></li><li><code>file:</code>／<code>javascript:</code></li><li>通常sceneからの任意navigation</li></ul></section></div>

<p class="extension-source">出典: <a href="internal-specification.md">紙芝居アプリ 3.2 内部仕様書</a>、<a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/extensions/kubohiroyaweblink.js">内蔵拡張ソース</a></p>

## Web Linkで利用者がボタンやメニューを操作したとき、設定済みのHTTPSページを開く {#extension-web-link-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">アプリ内蔵 2 / 2　TurboWarp紙芝居での利用例 2 / 2</p>

<aside class="extension-kamishibai-why"><strong>なぜTurboWarp紙芝居に必要？</strong><p>このアプリでは、公式サイトbuttonやmenu項目からWebページへ案内します。一方、台本中の任意URLが勝手にtabを開く設計にはできません。利用者の操作をきっかけに、アプリ側で設定されたHTTPS URLだけを開くことで、案内機能と安全なプレイを両立します。</p></aside>

<figure class="extension-editor-example"><img src="../images/extension-editor-web-link.png" alt="TurboWarp EditorのofficialWebsiteButtonから、クリックeventとWeb Link blockだけを切り出した画面"><figcaption>buttonクリック直後に、Web Linkが公式HTTPS URLを新しいtabで開く2ブロックのstackです。</figcaption></figure>

<div class="extension-usage-grid"><section><strong>入口</strong><span>公式サイトbutton、<code>open-url</code>を指定したUI項目。</span></section><section><strong>値</strong><span>公式サイトURLまたはUI項目へ設定したHTTPS URL。</span></section><section><strong>制約</strong><span>通常のscene actionからは呼び出さない。</span></section></div>

<p class="extension-note"><strong>browser policy:</strong> popup blockを避けるため、利用者clickに続けて実行します。新しいtabには<code>noopener,noreferrer</code>を付けます。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/turbowarp-kamishibai-app/blob/d1624c9ce9464bf696b4bb97851dce9154a09ee6/app/project.source.json">Version 3.2.0 project source</a>（<code>officialWebsiteButton</code>）</p>
