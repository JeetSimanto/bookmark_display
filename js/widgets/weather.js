/* ============================================================
   WEATHER.JS — Retro Weather API Widget
   Fetches real-time weather using Open-Meteo free API
   ============================================================ */

const WeatherWidget = (() => {
  let locationData = { lat: 40.7128, lon: -74.0060, city: 'New York' }; // Default fallback

  function init() {
    render();
    fetchWeather();
  }

  function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    if (document.getElementById('widget-weather')) return;

    const widget = document.createElement('div');
    widget.className = 'widget-weather';
    widget.id = 'widget-weather';
    widget.setAttribute('data-id', 'widget-weather');

    widget.innerHTML = `
      <div class="card-header" style="background: var(--accent-3); color: var(--color-white);">
        <span class="card-title">
          <span class="card-title-icon">⚡</span>
          WEATHER
        </span>
        <div class="card-actions">
          <button class="card-btn refresh-weather-btn" title="Refresh Weather">🔄</button>
        </div>
      </div>
      <div class="weather-body" style="padding: var(--space-md); text-align: center;">
        <div class="weather-city" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--color-yellow);">DETECTING LOCATION...</div>
        <div class="weather-info">
          <div class="weather-temp">--°C</div>
          <div class="weather-emoji" style="font-size: 3rem;">🌍</div>
        </div>
        <div class="weather-desc">LOADING WEATHER DATA...</div>
        <div class="weather-details">
          <span>WIND: -- km/h</span>
          <span>HUMIDITY: --%</span>
        </div>
      </div>
    `;

    grid.appendChild(widget);

    // Refresh handler
    const refreshBtn = widget.querySelector('.refresh-weather-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fetchWeather();
      });
    }
  }

  function fetchWeather() {
    const cityEl = document.querySelector('#widget-weather .weather-city');
    if (cityEl) cityEl.textContent = 'DETECTING LOCATION...';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationData.lat = position.coords.latitude;
          locationData.lon = position.coords.longitude;
          locationData.city = 'LOCAL WEATHER';
          getWeatherApiData();
        },
        () => {
          // Fallback to default
          locationData.city = 'NEW YORK (DEFAULT)';
          getWeatherApiData();
        },
        { timeout: 5000 }
      );
    } else {
      locationData.city = 'NEW YORK (DEFAULT)';
      getWeatherApiData();
    }
  }

  async function getWeatherApiData() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${locationData.lat}&longitude=${locationData.lon}&current_weather=true&windspeed_unit=kmh`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      updateWidget(data.current_weather);
    } catch {
      showError();
    }
  }

  function updateWidget(weather) {
    const widget = document.getElementById('widget-weather');
    if (!widget) return;

    const tempEl = widget.querySelector('.weather-temp');
    const emojiEl = widget.querySelector('.weather-emoji');
    const descEl = widget.querySelector('.weather-desc');
    const cityEl = widget.querySelector('.weather-city');
    const detailsEl = widget.querySelector('.weather-details');

    if (tempEl) tempEl.textContent = `${Math.round(weather.temperature)}°C`;
    if (cityEl) cityEl.textContent = locationData.city;

    const weatherInfo = mapWeatherCode(weather.weathercode);
    if (emojiEl) emojiEl.textContent = weatherInfo.emoji;
    if (descEl) descEl.textContent = weatherInfo.desc;

    if (detailsEl) {
      detailsEl.innerHTML = `
        <span>WIND: ${Math.round(weather.windspeed)} km/h</span>
        <span>ANGLE: ${weather.winddirection}°</span>
      `;
    }
  }

  function showError() {
    const widget = document.getElementById('widget-weather');
    if (!widget) return;
    const descEl = widget.querySelector('.weather-desc');
    if (descEl) descEl.textContent = 'FAILED TO FETCH WEATHER';
  }

  function mapWeatherCode(code) {
    // WMO Weather interpretation codes
    if (code === 0) return { emoji: '☀️', desc: 'CLEAR SKY' };
    if ([1, 2, 3].includes(code)) return { emoji: '⛅', desc: 'PARTLY CLOUDY' };
    if ([45, 48].includes(code)) return { emoji: '🌫️', desc: 'FOGGY' };
    if ([51, 53, 55].includes(code)) return { emoji: '🌧️', desc: 'LIGHT DRIZZLE' };
    if ([61, 63, 65].includes(code)) return { emoji: '🌧️', desc: 'RAINY' };
    if ([71, 73, 75, 77].includes(code)) return { emoji: '❄️', desc: 'SNOWY' };
    if ([80, 81, 82].includes(code)) return { emoji: '🌦️', desc: 'SHOWERS' };
    if ([85, 86].includes(code)) return { emoji: '❄️', desc: 'SNOW SHOWERS' };
    if ([95, 96, 99].includes(code)) return { emoji: '⚡', desc: 'THUNDERSTORM' };
    return { emoji: '🌍', desc: 'WEATHER' };
  }

  function destroy() {
    const el = document.getElementById('widget-weather');
    if (el) el.remove();
  }

  return { init, destroy };
})();

export default WeatherWidget;
