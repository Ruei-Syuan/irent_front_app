export const templateUrl = new URL("../index-assistant.html", import.meta.url);

export function initialize(app) {
  const {
    assistantCaseButtons,
    assistantHomeButtons,
    assistantPrompts,
    setAssistantScreen,
    updateAssistantResponse,
  } = app;
  document.querySelectorAll('[data-view-panel="assistant"]').forEach((root) => {
    app.bindPageNavigation(root);
  });
  assistantPrompts.forEach((button) =>
    button.addEventListener("click", () => {
      updateAssistantResponse(button.dataset.assistantPrompt);
      setAssistantScreen("case");
    }),
  );
  assistantCaseButtons.forEach((button) =>
    button.addEventListener("click", () => setAssistantScreen("case")),
  );
  assistantHomeButtons.forEach((button) =>
    button.addEventListener("click", () => setAssistantScreen("home")),
  );
}
