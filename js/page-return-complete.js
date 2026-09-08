export const templateUrl = new URL(
  "../index-return-complete.html",
  import.meta.url,
);

export function initialize(app) {
  const {
    finishMemberRental,
    returnCompleteBackButton,
    returnFinishButton,
    setActiveView,
  } = app;
  document
    .querySelectorAll('[data-view-panel="return-complete"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  returnCompleteBackButton.addEventListener("click", () =>
    setActiveView("return-summary"),
  );

  returnFinishButton.addEventListener("click", () => {
    void finishMemberRental();
  });
}
