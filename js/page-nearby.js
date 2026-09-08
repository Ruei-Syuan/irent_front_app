export const templateUrl = new URL("../index-nearby.html", import.meta.url);

export function initialize(app) {
  const {
    disableLocation,
    getProperties,
    locateButton,
    locateUser,
    locationToggle,
    quickRentButton,
    renderVehicleDetail,
    setActiveView,
  } = app;
  document.querySelectorAll("[data-nearby-view]").forEach((root) => {
    app.bindPageNavigation(root);
  });
  quickRentButton.addEventListener("click", () => {
    const selectedVehicle = app.allVehicles.features.find(
      (feature) => getProperties(feature).id === app.selectedVehicleId,
    );
    if (!selectedVehicle) return;
    renderVehicleDetail(selectedVehicle);
    setActiveView("vehicle");
  });
  locateButton?.addEventListener("click", () => {
    if (app.locationEnabled) {
      locateUser();
      return;
    }
    if (locationToggle) locationToggle.checked = true;
    locateUser();
  });
  locationToggle?.addEventListener("change", () => {
    if (locationToggle.checked) {
      locateUser();
      return;
    }
    disableLocation();
  });
}
