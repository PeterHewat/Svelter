import { wireLocaleLinks, wireLocaleMenus } from "./locale-links.js";
import { syncProductAppLinks } from "./product-links.js";
import { wirePricingBilling } from "./pricing.js";
import { wireRevealInView } from "./reveal.js";
import { wireTestimonialCarousel } from "./testimonial.js";
import {
  enableThemeTransition,
  toggleTheme,
  updateToggleLabels,
} from "./theme.js";

export function wireChrome() {
  updateToggleLabels();
  document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
    el.disabled = false;
    el.addEventListener("click", function () {
      toggleTheme();
      syncProductAppLinks();
    });
  });
  wireLocaleLinks();
  wireLocaleMenus();
  wireRevealInView();
  wirePricingBilling();
  wireTestimonialCarousel();
  syncProductAppLinks();
  requestAnimationFrame(enableThemeTransition);
}
