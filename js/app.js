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
import LayoutEngine from './layout.js';

/**
 * Main application bootstrap
 * Loads state first (blocking) to avoid layout flash, then renders all modules
 */
async function bootApp() {
  // Phase 1: Load persisted state before any rendering
  const appState = await StorageController.loadState();

  // Phase 2: Initialize workspace tab bar
  WorkspacesEngine.init(appState, onWorkspaceChange);

  // Phase 3: Initialize search bar
  initSearch();

  // Phase 4: Render widgets (they go into the grid first as anchors)
  ClockWidget.init();
  TodoWidget.init(appState);
  AiSitesWidget.init();

  // Phase 5: Render bookmark collections for active workspace
  // Pass layout callback so bookmarks triggers layout reorder after render
  BookmarksEngine.init(appState, () => {
    LayoutEngine.applyLayout();
  });

  // Phase 6: Initialize layout & drag-and-drop
  LayoutEngine.init(appState);
}

/**
 * Callback when workspace changes — re-render bookmarks and layout
 */
function onWorkspaceChange(appState) {
  LayoutEngine.setState(appState);
  BookmarksEngine.init(appState);
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
    if (e.key === '/' && document.activeElement !== searchBar) {
      e.preventDefault();
      searchBar.focus();
    }
  });
}

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', bootApp);
