import { normalizeApexDomainInput } from "./validate-domain";

export type DerivedHostnames = {
  apex: string;
  webPreRelease: string;
  webProduction: string;
  marketingPreRelease: string;
  marketingProduction: string;
  localSiteUrls: string[];
  productionSiteUrls: string[];
};

/**
 * Derives web and marketing hostname hints from an apex domain.
 *
 * @param apexDomain - Apex domain (e.g. `example.com`)
 */
export function deriveHostnames(apexDomain: string): DerivedHostnames {
  const apex = normalizeApexDomainInput(apexDomain);
  return {
    apex,
    webPreRelease: `preview.${apex}`,
    webProduction: apex,
    marketingPreRelease: `preview.www.${apex}`,
    marketingProduction: `www.${apex}`,
    localSiteUrls: ["http://localhost:5173", `https://preview.${apex}`],
    productionSiteUrls: [`https://${apex}`],
  };
}
