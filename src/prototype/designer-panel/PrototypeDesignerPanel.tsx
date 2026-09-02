import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Settings,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { prototypeDataContract } from "../data-contract/prototype-data-contract";
import { catalog, type CatalogEvent, type CatalogLoad } from "../ports/catalog";
import type { DesignerActivityRecord } from "./designer-activity";
import { designerActivity } from "./designer-activity";

// Panel autocontenido: trae su propio CSS scopeado (.lexy-dp) y no depende del
// tema Tailwind del proyecto host ni de componentes del registry. Así se puede
// previsualizar e iterar el diseño en cualquier entorno.
const PANEL_STYLES =
  '\n.lexy-dp {\n  --dp-bg: #ffffff;\n  --dp-fg: #0f172a;\n  --dp-card: #ffffff;\n  --dp-popover: #ffffff;\n  --dp-primary: #4f46e5;\n  --dp-primary-fg: #ffffff;\n  --dp-muted: #f8fafc;\n  --dp-muted-fg: #475569;\n  --dp-accent: #e0e7ff;\n  --dp-accent-fg: #4f46e5;\n  --dp-border: #e2e8f0;\n  --dp-ring: #c7d2fe;\n  --dp-destructive: #ef4444;\n  --dp-success: #10b981;\n  --dp-success-fg: #ffffff;\n  --dp-warning: #f59e0b;\n  --dp-warning-fg: #ffffff;\n  --dp-info: #0ea5e9;\n  --dp-radius: 8px;\n  --dp-mono: "Geist Mono", SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;\n  --dp-sans: "Geist Sans", system-ui, -apple-system, sans-serif;\n  color: var(--dp-fg);\n  font-family: var(--dp-sans);\n  font-size: 13.5px;\n  line-height: 1.5;\n}\n.lexy-dp *, .lexy-dp *::before, .lexy-dp *::after { box-sizing: border-box; }\n.lexy-dp p, .lexy-dp h1, .lexy-dp pre, .lexy-dp ul { margin: 0; }\n.lexy-dp ul { list-style: none; padding: 0; }\n.lexy-dp button { font-family: inherit; color: inherit; border: none; background: transparent; cursor: pointer; outline: none; }\n.lexy-dp code { font-family: var(--dp-mono); }\n\n/* Custom Scrollbars */\n.lexy-dp .lexy-dp-scroll::-webkit-scrollbar,\n.lexy-dp .lexy-dp-split__list::-webkit-scrollbar,\n.lexy-dp .lexy-dp-split__detail::-webkit-scrollbar,\n.lexy-dp .lexy-dp-sheet__body::-webkit-scrollbar,\n.lexy-dp .lexy-dp-snippet::-webkit-scrollbar {\n  width: 6px;\n  height: 6px;\n}\n.lexy-dp .lexy-dp-scroll::-webkit-scrollbar-track,\n.lexy-dp .lexy-dp-split__list::-webkit-scrollbar-track,\n.lexy-dp .lexy-dp-split__detail::-webkit-scrollbar-track,\n.lexy-dp .lexy-dp-sheet__body::-webkit-scrollbar-track,\n.lexy-dp .lexy-dp-snippet::-webkit-scrollbar-track {\n  background: transparent;\n}\n.lexy-dp .lexy-dp-scroll::-webkit-scrollbar-thumb,\n.lexy-dp .lexy-dp-split__list::-webkit-scrollbar-thumb,\n.lexy-dp .lexy-dp-split__detail::-webkit-scrollbar-thumb,\n.lexy-dp .lexy-dp-sheet__body::-webkit-scrollbar-thumb,\n.lexy-dp .lexy-dp-snippet::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.12);\n  border-radius: 9999px;\n}\n.lexy-dp .lexy-dp-scroll::-webkit-scrollbar-thumb:hover,\n.lexy-dp .lexy-dp-split__list::-webkit-scrollbar-thumb:hover,\n.lexy-dp .lexy-dp-split__detail::-webkit-scrollbar-thumb:hover,\n.lexy-dp .lexy-dp-sheet__body::-webkit-scrollbar-thumb:hover,\n.lexy-dp .lexy-dp-snippet::-webkit-scrollbar-thumb:hover {\n  background: rgba(0, 0, 0, 0.24);\n}\n\n/* ── Full Page ── */\n.lexy-dp-page {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  background: var(--dp-bg);\n}\n\n/* ── Tabs ── */\n.lexy-dp-tablist {\n  display: flex;\n  align-items: stretch;\n  border-bottom: 1px solid var(--dp-border);\n  padding: 0 16px;\n  background: #ffffff;\n  gap: 8px;\n}\n.lexy-dp-tab {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 14px;\n  font-size: 13px;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  color: var(--dp-muted-fg);\n  font-weight: 500;\n  transition: all 0.2s ease;\n}\n.lexy-dp-tab:hover { color: var(--dp-fg); }\n.lexy-dp-tab.is-active { \n  color: var(--dp-primary); \n  font-weight: 600; \n  border-bottom-color: var(--dp-primary);\n}\n.lexy-dp-tab svg { width: 15px; height: 15px; opacity: 0.8; }\n.lexy-dp-tab.is-active svg { opacity: 1; color: var(--dp-primary); }\n\n.lexy-dp-tabbadge {\n  margin-left: 4px;\n  border-radius: 9999px;\n  background: var(--dp-warning);\n  color: var(--dp-warning-fg);\n  padding: 1px 6px;\n  font-size: 10px;\n  font-weight: 600;\n}\n.lexy-dp-body { flex: 1; min-height: 0; }\n.lexy-dp-panel { height: 100%; }\n\n/* ── Scroll & Padding ── */\n.lexy-dp-scroll { height: 100%; overflow-y: auto; }\n.lexy-dp-pad { padding: 24px; }\n\n/* ── Column & Toolbar ── */\n.lexy-dp-col { display: flex; flex-direction: column; height: 100%; }\n.lexy-dp-toolbar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  border-bottom: 1px solid var(--dp-border);\n  background: #f8fafc;\n  padding: 8px 16px;\n}\n\n/* ── Buttons ── */\n.lexy-dp-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 8px 16px;\n  font-size: 13px;\n  font-weight: 500;\n  border-radius: var(--dp-radius);\n  border: 1px solid transparent;\n  background: var(--dp-primary);\n  color: var(--dp-primary-fg);\n  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.1);\n  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.lexy-dp-btn:hover { \n  opacity: 0.95; \n  transform: translateY(-1px);\n  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.15);\n}\n.lexy-dp-btn:active { transform: translateY(0); }\n.lexy-dp-btn:disabled { \n  opacity: 0.4; \n  cursor: not-allowed; \n  transform: none !important;\n  box-shadow: none !important;\n}\n.lexy-dp-btn--outline { \n  background: transparent; \n  border-color: var(--dp-border); \n  color: var(--dp-fg); \n  box-shadow: none;\n}\n.lexy-dp-btn--outline:hover { \n  background: var(--dp-muted); \n  border-color: var(--dp-border);\n  box-shadow: none;\n}\n.lexy-dp-btn--outline:disabled:hover { background: transparent; }\n.lexy-dp-btn--sm { padding: 5px 12px; font-size: 12px; }\n.lexy-dp-btn svg { width: 14px; height: 14px; }\n\n/* ── Badges ── */\n.lexy-dp-badge {\n  display: inline-flex;\n  align-items: center;\n  border-radius: 9999px;\n  padding: 2px 10px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  background: rgba(79, 70, 229, 0.08);\n  color: var(--dp-primary);\n  white-space: nowrap;\n}\n.lexy-dp-badge--outline { \n  background: var(--dp-muted); \n  color: var(--dp-muted-fg); \n  border-color: var(--dp-border); \n}\n.lexy-dp-badge--success { \n  background: rgba(16, 185, 129, 0.1); \n  color: #047857; \n}\n.lexy-dp-badge--warning { \n  background: rgba(245, 158, 11, 0.1); \n  color: #b45309; \n}\n\n/* ── Cards ── */\n.lexy-dp-card {\n  border: 1px solid var(--dp-border);\n  background: var(--dp-card);\n  border-radius: var(--dp-radius);\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);\n  padding: 16px;\n  transition: all 0.2s ease;\n}\n.lexy-dp-card:hover {\n  border-color: rgba(79, 70, 229, 0.2);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);\n}\n.lexy-dp-card__title { font-size: 14.5px; font-weight: 600; color: var(--dp-fg); }\n.lexy-dp-card__desc { font-size: 12.5px; color: var(--dp-muted-fg); margin-top: 4px; line-height: 1.4; }\n.lexy-dp-card__content { margin-top: 14px; }\n.lexy-dp-card__head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\n\n/* ── Searchbox ── */\n.lexy-dp-search { position: relative; display: flex; align-items: center; flex: 1; }\n.lexy-dp-search input {\n  width: 100%;\n  padding: 6px 30px 6px 12px;\n  font-size: 12.5px;\n  font-family: inherit;\n  border: 1px solid var(--dp-border);\n  border-radius: 6px;\n  background: #ffffff;\n  color: var(--dp-fg);\n  transition: all 0.2s ease;\n}\n.lexy-dp-search input:focus { \n  outline: none; \n  border-color: var(--dp-primary); \n  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);\n}\n.lexy-dp-search__clear {\n  position: absolute;\n  right: 10px;\n  border: none;\n  background: transparent;\n  color: var(--dp-muted-fg);\n  cursor: pointer;\n  padding: 2px;\n  display: inline-flex;\n  transition: color 0.15s ease;\n}\n.lexy-dp-search__clear:hover { color: var(--dp-fg); }\n.lexy-dp-search__clear svg { width: 14px; height: 14px; }\n\n/* ── Snippet ── */\n.lexy-dp-snippet {\n  font-family: var(--dp-mono);\n  font-size: 12px;\n  background: #f8fafc;\n  border: 1px solid var(--dp-border);\n  border-radius: var(--dp-radius);\n  padding: 12px 14px;\n  overflow: auto;\n  white-space: pre;\n  color: #334155;\n}\n.lexy-dp-sep { border: none; border-top: 1px solid var(--dp-border); height: 1px; margin: 20px 0; }\n.lexy-dp-section-label {\n  font-size: 11.5px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #64748b;\n  margin-bottom: 8px;\n}\n.lexy-dp-muted { color: var(--dp-muted-fg); }\n.lexy-dp-mono { font-family: var(--dp-mono); }\n.lexy-dp-empty { padding: 24px 16px; color: var(--dp-muted-fg); font-size: 13px; text-align: center; }\n\n.lexy-dp-log__event { color: var(--dp-fg); font-weight: 600; }\n\n/* ── Stacks & Grids ── */\n.lexy-dp-stack { display: flex; flex-direction: column; gap: 4px; }\n.lexy-dp-stack-sm { display: flex; flex-direction: column; gap: 8px; }\n.lexy-dp-stack-lg { display: flex; flex-direction: column; gap: 16px; }\n.lexy-dp-substack { display: flex; flex-direction: column; gap: 4px; padding-left: 18px; color: var(--dp-muted-fg); }\n.lexy-dp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }\n\n/* ── JSON Tree ── */\n.lexy-dp-json-str { color: #047857; } /* Emerald green */\n.lexy-dp-json-num { color: #0284c7; } /* Sky blue */\n.lexy-dp-json-row { display: flex; align-items: flex-start; gap: 6px; padding: 2px 0; }\n.lexy-dp-json-spacer { width: 14px; height: 14px; flex-shrink: 0; }\n.lexy-dp-json-leaf { min-width: 0; word-break: break-word; }\n.lexy-dp-json-toggle {\n  display: flex;\n  width: 100%;\n  align-items: flex-start;\n  gap: 6px;\n  padding: 3px 6px;\n  text-align: left;\n  background: transparent;\n  border-radius: 4px;\n  transition: background 0.15s ease;\n}\n.lexy-dp-json-toggle:hover { background: rgba(0, 0, 0, 0.03); }\n.lexy-dp-chevron { width: 14px; height: 14px; flex-shrink: 0; color: var(--dp-muted-fg); margin-top: 2px; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }\n.lexy-dp-chevron--sm { width: 12px; height: 12px; margin-top: 1px; }\n.lexy-dp-chevron.is-open { transform: rotate(90deg); color: var(--dp-fg); }\n\n/* ── Activity Log ── */\n.lexy-dp-activitylog {\n  min-height: 100%;\n  background: var(--dp-bg);\n  padding: 8px 0;\n  font-family: var(--dp-mono);\n  font-size: 12.5px;\n  line-height: 1.6;\n  color: var(--dp-fg);\n}\n.lexy-dp-activitylog--scroll { flex: 1; min-height: 0; overflow-y: auto; }\n.lexy-dp-log { \n  border-bottom: 1px solid var(--dp-border); \n  transition: background 0.15s ease;\n}\n.lexy-dp-log:hover {\n  background: rgba(0, 0, 0, 0.005);\n}\n.lexy-dp-log__head {\n  display: flex;\n  width: 100%;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 16px;\n  text-align: left;\n  background: transparent;\n  cursor: pointer;\n  transition: background 0.15s ease;\n}\n.lexy-dp-log__head:hover { background: rgba(0, 0, 0, 0.03); }\n.lexy-dp-log__time { margin-left: auto; flex-shrink: 0; color: var(--dp-muted-fg); font-size: 11px; }\n.lexy-dp-log__body { \n  padding: 8px 16px 12px 16px; \n  background: #f8fafc; \n  border-top: 1px solid rgba(0, 0, 0, 0.03);\n}\n\n/* ── Split (Master-Detail) ── */\n.lexy-dp-split { display: flex; height: 100%; }\n.lexy-dp-split__list {\n  width: 288px;\n  flex-shrink: 0;\n  overflow-y: auto;\n  border-right: 1px solid var(--dp-border);\n  padding: 12px 0;\n  display: flex;\n  flex-direction: column;\n  background: #f8fafc; /* sidebar light gray background */\n}\n.lexy-dp-list-section {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 10px 16px;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.05em;\n  color: #475569;\n  text-transform: uppercase;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-family: inherit;\n  text-align: left;\n  margin-top: 8px;\n}\n.lexy-dp-list-section:first-of-type { margin-top: 0; }\n.lexy-dp-listitem {\n  width: calc(100% - 16px);\n  margin: 2px 8px;\n  text-align: left;\n  border: none;\n  background: transparent;\n  padding: 7px 12px;\n  font-family: var(--dp-mono);\n  font-size: 12px;\n  color: #334155;\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  border-radius: 6px;\n  transition: all 0.15s ease;\n}\n.lexy-dp-listitem:hover { background: rgba(0, 0, 0, 0.03); color: var(--dp-fg); }\n.lexy-dp-listitem.is-active { \n  background: rgba(79, 70, 229, 0.08); \n  color: var(--dp-primary); \n  font-weight: 600;\n}\n.lexy-dp-split__detail { \n  flex: 1; \n  min-width: 0; \n  min-height: 0; \n  overflow-y: auto; \n  padding: 0; \n  background: #ffffff; /* details pure white background */\n}\n\n/* ── Detalle (Event / Load / Entity Detail Layout) ── */\n.lexy-dp-eventdetail { display: flex; flex-direction: column; font-size: 13.5px; line-height: 1.6; }\n\n/* The first detail body acts as the HERO banner of the selected item */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type {\n  background: #f8fafc;\n  border-bottom: 1px solid var(--dp-border);\n  padding: 24px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  margin-bottom: 12px;\n}\n/* Reorganize field rows inside the HERO banner */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 4px;\n}\n/* Hide default "Nombre" label since it\'s redundant */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field:first-of-type .lexy-dp-detail-label {\n  display: none;\n}\n/* Title of the hero banner (technical ID) */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field:first-of-type span:not(.lexy-dp-detail-label) {\n  font-size: 20px;\n  font-weight: 700;\n  color: #0f172a;\n  font-family: var(--dp-sans);\n}\n/* Styling other hero banner labels as small headers */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field:not(:first-of-type) .lexy-dp-detail-label {\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #64748b;\n}\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field:not(:first-of-type) .lexy-dp-detail-label::after {\n  content: "";\n}\n/* Text description in the hero banner */\n.lexy-dp-eventdetail .lexy-dp-detail-body:first-of-type .lexy-dp-detail-field:not(:first-of-type) span:not(.lexy-dp-detail-label) {\n  font-size: 13.5px;\n  color: #475569;\n  font-family: var(--dp-sans);\n  line-height: 1.6;\n}\n\n/* Detail sub-bodies (e.g. content underneath sections) */\n.lexy-dp-eventdetail .lexy-dp-detail-body:not(:first-of-type) {\n  padding: 12px 24px 24px 24px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.lexy-dp-detail-field { display: flex; gap: 8px; font-family: var(--dp-mono); font-size: 12.5px; }\n.lexy-dp-detail-label { color: var(--dp-muted-fg); flex-shrink: 0; }\n.lexy-dp-detail-label::after { content: ":"; }\n\n/* Section Header Buttons inside Detail Page */\n.lexy-dp-eventdetail > .lexy-dp-list-section {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 12px 24px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #0f172a;\n  background: #ffffff;\n  border-top: 1px solid var(--dp-border);\n  border-bottom: none;\n  cursor: pointer;\n  font-family: inherit;\n  text-align: left;\n  margin-top: 8px;\n  text-transform: none;\n  letter-spacing: normal;\n}\n.lexy-dp-eventdetail > .lexy-dp-list-section:hover { background: #f8fafc; }\n\n/* ── Triggers List ── */\n.lexy-dp-trigger-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }\n.lexy-dp-trigger-item { display: flex; gap: 8px; align-items: baseline; }\n.lexy-dp-bullet { color: var(--dp-primary); font-weight: 700; flex-shrink: 0; }\n\n/* ── Fields Table (DevTools) ── */\n.lexy-dp-field-table { \n  width: 100%; \n  border-collapse: collapse; \n  font-family: var(--dp-mono); \n  font-size: 12px; \n  table-layout: fixed; \n}\n.lexy-dp-field-table th { \n  text-align: left; \n  font-weight: 600; \n  color: #475569; \n  padding: 8px 12px; \n  background: #f8fafc; \n  border-bottom: 1px solid var(--dp-border); \n  border-right: 1px solid var(--dp-border); \n  white-space: nowrap; \n  overflow: hidden; \n  text-overflow: ellipsis; \n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.lexy-dp-field-table th:last-child { border-right: none; }\n.lexy-dp-field-table td { \n  padding: 6px 12px; \n  border-bottom: 1px solid var(--dp-border); \n  border-right: 1px solid var(--dp-border); \n  white-space: nowrap; \n  overflow: hidden; \n  text-overflow: ellipsis; \n  vertical-align: middle; \n  color: #334155;\n}\n.lexy-dp-field-table td:last-child { border-right: none; }\n.lexy-dp-field-table tbody tr { cursor: pointer; transition: background 0.15s ease; }\n.lexy-dp-field-table tbody tr:hover { background: rgba(0, 0, 0, 0.015); }\n.lexy-dp-field-table tbody tr.is-selected { background: rgba(79, 70, 229, 0.04); }\n.lexy-dp-field-table tbody tr.is-selected td { color: var(--dp-primary); font-weight: 600; }\n.lexy-dp-field-table tbody tr:last-child td { border-bottom: none; }\n\n/* Wrapper to round table corners */\n.lexy-dp-eventdetail .lexy-dp-detail-body > div[style*="overflowX"] {\n  border: 1px solid var(--dp-border);\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n/* ── Floating Launcher ── */\n.lexy-dp-launcher {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  z-index: 50;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 48px;\n  width: 48px;\n  gap: 0;\n  overflow: hidden;\n  border: none !important;\n  border-radius: 9999px;\n  background: #0f172a !important;\n  color: #ffffff !important;\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15) !important;\n  cursor: pointer;\n  padding: 0 14px;\n  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n}\n.lexy-dp-launcher:hover { \n  width: 176px; \n  gap: 8px; \n  background: #1e293b !important;\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;\n}\n.lexy-dp-launcher.is-open {\n  width: 176px;\n  gap: 8px;\n  background: #0f172a !important;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;\n}\n.lexy-dp-launcher.is-open:hover {\n  background: #1e293b !important;\n}\n.lexy-dp-launcher:focus-visible { outline: 2px solid var(--dp-primary); outline-offset: 2px; }\n.lexy-dp-launcher__icon { width: 20px; height: 20px; flex-shrink: 0; }\n.lexy-dp-launcher__label {\n  overflow: hidden;\n  white-space: nowrap;\n  font-size: 13px;\n  font-weight: 600;\n  max-width: 0;\n  opacity: 0;\n  transition: max-width 0.3s ease, opacity 0.2s ease;\n}\n.lexy-dp-launcher:hover .lexy-dp-launcher__label,\n.lexy-dp-launcher:focus-visible .lexy-dp-launcher__label,\n.lexy-dp-launcher.is-open .lexy-dp-launcher__label { max-width: 130px; opacity: 1; }\n\n/* ── Floating Sheet ── */\n.lexy-dp-sheet {\n  position: fixed;\n  bottom: 84px;\n  right: 20px;\n  z-index: 50;\n  display: flex;\n  flex-direction: column;\n  height: 75vh;\n  width: min(100vw - 2.5rem, 460px);\n  overflow: hidden;\n  border: 1px solid var(--dp-border);\n  border-radius: 12px;\n  background: var(--dp-popover);\n  color: var(--dp-fg);\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);\n  animation: lexy-sheet-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n\n@keyframes lexy-sheet-slide {\n  from { opacity: 0; transform: translateY(12px) scale(0.98); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n\n.lexy-dp-sheet__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  background: #0f172a;\n  padding: 14px 18px;\n  color: #ffffff;\n}\n.lexy-dp-sheet__title { font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em; }\n.lexy-dp-sheet__actions { display: flex; align-items: center; gap: 6px; }\n.lexy-dp-iconbtn {\n  display: flex;\n  height: 30px;\n  width: 30px;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  border-radius: 6px;\n  opacity: 0.6;\n  color: #ffffff;\n  cursor: pointer;\n  /* "Abrir panel completo" es un <a>: sin esto llega subrayado y en azul. */\n  text-decoration: none;\n  flex-shrink: 0;\n  transition: all 0.15s ease;\n}\n.lexy-dp-iconbtn:hover { opacity: 1; background: rgba(255, 255, 255, 0.1); color: #ffffff; }\n.lexy-dp-iconbtn:focus-visible { opacity: 1; outline: 2px solid #ffffff; outline-offset: 2px; }\n.lexy-dp-iconbtn svg { width: 15px; height: 15px; }\n.lexy-dp-sheet__body { flex: 1; min-height: 0; overflow-y: auto; background: var(--dp-bg); }\n';

function PanelStyles() {
  return <style>{PANEL_STYLES}</style>;
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));

const safeParse = (value: string | undefined): unknown => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const TREE_INDENT = 14;
const TREE_BASE = 8;

const renderPrimitive = (value: unknown) => {
  if (typeof value === "string") return <span className="lexy-dp-json-row-str">"{value}"</span>;
  if (typeof value === "number") return <span className="lexy-dp-json-row-num">{value}</span>;
  if (typeof value === "boolean")
    return <span className="lexy-dp-json-row-num">{String(value)}</span>;
  if (value === null) return <span className="lexy-dp-muted">null</span>;
  return <span className="lexy-dp-json-row-str">{String(value)}</span>;
};

function JsonNode({
  label,
  value,
  depth = 0,
  defaultOpen = false,
}: {
  label: string;
  value: unknown;
  depth?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isBranch = value !== null && typeof value === "object";
  const indent = { paddingLeft: depth * TREE_INDENT + TREE_BASE + "px" };

  if (!isBranch) {
    return (
      <div style={indent} className="lexy-dp-json-row">
        <span className="lexy-dp-json-spacer" aria-hidden />
        <span className="lexy-dp-json-leaf">
          <span className="lexy-dp-muted">{label}:</span> {renderPrimitive(value)}
        </span>
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={indent}
        className="lexy-dp-json-toggle"
      >
        <ChevronRight className={"lexy-dp-chevron" + (open ? " is-open" : "")} />
        <span className="lexy-dp-json-leaf">
          <span className="lexy-dp-muted">{label}:</span>
          {!open ? (
            <span className="lexy-dp-muted">
              {" "}
              {Array.isArray(value) ? "Array(" + entries.length + ")" : "{…}"}
            </span>
          ) : null}
        </span>
      </button>
      {open
        ? entries.map(([key, child]) => (
            <JsonNode key={key} label={key} value={child} depth={depth + 1} defaultOpen />
          ))
        : null}
    </div>
  );
}

function LogEntry({ item }: { item: DesignerActivityRecord }) {
  const [open, setOpen] = useState(false);
  const trigger = item.triggerId ?? "desconocido";
  const operationName = item.technicalId ?? item.label;
  const input = safeParse(item.inputPreview);
  const inputLabel = item.kind === "load" ? "params" : "payload";

  return (
    <div className="lexy-dp-log">
      <button type="button" onClick={() => setOpen((v) => !v)} className="lexy-dp-log__head">
        <ChevronRight
          className={"lexy-dp-chevron lexy-dp-chevron--sm" + (open ? " is-open" : "")}
        />
        <span className="lexy-dp-log__event">{operationName}</span>
        <span className="lexy-dp-log__time">{formatTime(item.occurredAt)}</span>
      </button>
      {open ? (
        <div className="lexy-dp-log__body">
          <div style={{ paddingLeft: TREE_BASE + "px" }} className="lexy-dp-json-row">
            <span className="lexy-dp-json-spacer" aria-hidden />
            <span className="lexy-dp-json-leaf">
              <span className="lexy-dp-muted">fuente:</span>{" "}
              <span className="lexy-dp-json-row-str">{trigger}</span>
            </span>
          </div>
          {input !== undefined ? <JsonNode label={inputLabel} value={input} defaultOpen /> : null}
        </div>
      ) : null}
    </div>
  );
}

// El panel completo se resuelve contra el base del build (import.meta.env.BASE_URL).
// Con una ruta absoluta, un prototipo servido bajo un sub-path —base: "/mi-proto/"
// en vite.config— apuntaba a la raíz del dominio y devolvía 404. Sin Vite delante
// (tests en Node) no existe env: cae a "/", que es el valor por defecto.
const DESIGNER_PANEL_HREF =
  (import.meta.env?.BASE_URL ?? "/").replace(/\/$/, "") + "/designer-panel";

function ActivityLog() {
  const activity = useSyncExternalStore(
    designerActivity.subscribe,
    designerActivity.getSnapshot,
    designerActivity.getSnapshot,
  );
  return (
    <div className="lexy-dp-activitylog">
      {activity.length === 0 ? (
        <p className="lexy-dp-empty">Sin actividad. Ejecuta una carga o publica un evento.</p>
      ) : null}
      {activity.map((item) => (
        <LogEntry key={item.id} item={item} />
      ))}
    </div>
  );
}

const matchesQuery = (item: DesignerActivityRecord, query: string): boolean => {
  const haystack = [item.technicalId, item.label, item.triggerId, item.inputPreview]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

function ActivityTab() {
  const [query, setQuery] = useState("");
  const activity = useSyncExternalStore(
    designerActivity.subscribe,
    designerActivity.getSnapshot,
    designerActivity.getSnapshot,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? activity.filter((item) => matchesQuery(item, normalizedQuery))
    : activity;

  return (
    <div className="lexy-dp-col">
      <div className="lexy-dp-toolbar">
        <button
          type="button"
          aria-label="Limpiar actividad"
          title="Limpiar actividad"
          className="lexy-dp-iconbtn"
          onClick={() => designerActivity.clear()}
        >
          <Trash2 />
        </button>
        <div className="lexy-dp-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en los logs…"
          />
          {query ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              className="lexy-dp-search__clear"
              onClick={() => setQuery("")}
            >
              <X />
            </button>
          ) : null}
        </div>
      </div>
      <div className="lexy-dp-activitylog lexy-dp-activitylog--scroll">
        {filtered.length === 0 ? (
          <p className="lexy-dp-empty">
            {activity.length === 0
              ? "Sin actividad. Ejecuta una carga o publica un evento."
              : "Sin coincidencias para la búsqueda."}
          </p>
        ) : null}
        {filtered.map((item) => (
          <LogEntry key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

const inferType = (value: unknown): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

const TYPE_COLORS: Record<string, string> = {
  string: "var(--dp-success)",
  number: "var(--dp-info)",
  boolean: "var(--dp-warning)",
};

const TypeLabel = ({ value }: { value: unknown }) => (
  <span className="lexy-dp-muted" style={{ marginLeft: "8px" }}>
    {inferType(value)}
  </span>
);

function PayloadKeyNode({
  label,
  value,
  depth = 0,
}: {
  label: string;
  value: unknown;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const indent = { paddingLeft: depth * TREE_INDENT + TREE_BASE + "px" };

  if (Array.isArray(value)) {
    const firstObj = value.find(
      (item) => item !== null && typeof item === "object" && !Array.isArray(item),
    );
    const children = firstObj ? Object.entries(firstObj as Record<string, unknown>) : [];
    if (children.length === 0) {
      return (
        <div style={indent} className="lexy-dp-json-row">
          <span className="lexy-dp-json-spacer" aria-hidden />
          <span
            className="lexy-dp-json-leaf"
            style={{ color: TYPE_COLORS[inferType(value)] ?? "var(--dp-fg)" }}
          >
            {label}
            <TypeLabel value={value} />
          </span>
        </div>
      );
    }
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={indent}
          className="lexy-dp-json-toggle"
        >
          <ChevronRight className={"lexy-dp-chevron" + (open ? " is-open" : "")} />
          <span
            className="lexy-dp-json-leaf"
            style={{ color: TYPE_COLORS[inferType(value)] ?? "var(--dp-fg)" }}
          >
            {label}
            <TypeLabel value={value} />
          </span>
        </button>
        {open
          ? children.map(([key, child]) => (
              <PayloadKeyNode key={key} label={key} value={child} depth={depth + 1} />
            ))
          : null}
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={indent}
          className="lexy-dp-json-toggle"
        >
          <ChevronRight className={"lexy-dp-chevron" + (open ? " is-open" : "")} />
          <span
            className="lexy-dp-json-leaf"
            style={{ color: TYPE_COLORS[inferType(value)] ?? "var(--dp-fg)" }}
          >
            {label}
            <TypeLabel value={value} />
          </span>
        </button>
        {open
          ? entries.map(([key, child]) => (
              <PayloadKeyNode key={key} label={key} value={child} depth={depth + 1} />
            ))
          : null}
      </div>
    );
  }

  return (
    <div style={indent} className="lexy-dp-json-row">
      <span className="lexy-dp-json-spacer" aria-hidden />
      <span
        className="lexy-dp-json-leaf"
        style={{ color: TYPE_COLORS[inferType(value)] ?? "var(--dp-fg)" }}
      >
        {label}
        <TypeLabel value={value} />
      </span>
    </div>
  );
}

function EventDetail({ event }: { event: CatalogEvent }) {
  const [triggersOpen, setTriggersOpen] = useState(true);
  const [payloadOpen, setPayloadOpen] = useState(true);

  const activity = useSyncExternalStore(
    designerActivity.subscribe,
    designerActivity.getSnapshot,
    designerActivity.getSnapshot,
  );
  const observedTriggers = Array.from(
    new Set(
      activity
        .filter((record) => record.technicalId === event.technicalId && record.triggerId)
        .map((record) => record.triggerId as string),
    ),
  );
  const payload = event.lastPayload;

  return (
    <div className="lexy-dp-eventdetail">
      <div className="lexy-dp-detail-body">
        <div className="lexy-dp-detail-field">
          <span className="lexy-dp-detail-label">Nombre</span>
          <span>{event.technicalId}</span>
        </div>
        {event.description ? (
          <div className="lexy-dp-detail-field">
            <span className="lexy-dp-detail-label">Descripción</span>
            <span>{event.description}</span>
          </div>
        ) : null}
        {event.lastReceipt ? (
          <div className="lexy-dp-detail-field">
            <span className="lexy-dp-detail-label">Último receipt</span>
            <span className="lexy-dp-mono">
              {event.lastReceipt.eventId} · {event.lastReceipt.status}
            </span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="lexy-dp-list-section"
        onClick={() => setTriggersOpen((v) => !v)}
      >
        Detonantes
        <ChevronRight
          className={"lexy-dp-chevron lexy-dp-chevron--sm" + (triggersOpen ? " is-open" : "")}
        />
      </button>
      {triggersOpen ? (
        <div className="lexy-dp-detail-body">
          {observedTriggers.length > 0 ? (
            <ul className="lexy-dp-trigger-list">
              {observedTriggers.map((trigger) => (
                <li key={trigger} className="lexy-dp-trigger-item">
                  <span className="lexy-dp-bullet">·</span>
                  <span className="lexy-dp-mono">{trigger}</span>
                </li>
              ))}
            </ul>
          ) : event.trigger ? (
            <span className="lexy-dp-muted">{event.trigger} · sin publicar aún</span>
          ) : (
            <span className="lexy-dp-muted">Sin publicar aún.</span>
          )}
        </div>
      ) : null}

      <button
        type="button"
        className="lexy-dp-list-section"
        onClick={() => setPayloadOpen((v) => !v)}
      >
        Payload
        <ChevronRight
          className={"lexy-dp-chevron lexy-dp-chevron--sm" + (payloadOpen ? " is-open" : "")}
        />
      </button>
      {payloadOpen ? (
        <div className="lexy-dp-detail-body">
          {payload !== undefined && payload !== null ? (
            typeof payload === "object" ? (
              <div className="lexy-dp-mono" style={{ fontSize: "12px" }}>
                {Object.entries(payload as Record<string, unknown>).map(([key, value]) => (
                  <PayloadKeyNode key={key} label={key} value={value} />
                ))}
              </div>
            ) : (
              <span className="lexy-dp-mono lexy-dp-muted">{typeof payload}</span>
            )
          ) : (
            <span className="lexy-dp-muted">
              Sin datos aún — publica el evento para ver el payload.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function LoadDetail({ load }: { load: CatalogLoad }) {
  const [paramsOpen, setParamsOpen] = useState(true);
  const params = load.lastParams;

  return (
    <div className="lexy-dp-eventdetail">
      <div className="lexy-dp-detail-body">
        <div className="lexy-dp-detail-field">
          <span className="lexy-dp-detail-label">Nombre</span>
          <span>{load.technicalId}</span>
        </div>
        {load.description ? (
          <div className="lexy-dp-detail-field">
            <span className="lexy-dp-detail-label">Descripción</span>
            <span>{load.description}</span>
          </div>
        ) : null}
        {load.reads.entities.length > 0 ? (
          <div className="lexy-dp-detail-field">
            <span className="lexy-dp-detail-label">Lee</span>
            <span className="lexy-dp-mono">{load.reads.entities.join(", ")}</span>
          </div>
        ) : null}
        {load.reads.fields.length > 0 ? (
          <div className="lexy-dp-detail-field">
            <span className="lexy-dp-detail-label">Campos</span>
            <ul className="lexy-dp-trigger-list">
              {load.reads.fields.map((field) => (
                <li key={field} className="lexy-dp-trigger-item">
                  <span className="lexy-dp-bullet">·</span>
                  <span className="lexy-dp-mono">{field}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="lexy-dp-list-section"
        onClick={() => setParamsOpen((v) => !v)}
      >
        Parámetros
        <ChevronRight
          className={"lexy-dp-chevron lexy-dp-chevron--sm" + (paramsOpen ? " is-open" : "")}
        />
      </button>
      {paramsOpen ? (
        <div className="lexy-dp-detail-body">
          {params !== undefined && params !== null && typeof params === "object" ? (
            <div className="lexy-dp-mono" style={{ fontSize: "12px" }}>
              {Object.entries(params as Record<string, unknown>).map(([key, value]) => (
                <PayloadKeyNode key={key} label={key} value={value} />
              ))}
            </div>
          ) : (
            <span className="lexy-dp-muted">Sin parámetros — esta carga no recibe filtros.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

type SelectedContract =
  { kind: "event"; id: string } | { kind: "load"; id: string } | { kind: "entity"; id: string };

type EntitySelectedItem =
  { kind: "field"; id: string } | { kind: "relation"; id: string; reverse: boolean };

function EntityDetail({ entityId }: { entityId: string }) {
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const [selected, setSelected] = useState<EntitySelectedItem | null>(null);
  const [itemDetailOpen, setItemDetailOpen] = useState(true);

  const entries = useSyncExternalStore(catalog.subscribe, catalog.getSnapshot, catalog.getSnapshot);

  const entity = prototypeDataContract.entities[entityId];
  if (!entity) return <p className="lexy-dp-empty">Entidad no encontrada.</p>;

  const entityRelations = [
    ...prototypeDataContract.relations
      .filter((r) => r.fromEntity === entityId)
      .map((r) => ({ ...r, targetEntity: r.toEntity, reverse: false })),
    ...prototypeDataContract.relations
      .filter((r) => r.toEntity === entityId)
      .map((r) => ({ ...r, targetEntity: r.fromEntity, reverse: true })),
  ];

  const hasRows = Object.keys(entity.fields).length > 0 || entityRelations.length > 0;

  const selectedField = selected?.kind === "field" ? entity.fields[selected.id] : null;
  const selectedRelation =
    selected?.kind === "relation"
      ? (entityRelations.find((r) => r.id === selected.id && r.reverse === selected.reverse) ??
        null)
      : null;

  const fieldEvents =
    selected?.kind === "field"
      ? entries.filter(
          (entry): entry is CatalogEvent =>
            entry.kind === "event" && entry.writes.fields.includes(entityId + "." + selected.id),
        )
      : [];

  // Contracara de fieldEvents: qué cargas traen este campo desde el backend.
  // Es lo que Desarrollo necesita para saber qué consulta lo tiene que resolver.
  const fieldLoads =
    selected?.kind === "field"
      ? entries.filter(
          (entry): entry is CatalogLoad =>
            entry.kind === "load" && entry.reads.fields.includes(entityId + "." + selected.id),
        )
      : [];

  const handleClick = (item: EntitySelectedItem) => {
    setSelected((prev) => (prev?.kind === item.kind && prev.id === item.id ? null : item));
    setItemDetailOpen(true);
  };

  const isSelected = (item: EntitySelectedItem) =>
    selected?.kind === item.kind &&
    selected.id === item.id &&
    (item.kind !== "relation" || (selected as { reverse: boolean }).reverse === item.reverse);

  return (
    <div className="lexy-dp-eventdetail">
      <div className="lexy-dp-detail-body">
        <div className="lexy-dp-detail-field">
          <span className="lexy-dp-detail-label">Nombre</span>
          <span>{entityId}</span>
        </div>
        <div className="lexy-dp-detail-field">
          <span className="lexy-dp-detail-label">Descripción</span>
          <span>{entity.productDescription}</span>
        </div>
      </div>

      <button
        type="button"
        className="lexy-dp-list-section"
        onClick={() => setFieldsOpen((v) => !v)}
      >
        Campos
        <ChevronRight
          className={"lexy-dp-chevron lexy-dp-chevron--sm" + (fieldsOpen ? " is-open" : "")}
        />
      </button>
      {fieldsOpen ? (
        !hasRows ? (
          <div className="lexy-dp-detail-body">
            <span className="lexy-dp-muted">Sin campos declarados.</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="lexy-dp-field-table">
              <thead>
                <tr>
                  <th style={{ color: "var(--dp-fg)" }}>Campo</th>
                  <th style={{ width: "100px", color: "var(--dp-muted-fg)" }}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(entity.fields).map(([fieldId, field]) => {
                  const sel = isSelected({ kind: "field", id: fieldId });
                  return (
                    <tr
                      key={fieldId}
                      className={sel ? "is-selected" : ""}
                      onClick={() => handleClick({ kind: "field", id: fieldId })}
                    >
                      <td
                        style={
                          sel ? undefined : { color: TYPE_COLORS[field.dataType] ?? "var(--dp-fg)" }
                        }
                      >
                        {fieldId}
                      </td>
                      <td className={sel ? undefined : "lexy-dp-muted"}>{field.dataType}</td>
                    </tr>
                  );
                })}
                {entityRelations.map((rel) => {
                  const sel = isSelected({ kind: "relation", id: rel.id, reverse: rel.reverse });
                  return (
                    <tr
                      key={rel.id + (rel.reverse ? "_r" : "")}
                      className={sel ? "is-selected" : ""}
                      onClick={() =>
                        handleClick({ kind: "relation", id: rel.id, reverse: rel.reverse })
                      }
                    >
                      <td style={sel ? undefined : { color: "var(--dp-primary)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <ArrowUpRight style={{ width: "11px", height: "11px", flexShrink: 0 }} />
                          {rel.id}
                        </span>
                      </td>
                      <td style={sel ? undefined : { color: "var(--dp-primary)", opacity: 0.8 }}>
                        {rel.targetEntity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {selected ? (
        <>
          <button
            type="button"
            className="lexy-dp-list-section"
            onClick={() => setItemDetailOpen((v) => !v)}
          >
            <span>
              Detalle · <span className="lexy-dp-mono">{selected.id}</span>
            </span>
            <ChevronRight
              className={"lexy-dp-chevron lexy-dp-chevron--sm" + (itemDetailOpen ? " is-open" : "")}
            />
          </button>
          {itemDetailOpen ? (
            <div className="lexy-dp-detail-body">
              {selectedField ? (
                <>
                  <div className="lexy-dp-detail-field">
                    <span className="lexy-dp-detail-label">Cargas que lo traen</span>
                  </div>
                  {fieldLoads.length === 0 ? (
                    <span className="lexy-dp-muted">Ninguna carga declara este campo.</span>
                  ) : (
                    <ul className="lexy-dp-trigger-list">
                      {fieldLoads.map((load) => (
                        <li key={load.technicalId} className="lexy-dp-trigger-item">
                          <span className="lexy-dp-bullet">·</span>
                          <span className="lexy-dp-mono">{load.technicalId}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="lexy-dp-detail-field">
                    <span className="lexy-dp-detail-label">Eventos que modifican</span>
                  </div>
                  {fieldEvents.length === 0 ? (
                    <span className="lexy-dp-muted">Ningún evento modifica este campo.</span>
                  ) : (
                    <ul className="lexy-dp-trigger-list">
                      {fieldEvents.map((event) => (
                        <li key={event.technicalId} className="lexy-dp-trigger-item">
                          <span className="lexy-dp-bullet">·</span>
                          <span className="lexy-dp-mono">{event.technicalId}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : selectedRelation ? (
                <>
                  <div className="lexy-dp-detail-field">
                    <span className="lexy-dp-detail-label">Descripción</span>
                    <span>{selectedRelation.productDescription}</span>
                  </div>
                  <div className="lexy-dp-detail-field">
                    <span className="lexy-dp-detail-label">Cardinalidad</span>
                    <span>{selectedRelation.cardinality}</span>
                  </div>
                  <div className="lexy-dp-detail-field">
                    <span className="lexy-dp-detail-label">Resolución</span>
                    <span>{selectedRelation.resolution}</span>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function EventsTab() {
  const entries = useSyncExternalStore(catalog.subscribe, catalog.getSnapshot, catalog.getSnapshot);
  const events = entries.filter((e): e is CatalogEvent => e.kind === "event");
  const loads = entries.filter((e): e is CatalogLoad => e.kind === "load");
  const entities = Object.entries(prototypeDataContract.entities);

  const defaultSelected: SelectedContract | null = entities[0]
    ? { kind: "entity", id: entities[0][0] }
    : null;

  const [selected, setSelected] = useState<SelectedContract | null>(defaultSelected);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [loadsOpen, setLoadsOpen] = useState(true);
  const [entitiesOpen, setEntitiesOpen] = useState(true);

  if (events.length === 0 && loads.length === 0 && entities.length === 0) {
    return (
      <p className="lexy-dp-empty">
        Publica un evento, ejecuta una carga o declara entidades para ver contenido aquí.
      </p>
    );
  }

  const selectedEvent =
    selected?.kind === "event" ? (events.find((e) => e.technicalId === selected.id) ?? null) : null;
  const selectedLoad =
    selected?.kind === "load" ? (loads.find((l) => l.technicalId === selected.id) ?? null) : null;

  const renderGroup = (
    label: string,
    open: boolean,
    toggle: () => void,
    ids: string[],
    kind: "event" | "load" | "entity",
  ) =>
    ids.length > 0 ? (
      <>
        <li>
          <button type="button" className="lexy-dp-list-section" onClick={toggle}>
            {label}
            <ChevronRight
              className={"lexy-dp-chevron lexy-dp-chevron--sm" + (open ? " is-open" : "")}
            />
          </button>
        </li>
        {open
          ? ids.map((id) => (
              <li key={kind + ":" + id}>
                <button
                  type="button"
                  onClick={() => setSelected({ kind, id })}
                  title={id}
                  className={
                    "lexy-dp-listitem" +
                    (selected?.kind === kind && selected.id === id ? " is-active" : "")
                  }
                >
                  {id}
                </button>
              </li>
            ))
          : null}
      </>
    ) : null;

  return (
    <div className="lexy-dp-split">
      <ul className="lexy-dp-split__list">
        {renderGroup(
          "Eventos",
          eventsOpen,
          () => setEventsOpen((v) => !v),
          events.map((e) => e.technicalId),
          "event",
        )}
        {renderGroup(
          "Cargas de datos",
          loadsOpen,
          () => setLoadsOpen((v) => !v),
          loads.map((l) => l.technicalId),
          "load",
        )}
        {renderGroup(
          "Entidades",
          entitiesOpen,
          () => setEntitiesOpen((v) => !v),
          entities.map(([id]) => id),
          "entity",
        )}
      </ul>
      <div className="lexy-dp-split__detail">
        {selected?.kind === "event" && selectedEvent ? (
          <EventDetail event={selectedEvent} />
        ) : selected?.kind === "load" && selectedLoad ? (
          <LoadDetail load={selectedLoad} />
        ) : selected?.kind === "entity" ? (
          <EntityDetail entityId={selected.id} />
        ) : null}
      </div>
    </div>
  );
}

type DesignerTab = "activity" | "events";

export function DesignerPanelPage() {
  const [tab, setTab] = useState<DesignerTab>("activity");
  const [launcherVisible, setLauncherVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lexy-dp-launcher-visible") !== "false";
    }
    return true;
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lexy-dp-launcher-visible") {
        setLauncherVisible(e.newValue !== "false");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="lexy-dp lexy-dp-page">
      <PanelStyles />
      <div className="lexy-dp-tablist" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "activity"}
          className={"lexy-dp-tab" + (tab === "activity" ? " is-active" : "")}
          onClick={() => setTab("activity")}
        >
          <Activity />
          Actividad
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "events"}
          className={"lexy-dp-tab" + (tab === "events" ? " is-active" : "")}
          onClick={() => setTab("events")}
        >
          <Zap />
          Eventos y Datos
        </button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="lexy-dp-muted" style={{ fontSize: "12px" }}>
            Burbuja de Asistencia:
          </span>
          <button
            type="button"
            className="lexy-dp-btn lexy-dp-btn--outline lexy-dp-btn--sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            onClick={() => {
              const nextState = !launcherVisible;
              setLauncherVisible(nextState);
              // El navegador emite "storage" en las OTRAS pestañas; esta ya se
              // actualizó con setLauncherVisible.
              localStorage.setItem("lexy-dp-launcher-visible", String(nextState));
            }}
          >
            {launcherVisible ? (
              <EyeOff style={{ width: "12px", height: "12px" }} />
            ) : (
              <Eye style={{ width: "12px", height: "12px" }} />
            )}
            {launcherVisible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      <div className="lexy-dp-body">
        {tab === "activity" ? (
          <div className="lexy-dp-panel">
            <ActivityTab />
          </div>
        ) : null}
        {tab === "events" ? (
          <div className="lexy-dp-panel">
            <EventsTab />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PrototypeDesignerPanel() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lexy-dp-launcher-visible") !== "false";
    }
    return true;
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lexy-dp-launcher-visible") {
        setVisible(e.newValue !== "false");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!visible) return null;

  return (
    <div className="lexy-dp">
      <PanelStyles />
      {open ? (
        <div role="dialog" aria-label="Actividad del prototipo" className="lexy-dp-sheet">
          <div className="lexy-dp-sheet__header">
            <p className="lexy-dp-sheet__title">Panel de Actividad</p>
            <div className="lexy-dp-sheet__actions">
              <button
                type="button"
                aria-label="Ocultar burbuja de asistencia"
                title="Ocultar burbuja de asistencia"
                className="lexy-dp-iconbtn"
                onClick={() => {
                  if (
                    confirm(
                      "¿Estás seguro de que quieres ocultar la burbuja de asistencia? Podrás volver a habilitarla desde la página del panel (/designer-panel).",
                    )
                  ) {
                    localStorage.setItem("lexy-dp-launcher-visible", "false");
                    setVisible(false);
                  }
                }}
              >
                <EyeOff />
              </button>
              {/* Enlace real, no window.open: sobrevive al bloqueo de pop-ups y
                  admite ctrl+clic, clic central y "abrir en pestaña nueva". */}
              <a
                href={DESIGNER_PANEL_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir panel completo"
                title="Abrir panel completo"
                className="lexy-dp-iconbtn"
              >
                <Maximize2 />
              </a>
              <button
                type="button"
                aria-label="Cerrar"
                className="lexy-dp-iconbtn"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
          </div>
          <div className="lexy-dp-sheet__body">
            <ActivityLog />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Designer Assist"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={"lexy-dp-launcher" + (open ? " is-open" : "")}
      >
        <Settings className="lexy-dp-launcher__icon" />
        <span className="lexy-dp-launcher__label">Designer Assist</span>
      </button>
    </div>
  );
}
