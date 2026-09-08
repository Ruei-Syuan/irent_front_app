export const templateUrl = new URL("../index-settings.html", import.meta.url);

export function initialize(app) {
  document.querySelectorAll('[data-view-panel="settings"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
