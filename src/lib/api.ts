const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

class AlignAPI {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}, timeoutMs = 30000) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        const detail = err?.detail;
        const body = typeof detail === 'string' ? detail
          : Array.isArray(detail) ? detail.map((d: any) => d.msg || d.message || '').join('; ')
          : detail?.message || 'Unknown error';
        throw new Error(`${res.status}: ${body}`);
      }
      return res.json();
    } catch (err: any) {
      clearTimeout(timer);
      if (err?.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
      }
      throw err;
    }
  }

  // Charts
  async getNatalChart(birthData: any) {
    return this.request('/charts/natal', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getProgressedChart(data: any) {
    return this.request('/charts/progressed', { method: 'POST', body: JSON.stringify(data) });
  }

  // Transits
  async getCurrentTransits(birthData: any) {
    return this.request('/transits/current', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getTransitEvents(data: any) {
    return this.request('/transits/events', { method: 'POST', body: JSON.stringify(data) });
  }

  async getUpcomingMoonPhases(count = 4) {
    return this.request(`/transits/upcoming-moon-phases?count=${count}`);
  }

  // Synastry
  async getSynastry(data: any) {
    return this.request('/synastry/aspects', { method: 'POST', body: JSON.stringify(data) });
  }

  async getComposite(data: any) {
    return this.request('/synastry/composite', { method: 'POST', body: JSON.stringify(data) }, 45000);
  }

  // Returns
  async getSolarReturn(data: any) {
    return this.request('/returns/solar', { method: 'POST', body: JSON.stringify(data) });
  }

  async getLunarReturn(data: any) {
    return this.request('/returns/lunar', { method: 'POST', body: JSON.stringify(data) });
  }

  // Readings
  async getStarseedAnalysis(birthData: any) {
    return this.request('/starseed/reading', { method: 'POST', body: JSON.stringify(birthData) });
  }

  // Deterministic soul-origin (stable across reloads; persisted server-side).
  async getStarseedOrigin(birthData: any, recalculate = false) {
    const qs = recalculate ? '?recalculate=true' : '';
    return this.request(`/starseed/origin${qs}`, { method: 'POST', body: JSON.stringify(birthData) });
  }

  // Current Star Activation — transient daily sky layer; never overwrites origin.
  async getStarseedActivation() {
    return this.request('/starseed/activation', { method: 'GET' });
  }

  async getNumerology(data: any) {
    return this.request('/numerology/reading', { method: 'POST', body: JSON.stringify(data) });
  }

  async getHumanDesign(birthData: any) {
    return this.request('/human-design/reading', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async drawTarot(data: any) {
    return this.request('/tarot/draw', { method: 'POST', body: JSON.stringify(data) });
  }

  async getACGLines(birthData: any) {
    return this.request('/acg/map', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getFinancialReport(birthData: any) {
    return this.request('/financial/analysis', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getFirdaria(birthData: any) {
    return this.request('/timelords/firdaria', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getZodiacalReleasing(birthData: any) {
    return this.request('/timelords/zodiacal-releasing', { method: 'POST', body: JSON.stringify(birthData) });
  }

  async getPlanetaryHours(data: any) {
    return this.request('/planetary-hours/calculate', { method: 'POST', body: JSON.stringify(data) });
  }

  async getNameAnalysis(data: any) {
    return this.request('/name-analysis/reading', { method: 'POST', body: JSON.stringify(data) });
  }

  // Courses
  async getCourses() {
    return this.request('/courses/');
  }

  async getCourse(courseId: string) {
    return this.request(`/courses/${courseId}`);
  }

  async getLesson(courseId: string, lessonId: string) {
    return this.request(`/courses/${courseId}/lessons/${lessonId}`);
  }

  async completeLesson(courseId: string, lessonId: string, userId: string) {
    return this.request(`/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getCourseProgress(userId: string) {
    return this.request(`/courses/progress?user_id=${encodeURIComponent(userId)}`);
  }

  async getCoursesMeta() {
    return this.request('/courses/meta');
  }

  // Subscription
  async getSubscriptionStatus() {
    return this.request('/subscription/status');
  }

  // AI Streaming
  async streamAIInterpretation(
    data: any,
    onChunk: (text: string) => void,
    onDone: () => void
  ) {
    const url = '/api/ai/interpret';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`AI stream error: ${res.status} ${errorText.substring(0, 200)}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.replace(/\r$/, '');
        if (trimmed.startsWith('data: ')) {
          const raw = trimmed.slice(6);
          if (raw === '[DONE]') {
            onDone();
            return;
          }
          // Backend sends JSON-encoded text tokens to preserve newlines
          try {
            const decoded = JSON.parse(raw);
            onChunk(decoded);
          } catch {
            // Fallback: treat as plain text (backward compat or error messages)
            onChunk(raw);
          }
        }
      }
    }
    onDone();
  }

  // Divine Timing (horary)
  async detectDivineHouse(question: string) {
    return this.request('/divine-timing/detect-house', { method: 'POST', body: JSON.stringify({ question }) });
  }

  async askDivineTiming(data: any) {
    return this.request('/divine-timing/ask', { method: 'POST', body: JSON.stringify(data) }, 45000);
  }

  async markDivineOutcome(questionId: string, outcome: string) {
    return this.request('/divine-timing/outcome', { method: 'POST', body: JSON.stringify({ question_id: questionId, outcome }) });
  }

  async streamDivineNarration(
    data: any,
    onChunk: (text: string) => void,
    onDone: () => void,
  ) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}/divine-timing/narrate`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${res.status} ${t.slice(0, 200)}`);
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.replace(/\r$/, '');
        if (trimmed.startsWith('data: ')) {
          const raw = trimmed.slice(6);
          if (raw === '[DONE]') { onDone(); return; }
          try { onChunk(JSON.parse(raw)); } catch { onChunk(raw); }
        }
      }
    }
    onDone();
  }

  // Pathway
  async getPathway(data: any) {
    return this.request('/pathway/reading', { method: 'POST', body: JSON.stringify(data) });
  }

  // Fixed Stars
  async getFixedStars(birthData: any) {
    return this.request('/fixed-stars/reading', { method: 'POST', body: JSON.stringify(birthData) });
  }

  // Rectification
  async getRectification(data: any) {
    return this.request('/rectification/analyze-direct', { method: 'POST', body: JSON.stringify(data) }, 60000);
  }

  async analyzeRectification(data: any) {
    return this.request('/rectification/analyze-direct', { method: 'POST', body: JSON.stringify(data) }, 60000);
  }

  async adaptiveFilter(data: any) {
    return this.request('/rectification/adaptive-filter', { method: 'POST', body: JSON.stringify(data) });
  }

  async generateSoulAvatar(appearance: string, archetype: string, sign: string, userId: string = ''): Promise<string> {
    const result = await this.request('/ai/generate-avatar', {
      method: 'POST',
      body: JSON.stringify({ appearance, archetype, sign, user_id: userId }),
    }, 60000);
    return result.image_url;
  }

  // Year Ahead / Galactic Forecast
  async getYearAhead(data: any) {
    return this.request('/transits/forecasts/events', { method: 'POST', body: JSON.stringify(data) }, 45000);
  }

  async getGalacticForecast(data: any) {
    return this.request('/transits/forecasts/events', { method: 'POST', body: JSON.stringify(data) }, 45000);
  }

  // Forecast events (used by moon phase forecast service)
  async getForecastEvents(windowDays = 30, startDate?: string) {
    return this.request('/transits/forecasts/events', {
      method: 'POST',
      body: JSON.stringify({ window_days: windowDays, start_date: startDate ?? null }),
    });
  }

  // Midpoints
  async getMidpoints(data: any) {
    return this.request('/synastry/midpoints', { method: 'POST', body: JSON.stringify(data) });
  }

  // Moon Phases
  async getMoonPhaseReading(data: any) {
    return this.request('/transits/moon-phase-reading', { method: 'POST', body: JSON.stringify(data) });
  }

  // Monthly Calendar
  async getMonthlyCalendar(data: any) {
    return this.request('/transits/calendars/month', { method: 'POST', body: JSON.stringify(data) });
  }

  // Upcoming eclipses
  async getUpcomingEclipses() {
    return this.request('/transits/eclipses/upcoming');
  }

  // World Echo
  async getWorldEchoToday() {
    return this.request('/world-echo/today');
  }

  async computeWorldEchoScan(date: string, scanType = 'global', scanLocation?: string) {
    return this.request('/world-echo/scan/compute', {
      method: 'POST',
      body: JSON.stringify({ date, scan_type: scanType, scan_location: scanLocation ?? null }),
    }, 60000);
  }

  async getWorldEchoEvent(eventId: string) {
    return this.request(`/world-echo/event/${eventId}`);
  }

  async getWorldEchoWhyMatched(eventId: string, scanDate?: string) {
    const qs = scanDate ? `?scan_date=${encodeURIComponent(scanDate)}` : '';
    return this.request(`/world-echo/event/${encodeURIComponent(eventId)}/why-matched${qs}`);
  }

  async getWorldEchoDate(date: string, scanType = 'global') {
    return this.request(`/world-echo/date/${encodeURIComponent(date)}?scan_type=${scanType}`);
  }

  async getWorldEchoPatterns(scanId: string, patternName: string) {
    return this.request(`/world-echo/pattern/${encodeURIComponent(scanId)}/${encodeURIComponent(patternName)}`);
  }

  // Cosmic Videos
  async renderCosmicVideo(data: any) {
    return this.request('/videos/render', { method: 'POST', body: JSON.stringify(data) });
  }

  async getVideoRenderStatus(videoId: string) {
    return this.request(`/videos/status/${videoId}`);
  }

  async getMyCosmicVideos(limit = 20, offset = 0) {
    return this.request(`/videos/my-videos?limit=${limit}&offset=${offset}`);
  }

  async generateVideoScript(templateId: string, astroData: any) {
    return this.request('/videos/generate-script', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, astro_data: astroData }),
    }, 60000);
  }

  // Profiles
  async getProfile(userId: string) {
    return this.request(`/profiles/${userId}`);
  }

  async updateProfile(userId: string, data: any) {
    return this.request(`/profiles/${userId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }
}

export const api = new AlignAPI();

/**
 * Build the standard birth-data payload from a user profile.
 * Every backend endpoint that accepts birth data requires at minimum:
 *   name, date, time, latitude, longitude, timezone
 * Reads house_system from the astrology settings store so all chart
 * calculations respect the user's chosen house system.
 */
export function buildBirthData(profile: any, overrides?: { house_system?: string }) {
  // Read house system from store (works because zustand getState is sync)
  let houseSystem = overrides?.house_system || 'Whole Sign';
  try {
    const { useAstrologySettings } = require('@/stores/astrologySettingsStore');
    const stored = useAstrologySettings.getState().houseSystem;
    if (stored && !overrides?.house_system) {
      const map: Record<string, string> = {
        'placidus': 'Placidus',
        'whole_sign': 'Whole Sign',
        'koch': 'Koch',
        'campanus': 'Campanus',
        'regiomontanus': 'Regiomontanus',
        'equal': 'Equal',
        'porphyry': 'Porphyry',
        'alcabitius': 'Alcabitius',
      };
      houseSystem = map[stored] || 'Whole Sign';
    }
  } catch {}

  const { resolveTimezoneOffset } = require('@/lib/timezoneOffset');
  const { offset, label } = resolveTimezoneOffset(
    profile.timezone,
    profile.longitude,
    profile.birth_date,
    profile.birth_time,
    profile.latitude,
  );

  return {
    name: profile.display_name || '',
    date: profile.birth_date,
    time: profile.birth_time || '12:00',
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: label,
    tz_offset: offset,
    location: profile.birth_location || '',
    house_system: houseSystem,
  };
}
