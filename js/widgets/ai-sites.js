/* ============================================================
   AI-SITES.JS — AI Website Directory Widget
   Curated grid of popular AI tools & platforms
   ============================================================ */

const AiSitesWidget = (() => {
  // Curated AI website directory
  const AI_DIRECTORY = [
    {
      category: '🤖 AI Chat',
      sites: [
        { name: 'ChatGPT', url: 'https://chat.openai.com' },
        { name: 'Claude', url: 'https://claude.ai' },
        { name: 'Gemini', url: 'https://gemini.google.com' },
        { name: 'Copilot', url: 'https://copilot.microsoft.com' },
        { name: 'DeepSeek', url: 'https://chat.deepseek.com' },
        { name: 'Poe', url: 'https://poe.com' },
      ]
    },
    {
      category: '🔍 AI Search',
      sites: [
        { name: 'Perplexity', url: 'https://perplexity.ai' },
        { name: 'You.com', url: 'https://you.com' },
        { name: 'Phind', url: 'https://phind.com' },
        { name: 'Kagi', url: 'https://kagi.com' },
      ]
    },
    {
      category: '🎨 AI Image',
      sites: [
        { name: 'Midjourney', url: 'https://midjourney.com' },
        { name: 'DALL·E', url: 'https://openai.com/dall-e-3' },
        { name: 'Stable Diffusion', url: 'https://stability.ai' },
        { name: 'Leonardo AI', url: 'https://leonardo.ai' },
        { name: 'Ideogram', url: 'https://ideogram.ai' },
        { name: 'Adobe Firefly', url: 'https://firefly.adobe.com' },
      ]
    },
    {
      category: '💻 AI Code',
      sites: [
        { name: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
        { name: 'Cursor', url: 'https://cursor.com' },
        { name: 'Replit AI', url: 'https://replit.com' },
        { name: 'v0 by Vercel', url: 'https://v0.dev' },
        { name: 'Bolt.new', url: 'https://bolt.new' },
        { name: 'Windsurf', url: 'https://codeium.com/windsurf' },
      ]
    },
    {
      category: '🎵 AI Media',
      sites: [
        { name: 'Suno', url: 'https://suno.com' },
        { name: 'Runway', url: 'https://runwayml.com' },
        { name: 'ElevenLabs', url: 'https://elevenlabs.io' },
        { name: 'Kling AI', url: 'https://klingai.com' },
      ]
    }
  ];

  /**
   * Get the favicon URL for a given page URL
   */
  function getFaviconUrl(pageUrl) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
    }
    try {
      const domain = new URL(pageUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  }

  /**
   * Initialize the AI sites widget
   */
  function init() {
    render();
  }

  /**
   * Render the AI sites widget into the grid
   */
  function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    // Don't duplicate
    if (document.getElementById('widget-ai-sites')) return;

    const widget = document.createElement('div');
    widget.className = 'widget-ai-sites';
    widget.id = 'widget-ai-sites';
    widget.setAttribute('data-id', 'widget-ai-sites');

    // Header
    widget.innerHTML = `
      <div class="card-header">
        <span class="card-title">
          <span class="card-title-icon">🧠</span>
          AI DIRECTORY
        </span>
      </div>
      <div class="ai-sites-grid" id="ai-sites-grid"></div>
    `;

    grid.appendChild(widget);

    // Populate the grid
    const sitesGrid = widget.querySelector('#ai-sites-grid');

    AI_DIRECTORY.forEach((group) => {
      // Category header
      const catLabel = document.createElement('div');
      catLabel.className = 'ai-sites-category';
      catLabel.textContent = group.category;
      sitesGrid.appendChild(catLabel);

      // Site items
      group.sites.forEach((site) => {
        const link = document.createElement('a');
        link.className = 'ai-site-item';
        link.href = site.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const favicon = document.createElement('img');
        favicon.className = 'ai-favicon';
        favicon.src = getFaviconUrl(site.url);
        favicon.alt = '';
        favicon.width = 20;
        favicon.height = 20;
        favicon.onerror = () => { favicon.style.display = 'none'; };

        const nameSpan = document.createElement('span');
        nameSpan.className = 'ai-site-name';
        nameSpan.textContent = site.name;

        link.appendChild(favicon);
        link.appendChild(nameSpan);
        sitesGrid.appendChild(link);
      });
    });
  }

  return { init, render };
})();

export default AiSitesWidget;
