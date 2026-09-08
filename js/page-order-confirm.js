export const templateUrl = new URL(
  "../index-order-confirm.html",
  import.meta.url,
);

export function initialize(app) {
  const { rentalHoursInput, rentalStartInput, updateRentalSchedule } = app;
  document
    .querySelectorAll('[data-view-panel="order-confirm"]')
    .forEach((root) => {
      app.bindPageNavigation(root);
    });
  rentalStartInput?.addEventListener("change", updateRentalSchedule);
  rentalHoursInput?.addEventListener("input", updateRentalSchedule);
}
