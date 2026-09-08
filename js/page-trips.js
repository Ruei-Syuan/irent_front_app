export const templateUrl = new URL("../index-trips.html", import.meta.url);

export function initialize(app) {
  const { historyFilters, renderRentalHistory } = app;
  document.querySelectorAll('[data-view-panel="trips"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
  historyFilters?.addEventListener("input", renderRentalHistory);
  historyFilters?.addEventListener("change", renderRentalHistory);
  historyFilters?.addEventListener("reset", () =>
    window.setTimeout(renderRentalHistory, 0),
  );
}
