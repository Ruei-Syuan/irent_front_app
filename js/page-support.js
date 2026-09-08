export const templateUrl = new URL("../index-support.html", import.meta.url);

export function initialize(app) {
  document.querySelectorAll('[data-view-panel="support"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
