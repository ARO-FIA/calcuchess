const PZ_API = ["https://lichess.org/api/puzzle/next", "https://lichess.org/api/puzzle/daily"];
const PZ_BEST_KEY = "calcuchess-puzzle-solved";

let pzGame = null;
let pzStartFen = null;
let pzData = null;
let pzSolution = [];
let pzPly = 0;
let pzSide = "w";
let pzFlipped = false;
let pzState = "idle";
let pzSelected = null;
let pzTargets = [];
let pzLastMove = null;
let pzPromoPending = null;
let pzMistakes = 0;
let pzSolved = 0;
let pzToken = 0;

function pzLoadCount() {
  try { pzSolved = Number(localStorage.getItem(PZ_BEST_KEY)) || 0; } catch { pzSolved = 0; }
}
function pzSaveCount() {
  try { localStorage.setItem(PZ_BEST_KEY, String(pzSolved)); } catch {}
}

async function pzFetch() {
  let lastErr = null;
  for (const url of PZ_API) {
    try {
      const r = await fetch(url);
      if (!r.ok) { lastErr = new Error("HTTP " + r.status); continue; }
      const data = await r.json();
      const hasLine = data && data.puzzle && Array.isArray(data.puzzle.solution) && data.puzzle.solution.length;
      const hasPos = hasLine && (data.puzzle.fen || (data.game && data.game.pgn));
      if (hasPos) return data;
      lastErr = new Error("Unexpected puzzle data.");
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Could not load a puzzle.");
}

function pzReplaysAll(game, solution) {
  for (const u of solution) {
    let m = null;
    try { m = game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u.slice(4) || "q" }); } catch { m = null; }
    if (!m) return false;
  }
  return true;
}

function pzBuildFen(data) {
  if (data.puzzle && data.puzzle.fen) {
    const direct = new Chess();
    if (direct.load(data.puzzle.fen) && pzReplaysAll(direct, data.puzzle.solution)) return data.puzzle.fen;
  }
  if (!data.game || !data.game.pgn) return data.puzzle && data.puzzle.fen ? data.puzzle.fen : null;
  const probe = new Chess();
  let ok = false;
  try { ok = probe.load_pgn(data.game.pgn); } catch { ok = false; }
  if (!ok) return data.puzzle && data.puzzle.fen ? data.puzzle.fen : null;
  const total = probe.history().length;
  const base = typeof data.puzzle.initialPly === "number" ? data.puzzle.initialPly : total;
  const candidates = [base + 1, total, base, base - 1, 0];
  for (const c of candidates) {
    if (c < 0 || c > total) continue;
    const g = new Chess();
    g.load_pgn(data.game.pgn);
    let guard = 5000;
    while (g.history().length > c && guard-- > 0) g.undo();
    if (g.history().length !== c) continue;
    const fen = g.fen();
    if (pzReplaysAll(g, data.puzzle.solution)) return fen;
  }
  return null;
}

function pzSolutionSan() {
  if (!pzStartFen || !pzSolution || !pzSolution.length) return "";
  const g = new Chess();
  if (!g.load(pzStartFen)) return "";
  const out = [];
  for (const u of pzSolution) {
    let m = null;
    try { m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u.slice(4) || "q" }); } catch { m = null; }
    if (!m) break;
    out.push(m.san);
  }
  return out.join(" ");
}

function pzSetStatus(message, kind) {
  const el = document.getElementById("pz-status");
  if (!el) return;
  el.textContent = message;
  el.className = "depth-status " + (kind || "neutral");
}

function pzThemeLabels() {
  if (!pzData || !pzData.puzzle || !pzData.puzzle.themes) return "—";
  return pzData.puzzle.themes.join(", ");
}
function pzPerfLabel() {
  if (!pzData || !pzData.game) return "—";
  const g = pzData.game;
  const perf = g.perf && g.perf.name ? g.perf.name : (g.perf && g.perf.key ? g.perf.key : "Chess");
  return perf;
}

async function pzNew() {
  const token = ++pzToken;
  pzState = "loading";
  pzShowOverlay("loading");
  pzSetStatus("Fetching a puzzle from Lichess…", "thinking");
  let data;
  try { data = await pzFetch(); } catch (e) {
    if (token !== pzToken) return;
    pzState = "error";
    pzShowOverlay("error", e && e.message ? e.message : "Network error.");
    pzSetStatus("Could not load a puzzle.", "danger");
    return;
  }
  if (token !== pzToken) return;
  try {
    pzData = data;
    pzGame = new Chess();
    const fen = pzBuildFen(data);
    if (!fen || !pzGame.load(fen)) throw new Error("Bad FEN.");
    pzStartFen = fen;
    pzSolution = data.puzzle.solution;
    pzPly = 0;
    pzMistakes = 0;
    pzSide = pzGame.turn();
    pzFlipped = pzSide === "b";
    pzSelected = null; pzTargets = []; pzLastMove = null;
    pzState = "playing";
    pzHideOverlay();
    const first = pzSolution[0];
    pzSetStatus("Find the best move for " + (pzSide === "w" ? "White" : "Black") + ".", "neutral");
    pzRender();
  } catch (e) {
    if (token !== pzToken) return;
    pzState = "error";
    pzShowOverlay("error", "This puzzle could not be loaded.");
    pzSetStatus("Puzzle failed to load.", "danger");
  }
}

function pzHandleSquare(square) {
  if (pzState !== "playing" || !pzGame || pzGame.turn() !== pzSide) return;
  const piece = pzGame.get(square);
  if (pzSelected) {
    const target = pzTargets.find(m => m.to === square);
    if (target) { pzAttemptMove(pzSelected, square, target); return; }
    if (piece && piece.color === pzSide) { pzSelect(square); return; }
    pzSelected = null; pzTargets = []; pzRenderBoard(); return;
  }
  if (piece && piece.color === pzSide) pzSelect(square);
}

function pzSelect(square) {
  pzSelected = square;
  pzTargets = pzGame.moves({ square, verbose: true });
  pzRenderBoard();
}

function pzAttemptMove(from, to, target) {
  const piece = pzGame.get(from);
  const promoRank = pzSide === "w" ? "8" : "1";
  const isPromo = Boolean(target.promotion) || (piece && piece.type === "p" && to[1] === promoRank);
  if (isPromo) { pzPromoPending = { from, to }; document.getElementById("pz-promo").classList.remove("hidden"); return; }
  pzPlayMove(from, to, null);
}

function pzPlayMove(from, to, promotion) {
  const expected = pzSolution[pzPly];
  const uci = from + to + (promotion || "");
  pzSelected = null; pzTargets = [];
  if (uci !== expected) {
    pzMistakes++;
    pzFlashBad();
    pzSetStatus("Not the strongest move. Look for checks, captures, and threats.", "danger");
    pzRenderBoard();
    pzRenderSidebar();
    return;
  }
  let played;
  try { played = pzGame.move({ from, to, promotion: promotion || "q" }); } catch { played = null; }
  if (!played) { pzRenderBoard(); return; }
  pzPly++;
  pzLastMove = { from: played.from, to: played.to };
  pzRender();
  if (pzPly >= pzSolution.length) { pzWin(); return; }

  const opp = pzSolution[pzPly];
  let reply = null;
  try { reply = pzGame.move({ from: opp.slice(0, 2), to: opp.slice(2, 4), promotion: opp.slice(4) || "q" }); } catch { reply = null; }
  if (reply) {
    pzPly++;
    pzLastMove = { from: reply.from, to: reply.to };
    pzSetStatus("Good find! Now find the next move.", "ok");
    pzRender();
    if (pzPly >= pzSolution.length) pzWin();
  } else {
    pzRender();
  }
}

function pzReveal() {
  if (!pzGame || pzState === "solved") return;
  pzState = "solved";
  while (pzPly < pzSolution.length) {
    const u = pzSolution[pzPly];
    let m = null;
    try { m = pzGame.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u.slice(4) || "q" }); } catch { m = null; }
    if (!m) break;
    pzPly++;
    pzLastMove = { from: m.from, to: m.to };
  }
  const line = pzSolutionSan();
  pzSetStatus("Solution: " + line, "neutral");
  pzHideOverlay();
  pzRender();
}

function pzWin() {
  pzState = "solved";
  pzSolved++;
  pzSaveCount();
  pzSetStatus("Solved! Great work.", "ok");
  pzShowOverlay("solved");
  pzRender();
}

function pzFlashBad() {
  const frame = document.getElementById("pz-board-frame");
  if (!frame) return;
  frame.classList.remove("flash-bad");
  void frame.offsetWidth;
  frame.classList.add("flash-bad");
  setTimeout(() => frame.classList.remove("flash-bad"), 1200);
}

function pzShowOverlay(kind, detail) {
  const overlay = document.getElementById("pz-overlay");
  const card = document.getElementById("pz-overlay-card");
  if (!overlay || !card) return;
  overlay.classList.remove("hidden");
  overlay.classList.remove("light");
  if (kind === "loading") {
    overlay.classList.add("light");
    card.innerHTML = `<p class="depth-eyebrow">LICHESS PUZZLES</p><h2>Loading puzzle…</h2><p class="dc-loading">Grabbing a fresh tactic from Lichess.</p>`;
    return;
  }
  if (kind === "error") {
    card.innerHTML = `<p class="depth-eyebrow">COULD NOT LOAD</p><h2>Puzzle unavailable</h2><p>${detail || "Check your connection and try again."}</p><div class="depth-actions"><button class="button button-green" id="pz-retry">Try again</button><button class="button button-outline" id="pz-home">Back to home</button></div>`;
    const retry = document.getElementById("pz-retry");
    const home = document.getElementById("pz-home");
    if (retry) retry.addEventListener("click", pzNew);
    if (home) home.addEventListener("click", () => showView("home"));
    return;
  }
  if (kind === "solved") {
    const rating = pzData && pzData.puzzle ? pzData.puzzle.rating : "?";
    card.innerHTML = `<p class="depth-eyebrow">PUZZLE SOLVED</p><h2>Nice work!</h2><p>Rated <strong>${rating}</strong> · ${pzMistakes === 0 ? "First try, flawless!" : pzMistakes + " miss(es) — you got it."}<br>Total solved: <strong>${pzSolved}</strong>.</p><div class="depth-actions"><button class="button button-green" id="pz-next">Next puzzle</button><button class="button button-outline" id="pz-home">Back to home</button></div>`;
    const next = document.getElementById("pz-next");
    const home = document.getElementById("pz-home");
    if (next) next.addEventListener("click", pzNew);
    if (home) home.addEventListener("click", () => showView("home"));
    return;
  }
}

function pzHideOverlay() {
  const overlay = document.getElementById("pz-overlay");
  if (overlay) overlay.classList.add("hidden");
}

function pzRender() {
  pzRenderBoard();
  pzRenderSidebar();
}

function pzRenderBoard() {
  const board = document.getElementById("pz-board");
  if (!board) return;
  board.innerHTML = "";
  const matrix = pzGame ? pzGame.board() : null;
  const files = "abcdefgh";
  const ranks = pzFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileList = pzFlipped ? "hgfedcba".split("") : files.split("");
  for (const rank of ranks) {
    for (const file of fileList) {
      const sq = file + rank;
      const fi = file.charCodeAt(0) - 97;
      const ri = 8 - rank;
      const piece = matrix ? matrix[ri][fi] : null;
      const square = document.createElement("button");
      const isLight = (fi + rank) % 2 === 0;
      square.type = "button";
      square.className = "square " + (isLight ? "light" : "dark");
      square.dataset.square = sq;
      square.setAttribute("role", "gridcell");
      square.setAttribute("aria-label", sq + (piece ? " " + (piece.color === "w" ? "white " : "black ") + piece.type : ""));
      if (pzLastMove && (pzLastMove.from === sq || pzLastMove.to === sq)) square.classList.add("last-move");
      if (pzSelected === sq) square.classList.add("selected");
      if (pzTargets.some(m => m.to === sq)) square.classList.add(piece ? "legal-capture" : "legal-target");
      if (piece) {
        const span = document.createElement("span");
        span.className = "piece " + (piece.color === "w" ? "piece-white" : "piece-black");
        span.textContent = PIECES[piece.color + piece.type];
        square.appendChild(span);
      }
      const showFile = pzFlipped ? rank === 1 : rank === 8;
      const showRank = pzFlipped ? file === "a" : file === "h";
      if (showFile || showRank) {
        const coord = document.createElement("span");
        coord.className = "square-coordinate";
        coord.textContent = showFile && showRank ? sq : showFile ? file : rank;
        square.appendChild(coord);
      }
      square.addEventListener("click", () => pzHandleSquare(sq));
      board.appendChild(square);
    }
  }
}

function pzRenderSidebar() {
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  const rating = pzData && pzData.puzzle ? pzData.puzzle.rating : "—";
  const id = pzData && pzData.puzzle ? pzData.puzzle.id : "—";
  set("pz-rating-row", String(rating));
  set("pz-themes-row", pzThemeLabels());
  set("pz-source-row", pzPerfLabel());
  set("pz-id-row", id);
  set("pz-solved-row", String(pzSolved));
  set("pz-mistakes-row", String(pzMistakes));
  set("pz-progress-row", pzGame ? (pzPly + " / " + pzSolution.length) : "—");
  set("pz-source-top", pzPerfLabel() + " · rating " + rating);
  set("pz-rating-top", pzSide === "w" ? "White to move" : "Black to move");
  set("pz-you-label", pzState === "playing" ? "Find the best move" : pzState === "solved" ? "Solved!" : "Loading…");
  set("pz-mission-label", pzData && pzData.puzzle ? ("Solve · rated " + rating) : "Solve the tactic");
  const reveal = document.getElementById("pz-reveal");
  if (reveal) reveal.disabled = pzState !== "playing";
  const moveList = document.getElementById("pz-move-list");
  if (moveList) {
    const hist = pzGame ? pzGame.history() : [];
    if (!hist.length) moveList.innerHTML = '<p class="move-list-empty">Solve the tactic to see moves.</p>';
    else {
      moveList.innerHTML = "";
      for (let i = 0; i < hist.length; i += 2) {
        const pair = document.createElement("div");
        pair.className = "move-pair";
        const num = document.createElement("span");
        num.className = "move-number";
        num.textContent = (Math.floor(i / 2) + 1) + ".";
        pair.appendChild(num);
        for (let s = 0; s < 2; s++) {
          const cell = document.createElement("span");
          cell.className = "move-cell";
          if (hist[i + s]) cell.textContent = hist[i + s];
          pair.appendChild(cell);
        }
        moveList.appendChild(pair);
      }
      moveList.scrollTop = moveList.scrollHeight;
    }
  }
}

function pzWire() {
  const nav = document.getElementById("nav-puzzles");
  if (nav) nav.addEventListener("click", () => { showView("puzzles"); if (pzState === "idle" || pzState === "error") pzNew(); });
  const playPz = document.getElementById("play-puzzles");
  if (playPz) playPz.addEventListener("click", () => { showView("puzzles"); pzNew(); });
  const flip = document.getElementById("pz-flip");
  if (flip) flip.addEventListener("click", () => { pzFlipped = !pzFlipped; pzRenderBoard(); });
  const back = document.getElementById("pz-back");
  if (back) back.addEventListener("click", () => showView("home"));
  const next = document.getElementById("pz-new");
  if (next) next.addEventListener("click", pzNew);
  const reveal = document.getElementById("pz-reveal");
  if (reveal) reveal.addEventListener("click", pzReveal);
  const promo = document.getElementById("pz-promo");
  if (promo) promo.addEventListener("click", e => {
    const btn = e.target.closest("button[data-promo]");
    if (!btn || !pzPromoPending) return;
    const p = btn.dataset.promo;
    const pending = pzPromoPending;
    pzPromoPending = null;
    promo.classList.add("hidden");
    if (!p) { pzSelected = null; pzTargets = []; pzRenderBoard(); return; }
    pzPlayMove(pending.from, pending.to, p);
  });
}

pzLoadCount();
pzWire();
