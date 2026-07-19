/* ============================================================
   SETTINGS.JS — Settings Management Module
   Handles background selection, uploads, and widget toggles
   ============================================================ */

import StorageController from './storage.js';

const SettingsController = (() => {
  let appState = null;
  let onWidgetChangeCallback = null;

  const BG_CLASSES = [
    'bg-dot-grid', 'bg-halftone', 'bg-retro-grid', 'bg-checkerboard',
    'bg-solid-yellow', 'bg-solid-green', 'bg-solid-pink',
    'bg-gradient-sunset', 'bg-gradient-cyberpunk', 'bg-custom'
  ];

  /**
   * Initialize settings listeners and apply current background
   */
  function init(state, onWidgetChange) {
    appState = state;
    onWidgetChangeCallback = onWidgetChange;

    // Apply saved background on boot
    applyBackground();

    // Hook up gear icon
    const gearBtn = document.getElementById('settings-btn');
    if (gearBtn) {
      gearBtn.addEventListener('click', openSettingsModal);
    }
  }

  /**
   * Apply the background theme class/style to body
   */
  function applyBackground() {
    if (!appState || !appState.settings) return;

    const bgType = appState.settings.backgroundType || 'dot-grid';
    const customUrl = appState.settings.customBackgroundUrl || '';

    // Remove all theme background classes
    document.body.classList.remove(...BG_CLASSES);
    document.body.style.backgroundImage = '';

    // Add current theme class
    const classToAdd = `bg-${bgType}`;
    document.body.classList.add(classToAdd);

    // Apply custom background image if set
    if (bgType === 'custom' && customUrl) {
      document.body.style.backgroundImage = `url(${customUrl})`;
    }
  }

  /**
   * Open the settings modal
   */
  function openSettingsModal() {
    // Avoid double modals
    if (document.getElementById('settings-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'settings-modal-overlay';

    const currentBg = appState.settings.backgroundType || 'dot-grid';
    const widgets = appState.settings.widgets || {
      'widget-clock': true,
      'widget-todo': true,
      'widget-ai-sites': true,
      'widget-weather': false
    };

    overlay.innerHTML = `
      <div class="modal-box" style="max-width: 500px; width: 100%;">
        <h2>SETTINGS</h2>
        
        <div class="settings-section-title">Background Theme</div>
        <div class="bg-options-grid" id="bg-options-grid">
          <div class="bg-option-card" data-bg="dot-grid">Dot Grid</div>
          <div class="bg-option-card" data-bg="halftone">Halftone</div>
          <div class="bg-option-card" data-bg="retro-grid">Retro Grid</div>
          <div class="bg-option-card" data-bg="checkerboard">Checkerboard</div>
          <div class="bg-option-card" data-bg="solid-yellow">Yellow</div>
          <div class="bg-option-card" data-bg="solid-green">Green</div>
          <div class="bg-option-card" data-bg="solid-pink">Pink</div>
          <div class="bg-option-card" data-bg="gradient-sunset">Sunset</div>
          <div class="bg-option-card" data-bg="gradient-cyberpunk">Cyberpunk</div>
          <div class="bg-option-card" data-bg="custom">Custom Image</div>
        </div>
        
        <div id="custom-bg-section" style="display: none; border: var(--border-thin); padding: var(--space-md); margin-bottom: var(--space-md); background: #fafafa;">
          <div class="upload-area" id="upload-area">
            📁 CLICK OR DRAG IMAGE TO UPLOAD
          </div>
          <input type="file" id="custom-bg-input" accept="image/*" style="display: none;" />
          
          <div id="custom-bg-preview-container" style="display: flex; gap: var(--space-md); align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: var(--space-sm); align-items: center;">
              <div id="custom-bg-preview" style="width: 80px; height: 50px; border: var(--border-thin); background-size: cover; background-position: center; background-color: #ddd;"></div>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: bold;">PREVIEW</span>
            </div>
            <button id="clear-custom-bg" class="btn-cancel" style="padding: var(--space-xs) var(--space-sm); border: var(--border-thin); cursor: pointer; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">Clear</button>
          </div>
        </div>
        
        <div class="settings-section-title">Active Widgets</div>
        <div class="widget-options-list">
          <div class="widget-option-row">
            <label for="widget-opt-clock">🕒 CLOCK WIDGET</label>
            <input type="checkbox" id="widget-opt-clock" data-widget="widget-clock" ${widgets['widget-clock'] ? 'checked' : ''} />
          </div>
          <div class="widget-option-row">
            <label for="widget-opt-todo">🔥 TASKS WIDGET</label>
            <input type="checkbox" id="widget-opt-todo" data-widget="widget-todo" ${widgets['widget-todo'] ? 'checked' : ''} />
          </div>
          <div class="widget-option-row">
            <label for="widget-opt-ai-sites">🧠 AI DIRECTORY WIDGET</label>
            <input type="checkbox" id="widget-opt-ai-sites" data-widget="widget-ai-sites" ${widgets['widget-ai-sites'] ? 'checked' : ''} />
          </div>
          <div class="widget-option-row">
            <label for="widget-opt-weather">⚡ WEATHER WIDGET</label>
            <input type="checkbox" id="widget-opt-weather" data-widget="widget-weather" ${widgets['widget-weather'] ? 'checked' : ''} />
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn-confirm" id="settings-close-btn">DONE</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cards = overlay.querySelectorAll('.bg-option-card');
    const customSection = overlay.querySelector('#custom-bg-section');
    const uploadArea = overlay.querySelector('#upload-area');
    const fileInput = overlay.querySelector('#custom-bg-input');
    const previewEl = overlay.querySelector('#custom-bg-preview');
    const clearBtn = overlay.querySelector('#clear-custom-bg');

    // Mark current background as active
    cards.forEach(card => {
      if (card.getAttribute('data-bg') === currentBg) {
        card.classList.add('active');
      }
    });

    // Toggle custom section visibility
    if (currentBg === 'custom') {
      customSection.style.display = 'block';
      if (appState.settings.customBackgroundUrl) {
        previewEl.style.backgroundImage = `url(${appState.settings.customBackgroundUrl})`;
      }
    }

    // Handle background selection
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const bg = card.getAttribute('data-bg');
        appState.settings.backgroundType = bg;

        if (bg === 'custom') {
          customSection.style.display = 'block';
          if (appState.settings.customBackgroundUrl) {
            previewEl.style.backgroundImage = `url(${appState.settings.customBackgroundUrl})`;
          }
        } else {
          customSection.style.display = 'none';
        }

        applyBackground();
        saveSettings();
      });
    });

    // Handle File Upload
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        appState.settings.customBackgroundUrl = base64;
        previewEl.style.backgroundImage = `url(${base64})`;
        applyBackground();
        saveSettings();
      };
      reader.readAsDataURL(file);
    });

    // Handle drag and drop files
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'var(--color-yellow)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.background = 'var(--color-white)';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'var(--color-white)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          appState.settings.customBackgroundUrl = base64;
          previewEl.style.backgroundImage = `url(${base64})`;
          applyBackground();
          saveSettings();
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear custom bg
    clearBtn.addEventListener('click', () => {
      appState.settings.customBackgroundUrl = '';
      previewEl.style.backgroundImage = '';
      applyBackground();
      saveSettings();
    });

    // Widget checkboxes
    const checkboxes = overlay.querySelectorAll('.widget-options-list input[type="checkbox"]');
    checkboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const widgetId = chk.getAttribute('data-widget');
        const enabled = chk.checked;

        if (!appState.settings.widgets) appState.settings.widgets = {};
        appState.settings.widgets[widgetId] = enabled;

        saveSettings();

        if (onWidgetChangeCallback) {
          onWidgetChangeCallback(widgetId, enabled);
        }
      });
    });

    // Close button
    const closeBtn = overlay.querySelector('#settings-close-btn');
    closeBtn.addEventListener('click', () => {
      overlay.remove();
    });
  }

  function saveSettings() {
    StorageController.saveState(appState);
  }

  return { init, applyBackground };
})();

export default SettingsController;
