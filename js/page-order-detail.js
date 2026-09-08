export const templateUrl = new URL(
  "../index-order-detail.html",
  import.meta.url,
);

export function initialize(app) {
  const { rentalStartButton, startMemberRental } = app;
  document
    .querySelectorAll('[data-view-panel="order-detail"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  rentalStartButton?.addEventListener("click", () => {
    void startMemberRental();
  });
}
