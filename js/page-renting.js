export const templateUrl = new URL("../index-renting.html", import.meta.url);

export function initialize(app) {
  document.querySelectorAll('[data-view-panel="renting"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
