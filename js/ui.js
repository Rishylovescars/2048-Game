// ── ui.js — UI updates: overlays, modals, leaderboard, stats, background ─────

// ── Score display ─────────────────────────────────────────────────────────────
function updateScoreDisplay() {
  const el = document.getElementById('score');
  el.textContent = score;
  el.classList.remove('bump');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('bump');
  document.getElementById('best').textContent = bestScore;
}

// ── Session stats ─────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-games').textContent     = sessionGames;
  document.getElementById('stat-moves').textContent     = sessionMoves;
  document.getElementById('stat-merges').textContent    = sessionMerges;
  document.getElementById('stat-best-tile').textContent = sessionBestTile || '—';
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function addToLeaderboard() {
  leaderboard.push({ score, tile: sessionBestTile });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  save();
  updateLeaderboardDisplay();
}

function updateLeaderboardDisplay() {
  const list = document.getElementById('leaderboard');
  list.innerHTML = '';

  if (!leaderboard.length) {
    list.innerHTML = '<li style="font-size:12px;color:var(--text-dim);text-align:center;padding:16px 0">Play a game to appear here!</li>';
    return;
  }

  const medals = ['gold', 'silver', 'bronze'];
  const icons  = ['①', '②', '③', '④', '⑤'];

  leaderboard.forEach((entry, i) => {
    const li        = document.createElement('li');
    li.className    = 'lb-item';
    li.style.animationDelay = (i * 0.08) + 's';
    const tileColor = getTileColor(entry.tile);
    li.innerHTML    = `
      <span class="lb-rank ${medals[i] || ''}">${icons[i]}</span>
      <span class="lb-score-val">${entry.score.toLocaleString()}</span>
      <span class="lb-tile-badge" style="background:${tileColor.bg};color:${tileColor.fg}">${entry.tile || '—'}</span>
    `;
    list.appendChild(li);
  });
}

function getTileColor(v) {
  const map = {
    2:    { bg: 'rgba(45,43,74,0.8)',    fg: '#d4d0f0' },
    4:    { bg: 'rgba(58,45,74,0.8)',    fg: '#e0d0f0' },
    8:    { bg: 'rgba(74,45,58,0.8)',    fg: '#ffd4e0' },
    16:   { bg: 'rgba(90,45,42,0.8)',    fg: '#ffc4c0' },
    32:   { bg: 'rgba(106,58,26,0.8)',   fg: '#ffd8b0' },
    64:   { bg: 'rgba(122,42,10,0.8)',   fg: '#ffe4c0' },
    128:  { bg: 'rgba(138,106,0,0.8)',   fg: '#fff8d0' },
    256:  { bg: 'rgba(154,122,0,0.8)',   fg: '#fffbd0' },
    512:  { bg: 'rgba(10,106,74,0.8)',   fg: '#d0fff0' },
    1024: { bg: 'rgba(10,74,122,0.8)',   fg: '#d0e8ff' },
    2048: { bg: 'rgba(247,201,72,0.8)',  fg: '#1a1400' },
  };
  return map[v] || { bg: 'rgba(255,255,255,0.1)', fg: '#fff' };
}

// ── Ambient background shifts with highest tile ───────────────────────────────
function updateBackground() {
  const max     = Math.max(...board.flat());
  const schemes = {
    2:    ['#f7c948', '#ff6b6b', '#4ecdc4'],
    4:    ['#f7c948', '#a29bfe', '#fd79a8'],
    8:    ['#ff7675', '#fdcb6e', '#e17055'],
    16:   ['#e17055', '#fd79a8', '#fdcb6e'],
    32:   ['#e67e22', '#e74c3c', '#f39c12'],
    64:   ['#c0392b', '#e74c3c', '#e67e22'],
    128:  ['#f7c948', '#fdcb6e', '#e17055'],
    256:  ['#f7c948', '#f39c12', '#e67e22'],
    512:  ['#00b894', '#00cec9', '#0984e3'],
    1024: ['#0984e3', '#6c5ce7', '#a29bfe'],
    2048: ['#f7c948', '#ff9f43', '#fff200'],
  };

  const key = Object.keys(schemes).filter(k => k <= max).pop();
  if (key) {
    const [c1, c2, c3] = schemes[key];
    document.querySelector('.orb-1').style.background = `radial-gradient(circle,${c1},transparent)`;
    document.querySelector('.orb-2').style.background = `radial-gradient(circle,${c2},transparent)`;
    document.querySelector('.orb-3').style.background = `radial-gradient(circle,${c3},transparent)`;
  }
}

// ── Game Over / Win overlay ───────────────────────────────────────────────────
function showOverlay(win) {
  const ov = document.getElementById('overlay');
  document.getElementById('overlayIcon').textContent  = win ? '🎊' : '😔';
  document.getElementById('overlayTitle').textContent = win ? 'You Won!' : 'Game Over';
  document.getElementById('overlayScore').textContent = score.toLocaleString() + ' pts';
  document.getElementById('overlayTitle').style.color = win ? 'var(--accent)' : 'var(--accent2)';
  ov.classList.add('visible');
}

// ── Instructions modal ────────────────────────────────────────────────────────
function showInstructions() {
  document.getElementById('instrModal').classList.add('visible');
}
function hideInstructions() {
  document.getElementById('instrModal').classList.remove('visible');
}

// Close modal on backdrop click
document.getElementById('instrModal').addEventListener('click', e => {
  if (e.target === document.getElementById('instrModal')) hideInstructions();
});

// ── Toast notification ────────────────────────────────────────────────────────
function showToast(msg) {
  const t     = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
