/* ============================================================
   APP.JS — Core Bootstrap Script
   Initializes all modules in correct dependency order
   ============================================================ */

import StorageController from './storage.js';
import WorkspacesEngine from './workspaces.js';
import BookmarksEngine from './bookmarks.js';
import ClockWidget from './widgets/clock.js';
import TodoWidget from './widgets/todo.js';
import AiSitesWidget from './widgets/ai-sites.js';
import WeatherWidget from './widgets/weather.js';
import LayoutEngine from './layout.js';
import SettingsController from './settings.js';

/**
 * Main application bootstrap
 * Loads state first (blocking) to avoid layout flash, then renders all modules
 */
let liveState = null;

async function bootApp() {
  // Phase 1: Load persisted state
  const appState = await StorageController.loadState();
  liveState = appState;

  // Ensure settings object exists
  if (!appState.settings) appState.settings = {};
  if (!appState.settings.widgets) {
    appState.settings.widgets = {
      'widget-clock': true,
      'widget-todo': true,
      'widget-ai-sites': true,
      'widget-weather': false
    };
  }

  // Phase 2: Initialize workspace tab bar
  WorkspacesEngine.init(appState, onWorkspaceChange);

  // Phase 3: Initialize search bar
  initSearch();

  // Phase 4: Render widgets based on settings
  const w = appState.settings.widgets;
  if (w['widget-clock'] !== false) ClockWidget.init();
  if (w['widget-todo'] !== false) TodoWidget.init(appState);
  if (w['widget-ai-sites'] !== false) AiSitesWidget.init();
  if (w['widget-weather'] === true) WeatherWidget.init();

  // Phase 5: Render bookmark collections for active workspace
  BookmarksEngine.init(appState, () => {
    LayoutEngine.applyLayout();
  });

  // Phase 6: Initialize layout & drag-and-drop
  LayoutEngine.init(appState);

  // Phase 7: Initialize settings (background, gear icon handler)
  SettingsController.init(appState, onWidgetToggle);
}

/**
 * Callback when workspace changes — re-render bookmarks and layout
 */
function onWorkspaceChange(appState) {
  liveState = appState;
  LayoutEngine.setState(appState);
  BookmarksEngine.init(appState, () => {
    LayoutEngine.applyLayout();
  });
}

/**
 * Callback when a widget is toggled on/off in settings
 */
function onWidgetToggle(widgetId, enabled) {
  if (enabled) {
    switch (widgetId) {
      case 'widget-clock':
        if (!document.getElementById('widget-clock')) ClockWidget.init();
        break;
      case 'widget-todo':
        if (!document.getElementById('widget-todo')) TodoWidget.init(liveState);
        break;
      case 'widget-ai-sites':
        if (!document.getElementById('widget-ai-sites')) AiSitesWidget.init();
        break;
      case 'widget-weather':
        if (!document.getElementById('widget-weather')) WeatherWidget.init();
        break;
    }
  } else {
    const el = document.getElementById(widgetId);
    if (el) el.remove();
  }

  // Re-apply layout after widget change
  requestAnimationFrame(() => {
    LayoutEngine.applyLayout();
  });
}

/**
 * Initialize the search bar — Enter routes to Google
 */
function initSearch() {
  const searchBar = document.getElementById('search-bar');
  if (!searchBar) return;

  searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchBar.value.trim();
      if (query) {
        // Check if it's a URL
        if (query.match(/^(https?:\/\/|www\.)/i) || query.match(/^\S+\.\S+$/)) {
          const url = query.startsWith('http') ? query : `https://${query}`;
          window.location.href = url;
        } else {
          // Route to Google search
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
      }
    }
  });

  // Focus search bar with keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      )) {
        return;
      }
      if (activeEl !== searchBar) {
        e.preventDefault();
        searchBar.focus();
      }
    }
  });
}

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', bootApp);
