// ── game.js — Pure board logic (no DOM) ──────────────────────────────────────

// ── State ────────────────────────────────────────────────────────────────────
let board        = [];
let score        = 0;
let bestScore    = 0;
let gameOver     = false;
let gameWon      = false;
let moving       = false;

// Session stats
let sessionGames    = 0;
let sessionMoves    = 0;
let sessionMerges   = 0;
let sessionBestTile = 0;

// Leaderboard data
let leaderboard = [];

// ── Storage ──────────────────────────────────────────────────────────────────
function load() {
  try {
    bestScore   = parseInt(localStorage.getItem('2048_best') || '0');
    leaderboard = JSON.parse(localStorage.getItem('2048_lb') || '[]');
  } catch(e) {}
}

function save() {
  try {
    localStorage.setItem('2048_best', bestScore);
    localStorage.setItem('2048_lb', JSON.stringify(leaderboard));
  } catch(e) {}
}

// ── Board Initialisation ─────────────────────────────────────────────────────
function initBoard() {
  board            = Array.from({ length: 4 }, () => Array(4).fill(0));
  score            = 0;
  gameOver         = false;
  gameWon          = false;
  sessionGames++;
  sessionMoves     = 0;
  sessionMerges    = 0;
  sessionBestTile  = 0;
}

// ── Random Tile ───────────────────────────────────────────────────────────────
function addRandom() {
  const empty = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!board[r][c]) empty.push([r, c]);

  if (!empty.length) return false;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c]  = Math.random() < 0.85 ? 2 : 4;
  return { r, c, val: board[r][c] };
}

// ── Slide a single row/column ─────────────────────────────────────────────────
function slide(row) {
  const filtered   = row.filter(x => x);
  const merged     = [];
  let   mergeCount = 0;

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const v = filtered[i] * 2;
      merged.push(v);
      score += v;
      if (v > sessionBestTile) sessionBestTile = v;
      sessionMerges++;
      mergeCount++;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < 4) merged.push(0);
  return { result: merged, merges: mergeCount };
}

// ── Apply a move in a direction ───────────────────────────────────────────────
function move(dir) {
  if (gameOver) return false;

  let changed     = false;
  let totalMerges = 0;

  for (let i = 0; i < 4; i++) {
    let row;
    if (dir === 'left')  row = [...board[i]];
    if (dir === 'right') row = [...board[i]].reverse();
    if (dir === 'up')    row = board.map(r => r[i]);
    if (dir === 'down')  row = board.map(r => r[i]).reverse();

    const { result, merges } = slide(row);
    totalMerges += merges;

    if (dir === 'right') result.reverse();
    if (dir === 'down')  result.reverse();

    for (let j = 0; j < 4; j++) {
      const [r, c] = (dir === 'left' || dir === 'right') ? [i, j] : [j, i];
      if (board[r][c] !== result[j]) changed = true;
      board[r][c] = result[j];
    }
  }

  if (!changed) return false;
  sessionMoves++;
  return true;
}

// ── Win / Lose checks ─────────────────────────────────────────────────────────
function checkGameOver() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!board[r][c])                             return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  return true;
}

function checkWin() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] === 2048) return true;
  return false;
}
