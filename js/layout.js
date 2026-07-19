/* ============================================================
   LAYOUT.JS — Free-Form Drag Engine
   Desktop-style free positioning — drag any card anywhere
   Uses mouse events for pixel-perfect placement
   ============================================================ */

import StorageController from './storage.js';

const LayoutEngine = (() => {
  let appState = null;
  let zCounter = 100;

  const CARD_SEL = '.collection-card, .widget-clock, .widget-todo, .widget-ai-sites, .widget-weather, .add-collection-btn';
  const DRAG_THRESHOLD = 5;
  const CARD_W = 340;
  const GAP = 24;
  const ROW_H = 300;

  function init(state) {
    appState = state;
    applyLayout();
    setupDrag();
  }

  function setState(state) {
    appState = state;
  }

  /**
   * Position all cards from saved state (or calculate defaults)
   */
  function applyLayout() {
    const grid = document.getElementById('main-grid');
    if (!grid || !appState) return;

    const ws = appState.workspaces[appState.activeWorkspace];
    if (!ws) return;

    // Migrate old array layout to empty object
    if (Array.isArray(ws.layout)) ws.layout = {};
    if (!ws.layout || typeof ws.layout !== 'object') ws.layout = {};
    const pos = ws.layout;

    const cards = Array.from(grid.querySelectorAll(CARD_SEL));
    // Use window width minus padding for reliable column count
    const containerW = window.innerWidth - 80;
    const cols = Math.max(1, Math.floor(containerW / (CARD_W + GAP)));

    // Track actual row bottoms for staggered placement (cards have variable height)
    const colBottoms = new Array(cols).fill(0);

    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      if (!id) return;
      card.setAttribute('draggable', 'false');

      const saved = pos[id];
      if (saved && (saved.x > 0 || saved.y > 0)) {
        // Use saved position (skip items stuck at 0,0 — those are stale)
        card.style.left = saved.x + 'px';
        card.style.top = saved.y + 'px';
      } else {
        // Find the shortest column
        let shortestCol = 0;
        for (let i = 1; i < cols; i++) {
          if (colBottoms[i] < colBottoms[shortestCol]) shortestCol = i;
        }
        const x = shortestCol * (CARD_W + GAP);
        const y = colBottoms[shortestCol];
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        // Estimate card height (will be refined after paint)
        colBottoms[shortestCol] = y + ROW_H + GAP;
      }
    });

    // After paint, refine positions for cards that used estimates and save
    requestAnimationFrame(() => {
      savePositions();
      updateHeight(grid);
    });
  }

  function updateHeight(grid) {
    if (!grid) grid = document.getElementById('main-grid');
    if (!grid) return;
    let max = 0;
    grid.querySelectorAll(CARD_SEL).forEach(c => {
      const b = c.offsetTop + c.offsetHeight;
      if (b > max) max = b;
    });
    grid.style.minHeight = Math.max(max + 80, window.innerHeight - 100) + 'px';
  }

  /**
   * Mouse-based free-form drag system
   */
  function setupDrag() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    grid.addEventListener('mousedown', (e) => {
      const card = e.target.closest(CARD_SEL);
      if (!card) return;

      // Allow add-collection-btn drag despite being a <button>
      const isAddBtn = e.target.closest('.add-collection-btn');
      const tag = e.target.tagName;
      const isInteractive = !isAddBtn && (
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' ||
        tag === 'A' || tag === 'LABEL' ||
        e.target.closest('button') || e.target.closest('a') ||
        e.target.closest('input') || e.target.closest('.link-item')
      );
      if (isInteractive) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const cardRect = card.getBoundingClientRect();
      const offX = e.clientX - cardRect.left;
      const offY = e.clientY - cardRect.top;
      let dragging = false;

      const onMove = (mv) => {
        const dx = mv.clientX - startX;
        const dy = mv.clientY - startY;

        if (!dragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
          dragging = true;
          card.style.zIndex = ++zCounter;
          card.classList.add('dragging');
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';
        }

        if (dragging) {
          mv.preventDefault();
          const gr = grid.getBoundingClientRect();
          let nx = mv.clientX - gr.left - offX + grid.scrollLeft;
          let ny = mv.clientY - gr.top - offY + grid.scrollTop;
          nx = Math.max(0, nx);
          ny = Math.max(0, ny);
          card.style.left = nx + 'px';
          card.style.top = ny + 'px';
        }
      };

      const onUp = () => {
        if (dragging) {
          card.classList.remove('dragging');
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
          savePositions();
          updateHeight(grid);
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  function savePositions() {
    const grid = document.getElementById('main-grid');
    if (!grid || !appState) return;

    const positions = {};
    grid.querySelectorAll(CARD_SEL).forEach(card => {
      const id = card.getAttribute('data-id');
      if (id) {
        positions[id] = {
          x: parseInt(card.style.left) || 0,
          y: parseInt(card.style.top) || 0
        };
      }
    });

    const ws = appState.workspaces[appState.activeWorkspace];
    if (ws) {
      ws.layout = positions;
      StorageController.saveState(appState);
    }
  }

  // API compatibility
  function makeDraggable() {}
  function saveLayoutOrder() { savePositions(); }

  return { init, setState, applyLayout, makeDraggable, saveLayoutOrder };
})();

export default LayoutEngine;
