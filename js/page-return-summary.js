export const templateUrl = new URL(
  "../index-return-summary.html",
  import.meta.url,
);

export function initialize(app) {
  const {
    returnSummaryBackButton,
    returnSummaryButton,
    setActiveView,
    setInspectionScreen,
  } = app;
  document
    .querySelectorAll('[data-view-panel="return-summary"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  returnSummaryBackButton.addEventListener("click", () => {
    setActiveView("scan");
    setInspectionScreen("cabin-clean");
  });

  returnSummaryButton.addEventListener("click", () =>
    setActiveView("return-complete"),
  );
}
