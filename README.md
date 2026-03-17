# 2048 — The Infinite Puzzle

A premium, fully-featured 2048 game with a dark glassmorphic UI, smooth tile animations, leaderboard, and responsive design.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5 (semantic)                  |
| Styling    | CSS3 (custom properties, grid, keyframe animations, glassmorphism) |
| Logic      | Vanilla JavaScript (ES2020, async/await) |
| Fonts      | Google Fonts — Playfair Display, DM Mono, Outfit |
| Storage    | `localStorage` (scores + leaderboard) |
| Build tool | **None** — zero dependencies, zero bundler |

No frameworks. No npm. No build step.

---

## Project Structure

```
2048-game/
├── index.html          # HTML shell + layout
├── css/
│   └── style.css       # All styles (variables, tiles, modals, animations)
└── js/
    ├── game.js         # Pure board logic — state, slide(), move(), checkWin()
    ├── render.js       # Tile DOM rendering — tileMap, posToCoord(), animations
    ├── ui.js           # UI helpers — score, leaderboard, overlay, toast, background
    └── main.js         # Input handling (keyboard + touch) and boot sequence
```

### Script load order (matters!)
`game.js` → `render.js` → `ui.js` → `main.js`

Each file depends on globals defined in the file before it.

---

## Running Locally in VS Code

### Option A — Live Server (recommended, one-click)

1. Open VS Code and go to **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **"Live Server"** by Ritwick Dey and click **Install**
3. Open the `2048-game/` folder in VS Code:
   ```
   File → Open Folder → select the 2048-game folder
   ```
4. Right-click `index.html` in the Explorer sidebar and choose  
   **"Open with Live Server"**
5. Your browser will open at `http://127.0.0.1:5500` — the game is live!

> Live Server auto-refreshes the browser whenever you save a file.

---

### Option B — VS Code built-in simple browser (no extension)

1. Open `index.html` in the editor
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) → type **"Simple Browser"** → select  
   **"Simple Browser: Show"**
3. Enter `file:///absolute/path/to/2048-game/index.html`

> Note: `localStorage` may be restricted with `file://` URLs in some browsers.  
> Use Option A (Live Server) to avoid this.

---

### Option C — Python one-liner (no extension needed)

If you have Python installed, open a terminal in the `2048-game/` folder and run:

```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## Controls

| Action           | Keyboard         | Mobile   |
|------------------|------------------|----------|
| Move tiles       | Arrow keys / WASD | Swipe    |

---

## Features

- Smooth CSS tile movement animations
- Merge bounce + score float effects
- Ambient background orbs that shift color with the highest tile
- Top-5 leaderboard stored in `localStorage`
- Session stats (games, moves, merges, best tile)
- Win (2048) and game-over overlays
- Instructions modal (auto-shows after 3 s)
- Toast notifications
- Fully responsive down to 360px
