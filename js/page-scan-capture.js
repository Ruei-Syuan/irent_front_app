export const templateUrl = new URL(
  "../index-scan-capture.html",
  import.meta.url,
);

export function initialize(app) {
  const { capturePhoto, scanCaptureNext, setInspectionScreen } = app;
  document
    .querySelectorAll('[data-inspection-screen="capture"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  scanCaptureNext.addEventListener("click", async () => {
    scanCaptureNext.disabled = true;
    const photo = await capturePhoto("capture");
    if (photo) setInspectionScreen("result");
    scanCaptureNext.disabled = false;
  });
}
