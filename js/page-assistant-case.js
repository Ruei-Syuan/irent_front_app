export const templateUrl = new URL(
  "../index-assistant-case.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-assistant-screen="case"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
