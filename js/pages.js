// Mount every screen before initializing shared state and event handlers.
const pageLoaders = new Map([
  ["assistant/case", () => import("./page-assistant-case.js")],
  ["assistant/home", () => import("./page-assistant-home.js")],
  ["assistant", () => import("./page-assistant.js")],
  ["feedback", () => import("./page-feedback.js")],
  ["nearby", () => import("./page-nearby.js")],
  ["order-confirm", () => import("./page-order-confirm.js")],
  ["order-detail", () => import("./page-order-detail.js")],
  ["points", () => import("./page-points.js")],
  ["rental-ready", () => import("./page-rental-ready.js")],
  ["renting", () => import("./page-renting.js")],
  ["return/active", () => import("./page-return-active.js")],
  ["return/choice", () => import("./page-return-choice.js")],
  ["return", () => import("./page-return.js")],
  ["return-complete", () => import("./page-return-complete.js")],
  ["return-summary", () => import("./page-return-summary.js")],
  ["scan/cabin-capture", () => import("./page-scan-cabin-capture.js")],
  ["scan/cabin-clean", () => import("./page-scan-cabin-clean.js")],
  ["scan/cabin-dirty", () => import("./page-scan-cabin-dirty.js")],
  ["scan/cabin-normal", () => import("./page-scan-cabin-normal.js")],
  ["scan/capture", () => import("./page-scan-capture.js")],
  ["scan", () => import("./page-scan.js")],
  ["scan/recording", () => import("./page-scan-recording.js")],
  ["scan/result", () => import("./page-scan-result.js")],
  ["scan/start", () => import("./page-scan-start.js")],
  ["settings", () => import("./page-settings.js")],
  ["support", () => import("./page-support.js")],
  ["trips", () => import("./page-trips.js")],
  ["vehicle", () => import("./page-vehicle.js")],
]);
const loadedPages = new Map();
const templateCache = new Map();
let routeReady = false;
let applyingRoute = false;
let routeQueued = false;

async function loadDocument(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status}`);
  }
  return new DOMParser().parseFromString(await response.text(), "text/html");
}

async function mountSharedShell() {
  const content = document.querySelector("template[data-page-content]");
  if (!content) return;
  templateCache.set(
    content.dataset.pageContent,
    content.content.cloneNode(true),
  );
  // 首頁是共用外框的唯一來源，分頁不重複維護導覽、會員與通知元件。
  const shell = await loadDocument(new URL("../index.html", import.meta.url));
  shell.querySelectorAll("script").forEach((script) => script.remove());
  document.body.replaceChildren(...shell.body.childNodes);
}

async function mountPages(container) {
  await Promise.all(
    Array.from(container.querySelectorAll("[data-page-slot]"), async (slot) => {
      const name = slot.dataset.pageSlot;
      const load = pageLoaders.get(name);
      if (!load) throw new Error(`Unknown page: ${name}`);
      const page = await load();
      let content = templateCache.get(name);
      if (!content) {
        const pageDocument = await loadDocument(page.templateUrl);
        const template = pageDocument.querySelector(
          "template[data-page-content]",
        );
        if (!template || template.dataset.pageContent !== name) {
          throw new Error(`Missing page content: ${name}`);
        }
        content = template.content;
      }
      const fragment = content.cloneNode(true);
      await mountPages(fragment);
      loadedPages.set(name, page);
      slot.replaceWith(fragment);
    }),
  );
}

export function initializePages(app) {
  loadedPages.forEach((page) => page.initialize(app));
}

function pageNameFromLocation() {
  const filename = window.location.pathname.split("/").pop();
  return (
    Array.from(pageLoaders.keys()).find(
      (name) => `index-${name.replaceAll("/", "-")}.html` === filename,
    ) || "nearby"
  );
}

// 同一份共用程式切換畫面與網址，避免重新載入時遺失拍攝與租借狀態。
export function syncPageRoute() {
  if (!routeReady || applyingRoute || routeQueued) return;
  routeQueued = true;
  queueMicrotask(() => {
    routeQueued = false;
    const view = document.querySelector(".nearby-app").dataset.activeView;
    let name = view;
    const screenAttributes = {
      scan: "inspectionScreen",
      assistant: "assistantScreen",
      return: "returnScreen",
    };
    const attribute = screenAttributes[view];
    if (attribute) {
      const selector = attribute.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      const screen = document.querySelector(`[data-${selector}].is-active`);
      if (screen) name += `/${screen.dataset[attribute]}`;
    }
    if (!pageLoaders.has(name) || pageNameFromLocation() === name) return;
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(
      /[^/]*$/,
      `index-${name.replaceAll("/", "-")}.html`,
    );
    window.history.pushState(null, "", url);
  });
}

export function initializePageRoute(app) {
  function applyRoute() {
    applyingRoute = true;
    try {
      const [view, screen] = pageNameFromLocation().split("/");
      app.setActiveView(view);
      const activeView =
        document.querySelector(".nearby-app").dataset.activeView;
      if (activeView !== view) {
        const url = new URL(window.location.href);
        url.pathname = url.pathname.replace(
          /[^/]*$/,
          `index-${activeView}.html`,
        );
        window.history.replaceState(null, "", url);
        return;
      }
      if (view === "scan") app.setInspectionScreen(screen || "start");
      if (view === "assistant") app.setAssistantScreen(screen || "home");
      if (view === "return") app.setReturnScreen(screen || "choice");
    } finally {
      applyingRoute = false;
    }
  }
  applyRoute();
  routeReady = true;
  window.addEventListener("popstate", applyRoute);
}

async function startApp() {
  let app = document.querySelector(".nearby-app, [data-app-loading]");
  app?.setAttribute("aria-busy", "true");
  try {
    await mountSharedShell();
    app = document.querySelector(".nearby-app");
    app.setAttribute("aria-busy", "true");
    await mountPages(document);
    await import("./nearby-vehicles.js");
  } catch (error) {
    console.error("App initialization failed", error);
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = "畫面載入失敗，請重新整理再試一次。";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "重新載入";
    retry.addEventListener("click", () => window.location.reload());
    message.append(retry);
    (app || document.body).prepend(message);
  } finally {
    app?.removeAttribute("aria-busy");
  }
}

void startApp();
