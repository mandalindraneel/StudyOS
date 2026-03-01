'use strict';
const LS = {
  NAME: 'studyos_name', STREAK_DATE: 'studyos_streak_date',
  STREAK_COUNT: 'studyos_streak_count', EXAM: 'studyos_exam',
  GOALS: 'studyos_goals', NOTES: 'studyos_notes',
  JOURNAL: 'studyos_journal', PAPERS: 'studyos_papers',
};
let timerInterval = null, timerRunning = false, timerTotal = 0, timerRemaining = 0;
let countdownInterval = null;
let noteFilter = 'All', paperFilter = 'All';

const lsGet = (k, fb = null) => { try { const r = localStorage.getItem(k); return r !== null ? JSON.parse(r) : fb } catch { return fb } };
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const todayStr = () => new Date().toISOString().slice(0, 10);
const pad2 = n => String(n).padStart(2, '0');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const flash = el => { el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2500) };
const toGCalDT = d => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
const fmtDate = s => { const d = new Date(`${s}T00:00:00`); return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) };
function initBeam() {
  const canvas = document.getElementById('beamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight };
  resize(); window.addEventListener('resize', resize);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const b = Math.sin(t * .011) * .055;
    const sx = W * (0.86 + Math.sin(t * .006) * .03);
    const sy = H * (0.03 + Math.cos(t * .008) * .014);
    [[W * 1.12, .2, .08], [W * .64, .36, .1], [W * .3, .62, .18]].forEach(([r, a0, a1]) => {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * (1 + b));
      g.addColorStop(0, `rgba(190,230,255,${a0 + b * .04})`);
      g.addColorStop(.35, `rgba(50,15,255,${a1})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * .062);
    core.addColorStop(0, `rgba(255,255,255,${.88 + b * .5})`);
    core.addColorStop(.18, 'rgba(220,240,255,.55)');
    core.addColorStop(.55, 'rgba(110,185,255,.1)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    [[.2, .016, .17], [.37, .027, .1], [.53, .047, .07], [.69, .021, .09]].forEach(([d, r, a]) => {
      const fx = sx + (W / 2 - sx) * d + Math.sin(t * .012 + d * 6) * 7;
      const fy = sy + (H / 2 - sy) * d + Math.cos(t * .01 + d * 5) * 5;
      const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * r);
      rg.addColorStop(0, `rgba(210,235,255,${a + b * .04})`);
      rg.addColorStop(.5, `rgba(155,210,255,${a * .32})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(fx, fy, W * r, 0, Math.PI * 2); ctx.fill();
    });
    t++; requestAnimationFrame(draw);
  }
  draw();
}
function initCalmParticles() {
  const canvas = document.getElementById('calmCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, tick = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight };
  resize(); window.addEventListener('resize', resize);
  const mkOrb = () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    r: 1.4 + Math.random() * 2.6, vx: (Math.random() - .5) * .09, vy: -0.04 - Math.random() * .085,
    alpha: .022 + Math.random() * .12, phase: Math.random() * Math.PI * 2,
    hue: Math.random() > .08 ? 210 + Math.floor(Math.random() * 18) : 0,
    sat: Math.random() > .08 ? 60 : 0,
  });
  const orbs = Array.from({ length: 38 }, mkOrb);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(o => {
      const breathe = Math.sin(tick * .007 + o.phase) * .5 + .5;
      const a = o.alpha * (.48 + breathe * .52);
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 2.8);
      g.addColorStop(0, `hsla(${o.hue},${o.sat}%,74%,${a})`);
      g.addColorStop(1, `hsla(${o.hue},${o.sat}%,74%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 2.8, 0, Math.PI * 2); ctx.fill();
      o.x += o.vx; o.y += o.vy;
      if (o.y < -12) { o.y = H + 12; o.x = Math.random() * W }
      if (o.x < -12) o.x = W + 12; if (o.x > W + 12) o.x = -12;
    });
    tick++; requestAnimationFrame(draw);
  }
  draw();
}
function initFlame(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const particles = [];

  function mkParticle() {
    return {
      x: W / 2 + (Math.random() - 0.5) * 16,
      y: H - 8,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(2.2 + Math.random() * 2.8),
      life: 0,
      maxLife: 28 + Math.random() * 22,
      r: 6 + Math.random() * 10,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Add new particles each frame
    for (let i = 0; i < 3; i++) particles.push(mkParticle());

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      if (p.life >= p.maxLife) { particles.splice(i, 1); continue }
      const prog = p.life / p.maxLife;
      p.x += p.vx + (Math.random() - 0.5) * 0.6;
      p.y += p.vy;
      p.vy *= 0.97;
      p.r *= 0.985;
      let r = 255, g, b = 0;
      if (prog < 0.25) { g = Math.floor(255 * (prog / 0.25)); } // white-yellow
      else if (prog < 0.55) { g = Math.floor(255 * (1 - (prog - 0.25) / 0.3)); } // yellow → orange
      else { g = 0; r = Math.floor(255 * (1 - (prog - 0.55) / 0.45)); } // orange → red → fade

      const alpha = (1 - prog) * (prog < 0.1 ? prog * 10 : 1) * 0.85;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(${r},${Math.max(0, g)},${b},${alpha})`);
      grad.addColorStop(0.45, `rgba(${r},${Math.max(0, Math.floor(g * 0.5))},0,${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(${Math.floor(r * 0.4)},0,0,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}
const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm+hail', 99: 'Thunderstorm+heavy hail',
};
const WMO_EMOJI = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧', 66: '🌨', 67: '🌨',
  71: '🌨', 73: '❄️', 75: '❄️', 77: '🌨', 80: '🌦', 81: '🌦', 82: '⛈', 85: '🌨', 86: '🌨',
  95: '⛈', 96: '⛈', 99: '⛈',
};
function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
async function loadWeather() {
  const card = document.getElementById('weatherCard');
  if (!card) return;

  if (!('geolocation' in navigator)) {
    renderWeatherError(card, 'Location not available in your browser.'); return;
  }
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    try {
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&wind_speed_unit=kmh&timezone=auto`);
      const wData = await wRes.json();
      const cw = wData.current_weather;
      const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { 'Accept-Language': 'en' } });
      const locData = await locRes.json();
      const city = locData.address.city || locData.address.town || locData.address.village || locData.address.county || 'Your location';
      const country = locData.address.country_code?.toUpperCase() || '';
      let humidity = '--';
      if (wData.hourly?.time && wData.hourly?.relativehumidity_2m) {
        const nowH = new Date().toISOString().slice(0, 13);
        const idx = wData.hourly.time.findIndex(t => t.startsWith(nowH));
        if (idx > -1) humidity = wData.hourly.relativehumidity_2m[idx] + '%';
      }
      const code = cw.weathercode;
      const emoji = WMO_EMOJI[code] || '🌡';
      const desc = WMO_CODES[code] || 'Weather';
      const temp = Math.round(cw.temperature) + '°C';
      const wind = Math.round(cw.windspeed) + ' km/h';
      const windD = windDir(cw.winddirection);
      card.innerHTML = `
        <div class="w-top">
          <div class="w-emoji">${emoji}</div>
          <div class="w-main-info">
            <div class="w-temp">${temp}</div>
            <div class="w-desc">${desc}</div>
            <div class="w-loc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              ${esc(city)}${country ? ', ' + esc(country) : ''}
            </div>
          </div>
        </div>
        <div class="w-divider"></div>
        <div class="w-stats">
          <div class="w-stat">
            <div class="w-stat-val">${humidity}</div>
            <div class="w-stat-lbl">Humidity</div>
          </div>
          <div class="w-stat">
            <div class="w-stat-val">${esc(wind)}</div>
            <div class="w-stat-lbl">Wind</div>
          </div>
          <div class="w-stat">
            <div class="w-stat-val">${esc(windD)}</div>
            <div class="w-stat-lbl">Direction</div>
          </div>
        </div>`;
    } catch (e) {
      renderWeatherError(card, 'Could not load weather data.');
    }
  }, () => {
    renderWeatherError(card, 'Location permission denied. Enable location to see weather.');
  }, { timeout: 8000 });
}

function renderWeatherError(card, msg) {
  card.innerHTML = `<div class="weather-err"><p>${msg}</p><button class="btn btn-ghost" style="font-size:.78rem;padding:7px 14px;margin-top:8px" onclick="loadWeather()">Try again</button></div>`;
}
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Learning is not attained by chance — it must be sought with ardor.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];
function loadQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const el = document.getElementById('quoteText');
  const au = document.getElementById('quoteAuthor');
  if (el) el.textContent = q.text;
  if (au) au.textContent = '— ' + q.author;
}
document.addEventListener('DOMContentLoaded', () => {
  initInfoModal();
  initMobileMenu();
  const existingName = lsGet(LS.NAME);
  if (!existingName) { showWelcomeScreen(); }
  else { computeStreak(); showReturnAnimation(existingName); }
});
function showWelcomeScreen() {
  const ws = document.getElementById('welcomeScreen');
  const inp = document.getElementById('nameInput');
  const btn = document.getElementById('nameSubmitBtn');
  ws.classList.remove('hidden');
  initBeam();
  function submit() {
    const name = inp.value.trim();
    if (!name) { inp.style.borderColor = '#FF453A'; inp.focus(); setTimeout(() => inp.style.borderColor = '', 1200); return }
    lsSet(LS.NAME, name);
    ws.style.transition = 'opacity .3s ease'; ws.style.opacity = '0';
    setTimeout(() => { ws.classList.add('hidden'); showFirstAnimation(name) }, 300);
  }
  btn.addEventListener('click', submit);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit() });
  inp.focus();
}
function showFirstAnimation(name) {
  const ts = document.getElementById('transitionScreen');
  const w = document.getElementById('transFirst_wrap');
  document.getElementById('transFirstName').textContent = name;
  ts.classList.remove('hidden'); w.style.display = 'block';
  setTimeout(() => {
    ts.style.transition = 'opacity .35s ease'; ts.style.opacity = '0';
    setTimeout(() => { ts.classList.add('hidden'); computeStreak(); launchDashboard(name) }, 350);
  }, 2000);
}
function showReturnAnimation(name) {
  const ts = document.getElementById('transitionScreen');
  const w = document.getElementById('transReturn_wrap');
  document.getElementById('transReturnName').textContent = name;
  document.getElementById('transStreakNum').textContent = lsGet(LS.STREAK_COUNT, 0);
  ts.classList.remove('hidden'); w.style.display = 'block';
  requestAnimationFrame(() => {
    const fc = document.getElementById('flameCanvas');
    if (fc) initFlame(fc);
  });
  setTimeout(() => {
    ts.style.transition = 'opacity .35s ease'; ts.style.opacity = '0';
    setTimeout(() => { ts.classList.add('hidden'); launchDashboard(name) }, 350);
  }, 2600);
}
function computeStreak() {
  const today = todayStr();
  const saved = lsGet(LS.STREAK_DATE, null);
  let cnt = lsGet(LS.STREAK_COUNT, 0);
  if (!saved) { cnt = 1 }
  else {
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yStr = yest.toISOString().slice(0, 10);
    if (saved === today) { }
    else if (saved === yStr) { cnt++ }
    else { cnt = 1 }
  }
  lsSet(LS.STREAK_DATE, today); lsSet(LS.STREAK_COUNT, cnt);
  return cnt;
}
function launchDashboard(name) {
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  dash.style.animation = 'fadeIn .38s ease both';
  initCalmParticles();
  initGreeting(name);
  initClock();
  initNavigation();
  initPlanner();
  initTimer();
  initGoals();
  initNotes();
  initJournal();
  initPapers();
  initAnalyzer();
  updateOverview();
  loadQuote();
  loadWeather();
  document.getElementById('sbName').textContent = name;
  document.getElementById('sbAvatar').textContent = name.charAt(0).toUpperCase();
  const cnt = lsGet(LS.STREAK_COUNT, 0);
  document.getElementById('streakCount').textContent = cnt;
  document.getElementById('overviewStreak').textContent = cnt;
}
function initGreeting(name) {
  const h = new Date().getHours();
  const p = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  document.getElementById('greetingText').textContent = `${p}, ${name}`;
}
function initClock() {
  const el = document.getElementById('liveClock');
  const D = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const tick = () => { const n = new Date(); el.textContent = `${D[n.getDay()]} ${n.getDate()} ${M[n.getMonth()]} · ${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}` };
  tick(); setInterval(tick, 1000);
}
function initInfoModal() {
  const modal = document.getElementById('infoModal');
  [document.getElementById('openInfoWelcome'), document.getElementById('openInfoDash')].forEach(b => {
    if (b) b.addEventListener('click', () => modal.classList.remove('hidden'));
  });
  document.getElementById('closeInfo').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden') });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.add('hidden') });
}
function initMobileMenu() {
  const btn = document.getElementById('mobMenuBtn');
  const sb = document.getElementById('sidebar');
  if (!btn || !sb) return;
  btn.addEventListener('click', () => sb.classList.toggle('mob-open'));
  document.addEventListener('click', e => {
    if (sb.classList.contains('mob-open') && !sb.contains(e.target) && !btn.contains(e.target))
      sb.classList.remove('mob-open');
  });
}
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const t = link.getAttribute('data-section');
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.section').forEach(s => {
        s.id === `section-${t}`
          ? (s.classList.remove('hidden'), s.classList.add('active'))
          : (s.classList.add('hidden'), s.classList.remove('active'));
      });
      document.getElementById('sidebar')?.classList.remove('mob-open');
    });
  });
}
function initPlanner() {
  document.getElementById('addCalBtn').addEventListener('click', () => {
    const title = document.getElementById('calTitle').value.trim();
    const date = document.getElementById('calDate').value;
    const time = document.getElementById('calTime').value;
    const dur = parseInt(document.getElementById('calDuration').value) || 60;
    if (!title || !date || !time) { alert('Please fill in Event Title, Date, and Time.'); return }
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + dur * 60000);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${toGCalDT(start)}/${toGCalDT(end)}`, '_blank');
  });
  const saved = lsGet(LS.EXAM, null);
  if (saved) { document.getElementById('examName').value = saved.name || ''; document.getElementById('examDateTime').value = saved.datetime || ''; startCountdown(saved.datetime, saved.name) }
  document.getElementById('setExamBtn').addEventListener('click', () => {
    const name = document.getElementById('examName').value.trim();
    const dt = document.getElementById('examDateTime').value;
    if (!name || !dt) { alert('Please enter exam name and date/time.'); return }
    lsSet(LS.EXAM, { name, datetime: dt });
    flash(document.getElementById('examSaved'));
    startCountdown(dt, name); updateOverview();
  });
}
function startCountdown(dtStr, label) {
  if (countdownInterval) clearInterval(countdownInterval);
  document.getElementById('countdownLabel').textContent = label || 'Exam';
  const tick = () => {
    let diff = new Date(dtStr).getTime() - Date.now();
    if (diff <= 0) { clearInterval(countdownInterval);['cdDays', 'cdHours', 'cdMinutes', 'cdSeconds'].forEach(id => document.getElementById(id).textContent = '00'); document.getElementById('countdownLabel').textContent = 'Exam time!'; return }
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    document.getElementById('cdDays').textContent = pad2(d);
    document.getElementById('cdHours').textContent = pad2(h);
    document.getElementById('cdMinutes').textContent = pad2(m);
    document.getElementById('cdSeconds').textContent = pad2(s);
  };
  tick(); countdownInterval = setInterval(tick, 1000);
}
function initTimer() {
  const startBtn = document.getElementById('timerStartBtn');
  const pauseBtn = document.getElementById('timerPauseBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  const display = document.getElementById('timerDisplay');
  const statusEl = document.getElementById('timerStatus');
  const ring = document.getElementById('timerRing');
  const minInput = document.getElementById('timerMinutes');
  const CIRC = 603;
  const setRing = f => ring.style.strokeDashoffset = CIRC * (1 - f);
  const updDisp = () => { display.textContent = `${pad2(Math.floor(timerRemaining / 60))}:${pad2(timerRemaining % 60)}`; setRing(timerTotal > 0 ? timerRemaining / timerTotal : 1) };
  startBtn.addEventListener('click', () => {
    if (!timerRunning) {
      if (timerRemaining === 0) { timerTotal = (parseInt(minInput.value) || 25) * 60; timerRemaining = timerTotal }
      timerRunning = true; statusEl.textContent = 'Focusing…'; startBtn.disabled = true; pauseBtn.disabled = false;
      timerInterval = setInterval(() => { if (timerRemaining <= 0) { clearInterval(timerInterval); timerRunning = false; statusEl.textContent = 'Session Complete!'; startBtn.disabled = false; pauseBtn.disabled = true; timerRemaining = 0; updDisp(); playBeep(); return } timerRemaining--; updDisp() }, 1000);
    }
    updDisp();
  });
  pauseBtn.addEventListener('click', () => { if (timerRunning) { clearInterval(timerInterval); timerRunning = false; statusEl.textContent = 'Paused'; startBtn.disabled = false; pauseBtn.disabled = true } });
  resetBtn.addEventListener('click', () => { clearInterval(timerInterval); timerRunning = false; timerRemaining = timerTotal = 0; statusEl.textContent = 'Ready'; display.textContent = `${pad2(parseInt(minInput.value) || 25)}:00`; setRing(1); startBtn.disabled = false; pauseBtn.disabled = true });
  minInput.addEventListener('change', () => { if (!timerRunning && timerRemaining === 0) display.textContent = `${pad2(parseInt(minInput.value) || 25)}:00` });
}
function playBeep() {
  try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.setValueAtTime(660, c.currentTime); o.frequency.setValueAtTime(440, c.currentTime + .3); g.gain.setValueAtTime(.4, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .9); o.start(c.currentTime); o.stop(c.currentTime + .9) } catch { }
}
function initGoals() {
  renderGoals();
  document.getElementById('addGoalBtn').addEventListener('click', () => {
    const subject = document.getElementById('goalSubject').value.trim();
    const current = parseFloat(document.getElementById('goalCurrent').value);
    const target = parseFloat(document.getElementById('goalTarget').value);
    if (!subject || isNaN(current) || isNaN(target)) { alert('Please fill in all fields.'); return }
    if ([current, target].some(v => v < 0 || v > 100)) { alert('Scores must be 0–100.'); return }
    const goals = lsGet(LS.GOALS, []); goals.push({ id: uid(), subject, current, target }); lsSet(LS.GOALS, goals);
    ['goalSubject', 'goalCurrent', 'goalTarget'].forEach(id => document.getElementById(id).value = '');
    renderGoals(); updateOverview();
    if (current >= target) triggerCelebration(subject, current, target);
  });
  document.getElementById('closeCelebration').addEventListener('click', () => document.getElementById('celebrationOverlay').classList.add('hidden'));
}
function renderGoals() {
  const c = document.getElementById('goalsList');
  const goals = lsGet(LS.GOALS, []);
  if (!goals.length) { c.innerHTML = '<p class="empty">No goals added yet.</p>'; return }
  c.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
    const done = g.current >= g.target;
    return `<div class="goal-item">
      <div class="g-head"><span class="g-subj">${esc(g.subject)}</span><span class="g-nums">${g.current}% / ${g.target}%</span></div>
      <div class="g-track"><div class="g-fill${done ? ' done' : ''}" style="width:0%" data-w="${pct}%"></div></div>
      <div class="g-foot"><span class="g-pct">${done ? '✓ Achieved' : pct + '% towards goal'}</span><button class="btn-sm-danger" onclick="deleteGoal('${g.id}')">Remove</button></div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => c.querySelectorAll('.g-fill').forEach(b => b.style.width = b.getAttribute('data-w')));
}
function deleteGoal(id) { lsSet(LS.GOALS, lsGet(LS.GOALS, []).filter(g => g.id !== id)); renderGoals(); updateOverview() }
function triggerCelebration(subject, current, target) {
  document.getElementById('celebrationMsg').textContent = `You scored ${current}% in ${subject}, hitting your ${target}% target!`;
  document.getElementById('celebrationOverlay').classList.remove('hidden');
  const w = document.getElementById('confettiWrap'); w.innerHTML = '';
  const cols = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#5E5CE6', '#32ADE6'];
  for (let i = 0; i < 65; i++) { const p = document.createElement('div'); p.className = 'confetti-piece'; p.style.left = Math.random() * 100 + '%'; p.style.background = cols[Math.floor(Math.random() * cols.length)]; p.style.animationDuration = (1.8 + Math.random() * 1.7).toFixed(2) + 's'; p.style.animationDelay = (Math.random() * .95).toFixed(2) + 's'; w.appendChild(p) }
}
function updateOverview() {
  const cnt = lsGet(LS.STREAK_COUNT, 0);
  document.getElementById('overviewStreak').textContent = cnt;
  const goals = lsGet(LS.GOALS, []);
  let pct = 0;
  if (goals.length) pct = Math.round(goals.reduce((s, g) => s + (g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0), 0) / goals.length);
  const C = 226;
  document.getElementById('overviewGoalRing').style.strokeDashoffset = C - C * pct / 100;
  document.getElementById('overviewGoalPct').textContent = `${pct}%`;
}
function initNotes() {
  renderNotes();
  document.getElementById('saveNoteBtn').addEventListener('click', () => {
    const subject = document.getElementById('noteSubject').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    if (!subject || !content) { alert('Please add a subject and content.'); return }
    const notes = lsGet(LS.NOTES, []); notes.unshift({ id: uid(), subject, content, date: todayStr() }); lsSet(LS.NOTES, notes);
    document.getElementById('noteSubject').value = ''; document.getElementById('noteContent').value = '';
    noteFilter = 'All'; renderNotes();
  });
}
function renderNotes() {
  const notes = lsGet(LS.NOTES, []);
  const c = document.getElementById('notesList');
  const f = document.getElementById('notesFilter');
  const subs = ['All', ...new Set(notes.map(n => n.subject))];
  f.innerHTML = subs.map(s => `<button class="chip${s === noteFilter ? ' on' : ''}" onclick="setNoteFilter('${esc(s)}')">${esc(s)}</button>`).join('');
  const filtered = noteFilter === 'All' ? notes : notes.filter(n => n.subject === noteFilter);
  if (!filtered.length) { c.innerHTML = '<p class="empty">No notes match this filter.</p>'; return }
  c.innerHTML = filtered.map(n => `
    <div class="note-item">
      <div class="n-head"><span class="n-tag">${esc(n.subject)}</span><small>${n.date}</small></div>
      <div class="n-body" id="nb-${n.id}">${esc(n.content)}</div>
      <textarea class="n-edit" id="ne-${n.id}" rows="3">${esc(n.content)}</textarea>
      <div class="n-actions">
        <button class="btn-sm-blue" onclick="editNote('${n.id}')">Edit</button>
        <button class="btn-sm-blue" id="nSave-${n.id}" onclick="saveNoteEdit('${n.id}')" style="display:none">Save</button>
        <button class="btn-sm-danger" onclick="deleteNote('${n.id}')">Delete</button>
      </div>
    </div>`).join('');
}
function setNoteFilter(s) { noteFilter = s; renderNotes() }
function editNote(id) { document.getElementById(`nb-${id}`).classList.add('editing'); document.getElementById(`ne-${id}`).classList.add('show'); document.getElementById(`nSave-${id}`).style.display = 'inline-block' }
function saveNoteEdit(id) { const c = document.getElementById(`ne-${id}`).value.trim(); if (!c) return; const notes = lsGet(LS.NOTES, []); const n = notes.find(x => x.id === id); if (n) { n.content = c; lsSet(LS.NOTES, notes) } renderNotes() }
function deleteNote(id) { lsSet(LS.NOTES, lsGet(LS.NOTES, []).filter(n => n.id !== id)); renderNotes() }
function initJournal() {
  const today = todayStr();
  document.getElementById('journalTodayDate').textContent = fmtDate(today);
  const j = lsGet(LS.JOURNAL, {});
  if (j[today]) document.getElementById('journalEntry').value = j[today];
  renderJournal();
  document.getElementById('saveJournalBtn').addEventListener('click', () => {
    const text = document.getElementById('journalEntry').value.trim();
    if (!text) { alert('Write something before saving.'); return }
    const j = lsGet(LS.JOURNAL, {}); j[today] = text; lsSet(LS.JOURNAL, j);
    flash(document.getElementById('journalSaved')); renderJournal();
  });
}
function renderJournal() {
  const j = lsGet(LS.JOURNAL, {}); const today = todayStr();
  const entries = Object.entries(j).filter(([d]) => d !== today).sort(([a], [b]) => b.localeCompare(a));
  const c = document.getElementById('journalHistory');
  if (!entries.length) { c.innerHTML = '<p class="empty">No previous entries yet.</p>'; return }
  c.innerHTML = entries.map(([date, text]) => `
    <div class="j-item">
      <div class="j-date">${fmtDate(date)}</div>
      <div class="j-text">${esc(text)}</div>
    </div>`).join('');
}

function initPapers() {
  renderPapers();
  document.getElementById('addPaperBtn').addEventListener('click', () => {
    const subject = document.getElementById('paperSubject').value;
    const name = document.getElementById('paperName').value.trim();
    const link = document.getElementById('paperLink').value.trim();
    if (!subject || !name || !link) { alert('Please fill in all fields.'); return }
    const papers = lsGet(LS.PAPERS, []); papers.unshift({ id: uid(), subject, name, link }); lsSet(LS.PAPERS, papers);
    document.getElementById('paperSubject').value = ''; document.getElementById('paperName').value = ''; document.getElementById('paperLink').value = '';
    paperFilter = 'All'; renderPapers();
  });
}
function renderPapers() {
  const papers = lsGet(LS.PAPERS, []);
  const c = document.getElementById('papersList');
  const f = document.getElementById('papersFilter');
  const subs = ['All', ...new Set(papers.map(p => p.subject))];
  f.innerHTML = subs.map(s => `<button class="chip${s === paperFilter ? ' on' : ''}" onclick="setPaperFilter('${esc(s)}')">${esc(s)}</button>`).join('');
  const filtered = paperFilter === 'All' ? papers : papers.filter(p => p.subject === paperFilter);
  if (!filtered.length) { c.innerHTML = '<p class="empty">No papers match this filter.</p>'; return }
  c.innerHTML = filtered.map(p => `
    <div class="paper-item">
      <div class="p-info"><div class="p-name">${esc(p.name)}</div><div class="p-sub">${esc(p.subject)}</div></div>
      <div class="p-acts">
        <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"><button class="btn-sm-blue">Open</button></a>
        <button class="btn-sm-danger" onclick="deletePaper('${p.id}')">Delete</button>
      </div>
    </div>`).join('');
}

function setPaperFilter(s) { paperFilter = s; renderPapers() }
function deletePaper(id) { lsSet(LS.PAPERS, lsGet(LS.PAPERS, []).filter(p => p.id !== id)); renderPapers() }
function initAnalyzer() {
  document.getElementById('generateReportBtn').addEventListener('click', () => {
    const subject = document.getElementById('analyzerSubject').value.trim();
    const score = parseFloat(document.getElementById('analyzerScore').value);
    const topics = document.getElementById('analyzerTopics').value.trim();
    if (!subject || isNaN(score)) { alert('Please enter a subject and score.'); return }
    if (score < 0 || score > 100) { alert('Score must be 0–100.'); return }
    const tList = topics ? topics.split(/[,\n]+/).map(t => t.trim()).filter(Boolean) : [];
    const tStr = tList.length ? tList.slice(0, 5).map(t => `<em>${esc(t)}</em>`).join(', ') : 'the areas noted';
    let cls, bar, tier, str, wk, foc, mot;
    if (score < 50) {
      cls = 'danger'; bar = 'var(--red)'; tier = 'Needs Work';
      str = `You scored ${score}% in ${subject}. You have foundational exposure — and the fact you are analysing your performance already sets you apart.`;
      wk = tList.length ? `Your weak areas include ${tStr}. These need focused revision — conceptual clarity first, then application, then technique.` : `Your performance indicates broad conceptual gaps. Revisit fundamentals before harder problems.`;
      foc = 'Dedicate 60%+ of study time to weakest topics. Textbook examples, solved papers, concept maps.';
      mot = 'Every expert was once a beginner. Your score today is your starting point, not your ceiling.';
    } else if (score < 75) {
      cls = 'warning'; bar = 'var(--orange)'; tier = 'Moderate';
      str = `A ${score}% in ${subject} shows reasonable grasp. Your foundational understanding is intact.`;
      wk = tList.length ? `Improvement needed in ${tStr}.` : `Identifiable gaps that, when addressed, will significantly elevate your result.`;
      foc = 'Aim for accuracy over speed. Practice past questions in weak topics.';
      mot = 'You are halfway up the mountain. Targeted effort now will push you firmly into the high-performing bracket.';
    } else if (score < 90) {
      cls = 'good'; bar = 'var(--blue)'; tier = 'Good';
      str = `A ${score}% in ${subject} is commendable. Solid understanding across most of the syllabus.`;
      wk = tList.length ? `Minor vulnerabilities in ${tStr}.` : `Gaps are likely exam technique, time management or edge-case knowledge.`;
      foc = 'Polish mark-scheme alignment and eliminate careless errors. Timed mocks are your best tool.';
      mot = 'You are in a strong position. Disciplined refinement will push you into the top tier.';
    } else {
      cls = 'excellent'; bar = 'var(--green)'; tier = 'Excellent';
      str = `Scoring ${score}% in ${subject} is exceptional. Mastery, depth and reliable application.`;
      wk = tList.length ? `Even at this level, ${tStr} offer micro-level improvements.` : `Focus shifts from eliminating weaknesses to sustaining consistency.`;
      foc = 'Maintain your rhythm. Explore recent past papers. Peer explanation deepens your own understanding.';
      mot = 'You are operating at an elite level. Trust your preparation and walk in with complete confidence.';
    }
    document.getElementById('reportCard').innerHTML = `
      <div class="rep-content">
        <div class="rep-score ${cls}">${score}%</div>
        <div class="rep-sub">${esc(subject)} — ${tier}</div>
        <div class="rep-btrack"><div class="rep-bfill" style="width:0%;background:${bar}" data-w="${score}%"></div></div>
        <div class="rep-section"><div class="rep-st s">Strengths</div><p>${str}</p></div>
        <div class="rep-section"><div class="rep-st w">Weaknesses</div><p>${wk}</p></div>
        <div class="rep-section"><div class="rep-st f">Focus</div><p>${foc}</p></div>
        <div class="rep-section"><div class="rep-st c">Motivation</div><p>${mot}</p></div>
      </div>`;
    requestAnimationFrame(() => { const b = document.querySelector('.rep-bfill'); if (b) b.style.width = b.getAttribute('data-w') });
  });
}
window.deleteGoal = deleteGoal; window.editNote = editNote; window.saveNoteEdit = saveNoteEdit;
window.deleteNote = deleteNote; window.setNoteFilter = setNoteFilter;
window.deletePaper = deletePaper; window.setPaperFilter = setPaperFilter;
window.loadWeather = loadWeather;