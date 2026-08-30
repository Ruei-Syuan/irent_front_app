---
name: Codex Front App
description: iRent 使用者端前端開發規則
---

# Front App 開發規則

本目錄沿用專案根目錄 `AGENTS.md` 的規範；以下內容為前端頁面的補充要求。

## 回覆與修改原則

- 不需要額外花時間寫計畫，直接說明修改內容後動手。
- 使用繁體中文，回覆保持簡短明確。
- 優先直接修改既有的 HTML、CSS、JavaScript 檔案。
- 除非明確要求，不建立新檔案、不更換技術架構、不新增 README 或範例文件。
- 保留既有功能、文字、檔案結構與互動流程，只修改指定部分。
- 樣式修改必須同步檢查桌面版與手機版。
- 完成後執行格式化：Windows 使用 `Shift + Alt + F`。
- 完成後只列出：修改檔案、修改內容、驗證結果。

## 前端技術規範

- 使用 HTML、CSS、JavaScript（ES Modules）與 Capacitor 相容的前端實作。
- 互動式地圖固定使用 `MapLibre GL JS`。
- 不使用 Leaflet、Google Maps 或 Mapbox GL JS，除非明確指定。
- 地圖資料統一使用 GeoJSON `FeatureCollection`。
- 地圖資料點使用 MapLibre WebGL 圖層，不為每個點建立 HTML Marker。
- 車輛地圖 API 預設使用 `GET /api/v1/vehicles/map-summary`。
- API 資料應保留必要欄位：`id`、`plateNumber`、`latitude`、`longitude`、`healthScore`、`issueCount`、`status`、`updatedAt`。

## 彈跳視窗固定使用
- SweetAlert2 (JavaScript 套件)

## 健康分數機制

車輛健康分數由車內與車外各占 50% 計算：

- 車內：乾淨 100 分、普通 70 分、髒污 40 分。
- 車外：正常 100 分、待維修 40 分。
- 總分為車內與車外分數平均值。
- 車外待維修時，總分最高不得超過 70 分。

## 驗證規則

- 預設不執行完整測試、建置、端對端測試、視覺測試或效能測試。
- 優先使用靜態檢查、JavaScript 語法檢查或最小必要啟動驗證。
