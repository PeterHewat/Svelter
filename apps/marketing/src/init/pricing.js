import { PRICING_BILLING_KEY } from "./constants.js";

export function wirePricingBilling() {
  var root = document.querySelector(".pricing-table-root");
  if (!root) {
    return;
  }

  function parseAmount(value) {
    var amount = parseInt(String(value), 10);
    return Number.isFinite(amount) ? amount : 0;
  }

  function readDisplayedAmount(el) {
    return parseAmount((el.textContent || "").replace(/[^\d]/g, ""));
  }

  function formatPrice(amount) {
    return "$" + amount;
  }

  function animatePriceAmount(el, target, duration) {
    var from = readDisplayedAmount(el);
    if (from === target) {
      el.textContent = formatPrice(target);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = formatPrice(target);
      return;
    }

    var start = performance.now();
    function tick(now) {
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(from + (target - from) * eased);
      el.textContent = formatPrice(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatPrice(target);
      }
    }
    requestAnimationFrame(tick);
  }

  function getBillingMode() {
    return root.querySelector(".billing-annual:checked") ? "annual" : "monthly";
  }

  function applyBillingMode(mode, options) {
    var animate = !(options && options.animate === false);
    var annual = mode === "annual";
    var annualInput = root.querySelector(".billing-annual");
    var monthlyInput = root.querySelector(".billing-monthly");
    if (annualInput) {
      annualInput.checked = annual;
    }
    if (monthlyInput) {
      monthlyInput.checked = !annual;
    }

    root.querySelectorAll("[data-pricing-amount]").forEach(function (el) {
      var target = parseAmount(
        el.getAttribute(annual ? "data-annual" : "data-monthly"),
      );
      if (animate) {
        animatePriceAmount(el, target, 360);
      } else {
        el.textContent = formatPrice(target);
      }
    });

    try {
      sessionStorage.setItem(PRICING_BILLING_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  var storedMode = null;
  try {
    storedMode = sessionStorage.getItem(PRICING_BILLING_KEY);
  } catch {
    /* ignore */
  }

  if (storedMode === "annual" || storedMode === "monthly") {
    applyBillingMode(storedMode, { animate: false });
  }

  root.querySelectorAll(".billing-input").forEach(function (input) {
    input.addEventListener("change", function () {
      applyBillingMode(getBillingMode(), { animate: true });
    });
  });
}
