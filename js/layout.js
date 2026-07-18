/* ============================================================
   LAYOUT.JS — Card Layout & Drag and Drop Engine
   Handles reordering dashboard cards and persisting layout state
   Uses HTML5 Drag and Drop API with draggable attribute
   ============================================================ */

import StorageController from './storage.js';

const LayoutEngine = (() => {
  let appState = null;
  let draggedEl = null;
  let placeholder = null;

  /**
   * Initialize layout sorting and drag & drop listeners
   * @param {Object} state - The loaded app state
   */
  function init(state) {
    appState = state;
    applyLayout();
    setupDragAndDrop();
  }

  /**
   * Update state reference (called on workspace switch)
   */
  function setState(state) {
    appState = state;
  }

  /**
   * Make all grid children draggable
   */
  function makeDraggable() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.collection-card, .widget-clock, .widget-todo, .widget-ai-sites');
    cards.forEach(card => {
      card.setAttribute('draggable', 'true');
    });
  }

  /**
   * Reorder elements in the DOM to match active workspace's layout state
   */
  function applyLayout() {
    const grid = document.getElementById('main-grid');
    if (!grid || !appState) return;

    const workspace = appState.workspaces[appState.activeWorkspace];
    if (!workspace || !workspace.layout) return;

    // Get all cards currently in the DOM
    const cards = Array.from(grid.querySelectorAll('.collection-card, .widget-clock, .widget-todo, .widget-ai-sites'));
    const addBtn = document.getElementById('add-collection-btn');

    // Create a map of data-id to card element
    const cardMap = new Map();
    cards.forEach(card => {
      const dataId = card.getAttribute('data-id');
      if (dataId) {
        cardMap.set(dataId, card);
      }
    });

    // Reappend elements in the layout order
    workspace.layout.forEach(id => {
      const card = cardMap.get(id);
      if (card) {
        grid.appendChild(card);
        cardMap.delete(id);
      }
    });

    // Any remaining cards that weren't in layout (e.g. newly created collections)
    cardMap.forEach(card => {
      grid.appendChild(card);
    });

    // Always make sure the "+ NEW COLLECTION" button is at the end
    if (addBtn) {
      grid.appendChild(addBtn);
    }

    // Ensure all cards have draggable attribute
    makeDraggable();
  }

  /**
   * Create a placeholder element for drop target indication
   */
  function createPlaceholder() {
    const el = document.createElement('div');
    el.className = 'drag-placeholder';
    el.style.cssText = `
      border: 4px dashed var(--color-blue, #003BFF);
      background: rgba(0, 59, 255, 0.08);
      min-height: 80px;
      transition: none;
    `;
    return el;
  }

  /**
   * Set up drag and drop event listeners on the grid (event delegation)
   */
  function setupDragAndDrop() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    let dragAllowed = false;

    // Track where the mouse is pressed to determine if dragging should be allowed
    grid.addEventListener('mousedown', (e) => {
      const isHeader = e.target.closest('.card-header');
      const isClock = e.target.closest('.widget-clock');
      
      // Do not allow dragging from inputs, buttons, links, or labels
      const tag = e.target.tagName;
      const isInput = tag === 'INPUT' || tag === 'BUTTON' || tag === 'A' || tag === 'LABEL';

      if ((isHeader || isClock) && !isInput) {
        dragAllowed = true;
      } else {
        dragAllowed = false;
      }
    });

    // -- DRAG START --
    grid.addEventListener('dragstart', (e) => {
      if (!dragAllowed) {
        e.preventDefault();
        return;
      }

      const card = e.target.closest('.collection-card, .widget-clock, .widget-todo, .widget-ai-sites');
      if (!card) return;

      draggedEl = card;

      // Small delay so the browser captures the drag image before we style it
      requestAnimationFrame(() => {
        card.classList.add('dragging');
      });

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.getAttribute('data-id') || '');
    });

    // -- DRAG OVER (determines drop position) --
    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedEl) return;
      e.dataTransfer.dropEffect = 'move';

      const target = getDragPosition(grid, e.clientX, e.clientY);
      const addBtn = document.getElementById('add-collection-btn');

      // Remove existing placeholder
      if (placeholder && placeholder.parentNode) {
        placeholder.remove();
      }
      placeholder = createPlaceholder();

      if (target) {
        if (target.insertAfter) {
          grid.insertBefore(placeholder, target.element.nextSibling);
        } else {
          grid.insertBefore(placeholder, target.element);
        }
      } else if (addBtn) {
        grid.insertBefore(placeholder, addBtn);
      } else {
        grid.appendChild(placeholder);
      }
    });

    // -- DRAG LEAVE --
    grid.addEventListener('dragleave', (e) => {
      // Only remove placeholder when leaving the grid entirely
      if (e.relatedTarget && !grid.contains(e.relatedTarget)) {
        if (placeholder && placeholder.parentNode) {
          placeholder.remove();
        }
      }
    });

    // -- DROP --
    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedEl) return;

      // Insert the dragged element where the placeholder is
      if (placeholder && placeholder.parentNode) {
        grid.insertBefore(draggedEl, placeholder);
        placeholder.remove();
      }

      placeholder = null;
    });

    // -- DRAG END (always fires, even if drop didn't happen) --
    grid.addEventListener('dragend', (e) => {
      if (draggedEl) {
        draggedEl.classList.remove('dragging');
      }

      // Clean up placeholder
      if (placeholder && placeholder.parentNode) {
        placeholder.remove();
      }

      draggedEl = null;
      placeholder = null;
      saveLayoutOrder();
    });
  }

  /**
   * Determine which card the dragged element is closest to and whether
   * we should drop before or after it, using 2D Euclidean distance.
   */
  function getDragPosition(container, x, y) {
    const draggableElements = [
      ...container.querySelectorAll(
        '.collection-card:not(.dragging), .widget-clock:not(.dragging), .widget-todo:not(.dragging), .widget-ai-sites:not(.dragging)'
      )
    ];

    let closestElement = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    let insertAfter = false;

    draggableElements.forEach(child => {
      const box = child.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = dx * dx + dy * dy;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = child;
        insertAfter = x > centerX;
      }
    });

    return closestElement ? { element: closestElement, insertAfter } : null;
  }

  /**
   * Save the current DOM order of cards to layout state
   */
  function saveLayoutOrder() {
    const grid = document.getElementById('main-grid');
    if (!grid || !appState) return;

    const cards = Array.from(grid.querySelectorAll('.collection-card, .widget-clock, .widget-todo, .widget-ai-sites'));
    const newLayout = cards.map(card => card.getAttribute('data-id')).filter(Boolean);

    const workspace = appState.workspaces[appState.activeWorkspace];
    if (workspace) {
      workspace.layout = newLayout;
      StorageController.saveState(appState);
    }
  }

  return { init, setState, applyLayout, makeDraggable, saveLayoutOrder };
})();

export default LayoutEngine;
