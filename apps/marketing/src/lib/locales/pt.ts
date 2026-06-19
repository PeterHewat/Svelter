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
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Painel",
    github: "Ver no GitHub",
  },
  home: {
    heroTitle: "Construa mais rápido com {{name}}",
    heroTagline:
      "Modelo monorepo pronto para produção para sites de produto e marketing.",
    heroScreenshotAlt: "Marcador de captura de tela do produto",
    heroMicrocopy: "Experimente grátis, sem conta nem cartão de crédito",
    logoBarTagline: "Confiado por equipes que constroem com o modelo",
    ctaTitle: "Pronto para lançar seu produto?",
    ctaSubtitle:
      "Clone o modelo, personalize o conteúdo placeholder e publique hoje.",
    howItWorksTitle: "Como funciona",
    metricsTitle: "Feito para velocidade",
    testimonialTitle: "O que as equipes dizem",
    testimonialPrev: "Depoimento anterior",
    testimonialNext: "Próximo depoimento",
    freeTierBadge: "Grátis para sempre",
    popularTierBadge: "Mais popular",
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
  },
  blog: {
    title: "Blog",
    back: "← Voltar ao blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentação",
    intro:
      "Guias para configuração local, variáveis de ambiente e deploy. Conteúdo em inglês no template.",
    back: "← Toda a documentação",
    sidebar: "Navegação da documentação",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produto",
    company: "Empresa",
    resources: "Recursos",
    legal: "Legal",
    about: "Sobre",
    customers: "Clientes",
    security: "Segurança",
    github: "GitHub",
    privacy: "Privacidade",
    terms: "Termos",
  },
  pages: {
    features: { title: "Recursos" },
    pricing: { title: "Preços" },
    customers: { title: "Clientes" },
    security: { title: "Segurança" },
    about: { title: "Sobre" },
    docs: { title: "Documentação" },
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
