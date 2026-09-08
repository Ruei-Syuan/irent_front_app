export const templateUrl = new URL(
  "../index-return-active.html",
  import.meta.url,
);

export function initialize(app) {
  document.querySelectorAll('[data-return-screen="active"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
