export const templateUrl = new URL(
  "../index-scan-recording.html",
  import.meta.url,
);

export function initialize(app) {
  const { scanRecordNext, setInspectionScreen } = app;
  document
    .querySelectorAll('[data-inspection-screen="recording"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
      const angleButtons = root.querySelectorAll("[data-scan-angle]");
      const currentAngle = root.querySelector(
        ".inspection-progress-head > span:last-child strong",
      );
      const angleBadge = root.querySelector(".inspection-angle-badge");
      angleButtons.forEach((button) => {
        button.addEventListener("click", () => {
          angleButtons.forEach((angleButton) => {
            const isSelected = angleButton === button;
            angleButton.classList.toggle("is-current", isSelected);
            angleButton.setAttribute("aria-pressed", String(isSelected));
          });
          const label = button.querySelector("small").textContent;
          currentAngle.textContent = label;
          angleBadge.textContent = label;
        });
      });
    });
  scanRecordNext.addEventListener("click", () => {
    app.scanProgress = 4;
    setInspectionScreen("capture");
  });
}
