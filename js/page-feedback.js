export const templateUrl = new URL("../index-feedback.html", import.meta.url);

export function initialize(app) {
  const { feedbackSubmit, setActiveView } = app;
  document.querySelectorAll('[data-view-panel="feedback"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
  feedbackSubmit.addEventListener("click", () => setActiveView("nearby"));
}
