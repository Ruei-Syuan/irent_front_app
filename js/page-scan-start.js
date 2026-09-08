export const templateUrl = new URL("../index-scan-start.html", import.meta.url);

export function initialize(app) {
  const {
    inspectionModeButtons,
    revokeCapturedPhotos,
    scanButton,
    setInspectionMode,
    setInspectionScreen,
  } = app;
  document
    .querySelectorAll('[data-inspection-screen="start"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  inspectionModeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      setInspectionMode(button.dataset.inspectionMode);
    }),
  );
  scanButton.addEventListener("click", () => {
    revokeCapturedPhotos();
    app.scanProgress = 3;
    setInspectionScreen("recording");
  });
}
