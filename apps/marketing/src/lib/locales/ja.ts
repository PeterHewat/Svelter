import type { TranslationDictionary } from "@repo/utils";

const ja: TranslationDictionary = {
  meta: {
    homeDescription:
      "SvelteKit、Clerk、Convex、Tailwind を使った、プロダクトとマーケティング向けの本番対応モノレポテンプレート。",
    pricingDescription:
      "Free、Pro、Business プランを比較。透明なテンプレート制限で無料から始められます。",
  },
  nav: {
    main: "メインナビゲーション",
    menu: "メニュー",
    features: "機能",
    pricing: "料金",
    about: "概要",
    blog: "ブログ",
    faq: "FAQ",
    docs: "ドキュメント",
    dashboard: "ダッシュボード",
    signIn: "ログイン",
  },
  home: {
    heroTitle: "{{name}} でより速く開発",
    heroTagline:
      "プロダクトとマーケティングサイト向けの本番対応モノレポテンプレート。",
    heroScreenshotAlt: "プロダクトアプリのスクリーンショットプレースホルダー",
    heroMicrocopy: "無料でお試し — アカウントもクレジットカードも不要",
    customerLogosTitle: "このテンプレートで構築するチームに信頼されています",
    ctaTitle: "プロダクトを公開する準備はできましたか？",
    ctaSubtitle:
      "テンプレートをクローンし、プレースホルダーをカスタマイズして、今日デプロイしましょう。",
    ctaDashboard: "ダッシュボードへ",
    howItWorksTitle: "仕組み",
    metricsTitle: "スピードのために構築",
    testimonialTitle: "チームの声",
    testimonialPrev: "前のお客様の声",
    testimonialNext: "次のお客様の声",
    freeTierBadge: "永久無料",
    popularTierBadge: "最も人気",
    faqTitle: "よくある質問",
    aboutTitle: "概要",
  },
  pricing: {
    subtitle: "チームに合ったプランをお選びください。",
    billingToggle: "請求期間",
    billingMonthly: "月額",
    billingAnnual: "年額",
    annualSave: "年額請求で約 17% お得",
    compareTitle: "プラン比較",
    featureColumn: "機能",
    included: "含む",
    excluded: "含まない",
  },
  blog: {
    title: "ブログ",
    back: "← ブログに戻る",
    changelogVersion: "v{{version}}",
    changelogLabel: "変更履歴",
  },
  docs: {
    title: "ドキュメント",
    intro:
      "ローカルセットアップ、設定、デプロイのガイド。テンプレートのコンテンツは英語のみです。",
    back: "← すべてのドキュメント",
    sidebar: "ドキュメントナビゲーション",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "プロダクト",
    company: "会社",
    resources: "リソース",
    legal: "法的情報",
    about: "概要",
    testimonials: "お客様の声",
    security: "セキュリティ",
    privacy: "プライバシー",
    terms: "利用規約",
  },
  pages: {
    features: { title: "機能" },
    pricing: { title: "料金" },
    legal: { title: "法的情報" },
    security: { title: "セキュリティ" },
    about: { title: "概要" },
    docs: { title: "ドキュメント" },
    privacy: { title: "プライバシーポリシー" },
    terms: { title: "利用規約" },
  },
  language: {
    select: "言語を選択",
    hubTitle: "言語を選択してください",
  },
  theme: {
    toggle: "テーマを切り替え",
    light: "ライト",
    dark: "ダーク",
    switchToLight: "ライトに切り替え",
    switchToDark: "ダークに切り替え",
    switchToLightAria: "ライトテーマに切り替えます。",
    switchToDarkAria: "ダークテーマに切り替えます。",
  },
};

export default ja;
