export const templateUrl = new URL("../index-return.html", import.meta.url);

export function initialize(app) {
  const {
    returnScanStartButtons,
    returnStartButtons,
    revokeCapturedPhotos,
    selectMemberRental,
    setActiveView,
    setInspectionScreen,
    setReturnScreen,
    showToast,
  } = app;
  document.querySelectorAll('[data-view-panel="return"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
  returnStartButtons.forEach((button) =>
    button.addEventListener("click", async () => {
      const record = await selectMemberRental("active");
      if (!record) {
        showToast("目前沒有租借中訂單");
        return;
      }
      setActiveView("return");
      setReturnScreen("active");
    }),
  );
  returnScanStartButtons.forEach((button) =>
    button.addEventListener("click", () => {
      revokeCapturedPhotos();
      setActiveView("scan");
      setInspectionScreen("recording");
    }),
  );
}
