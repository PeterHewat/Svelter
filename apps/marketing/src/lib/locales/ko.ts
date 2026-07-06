import type { TranslationDictionary } from "@repo/utils";

const ko: TranslationDictionary = {
  meta: {
    homeDescription:
      "SvelteKit, Clerk, Convex, Tailwind로 제품 및 마케팅 사이트를 위한 프로덕션 준비 모노레포 템플릿.",
    pricingDescription:
      "Free, Pro, Business 요금제를 비교하세요. 투명한 템플릿 한도로 무료로 시작하세요.",
  },
  nav: {
    main: "주 메뉴",
    menu: "메뉴",
    features: "기능",
    pricing: "요금",
    about: "소개",
    blog: "블로그",
    faq: "FAQ",
    docs: "문서",
    dashboard: "대시보드",
    signIn: "로그인",
  },
  home: {
    heroTitle: "{{name}}로 더 빠르게 개발",
    heroTagline:
      "제품 및 마케팅 웹사이트를 위한 프로덕션 준비 모노레포 템플릿.",
    heroScreenshotAlt: "제품 앱 스크린샷 자리 표시자",
    heroMicrocopy: "무료로 체험하세요 — 계정이나 신용카드 불필요",
    customerLogosTitle: "이 템플릿으로 구축하는 팀의 신뢰",
    ctaTitle: "제품을 출시할 준비가 되셨나요?",
    ctaSubtitle:
      "템플릿을 복제하고, 플레이스홀더 콘텐츠를 맞춤 설정한 뒤 오늘 배포하세요.",
    ctaDashboard: "대시보드로 이동",
    howItWorksTitle: "작동 방식",
    metricsTitle: "속도를 위해 설계",
    testimonialTitle: "팀의 이야기",
    testimonialPrev: "이전 후기",
    testimonialNext: "다음 후기",
    freeTierBadge: "영구 무료",
    popularTierBadge: "가장 인기",
    faqTitle: "자주 묻는 질문",
    aboutTitle: "소개",
  },
  pricing: {
    subtitle: "팀에 맞는 요금제를 선택하세요.",
    billingToggle: "결제 주기",
    billingMonthly: "월간",
    billingAnnual: "연간",
    annualSave: "연간 결제 시 약 17% 절약",
    compareTitle: "요금제 비교",
    featureColumn: "기능",
    included: "포함",
    excluded: "미포함",
  },
  blog: {
    title: "블로그",
    back: "← 블로그로 돌아가기",
    changelogVersion: "v{{version}}",
    changelogLabel: "변경 로그",
  },
  docs: {
    title: "문서",
    intro:
      "로컬 설정, 구성 및 배포 가이드. 템플릿 콘텐츠는 영어로만 제공됩니다.",
    back: "← 모든 문서",
    sidebar: "문서 탐색",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "제품",
    company: "회사",
    resources: "리소스",
    legal: "법적 고지",
    about: "소개",
    testimonials: "고객 후기",
    security: "보안",
    privacy: "개인정보",
    terms: "약관",
  },
  pages: {
    features: { title: "기능" },
    pricing: { title: "요금" },
    legal: { title: "법적 고지" },
    security: { title: "보안" },
    about: { title: "소개" },
    docs: { title: "문서" },
    privacy: { title: "개인정보 처리방침" },
    terms: { title: "서비스 약관" },
  },
  language: {
    select: "언어 선택",
    hubTitle: "언어를 선택하세요",
  },
  theme: {
    toggle: "테마 전환",
    light: "라이트",
    dark: "다크",
    switchToLight: "라이트로 전환",
    switchToDark: "다크로 전환",
    switchToLightAria: "라이트 테마로 전환합니다.",
    switchToDarkAria: "다크 테마로 전환합니다.",
  },
};

export default ko;
