import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const ko: TranslationDictionary = {
  common: {
    welcome: "환영합니다",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    retry: "다시 시도",
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "편집",
    create: "만들기",
    search: "검색",
    noResults: "결과를 찾을 수 없습니다",
  },
  theme: {
    light: "라이트",
    dark: "다크",
    system: "시스템",
    toggle: "테마 전환",
    switchToLight: "라이트로 전환",
    switchToDark: "다크로 전환",
    switchToLightAria: "라이트 테마로 전환합니다.",
    switchToDarkAria: "다크 테마로 전환합니다.",
  },
  language: {
    select: "언어 선택",
    current: "현재 언어: {{language}}",
  },
  nav: {
    main: "주 메뉴",
    tasks: "작업",
    user: "사용자",
    home: "홈",
    website: "웹사이트",
  },
  auth: {
    openAuth: "로그인",
    login: "로그인",
    logout: "로그아웃",
    signUp: "가입하기",
    email: "이메일",
    password: "비밀번호",
    google: "Google로 계속",
    tabsLabel: "로그인 또는 가입",
    signInTab: "로그인",
    signUpTab: "가입하기",
    signInTitle: "로그인",
    signUpTitle: "계정 만들기",
    or: "또는",
    noAccount: "계정이 없으신가요?",
    hasAccount: "이미 계정이 있으신가요?",
    errors: {
      invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
      accountNotFound:
        "이 이메일로 등록된 계정이 없습니다. 가입을 시도해 보세요.",
      accountExists:
        "이 이메일로 이미 계정이 있습니다. 로그인을 시도해 보세요.",
      generic: "로그인에 실패했습니다. 다시 시도해 주세요.",
      serverNotConfigured:
        "인증이 완전히 구성되지 않았습니다. Clerk + Convex 환경 변수는 bun run setup을 실행하세요.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    introBeforeSetup: "이것은 제품 웹 앱입니다. ",
    introAfterSetup:
      "을(를) 완료하면 Convex와 Clerk가 연결됩니다. 시작 예제로 사용한 뒤 이 데모를 자신의 프로젝트로 교체하세요.",
    tasksNote:
      "에서 백엔드 연결을 확인할 수 있습니다. 로그인 없이 사용 가능(게스트 작업 3개 제한). 로그인하면 게스트 작업을 계정에 병합합니다.",
    userNote: "에서 Convex 프로필을 표시합니다.",
    marketingLink: "마케팅 웹사이트로 돌아가기",
  },
  backend: {
    setupTitle: "클라우드 설정 완료",
    setupBody:
      "Convex를 연결하고 Clerk를 구성하여 작업 데모를 실행하세요. 아래 단계를 따른 뒤 별도 터미널에서 bun run dev:convex와 bun run dev:web을 실행하세요.",
    stepConvex:
      "bun run setup을 실행하여 Convex를 연결하고 PUBLIC_CONVEX_URL 동기화",
    stepAuth: "bun run setup을 실행하여 Clerk 구성(공개 키 + Convex issuer)",
    stepEnv: "이 저장소의 docs/getting-started.md 참고",
    setupGuide: "전체 가이드: 이 저장소의 docs/getting-started.md",
    backHome: "홈으로 돌아가기",
  },
  tasks: {
    title: "작업",
    newPlaceholder: "무엇을 해야 하나요?",
    add: "작업 추가",
    empty: "아직 작업이 없습니다. 위에서 추가하세요.",
    listLabel: "내 작업",
    toggleComplete: "「{{title}}」 완료로 표시",
    delete: "「{{title}}」 삭제",
    quotaGuest: "할당량: {{count}} / {{limit}}개 작업(게스트)",
    quotaSignedIn: "할당량: {{count}} / {{limit}}개 작업(로그인)",
    guestLimitReached:
      "게스트 한도에 도달했습니다({{limit}}개 작업). 계정을 만들어 더 추가하세요.",
    signedInLimitReached: "작업 한도에 도달했습니다({{limit}}개 작업).",
    signUpToContinue: "계속하려면 가입하기",
    accountConvexLabel: "Convex에 저장된 프로필",
    anonymous: "익명",
    guestSession: "게스트 세션",
    noEmail: "동기화된 이메일 없음",
  },
  user: {
    title: "사용자",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "페이지를 찾을 수 없습니다",
    notFoundHint: "요청한 페이지가 존재하지 않습니다.",
    unauthorized: "이 페이지를 볼 권한이 없습니다",
    serverError: "서버 오류입니다. 나중에 다시 시도해 주세요.",
    networkError: "네트워크 오류입니다. 연결을 확인해 주세요.",
  },
};

export default ko;
