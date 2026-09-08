export const templateUrl = new URL("../index-vehicle.html", import.meta.url);

export function initialize(app) {
  document.querySelectorAll('[data-view-panel="vehicle"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
