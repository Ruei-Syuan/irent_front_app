export const templateUrl = new URL(
  "../index-scan-cabin-normal.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-inspection-screen="cabin-normal"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
