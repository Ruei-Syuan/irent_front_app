export const templateUrl = new URL(
  "../index-scan-cabin-capture.html",
  import.meta.url,
);

export function initialize(app) {
  const { cabinCaptureNext, capturePhoto, setInspectionScreen } = app;
  document
    .querySelectorAll('[data-inspection-screen="cabin-capture"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  cabinCaptureNext.addEventListener("click", async () => {
    cabinCaptureNext.disabled = true;
    const photo = await capturePhoto("cabin-capture");
    if (photo) setInspectionScreen("cabin-clean");
    cabinCaptureNext.disabled = false;
  });
}
