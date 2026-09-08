export const templateUrl = new URL(
  "../index-return-choice.html",
  import.meta.url,
);

export function initialize(app) {
  document.querySelectorAll('[data-return-screen="choice"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
}
