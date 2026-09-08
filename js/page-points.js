export const templateUrl = new URL("../index-points.html", import.meta.url);

export function initialize(app) {
  document.querySelectorAll('[data-view-panel="points"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
