import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const zh: TranslationDictionary = {
  common: {
    welcome: "欢迎",
    loading: "加载中...",
    error: "发生错误",
    retry: "重试",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    create: "创建",
    search: "搜索",
    noResults: "未找到结果",
  },
  theme: {
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    toggle: "切换主题",
    switchToLight: "切换到浅色",
    switchToDark: "切换到深色",
    switchToLightAria: "切换到浅色主题。",
    switchToDarkAria: "切换到深色主题。",
  },
  language: {
    select: "选择语言",
    current: "当前语言：{{language}}",
  },
  nav: {
    main: "主导航",
    tasks: "任务",
    user: "用户",
    home: "首页",
    website: "网站",
  },
  auth: {
    openAuth: "登录",
    login: "登录",
    logout: "退出登录",
    signUp: "注册",
    email: "邮箱",
    password: "密码",
    google: "使用 Google 继续",
    tabsLabel: "登录或注册",
    signInTab: "登录",
    signUpTab: "注册",
    signInTitle: "登录",
    signUpTitle: "创建账户",
    or: "或",
    noAccount: "还没有账户？",
    hasAccount: "已有账户？",
    errors: {
      invalidCredentials: "邮箱或密码不正确。",
      accountNotFound: "未找到与此邮箱关联的账户。请尝试注册。",
      accountExists: "此邮箱已注册。请尝试登录。",
      generic: "登录失败，请重试。",
      serverNotConfigured:
        "身份验证尚未完全配置。请运行 bun run setup 以配置 Clerk 和 Convex 环境变量。",
    },
  },
  home: {
    title: PRODUCT_NAME,
    introBeforeSetup: "这是产品 Web 应用。完成 ",
    introAfterSetup:
      " 后，Convex 和 Clerk 应已连接。可将其作为起步示例，然后用你自己的项目替换此演示。",
    tasksNote:
      " 可验证后端是否正确连接。无需登录即可使用（访客限 3 个任务）。登录后可将访客任务合并到你的账户。",
    userNote: " 显示你的 Convex 个人资料。",
    marketingLink: "返回营销网站",
  },
  backend: {
    setupTitle: "完成云端配置",
    setupBody:
      "连接 Convex 并配置 Clerk 以运行任务演示。按以下步骤操作，然后在不同终端分别运行 bun run dev:convex 和 bun run dev:web。",
    stepConvex: "运行 bun run setup 以连接 Convex 并同步 PUBLIC_CONVEX_URL",
    stepAuth: "运行 bun run setup 以配置 Clerk（发布密钥 + Convex issuer）",
    stepEnv: "请参阅本仓库中的 docs/getting-started.md",
    setupGuide: "完整指南：本仓库中的 docs/getting-started.md",
    backHome: "返回首页",
  },
  tasks: {
    title: "任务",
    newPlaceholder: "需要做什么？",
    add: "添加任务",
    empty: "暂无任务。请在上方添加。",
    listLabel: "你的任务",
    toggleComplete: "将「{{title}}」标记为已完成",
    delete: "删除「{{title}}」",
    quotaGuest: "配额：{{count}} / {{limit}} 个任务（访客）",
    quotaSignedIn: "配额：{{count}} / {{limit}} 个任务（已登录）",
    guestLimitReached:
      "已达访客上限（{{limit}} 个任务）。创建账户以添加更多任务。",
    signedInLimitReached: "已达任务上限（{{limit}} 个任务）。",
    signUpToContinue: "注册以继续",
    accountConvexLabel: "个人资料存储于 Convex",
    anonymous: "匿名",
    guestSession: "访客会话",
    noEmail: "未同步邮箱",
  },
  user: {
    title: "用户",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "页面未找到",
    notFoundHint: "你请求的页面不存在。",
    unauthorized: "你无权查看此页面",
    serverError: "服务器错误，请稍后重试。",
    networkError: "网络错误，请检查你的连接。",
  },
};

export default zh;
