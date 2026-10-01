import { $, $$ } from "./ui.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const transient = new Set();
let observer;
const graphicSelectors = '.orbit-stage,.glass-icon,.pyramid,.compound-art,.stock-comparison,.step-token,.steps-wave,.portrait,.closing-coin,.bridge-emblem';
export const motionEnabled = () => !reduce.matches && !document.hidden;

export function reveal(element, delay = 0) {
  if (
    !motionEnabled() ||
    !element.animate ||
    element.contains(document.activeElement)
  )
    return;
  const animation = element.animate(
    [
      { opacity: 0.12, translate: "0 28px" },
      { opacity: 1, translate: "0 0" },
    ],
    {
      duration: 750,
      delay,
      easing: "cubic-bezier(.2,.7,.2,1)",
      fill: "backwards",
    },
  );
  transient.add(animation);
  for (const event of ["finish", "cancel"])
    animation.addEventListener(event, () => transient.delete(animation), {
      once: true,
    });
}

function sync() {
  document.documentElement.dataset.motion = motionEnabled() ? "on" : "off";
  if (!motionEnabled()) {
    for (const animation of transient) animation.cancel();
  }
}

export function observeMotion(root = document) {
  if (!observer) return;
  $$(graphicSelectors, root).forEach(element => element.classList.add('motion-graphic'));
  $$(".reveal,.loop-zone,.cta,.motion-graphic", root).forEach((element) =>
    observer.observe(element),
  );
}

export function initMotion() {
  sync();
  reduce.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
          if (
            entry.isIntersecting &&
            entry.target.classList.contains("reveal") &&
            !entry.target.dataset.revealed
          ) {
            entry.target.dataset.revealed = "true";
            reveal(entry.target, Math.min((index % 4) * 75, 225));
            if (!entry.target.matches(".loop-zone,.cta,.motion-graphic"))
              observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );
    observeMotion();
  }
  document.addEventListener("focusin", (event) => {
    for (const animation of transient)
      if (animation.effect?.target?.contains(event.target)) animation.cancel();
  });
}
