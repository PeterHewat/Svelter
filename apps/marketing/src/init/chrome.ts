import { wireLocaleLinks, wireLocaleMenus } from "./locale-links";
import { wireNavActive } from "./nav-active";
import { wirePricingBilling } from "./pricing";
import { syncProductAppLinks } from "./product-links";
import { wireRevealInView } from "./reveal";
import { wireTestimonialCarousel } from "./testimonial";
import { toggleTheme, updateToggleLabels } from "./theme";

export function wireChrome() {
  updateToggleLabels();
  document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
    if (!(el instanceof HTMLButtonElement)) {
      return;
    }
    el.disabled = false;
    el.addEventListener("click", function () {
      toggleTheme();
      syncProductAppLinks();
    });
  });
  wireLocaleLinks();
  wireLocaleMenus();
  wireNavActive();
  wireRevealInView();
  wirePricingBilling();
  wireTestimonialCarousel();
  syncProductAppLinks();
}
