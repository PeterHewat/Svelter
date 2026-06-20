import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const pt: TranslationDictionary = {
  common: {
    welcome: "Bem-vindo",
    loading: "A carregar...",
    error: "Ocorreu um erro",
    retry: "Tentar novamente",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Criar",
    search: "Pesquisar",
    noResults: "Nenhum resultado encontrado",
  },
  theme: {
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
    toggle: "Alternar tema",
  },
  language: {
    select: "Selecionar idioma",
    current: "Idioma atual: {{language}}",
  },
  nav: {
    main: "Navegação principal",
    tasks: "Tarefas",
    home: "Início",
    website: "Site",
  },
  auth: {
    openAuth: "Iniciar sessão",
    login: "Iniciar sessão",
    logout: "Terminar sessão",
    signUp: "Registar",
    email: "E-mail",
    password: "Palavra-passe",
    google: "Continuar com Google",
    tabsLabel: "Iniciar sessão ou registar",
    signInTab: "Iniciar sessão",
    signUpTab: "Registar",
    signInTitle: "Iniciar sessão",
    signUpTitle: "Criar conta",
    or: "ou",
    noAccount: "Não tem conta?",
    hasAccount: "Já tem conta?",
    errors: {
      invalidCredentials: "E-mail ou palavra-passe inválidos.",
      accountNotFound: "Não existe conta com este e-mail. Tente registar-se.",
      accountExists:
        "Já existe uma conta com este e-mail. Tente iniciar sessão.",
      generic: "Falha ao iniciar sessão. Tente novamente.",
      serverNotConfigured:
        "A autenticação não está configurada. Execute bun run setup para Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Funcionalidades",
      svelte: "SPA SvelteKit com rotas por ficheiros",
      convex: "API de tarefas de exemplo com Convex (ativar com env)",
      auth: "Início de sessão com Clerk (social + e-mail) e backend Convex",
      tailwind: "Tailwind v4 com tokens partilhados",
      i18n: "Internacionalização (9 idiomas)",
      themes: "Temas claro e escuro",
    },
  },
  backend: {
    setupTitle: "Concluir configuração na nuvem",
    setupBody:
      "Ligue o Convex e configure o Clerk para a demo de tarefas. Siga os passos abaixo e depois execute bun run dev:convex e bun run dev:web em terminais separados.",
    stepConvex:
      "Execute bun run setup para ligar o Convex e sincronizar PUBLIC_CONVEX_URL",
    stepAuth:
      "Execute bun run setup para configurar o Clerk (chave pública + emissor Convex)",
    stepEnv: "Consulte docs/getting-started.md neste repositório",
    setupGuide: "Guia completo: docs/getting-started.md neste repositório",
    backHome: "Voltar ao início",
  },
  tasks: {
    title: "Tarefas",
    subtitle: "Exemplo vertical: mutações Convex e autenticação Clerk",
    newPlaceholder: "O que precisa de ser feito?",
    add: "Adicionar tarefa",
    empty: "Ainda não há tarefas. Adicione uma acima.",
    listLabel: "As suas tarefas",
    toggleComplete: "Marcar «{{title}}» como concluída",
    delete: "Eliminar «{{title}}»",
    guestLimit: "{{count}} / {{limit}} tarefas de convidado",
    guestLimitReached:
      "Limite de convidado atingido ({{limit}} tarefas). Crie uma conta para adicionar mais.",
    signUpToContinue: "Registar para continuar",
    accountConvexLabel: "Perfil guardado no Convex",
    anonymous: "Anónimo",
    guestSession: "Sessão de convidado",
    noEmail: "Sem e-mail sincronizado",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Página não encontrada",
    notFoundHint: "A página que solicitou não existe.",
    unauthorized: "Não está autorizado a ver esta página",
    serverError: "Erro do servidor. Tente novamente mais tarde.",
    networkError: "Erro de rede. Verifique a sua ligação.",
  },
};

export default pt;
