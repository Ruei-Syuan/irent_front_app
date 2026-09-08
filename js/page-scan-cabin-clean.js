export const templateUrl = new URL(
  "../index-scan-cabin-clean.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-inspection-screen="cabin-clean"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
