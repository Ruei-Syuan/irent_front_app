export const templateUrl = new URL("../index-scan.html", import.meta.url);

export function initialize(app) {
  const {
    cabinRecheckButtons,
    cabinReturnButtons,
    cameraSwitchButtons,
    scanBackButtons,
    scanCabinNext,
    setActiveView,
    setInspectionScreen,
    switchCamera,
  } = app;
  document.querySelectorAll('[data-view-panel="scan"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
  scanBackButtons.forEach((button) =>
    button.addEventListener("click", () => setInspectionScreen("start")),
  );
  scanCabinNext?.addEventListener("click", () =>
    setInspectionScreen("cabin-capture"),
  );

  cabinReturnButtons.forEach((button) =>
    button.addEventListener("click", () => {
      setActiveView("return-summary");
    }),
  );
  cabinRecheckButtons.forEach((button) =>
    button.addEventListener("click", () =>
      setInspectionScreen("cabin-capture"),
    ),
  );

  cameraSwitchButtons.forEach((button) =>
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      void switchCamera();
    }),
  );
}
