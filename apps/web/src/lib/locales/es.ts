import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const es: TranslationDictionary = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Ocurrió un error",
    retry: "Reintentar",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    noResults: "No se encontraron resultados",
  },
  theme: {
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    toggle: "Cambiar tema",
  },
  language: {
    select: "Seleccionar idioma",
    current: "Idioma actual: {{language}}",
  },
  nav: {
    main: "Navegación principal",
    tasks: "Tareas",
    home: "Inicio",
    website: "Sitio web",
  },
  auth: {
    openAuth: "Iniciar sesión",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    signUp: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    google: "Continuar con Google",
    tabsLabel: "Iniciar sesión o registrarse",
    signInTab: "Iniciar sesión",
    signUpTab: "Registrarse",
    signInTitle: "Iniciar sesión",
    signUpTitle: "Crear cuenta",
    or: "o",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    errors: {
      invalidCredentials: "Correo o contraseña incorrectos.",
      accountNotFound: "No hay cuenta con este correo. Prueba a registrarte.",
      accountExists:
        "Ya existe una cuenta con este correo. Prueba iniciar sesión.",
      generic: "Error al iniciar sesión. Inténtalo de nuevo.",
      serverNotConfigured:
        "Auth no está configurado. Ejecuta bun run setup para Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Características",
      svelte: "SPA SvelteKit con rutas por archivos",
      convex: "API de tareas de ejemplo con Convex (activar con env)",
      auth: "Inicio de sesión con Clerk (social + correo) y backend Convex",
      tailwind: "Tailwind v4 con tokens compartidos",
      i18n: "Internacionalización (9 idiomas)",
      themes: "Temas claro y oscuro",
    },
  },
  backend: {
    setupTitle: "Completar configuración en la nube",
    setupBody:
      "Vincula Convex y configura Clerk para la demo de tareas. Sigue los pasos y luego inicia bun run dev:convex y bun run dev:web en terminales separadas.",
    stepConvex:
      "Ejecuta bun run setup para vincular Convex y sincronizar PUBLIC_CONVEX_URL",
    stepAuth:
      "Ejecuta bun run setup para configurar Clerk (clave pública + issuer en Convex)",
    stepEnv: "Ver docs/getting-started.md en este repositorio",
    setupGuide: "Guía completa: docs/getting-started.md en este repositorio",
    backHome: "Volver al inicio",
  },
  tasks: {
    title: "Tareas",
    subtitle: "Ejemplo vertical: mutaciones Convex y auth con Clerk",
    newPlaceholder: "¿Qué hay que hacer?",
    add: "Añadir tarea",
    empty: "Aún no hay tareas. Añade una arriba.",
    listLabel: "Tus tareas",
    toggleComplete: "Marcar «{{title}}» como completada",
    delete: "Eliminar «{{title}}»",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Página no encontrada",
    notFoundHint: "La página que solicitaste no existe.",
    unauthorized: "No tienes autorización para ver esta página",
    serverError: "Error del servidor. Por favor, inténtalo más tarde.",
    networkError: "Error de red. Por favor, verifica tu conexión.",
  },
};

export default es;
