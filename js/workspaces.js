/* ============================================================
   WORKSPACES.JS — Tab Management & Workspace Switching
   ============================================================ */

import StorageController from './storage.js';

const WorkspacesEngine = (() => {
  let appState = null;
  let onWorkspaceChange = null;

  /**
   * Initialize the workspace engine
   * @param {Object} state - The loaded app state
   * @param {Function} changeCallback - Called when workspace switches
   */
  function init(state, changeCallback) {
    appState = state;
    onWorkspaceChange = changeCallback;
    render();
  }

  /**
   * Render the workspace tab bar
   */
  function render() {
    const container = document.getElementById('workspace-tabs');
    if (!container) return;

    container.innerHTML = '';

    const workspaceKeys = Object.keys(appState.workspaces);

    workspaceKeys.forEach((key) => {
      const ws = appState.workspaces[key];
      const tab = document.createElement('button');
      tab.className = `workspace-tab${key === appState.activeWorkspace ? ' active' : ''}`;
      tab.id = `workspace-tab-${key}`;
      tab.textContent = ws.name;

      // Delete badge (don't allow deleting if only 1 workspace)
      if (workspaceKeys.length > 1) {
        const del = document.createElement('span');
        del.className = 'tab-delete';
        del.textContent = '✕';
        del.title = `Delete ${ws.name}`;
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteWorkspace(key);
        });
        tab.appendChild(del);
      }

      tab.addEventListener('click', () => switchWorkspace(key));
      container.appendChild(tab);
    });

    // ADD + button
    const addBtn = document.createElement('button');
    addBtn.className = 'workspace-add';
    addBtn.id = 'workspace-add-btn';
    addBtn.textContent = '+ ADD';
    addBtn.addEventListener('click', () => showAddModal());
    container.appendChild(addBtn);
  }

  /**
   * Switch to a different workspace
   */
  function switchWorkspace(key) {
    if (key === appState.activeWorkspace) return;
    appState.activeWorkspace = key;
    StorageController.saveState(appState);
    render();
    if (onWorkspaceChange) onWorkspaceChange(appState);
  }

  /**
   * Show add workspace modal
   */
  function showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-add-workspace';

    overlay.innerHTML = `
      <div class="modal-box">
        <h2>New Workspace</h2>
        <input type="text" id="new-workspace-input" placeholder="WORKSPACE NAME..." maxlength="20" autofocus />
        <div class="modal-actions">
          <button class="btn-cancel" id="modal-cancel">CANCEL</button>
          <button class="btn-confirm" id="modal-confirm">CREATE</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById('new-workspace-input');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    input.focus();

    const doCreate = () => {
      const name = input.value.trim();
      if (name) {
        addWorkspace(name);
      }
      overlay.remove();
    };

    confirmBtn.addEventListener('click', doCreate);
    cancelBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doCreate();
      if (e.key === 'Escape') overlay.remove();
    });
  }

  /**
   * Add a new workspace
   */
  function addWorkspace(name) {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    appState.workspaces[key] = {
      name: name.toUpperCase(),
      collections: [],
      layout: [
        "widget-clock",
        "widget-todo",
        "widget-ai-sites"
      ]
    };
    appState.activeWorkspace = key;
    StorageController.saveState(appState);
    render();
    if (onWorkspaceChange) onWorkspaceChange(appState);
  }

  /**
   * Delete a workspace
   */
  function deleteWorkspace(key) {
    if (Object.keys(appState.workspaces).length <= 1) return;

    const ws = appState.workspaces[key];
    if (!confirm(`Delete workspace "${ws.name}"? This cannot be undone.`)) return;

    delete appState.workspaces[key];

    // Switch to first remaining workspace if active was deleted
    if (appState.activeWorkspace === key) {
      appState.activeWorkspace = Object.keys(appState.workspaces)[0];
    }

    StorageController.saveState(appState);
    render();
    if (onWorkspaceChange) onWorkspaceChange(appState);
  }

  /**
   * Get current state reference
   */
  function getState() {
    return appState;
  }

  return { init, render, getState };
})();

export default WorkspacesEngine;
