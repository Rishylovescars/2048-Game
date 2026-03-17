// ── render.js — Tile DOM rendering ───────────────────────────────────────────

let tileMap       = {}; // key: "r-c" → { el, val, id }
let tileIdCounter = 0;

// ── Cell geometry ─────────────────────────────────────────────────────────────
function getCellSize() {
  const layer = document.getElementById('tile-layer');
  const rect  = layer.getBoundingClientRect();
  return (rect.width - 30) / 4; // 3 gaps × 10px
}

function posToCoord(r, c) {
  const size = getCellSize();
  const gap  = 10;
  return {
    left: c * (size + gap),
    top:  r * (size + gap),
    size,
  };
}

// ── Full re-render (no animation) ─────────────────────────────────────────────
function renderTiles(mergedCells = []) {
  const layer     = document.getElementById('tile-layer');
  const newMap    = {};
  const mergedSet = new Set(mergedCells.map(([r, c]) => `${r}-${c}`));

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r][c];
      if (!v) continue;

      const key              = `${r}-${c}`;
      const { left, top, size } = posToCoord(r, c);
      const existing         = tileMap[key];

      if (existing && existing.val === v) {
        existing.el.style.left = left + 'px';
        existing.el.style.top  = top  + 'px';
        if (mergedSet.has(key)) {
          existing.el.classList.add('merge-tile');
          setTimeout(() => existing.el.classList.remove('merge-tile'), 300);
        }
        existing.el.className  = `tile t${v}${mergedSet.has(key) ? ' merge-tile' : ''}`;
        existing.el.textContent = v;
        newMap[key]            = existing;
      } else {
        const el        = document.createElement('div');
        el.className    = `tile t${v} new-tile`;
        el.style.left   = left + 'px';
        el.style.top    = top  + 'px';
        el.style.width  = size + 'px';
        el.style.height = size + 'px';
        el.textContent  = v;
        layer.appendChild(el);
        newMap[key] = { el, val: v, id: ++tileIdCounter };
        setTimeout(() => el.classList.remove('new-tile'), 350);
      }
    }
  }

  // Remove tiles that no longer exist
  for (const key in tileMap) {
    if (!newMap[key]) tileMap[key].el.remove();
  }
  tileMap = newMap;
  syncTileSizes();
}

// ── Animated move render ──────────────────────────────────────────────────────
function updateMovingTiles(prevBoard, mergedCells) {
  const mergedSet = new Set(mergedCells.map(([r, c]) => `${r}-${c}`));
  const layer     = document.getElementById('tile-layer');
  const newMap    = {};

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r][c];
      if (!v) continue;

      const key              = `${r}-${c}`;
      const { left, top, size } = posToCoord(r, c);

      // Try to reuse an existing tile element
      let foundKey = null;
      if (tileMap[key] && tileMap[key].val === v && !mergedSet.has(key)) {
        foundKey = key;
      } else {
        for (const pk in tileMap) {
          if (tileMap[pk] && tileMap[pk].val === v && !newMap[pk] && pk !== key) {
            foundKey = pk;
            break;
          }
        }
      }

      if (foundKey && tileMap[foundKey]) {
        const el        = tileMap[foundKey].el;
        el.style.left   = left + 'px';
        el.style.top    = top  + 'px';
        el.style.width  = size + 'px';
        el.style.height = size + 'px';
        el.className    = `tile t${v}`;
        el.textContent  = v;
        if (mergedSet.has(key)) {
          setTimeout(() => {
            el.classList.add('merge-tile');
            setTimeout(() => el.classList.remove('merge-tile'), 300);
          }, 130);
        }
        newMap[key]          = { el, val: v, id: tileMap[foundKey].id };
        tileMap[foundKey]    = null;
      } else {
        // Create a brand-new tile element
        const el        = document.createElement('div');
        el.className    = `tile t${v} new-tile`;
        el.style.left   = left + 'px';
        el.style.top    = top  + 'px';
        el.style.width  = size + 'px';
        el.style.height = size + 'px';
        el.textContent  = v;
        layer.appendChild(el);
        newMap[key] = { el, val: v, id: ++tileIdCounter };
        setTimeout(() => el.classList.remove('new-tile'), 350);
      }
    }
  }

  // Remove orphan tiles
  for (const k in tileMap) {
    if (tileMap[k]) tileMap[k].el.remove();
  }
  tileMap = newMap;
}

// ── Add a single newly spawned tile ──────────────────────────────────────────
function addNewTileEl(r, c, v) {
  const key              = `${r}-${c}`;
  const { left, top, size } = posToCoord(r, c);
  const layer            = document.getElementById('tile-layer');

  if (tileMap[key]) tileMap[key].el.remove();

  const el        = document.createElement('div');
  el.className    = `tile t${v} new-tile`;
  el.style.left   = left + 'px';
  el.style.top    = top  + 'px';
  el.style.width  = size + 'px';
  el.style.height = size + 'px';
  el.textContent  = v;
  layer.appendChild(el);
  tileMap[key] = { el, val: v, id: ++tileIdCounter };
  setTimeout(() => el.classList.remove('new-tile'), 350);
}

// ── Sync tile sizes after resize ──────────────────────────────────────────────
function syncTileSizes() {
  const layer = document.getElementById('tile-layer');
  const rect  = layer.getBoundingClientRect();
  if (!rect.width) return;
  const size = (rect.width - 30) / 4;
  for (const key in tileMap) {
    tileMap[key].el.style.width  = size + 'px';
    tileMap[key].el.style.height = size + 'px';
  }
}

// ── Reset tile layer ──────────────────────────────────────────────────────────
function clearTileLayer() {
  document.getElementById('tile-layer').innerHTML = '';
  tileMap       = {};
  tileIdCounter = 0;
}

// ── Resize handler ────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const key = `${r}-${c}`;
      if (tileMap[key]) {
        const { left, top, size } = posToCoord(r, c);
        tileMap[key].el.style.left   = left + 'px';
        tileMap[key].el.style.top    = top  + 'px';
        tileMap[key].el.style.width  = size + 'px';
        tileMap[key].el.style.height = size + 'px';
      }
    }
});
