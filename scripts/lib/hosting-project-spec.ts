export type HostingAppSpec = {
  appDir: "apps/web" | "apps/marketing";
  suffix: "web" | "marketing";
};

const APP_SPECS: HostingAppSpec[] = [
  { appDir: "apps/web", suffix: "web" },
  { appDir: "apps/marketing", suffix: "marketing" },
];

/**
 * Static hosting app specs for web and marketing surfaces.
 */
export function hostingAppSpecs(): HostingAppSpec[] {
  return APP_SPECS;
}

/**
 * Builds default Cloudflare Pages project names from a product slug.
 *
 * @param slug - Product slug (from setup product name, e.g. `foobar`)
 */
export function pagesProjectNames(slug: string): {
  web: string;
  marketing: string;
} {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return {
    web: `${normalized}-web`,
    marketing: `${normalized}-marketing`,
  };
}
