import type { TranslationDictionary } from "@repo/utils";

const pt: TranslationDictionary = {
  meta: {
    homeDescription:
      "Modelo monorepo pronto para produção para produto e marketing com SvelteKit, Clerk, Convex e Tailwind.",
    pricingDescription:
      "Compare os planos Free, Pro e Business. Comece grátis com limites transparentes.",
  },
  nav: {
    main: "Navegação principal",
    menu: "Menu",
    features: "Recursos",
    pricing: "Preços",
    blog: "Blog",
    logIn: "Entrar",
    startFree: "Começar grátis",
    docs: "Documentação",
    github: "Ver no GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun para app de produto e site de marketing",
    heroTitle: "Construa mais rápido com {{name}}",
    heroSubtitle:
      "Um modelo monorepo pronto para produção para produto e marketing.",
    heroCta: "Começar grátis",
    heroSecondaryCta: "Ler o blog",
    heroMicrocopy: "Não é necessário cartão de crédito",
    howItWorksTitle: "Como funciona",
    metricsTitle: "Feito para velocidade",
    pricingTeaserTitle: "Preços simples e transparentes",
    pricingTeaserLink: "Comparar todos os planos",
    freeTierBadge: "Grátis para sempre",
    popularTierBadge: "Mais popular",
    integrationsTitle: "Funciona com a sua stack",
    integrationsLink: "Ver integrações",
    faqTitle: "Perguntas frequentes",
  },
  pricing: {
    subtitle: "Escolha o plano certo para sua equipe.",
    billingToggle: "Período de cobrança",
    billingMonthly: "Mensal",
    billingAnnual: "Anual",
    annualSave: "Economize ~17% com cobrança anual",
    compareTitle: "Comparar planos",
    featureColumn: "Recurso",
    included: "Incluído",
    excluded: "Não incluído",
    enterpriseContact: "Falar com vendas",
    faqTitle: "FAQ de preços",
  },
  blog: {
    title: "Blog",
    back: "← Voltar ao blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produto",
    company: "Empresa",
    resources: "Recursos",
    legal: "Legal",
    features: "Recursos",
    pricing: "Preços",
    integrations: "Integrações",
    about: "Sobre",
    customers: "Clientes",
    blog: "Blog",
    security: "Segurança",
    docs: "Documentação",
    github: "GitHub",
    privacy: "Privacidade",
    terms: "Termos",
  },
  pages: {
    features: { title: "Recursos" },
    pricing: { title: "Preços" },
    integrations: { title: "Integrações" },
    customers: { title: "Clientes" },
    security: { title: "Segurança" },
    about: { title: "Sobre" },
    privacy: { title: "Política de privacidade" },
    terms: { title: "Termos de serviço" },
  },
  stub: {
    templateNotice: "Modelo placeholder — substituir antes do lançamento (v1).",
  },
  language: {
    select: "Selecionar idioma",
    hubTitle: "Escolha seu idioma",
  },
  theme: {
    toggle: "Alternar tema",
    light: "Claro",
    dark: "Escuro",
  },
};

export default pt;
