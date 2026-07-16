/* ============================================================
   BOOKMARKS.JS — Bookmark Collection & Link Engine
   Renders dense bookmark grid with favicon resolution
   ============================================================ */

import StorageController from './storage.js';

const BookmarksEngine = (() => {
  let appState = null;
  let onRenderCallback = null;

  // Accent color cycle order
  const ACCENT_COLORS = [1, 2, 3, 4, 5];
  const COLLECTION_ICONS = ['📁', '🔖', '⭐', '🔥', '💎', '🎯', '📌', '🗂️', '💡', '🛠️'];

  /**
   * Initialize the bookmarks engine
   * @param {Object} state - The loaded app state
   */
  function init(state, onRender) {
    appState = state;
    if (onRender) onRenderCallback = onRender;
    render();
  }

  /**
   * Get the favicon URL for a given page URL
   */
  function getFaviconUrl(pageUrl) {
    // Chrome extension favicon API
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
    }
    // Fallback: Google's public favicon service
    try {
      const domain = new URL(pageUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  }

  /**
   * Render all bookmark collections for the active workspace
   */
  function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    // Clear only bookmark cards (preserve widgets)
    grid.querySelectorAll('.collection-card, .add-collection-btn').forEach(el => el.remove());

    const workspace = appState.workspaces[appState.activeWorkspace];
    if (!workspace) return;

    const collections = workspace.collections || [];

    // Insert collection cards before the first widget
    const firstWidget = grid.querySelector('[class*="widget-"]');

    collections.forEach((collection, idx) => {
      const card = createCollectionCard(collection, idx);
      if (firstWidget) {
        grid.insertBefore(card, firstWidget);
      } else {
        grid.appendChild(card);
      }
    });

    // Add "new collection" button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-collection-btn';
    addBtn.id = 'add-collection-btn';
    addBtn.innerHTML = '<span style="font-size:1.6rem">+</span> NEW COLLECTION';
    addBtn.addEventListener('click', () => showAddCollectionModal());

    if (firstWidget) {
      grid.insertBefore(addBtn, firstWidget);
    } else {
      grid.appendChild(addBtn);
    }

    // Notify parent to apply layout ordering
    if (onRenderCallback) onRenderCallback();
  }

  /**
   * Create a single collection card element
   */
  function createCollectionCard(collection, index) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.id = `collection-${index}`;
    card.setAttribute('data-id', `collection-${collection.id}`);

    const accentIdx = collection.color || ACCENT_COLORS[index % ACCENT_COLORS.length];
    const icon = collection.icon || COLLECTION_ICONS[index % COLLECTION_ICONS.length];

    card.innerHTML = `
      <div class="card-header" data-accent="${accentIdx}">
        <span class="card-title">
          <span class="card-title-icon">${icon}</span>
          ${escapeHtml(collection.name)}
        </span>
        <div class="card-actions">
          <button class="card-btn delete-btn" title="Delete collection">✕</button>
        </div>
      </div>
      <div class="card-body">
        <ul class="link-list"></ul>
        <div class="add-link-form">
          <input type="text" placeholder="Name" class="link-name-input" />
          <input type="text" placeholder="https://..." class="link-url-input" />
          <button class="link-add-btn">+</button>
        </div>
      </div>
    `;

    // Render links
    const linkList = card.querySelector('.link-list');
    (collection.links || []).forEach((link, linkIdx) => {
      linkList.appendChild(createLinkItem(link, index, linkIdx));
    });

    // Delete collection handler
    card.querySelector('.delete-btn').addEventListener('click', () => {
      deleteCollection(index);
    });

    // Add link handler
    const nameInput = card.querySelector('.link-name-input');
    const urlInput = card.querySelector('.link-url-input');
    const addLinkBtn = card.querySelector('.link-add-btn');

    const doAddLink = () => {
      const name = nameInput.value.trim();
      let url = urlInput.value.trim();
      if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        addLink(index, name, url);
      }
    };

    addLinkBtn.addEventListener('click', doAddLink);
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAddLink();
    });
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') urlInput.focus();
    });

    return card;
  }

  /**
   * Create a single link item element
   */
  function createLinkItem(link, collectionIdx, linkIdx) {
    const li = document.createElement('li');
    li.className = 'link-item';

    const favicon = document.createElement('img');
    favicon.className = 'favicon';
    favicon.src = getFaviconUrl(link.url);
    favicon.alt = '';
    favicon.width = 20;
    favicon.height = 20;
    favicon.onerror = () => { favicon.style.display = 'none'; };

    const nameSpan = document.createElement('a');
    nameSpan.className = 'link-name';
    nameSpan.textContent = link.name;
    nameSpan.href = link.url;
    nameSpan.target = '_blank';
    nameSpan.rel = 'noopener noreferrer';

    const delBtn = document.createElement('button');
    delBtn.className = 'link-delete';
    delBtn.textContent = '✕';
    delBtn.title = 'Remove link';
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(collectionIdx, linkIdx);
    });

    li.appendChild(favicon);
    li.appendChild(nameSpan);
    li.appendChild(delBtn);

    // Clicking the item (not the delete button) opens the link
    li.addEventListener('click', (e) => {
      if (e.target !== delBtn) {
        window.open(link.url, '_blank');
      }
    });

    return li;
  }

  /**
   * Show add collection modal
   */
  function showAddCollectionModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-add-collection';

    overlay.innerHTML = `
      <div class="modal-box">
        <h2>New Collection</h2>
        <input type="text" id="new-collection-input" placeholder="COLLECTION NAME..." maxlength="30" autofocus />
        <div class="modal-actions">
          <button class="btn-cancel" id="modal-cancel-col">CANCEL</button>
          <button class="btn-confirm" id="modal-confirm-col">CREATE</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById('new-collection-input');
    const confirmBtn = document.getElementById('modal-confirm-col');
    const cancelBtn = document.getElementById('modal-cancel-col');

    input.focus();

    const doCreate = () => {
      const name = input.value.trim();
      if (name) {
        addCollection(name);
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
   * Add a new collection to the active workspace
   */
  function addCollection(name) {
    const workspace = appState.workspaces[appState.activeWorkspace];
    const colorIdx = ACCENT_COLORS[(workspace.collections.length) % ACCENT_COLORS.length];
    const iconIdx = workspace.collections.length % COLLECTION_ICONS.length;

    workspace.collections.push({
      id: `col_${appState.activeWorkspace}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.toUpperCase(),
      icon: COLLECTION_ICONS[iconIdx],
      color: colorIdx,
      links: []
    });

    StorageController.saveState(appState);
    render();
  }

  /**
   * Delete a collection
   */
  function deleteCollection(index) {
    const workspace = appState.workspaces[appState.activeWorkspace];
    const col = workspace.collections[index];
    if (!confirm(`Delete collection "${col.name}"?`)) return;

    workspace.collections.splice(index, 1);
    StorageController.saveState(appState);
    render();
  }

  /**
   * Add a link to a collection
   */
  function addLink(collectionIdx, name, url) {
    const workspace = appState.workspaces[appState.activeWorkspace];
    workspace.collections[collectionIdx].links.push({ name, url });
    StorageController.saveState(appState);
    render();
  }

  /**
   * Delete a link from a collection
   */
  function deleteLink(collectionIdx, linkIdx) {
    const workspace = appState.workspaces[appState.activeWorkspace];
    workspace.collections[collectionIdx].links.splice(linkIdx, 1);
    StorageController.saveState(appState);
    render();
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return { init, render };
})();

export default BookmarksEngine;
