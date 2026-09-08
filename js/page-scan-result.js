export const templateUrl = new URL(
  "../index-scan-result.html",
  import.meta.url,
);

export function initialize(app) {
  const {
    returnResultBackButton,
    returnSubmitButton,
    setActiveView,
    setInspectionScreen,
    setReturnScreen,
  } = app;
  document
    .querySelectorAll('[data-inspection-screen="result"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  returnSubmitButton.addEventListener("click", () => {
    setInspectionScreen("cabin-capture");
  });
  returnResultBackButton.addEventListener("click", () => {
    setActiveView("return");
    setReturnScreen("active");
  });
}
