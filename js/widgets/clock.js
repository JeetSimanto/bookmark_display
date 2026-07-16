/* ============================================================
   CLOCK.JS — Giant Chronograph Widget
   Oversized time display updating every second
   ============================================================ */

const ClockWidget = (() => {
  let intervalId = null;

  /**
   * Initialize the clock widget
   */
  function init() {
    render();
    update();
    // Start 1000ms update loop
    intervalId = setInterval(update, 1000);
  }

  /**
   * Render the clock widget container into the grid
   */
  function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    // Don't duplicate
    if (document.getElementById('widget-clock')) return;

    const widget = document.createElement('div');
    widget.className = 'widget-clock';
    widget.id = 'widget-clock';
    widget.setAttribute('data-id', 'widget-clock');

    widget.innerHTML = `
      <div class="clock-time" id="clock-time">--:--:--</div>
      <div class="clock-date" id="clock-date">--- --- --, ----</div>
    `;

    grid.appendChild(widget);
  }

  /**
   * Update the clock display
   */
  function update() {
    const now = new Date();

    // Time: HH:MM:SS AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');

    const timeEl = document.getElementById('clock-time');
    if (timeEl) {
      timeEl.textContent = `${hours}:${mins}:${secs} ${ampm}`;
    }

    // Date: DAY MON DD, YYYY
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const dateEl = document.getElementById('clock-date');
    if (dateEl) {
      dateEl.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
  }

  /**
   * Clean up the interval
   */
  function destroy() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { init, destroy };
})();

export default ClockWidget;
