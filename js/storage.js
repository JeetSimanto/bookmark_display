/* ============================================================
   STORAGE.JS — State Wrapper for chrome.storage.local
   Manages all persistence for Booktab
   ============================================================ */

const StorageController = (() => {
  // Default initial state
  const DEFAULT_STATE = {
    activeWorkspace: 'home',
    workspaces: {
      home: {
        name: 'HOME',
        collections: [
          {
            name: 'Work',
            icon: '💼',
            color: 1,
            links: [
              { name: 'Google Drive', url: 'https://drive.google.com' },
              { name: 'Notion', url: 'https://notion.so' },
              { name: 'GitHub', url: 'https://github.com' },
              { name: 'Figma', url: 'https://figma.com' }
            ]
          },
          {
            name: 'Reading',
            icon: '📖',
            color: 3,
            links: [
              { name: 'Hacker News', url: 'https://news.ycombinator.com' },
              { name: 'Medium', url: 'https://medium.com' },
              { name: 'Dev.to', url: 'https://dev.to' }
            ]
          }
        ]
      },
      work: {
        name: 'WORK',
        collections: [
          {
            name: 'Projects',
            icon: '🚀',
            color: 5,
            links: [
              { name: 'Jira', url: 'https://www.atlassian.com/software/jira' },
              { name: 'Linear', url: 'https://linear.app' },
              { name: 'Slack', url: 'https://slack.com' }
            ]
          }
        ]
      }
    },
    todos: [
      { id: 1, text: 'Review pull requests', completed: false },
      { id: 2, text: 'Update documentation', completed: false },
      { id: 3, text: 'Ship v1.0 🚀', completed: false }
    ],
    settings: {}
  };

  /**
   * Check if running inside a Chrome extension environment
   */
  function isChromeExtension() {
    return typeof chrome !== 'undefined' &&
           typeof chrome.storage !== 'undefined' &&
           typeof chrome.storage.local !== 'undefined';
  }

  function normalizeState(state) {
    if (!state || !state.workspaces) return state;
    Object.keys(state.workspaces).forEach(wsKey => {
      const ws = state.workspaces[wsKey];
      if (!ws.collections) ws.collections = [];
      
      // Ensure all collections have stable IDs
      ws.collections.forEach((col, idx) => {
        if (!col.id) {
          col.id = `col_${wsKey}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
        }
      });

      // Migrate old array layout to object format
      if (Array.isArray(ws.layout)) {
        ws.layout = {};
      }

      if (!ws.layout || typeof ws.layout !== 'object') {
        ws.layout = {};
      }

      // Clean up stale entries (deleted collections)
      const validIds = new Set([
        ...ws.collections.map(c => `collection-${c.id}`),
        "widget-clock",
        "widget-todo",
        "widget-ai-sites",
        "add-collection-btn"
      ]);

      Object.keys(ws.layout).forEach(id => {
        if (!validIds.has(id)) {
          delete ws.layout[id];
        }
      });
    });
    return state;
  }

  /**
   * Load the full app state from storage
   * @returns {Promise<Object>} The app state
   */
  async function loadState() {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['booktabState'], async (result) => {
          if (result.booktabState) {
            const originalStr = JSON.stringify(result.booktabState);
            const normalized = normalizeState(result.booktabState);
            if (JSON.stringify(normalized) !== originalStr) {
              await saveState(normalized);
            }
            resolve(normalized);
          } else {
            const defaultState = normalizeState(structuredClone(DEFAULT_STATE));
            await saveState(defaultState);
            resolve(defaultState);
          }
        });
      });
    } else {
      // Fallback for local dev / non-extension context
      const raw = localStorage.getItem('booktabState');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const originalStr = JSON.stringify(parsed);
          const normalized = normalizeState(parsed);
          if (JSON.stringify(normalized) !== originalStr) {
            await saveState(normalized);
          }
          return normalized;
        } catch {
          const defaultState = normalizeState(structuredClone(DEFAULT_STATE));
          await saveState(defaultState);
          return defaultState;
        }
      }
      const defaultState = normalizeState(structuredClone(DEFAULT_STATE));
      await saveState(defaultState);
      return defaultState;
    }
  }

  /**
   * Save the full app state to storage
   * @param {Object} state - The state to persist
   * @returns {Promise<void>}
   */
  async function saveState(state) {
    if (isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ booktabState: state }, resolve);
      });
    } else {
      localStorage.setItem('booktabState', JSON.stringify(state));
    }
  }

  /**
   * Get a fresh copy of the default state
   * @returns {Object}
   */
  function getDefault() {
    return structuredClone(DEFAULT_STATE);
  }

  return { loadState, saveState, getDefault };
})();

export default StorageController;
