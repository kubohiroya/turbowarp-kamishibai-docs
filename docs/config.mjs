export const dsl4PublicationStatus = Object.freeze({
  verifiedOn: '2026-08-26',
  implementationCommit: '65f5e705921b6c92ba6ec5373ec13eff5101f2c6',
  latestPublishedRelease: 'v3.2.3',
  publishedDsl4Prerelease: 'v4.0.0-rc.10',
  officialDsl4Release: null,
});

export const documentUpdatedAt = Object.freeze({
  'executive-summary-adult.md': '2026-08-08',
  'executive-summary-adult-4.0.md': '2026-08-20',
  'executive-summary-kids.md': '2026-08-08',
  'executive-summary-kids-4.0.md': '2026-08-20',
  'user-guide.md': '2026-08-08',
  'user-guide-4.0.md': '2026-08-20',
  'dsl-manual.md': '2026-08-08',
  'command-reference.md': '2026-08-08',
  'history.md': '2026-08-04',
  'dsl-4.0-author-guide.md': '2026-08-20',
  'dsl-4.0-schema-reference.md': '2026-08-20',
  'dsl-4.0-history.md': '2026-08-20',
  'dsl-3.2-to-4.0-conversion-guide.md': '2026-08-20',
  'dsl-4.0-turbowarp-broadcast-guide.md': '2026-08-20',
  'dsl-4.0-runtime-block-reference.md': '2026-08-20',
  'dsl-4.0-runtime-variable-guide.md': '2026-08-20',
  'dsl-4.0-runtime-variable-turbowarp-reference.md': '2026-08-20',
  'play.md': '2026-08-20',
  'create.md': '2026-08-20',
  'application-materials-guide.md': '2026-08-09',
  'application-materials-guide-4.0.md': '2026-08-20',
  'developer-guide.md': '2026-08-12',
  'developer-guide-4.0.md': '2026-08-20',
  'internal-specification.md': '2026-08-08',
  'internal-specification-4.0.md': '2026-08-20',
  'extension-guide.md': '2026-08-08',
  'extension-guide-4.0.md': '2026-08-20',
  'dsl-3.1-diagnostics-design.md': '2026-08-04',
  'dsl-4.0-diagnostics-design.md': '2026-08-20',
  'dependency-audit.md': '2026-08-08',
  'release-smoke.md': '2026-08-04',
  'release-smoke-4.0.md': '2026-08-20',
  'upstream-fork-policy.md': '2026-08-25',
  'tm-extension-id-migration.md': '2026-08-25',
  'turbowarp-ecosystem.md': '2026-08-26',
});

export const documentCollections = [
  {
    id: 'user-guides',
    version: '3.2',
    title: '紙芝居を見る人向けドキュメント',
    documents: [
      {
        sourceFilename: 'executive-summary-adult.md',
        title: '紙芝居アプリ 3.2 概要説明書 大人向け',
        audience: '保護者・教員・運営者',
        description:
          'TurboWarp紙芝居3.2の価値、仕組み、利用場面、教育的な意義を簡潔にまとめています。',
      },
      {
        sourceFilename: 'executive-summary-adult-4.0.md',
        version: '4.0',
        title: '紙芝居アプリ 4.0 概要説明書 大人向け',
        audience: '初めての方・保護者・教員・教材作成者・運営者',
        description:
          'TurboWarp紙芝居4.0でできること、遊ぶ・作る流れ、人とAIの役割、カメラを使う際の安全、教育利用を初めての方向けに説明します。',
      },
      {
        sourceFilename: 'executive-summary-kids.md',
        title: '紙芝居アプリ 3.2 概要説明書 子供向け',
        audience: '子供・初めての方',
        description: 'TurboWarp紙芝居3.2でできることや安全な使い方を、やさしい言葉で紹介します。',
        addFurigana: true,
      },
      {
        sourceFilename: 'executive-summary-kids-4.0.md',
        version: '4.0',
        title: '紙芝居アプリ 4.0 概要説明書 子供向け',
        audience: '子供・初めての方',
        description:
          'TurboWarp紙芝居4.0で「見る・動く・作る」方法と、カメラ、個人情報、まわりの安全、困ったときの行動をやさしい言葉で説明します。',
        addFurigana: true,
      },
      {
        sourceFilename: 'user-guide.md',
        title: '紙芝居アプリ 3.2 操作説明書',
        audience: 'アプリを使う方',
        description:
          'TurboWarp紙芝居3.2の台本読み込み、再生、ポーズ認識、本番前の確認方法を説明します。',
      },
      {
        sourceFilename: 'user-guide-4.0.md',
        version: '4.0',
        title: '紙芝居アプリ 4.0 操作説明書',
        audience: '初めてサンプル作品を試す方・進行役',
        description:
          '4.0のサンプル作品を開き、キー・タッチ・ポーズで進め、困ったときに戻る方法を順番に説明します。',
      },
    ],
  },
  {
    id: 'dsl-3.2-guides',
    version: '3.2',
    title: '台本を作る人向けドキュメント',
    documents: [
      {
        sourceFilename: 'dsl-manual.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 3.2 ファイル作成マニュアル',
        audience: 'DSL 3.2の作品を作る方',
        description:
          '3.1／3.2宣言の互換性、3.2台本の設計、旧Text Assetの互換期間、SVG Textへの移行を含む作成・テスト手順を説明します。',
      },
      {
        sourceFilename: 'command-reference.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 3.2 コマンドリファレンス',
        audience: 'DSL 3.2の台本文法を調べる方',
        description:
          '過去リリースから引き継いだ手書きMarkdownで、3.2.xが受理する3.1／3.2宣言、コマンド、アクション、Text Asset互換仕様、注意事項を保守しています。',
      },
      {
        sourceFilename: 'history.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 2.0から3.2への変更履歴',
        audience: '2.0から移行する方',
        description:
          '2.0から3.1の累積差分と、3.2.xの宣言互換性、旧Text Asset互換期間、SVG Textへの段階移行をまとめています。',
      },
    ],
  },
  {
    id: 'dsl-4.0-guides',
    version: '4.0',
    title: '台本を作る人向けドキュメント',
    documents: [
      {
        sourceFilename: 'dsl-4.0-author-guide.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 4.0 台本作成ガイド',
        audience: 'DSL 4.0の作品を作る方',
        description:
          '入門チュートリアルの次に、作品フォルダー、場面、命令、入力、分岐、エラーへの対処を必要な範囲で調べるガイドです。',
      },
      {
        sourceFilename: 'dsl-4.0-runtime-variable-guide.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: 'DSL 4.0ランタイム変数ガイド',
        audience: '変数と条件分岐を使うDSL 4.0紙芝居制作者',
        description:
          '台本変数の宣言、runtime状態を使う分岐式、TurboWarpからの書込が反映される時期を、制作者向けに説明します。',
      },
      {
        sourceFilename: 'dsl-4.0-schema-reference.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 4.0 Schemaリファレンス',
        audience: '台本の項目・命令の制約を調べる方',
        description:
          '台本の項目や命令について、使える値、必須条件、制約を検索するための仕様一覧です。入門手順は扱いません。',
      },
      {
        sourceFilename: 'dsl-4.0-history.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 4.0 リリース履歴',
        audience: '4.0の公開を管理・確認する開発／リリース担当者',
        description:
          '候補版と正式版を区別し、確認したソース、配布物、既知の制約、公開状態を版ごとに記録します。一般向けの操作手順ではありません。',
      },
      {
        sourceFilename: 'dsl-3.2-to-4.0-conversion-guide.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 3.2から4.0への変換ガイド',
        audience: 'DSL 3.1／3.2の既存作品を4.0へ移行する方',
        description:
          '元の台本を残したまま4.0用の別ファイルへ変換し、警告を確認して作品作りへ引き渡す手順です。',
      },
    ],
  },
  {
    id: 'tutorials',
    version: '4.0',
    title: 'TurboWarp紙芝居 4.0 チュートリアル',
    documents: [
      {
        sourceFilename: 'play.md',
        publicationBasename: 'play',
        listedOnVersionTop: true,
        title: '紙芝居を遊ぶ',
        audience: '初めてTurboWarp紙芝居を再生する方',
        description: '公開サンプルを開き、ポーズを使って物語を最後まで進める手順を説明します。',
      },
      {
        sourceFilename: 'create.md',
        publicationBasename: 'create',
        listedOnVersionTop: true,
        title: '紙芝居を作る',
        audience: '初めて紙芝居DSL 4.0を書く方',
        description: '公開スターターを変更し、プレビュー、検査、ビルドを経て作品を完成させます。',
      },
    ],
  },
  {
    id: 'turbowarp-programmer-guides',
    version: '4.0',
    title: 'TurboWarpでプログラムを書く人向けドキュメント',
    subtitle: 'DSL 4.0ランタイムとのメッセージ・block・変数連携',
    documents: [
      {
        sourceFilename: 'dsl-4.0-turbowarp-broadcast-guide.md',
        title: 'DSL 4.0ランタイムからのメッセージに応じた動作の記述',
        audience: 'DSL 4.0の台本とTurboWarpプログラムを連携する方',
        description:
          'broadcastMessageAndWaitで台本からメッセージを送り、TurboWarp側で受け取って処理を完了するまで待たせる方法を説明します。',
      },
      {
        sourceFilename: 'dsl-4.0-runtime-block-reference.md',
        title: 'DSL 4.0ランタイム ブロックリファレンス',
        audience: '集約ランタイムのTurboWarpブロックと公開変数を調べる方',
        description:
          '紙芝居ランタイムと6つの機能拡張に由来する公開ブロックと、TurboWarpから参照できる2つのStage変数を一覧にします。',
      },
      {
        sourceFilename: 'dsl-4.0-runtime-variable-turbowarp-reference.md',
        title: 'DSL 4.0ランタイム変数 TurboWarp連携リファレンス',
        audience: 'DSL 4.0のランタイム変数をTurboWarp blockから利用する方',
        description:
          '専用blockの戻り値、型付き書込、分岐式と共有するsnapshot、非公開範囲、既定OFFの段階導入契約を説明します。',
      },
    ],
  },
  {
    id: 'developer-guides',
    version: '3.2',
    title: 'アプリを開発する人向けドキュメント',
    documents: [
      {
        sourceFilename: 'application-materials-guide.md',
        outputDirectory: 'user-guides',
        title: 'TurboWarp紙芝居 3.2 アプリ・教材・ツールチェインガイド',
        audience: 'DSL 3.2のアプリ、教材、ツールチェインを把握する方',
        description:
          'DSL 3.2系列のアプリ、浦島太郎、体験会教材、台本、sb3-toolchainを図解付き・全8ページで紹介します。',
      },
      {
        sourceFilename: 'application-materials-guide-4.0.md',
        version: '4.0',
        title: 'TurboWarp紙芝居 4.0 アプリ・教材・ツールチェインガイド',
        audience: '教材・ワークショップ設計者、制作環境担当者、プレビュー／ビルド確認者',
        description:
          '概要説明の次に全員が読む文書ではなく、教材設計、制作環境、検証・プレビュー・ビルドを具体化するための全8ページの詳細ガイドです。',
      },
      {
        sourceFilename: 'developer-guide.md',
        title: '紙芝居アプリ 3.2 ソフトウェアメンテナンスガイド',
        audience: 'TurboWarp紙芝居3.2を保守するソフトウェア開発者',
        description:
          'TurboWarp紙芝居3.2の成果物とビルダー、アプリ本体、SB3、ドキュメントの変更、検証、公開手順を案内します。',
      },
      {
        sourceFilename: 'developer-guide-4.0.md',
        version: '4.0',
        title: '紙芝居アプリ 4.0 ソフトウェアメンテナンスガイド',
        audience: 'TurboWarp紙芝居4.0の実装と公開手順を保守する開発者',
        description:
          '実装の変更箇所とテスト、開発環境、プレビュー、完成ファイル、公開、切り戻しの手順を案内します。',
      },
      {
        sourceFilename: 'internal-specification.md',
        title: '紙芝居アプリ 3.2 内部仕様書',
        audience: 'TurboWarp紙芝居3.2の実装を調査・変更する方',
        description:
          'TurboWarp紙芝居3.2の汎用アプリSB3におけるtarget、変数、block、message、呼出し関係、状態遷移を記録します。',
      },
      {
        sourceFilename: 'internal-specification-4.0.md',
        version: '4.0',
        title: '紙芝居アプリ 4.0 内部仕様書',
        audience: 'TurboWarp紙芝居4.0の実装を調査・変更する方',
        description:
          '台本の読み込みから実行環境までの内部構造、責任分担、状態の切り替えを、用語表と実装経路に対応させて記録します。',
      },
      {
        sourceFilename: 'extension-guide.md',
        title: 'TurboWarp紙芝居 3.2 機能拡張ガイド',
        audience: 'TurboWarp紙芝居3.2の依存機能を調査・変更する方',
        description:
          'TurboWarp紙芝居3.2が利用する16個の依存機能拡張を1拡張2ページで図解し、sb3-toolchainによるbundle構成も説明する全34ページのガイドです。',
      },
      {
        sourceFilename: 'extension-guide-4.0.md',
        version: '4.0',
        title: 'TurboWarp紙芝居 4.0 機能拡張・プラットフォーム統合ガイド',
        audience: 'TurboWarp紙芝居4.0と外部機能の接続を調査・変更する開発者',
        description:
          '実行部分と外部機能の責任分担、利用環境ごとの違い、権限、失敗時の代替動作、配布境界を説明します。',
      },
      {
        sourceFilename: 'dsl-3.1-diagnostics-design.md',
        title: 'DSL 3.1 台本診断・安全停止 設計レビュー',
        audience: '台本診断と安全停止を保守する方',
        description:
          'DSL 3.1の限定preflight、診断データモデル、機能拡張との境界、安全停止の設計判断を記録します。',
      },
      {
        sourceFilename: 'dsl-4.0-diagnostics-design.md',
        version: '4.0',
        title: 'DSL 4.0 台本診断・安全停止 設計レビュー',
        audience: 'DSL 4.0の診断と安全停止を実装・レビューする開発者',
        description:
          '台本の読み込みから実行までの失敗を分類し、問題のある状態を公開しないこと、安全に停止・後片付けすることを記録します。',
      },
      {
        sourceFilename: 'dependency-audit.md',
        title: 'TurboWarp紙芝居 3.2 依存関係監査記録',
        audience: 'TurboWarp紙芝居3.2の依存更新とsecurity overrideを保守する方',
        description:
          'TurboWarp紙芝居3.2について2026年8月に実施した依存更新、脆弱性監査、overrideの理由と解除条件を記録します。',
      },
      {
        sourceFilename: 'release-smoke.md',
        title: 'DSL 3.1 release smoke',
        audience: 'リリース候補をブラウザで検証する方',
        description:
          'Scratch VMテストでは確認できないEditor、カメラ、TurboWarp TM、Packagerのrelease smoke手順をまとめます。',
      },
      {
        sourceFilename: 'release-smoke-4.0.md',
        version: '4.0',
        title: 'DSL 4.0 release smoke',
        audience: 'DSL 4.0のリリース候補を検証して公開可否を判断する方',
        description:
          '公開候補の内容を固定し、自動テスト、ブラウザー、カメラ、ポーズ、安全停止、検証記録、切り戻しを確認します。',
      },
      {
        sourceFilename: 'tm-extension-id-migration.md',
        version: '4.0',
        title: 'TurboWarp TM Extension ID 移行ガイド',
        audience: 'TurboWarp紙芝居とSB3を新しい認識拡張IDへ移行する開発者',
        description:
          'TurboWarp TMのExtension IDをkubohiroyatmへ統一し、SB3移行、確認、rollback、旧識別子の扱いを日本語と英語で説明します。',
      },
      {
        sourceFilename: 'turbowarp-ecosystem.md',
        version: '4.0',
        title: 'TurboWarp extension and toolchain overview',
        audience:
          'TurboWarp機能拡張、toolchain、TurboWarp-Kamishibaiの関係を把握する開発者・教材作者',
        description:
          'ScratchからTurboWarp機能拡張、Composition API、SB3 Toolchain、TurboWarp-Kamishibaiへ進む道筋と、各repositoryの責務・surface・license境界を正本dataから説明します。',
      },
      {
        sourceFilename: 'upstream-fork-policy.md',
        version: '4.0',
        title: 'upstream fork管理方針',
        audience: 'TurboWarp-Kamishibai ecosystemの上流forkを評価・同期・撤回する開発者',
        description:
          'scratch-renderを独自productではなく上流検証用forkとして扱い、差分、license、issue routing、exact commit pinを記録します。',
      },
    ],
  },
];

export const documentationConfig = {
  title: 'TurboWarp紙芝居 ドキュメント',
  author: 'Hiroya Kubo',
  tocSectionDepth: 3,
  standaloneHtmlFilename: 'index.html',
  standaloneArticleHtmlFilename: 'document.html',
  collections: documentCollections,
  documents: documentCollections.flatMap((collection) =>
    collection.documents.map((document) => {
      const version = document.version ?? collection.version;
      const legacyOutputDirectory = document.outputDirectory ?? collection.id;
      const outputDirectory = `${version}/${legacyOutputDirectory}`;
      const publicationBasename =
        document.publicationBasename ?? document.sourceFilename.replace(/\.md$/u, '');
      return {
        ...document,
        updatedAt: documentUpdatedAt[document.sourceFilename],
        version,
        collectionId: collection.id,
        sourceDirectory: document.sourceDirectory ?? collection.id,
        legacyOutputDirectory,
        outputDirectory,
        publicationBasename,
        publicationOutputDirectory:
          publicationBasename === ''
            ? outputDirectory
            : `${outputDirectory}/${publicationBasename}`,
      };
    }),
  ),
};

export const workshopDocumentConfig = {
  versionFamily: '3.2系',
  title: 'AIを使って「紙芝居の物語に参加する仕組み」を作ろう！',
  author: 'Hiroya Kubo',
  updatedAt: '2026-08-04',
  sourceDirectory: 'workshops/2026-08-01',
  legacyOutputDirectory: 'workshops/2026-08-01',
  outputDirectory: 'workshops/2026-08-01',
  learnedThroughGrade: 3,
  coverFilename: 'tmpose-kamishibai-cover-20260801.md',
  htmlFilename: 'index.html',
  coverHtmlFilename: 'cover.html',
  sourceFilename: 'tmpose-kamishibai-20260801.md',
  tocHtmlFilename: 'toc.html',
  pdfFilename: 'tmpose-kamishibai-20260801.pdf',
  tocSectionDepth: 3,
  rubyOverrides: [
    '久保裕也:裕也:ひろや',
    '竜宮城:りゅうぐうじょう',
    '玉手箱:たまてばこ',
    '浦島太郎:うらしまたろう',
    '未習漢字:みしゅうかんじ',
  ],
};

export const staffDocumentConfig = {
  versionFamily: '3.2系',
  title: '親子AIプログラミング体験会スタッフ向け資料2026年8月1日版',
  author: 'Hiroya Kubo',
  updatedAt: '2026-08-04',
  sourceDirectory: 'workshops/2026-08-01',
  legacyOutputDirectory: 'workshops/2026-08-01/staff',
  outputDirectory: 'workshops/2026-08-01/staff',
  sourceFilename: 'tmpose-kamishibai-staff-20260801.md',
  htmlFilename: 'index.html',
  articleHtmlFilename: 'document.html',
  pdfFilename: 'tmpose-kamishibai-staff-20260801.pdf',
};

export function findDocument(sourceFilename) {
  return documentationConfig.documents.find(
    (document) => document.sourceFilename === sourceFilename,
  );
}

export function resolveLearnedThroughGrade(value = process.env.RUBYGANA_GRADE) {
  const grade =
    value === undefined || value === ''
      ? workshopDocumentConfig.learnedThroughGrade
      : Number(value);

  if (!Number.isInteger(grade) || grade < 1 || grade > 6) {
    throw new RangeError('RUBYGANA_GRADE must be an integer from 1 through 6.');
  }

  return grade;
}
