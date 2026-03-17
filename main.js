// ── main.js — Input handling, game loop, and boot ────────────────────────────

const delay = ms => new Promise(r => setTimeout(r, ms));

// ── New Game ──────────────────────────────────────────────────────────────────
function newGame() {
  initBoard();                                          // reset state  (game.js)
  clearTileLayer();                                     // wipe DOM     (render.js)
  document.getElementById('overlay').classList.remove('visible');
  addRandom();
  addRandom();
  renderTiles();                                        // draw initial tiles
  updateScoreDisplay();
  updateStats();
  updateLeaderboardDisplay();
  updateBackground();
}

// ── Move handler ──────────────────────────────────────────────────────────────
async function handleMove(dir) {
  if (moving || gameOver) return;
  moving = true;

  const prevBoard = board.map(r => [...r]);
  const changed   = move(dir);                          // game.js

  if (!changed) { moving = false; return; }

  // Collect merged cell positions
  const mergedCells = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] && board[r][c] !== prevBoard[r][c] && prevBoard[r][c])
        mergedCells.push([r, c]);

  updateMovingTiles(prevBoard, mergedCells);            // render.js — animate

  await delay(140);

  const newTile = addRandom();                          // game.js
  if (newTile) addNewTileEl(newTile.r, newTile.c, newTile.val); // render.js

  if (score > bestScore) { bestScore = score; save(); }
  updateScoreDisplay();
  updateStats();
  updateBackground();

  if (!gameWon && checkWin()) {
    gameWon = true;
    setTimeout(() => showOverlay(true), 400);
    addToLeaderboard();
    showToast('🎉 You reached 2048!');
  } else if (checkGameOver()) {
    gameOver = true;
    setTimeout(() => showOverlay(false), 400);
    addToLeaderboard();
  }

  moving = false;
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const map = {
    ArrowLeft:  'left',  ArrowRight: 'right',
    ArrowUp:    'up',    ArrowDown:  'down',
    a: 'left',  d: 'right',
    w: 'up',    s: 'down',
  };
  const dir = map[e.key];
  if (dir) { e.preventDefault(); handleMove(dir); }
});

// ── Touch / Swipe ─────────────────────────────────────────────────────────────
let touchStartX = 0, touchStartY = 0;

document.getElementById('grid').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('grid').addEventListener('touchend', e => {
  const dx  = e.changedTouches[0].clientX - touchStartX;
  const dy  = e.changedTouches[0].clientY - touchStartY;
  const abs = Math.max(Math.abs(dx), Math.abs(dy));
  if (abs < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
  else                              handleMove(dy > 0 ? 'down'  : 'up');
}, { passive: true });

// ── Boot ──────────────────────────────────────────────────────────────────────
load();                    // load best score + leaderboard from localStorage
updateLeaderboardDisplay();

// Small timeout lets the layout settle before we measure cell sizes
setTimeout(() => {
  newGame();
  setTimeout(showInstructions, 3000); // show how-to-play after 3 s
}, 100);
