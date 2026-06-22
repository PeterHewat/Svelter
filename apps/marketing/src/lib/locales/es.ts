import type { TranslationDictionary } from "@repo/utils";

const es: TranslationDictionary = {
  meta: {
    homeDescription:
      "Plantilla monorepo lista para producción para producto y marketing con SvelteKit, Clerk, Convex y Tailwind.",
    pricingDescription:
      "Compare los planes Free, Pro y Business. Empiece gratis con límites transparentes.",
  },
  nav: {
    main: "Navegación principal",
    menu: "Menú",
    features: "Características",
    pricing: "Precios",
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Panel",
    signIn: "Iniciar sesión",
    github: "Ver en GitHub",
  },
  home: {
    heroTitle: "Construye más rápido con {{name}}",
    heroTagline:
      "Plantilla monorepo lista para producción para sitios de producto y marketing.",
    heroScreenshotAlt: "Marcador de captura de pantalla del producto",
    heroMicrocopy: "Pruébalo gratis, sin cuenta ni tarjeta de crédito",
    logoBarTagline: "Equipos de confianza que construyen con la plantilla",
    ctaTitle: "¿Listo para lanzar tu producto?",
    ctaSubtitle:
      "Clona la plantilla, personaliza el contenido de marcador y despliega hoy.",
    ctaDashboard: "Ir al panel",
    howItWorksTitle: "Cómo funciona",
    metricsTitle: "Hecho para ir rápido",
    testimonialTitle: "Lo que dicen los equipos",
    testimonialPrev: "Testimonio anterior",
    testimonialNext: "Siguiente testimonio",
    freeTierBadge: "Gratis para siempre",
    popularTierBadge: "Más popular",
    faqTitle: "Preguntas frecuentes",
  },
  pricing: {
    subtitle: "Elija el plan que se adapte a su equipo.",
    billingToggle: "Periodo de facturación",
    billingMonthly: "Mensual",
    billingAnnual: "Anual",
    annualSave: "Ahorre ~17 % con facturación anual",
    compareTitle: "Comparar planes",
    featureColumn: "Función",
    included: "Incluido",
    excluded: "No incluido",
  },
  blog: {
    title: "Blog",
    back: "← Volver al blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentación",
    intro:
      "Guías para configuración local, variables de entorno y despliegue. Contenido en inglés en la plantilla.",
    back: "← Toda la documentación",
    sidebar: "Navegación de documentación",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Producto",
    company: "Empresa",
    resources: "Recursos",
    legal: "Legal",
    about: "Acerca de",
    customers: "Clientes",
    security: "Seguridad",
    github: "GitHub",
    privacy: "Privacidad",
    terms: "Términos",
  },
  pages: {
    features: { title: "Características" },
    pricing: { title: "Precios" },
    customers: { title: "Clientes" },
    security: { title: "Seguridad" },
    about: { title: "Acerca de" },
    docs: { title: "Documentación" },
    privacy: { title: "Política de privacidad" },
    terms: { title: "Términos de servicio" },
  },
  stub: {
    templateNotice:
      "Plantilla de marcador — reemplazar antes del lanzamiento (v1).",
  },
  language: {
    select: "Seleccionar idioma",
    hubTitle: "Elige tu idioma",
  },
  theme: {
    toggle: "Cambiar tema",
    light: "Claro",
    dark: "Oscuro",
    switchToLight: "Cambiar a modo claro",
    switchToDark: "Cambiar a modo oscuro",
    switchToLightAria: "Cambiar a tema claro.",
    switchToDarkAria: "Cambiar a tema oscuro.",
  },
};

export default es;
