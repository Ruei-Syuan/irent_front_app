export const templateUrl = new URL(
  "../index-rental-ready.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-view-panel="rental-ready"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
