export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector),
];
export const escape = (text) =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const copy = (tag, text, source, className = "") =>
  `<${tag} data-source="${source}" class="${className}">${escape(text)}</${tag}>`;
export const arrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
export const cta = (label, target, source, variant = "") =>
  `<a class="cta ${variant}" data-source="${source}" href="${target}"><span>${escape(label)}</span>${arrow}</a>`;
export function coin(className = "") {
  return `<span class="coin ${className}" aria-hidden="true"><span>A</span></span>`;
}
