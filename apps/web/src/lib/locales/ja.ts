import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const ja: TranslationDictionary = {
  common: {
    welcome: "ようこそ",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    retry: "再試行",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    edit: "編集",
    create: "作成",
    search: "検索",
    noResults: "結果が見つかりません",
  },
  theme: {
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    toggle: "テーマを切り替え",
    switchToLight: "ライトに切り替え",
    switchToDark: "ダークに切り替え",
    switchToLightAria: "ライトテーマに切り替えます。",
    switchToDarkAria: "ダークテーマに切り替えます。",
  },
  language: {
    select: "言語を選択",
    current: "現在の言語：{{language}}",
  },
  nav: {
    main: "メインナビゲーション",
    tasks: "タスク",
    user: "ユーザー",
    home: "ホーム",
    website: "ウェブサイト",
  },
  auth: {
    openAuth: "ログイン",
    login: "ログイン",
    logout: "ログアウト",
    signUp: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    google: "Google で続行",
    tabsLabel: "ログインまたは新規登録",
    signInTab: "ログイン",
    signUpTab: "新規登録",
    signInTitle: "ログイン",
    signUpTitle: "アカウント作成",
    or: "または",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "すでにアカウントをお持ちですか？",
    errors: {
      invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
      accountNotFound:
        "このメールアドレスのアカウントが見つかりません。新規登録をお試しください。",
      accountExists:
        "このメールアドレスはすでに登録されています。ログインをお試しください。",
      generic: "ログインに失敗しました。もう一度お試しください。",
      serverNotConfigured:
        "認証の設定が完了していません。Clerk と Convex の環境変数には bun run setup を実行してください。",
    },
  },
  home: {
    title: PRODUCT_NAME,
    introBeforeSetup: "これはプロダクト Web アプリです。",
    introAfterSetup:
      " を完了すると、Convex と Clerk が接続されます。スターター例として使い、デモを自分のプロジェクトに置き換えてください。",
    tasksNote:
      " でバックエンドの接続を確認できます。ログインなしで利用可能（ゲストはタスク 3 件まで）。ログインするとゲストのタスクをアカウントに統合できます。",
    userNote: " で Convex プロフィールを表示します。",
    marketingLink: "マーケティングサイトに戻る",
  },
  backend: {
    setupTitle: "クラウド設定を完了",
    setupBody:
      "Convex をリンクし Clerk を設定してタスクデモを実行します。以下の手順に従い、別々のターミナルで bun run dev:convex と bun run dev:web を起動してください。",
    stepConvex:
      "bun run setup を実行して Convex をリンクし PUBLIC_CONVEX_URL を同期",
    stepAuth:
      "bun run setup を実行して Clerk を設定（公開キー + Convex issuer）",
    stepEnv: "このリポジトリの docs/getting-started.md を参照",
    setupGuide: "完全ガイド：このリポジトリの docs/getting-started.md",
    backHome: "ホームに戻る",
  },
  tasks: {
    title: "タスク",
    newPlaceholder: "何をする必要がありますか？",
    add: "タスクを追加",
    empty: "タスクはまだありません。上から追加してください。",
    listLabel: "あなたのタスク",
    toggleComplete: "「{{title}}」を完了にする",
    delete: "「{{title}}」を削除",
    quotaGuest: "クォータ：{{count}} / {{limit}} 件（ゲスト）",
    quotaSignedIn: "クォータ：{{count}} / {{limit}} 件（ログイン済み）",
    guestLimitReached:
      "ゲストの上限に達しました（{{limit}} 件）。アカウントを作成して追加してください。",
    signedInLimitReached: "タスクの上限に達しました（{{limit}} 件）。",
    signUpToContinue: "続行するには新規登録",
    accountConvexLabel: "Convex に保存されたプロフィール",
    anonymous: "匿名",
    guestSession: "ゲストセッション",
    noEmail: "メール未同期",
  },
  user: {
    title: "ユーザー",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "ページが見つかりません",
    notFoundHint: "リクエストされたページは存在しません。",
    unauthorized: "このページを表示する権限がありません",
    serverError: "サーバーエラーです。しばらくしてからもう一度お試しください。",
    networkError: "ネットワークエラーです。接続を確認してください。",
  },
};

export default ja;
