export const templateUrl = new URL(
  "../index-scan-cabin-dirty.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-inspection-screen="cabin-dirty"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
