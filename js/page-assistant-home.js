export const templateUrl = new URL(
  "../index-assistant-home.html",
  import.meta.url,
);

export function initialize(app) {
  document
    .querySelectorAll('[data-assistant-screen="home"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
}
