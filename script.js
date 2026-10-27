const $ = id => document.getElementById(id);
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PIECES = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
};

const CLASSIFICATION_INFO = {
  book: { label: "Book", symbol: "B" },
  brilliant: { label: "Brilliant", symbol: "!!" },
  excellent: { label: "Excellent", symbol: "!" },
  best: { label: "Best", symbol: "★" },
  good: { label: "Good", symbol: "✓" },
  inaccuracy: { label: "Inaccuracy", symbol: "?!" },
  mistake: { label: "Mistake", symbol: "?" },
  blunder: { label: "Blunder", symbol: "??" },
  miss: { label: "Miss", symbol: "×" }
};

const BOOK_LINES = [
  "e2e4 e7e5 g1f3 b8c6 f1b5",
  "e2e4 e7e5 g1f3 b8c6 f1c4",
  "e2e4 e7e5 g1f3 b8c6 d2d4",
  "e2e4 e7e5 f2f4",
  "e2e4 c7c5",
  "e2e4 e7e6",
  "e2e4 c7c6",
  "e2e4 d7d5",
  "e2e4 g8f6",
  "d2d4 d7d5 c2c4",
  "d2d4 g8f6 c2c4 g7g6",
  "d2d4 g8f6 c2c4 e7e6",
  "c2c4 e7e5",
  "g1f3 d7d5",
  "g1f3 g8f6",
  "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6",
  "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1",
  "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4",
  "d2d4 d7d5 c2c4 e7e6 b1c3 g8f6"
].map(line => line.split(" "));

let game = new Chess();
let initialFen = START_FEN;
let moves = [];
let currentPly = 0;
let flipped = false;
let selectedSquare = null;
let legalTargets = [];
let importMode = "pgn";
let gameSource = "LOCAL";
let gameTitle = "Analysis board";
let playerNames = { white: "White", black: "Black" };
let currentPgn = "";
let onlineGames = [];
let stockfishWorker = null;
let stockfishReady = false;
let stockfishFailed = false;
let activeEvaluation = null;
let queuedEvaluation = null;
let evaluationRequestId = 0;
let classificationQueue = [];
let moveClassifications = [];
let classificationData = [];
let classificationSignature = "";
let classificationGeneration = 0;
let engineLines = new Map();
let analysisDepth = 14;

function showView(view) {
  $("home-view").classList.toggle("hidden", view !== "home");
  $("analysis-view").classList.toggle("hidden", view !== "analysis");
  $("nav-home").classList.toggle("active", view === "home");
  $("nav-analysis").classList.toggle("active", view === "analysis");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setStatus(message, type = "") {
  $("import-message").textContent = message;
  $("import-message").className = `status-message ${type}`;
}

function setOnlineStatus(message, type = "") {
  $("online-message").textContent = message;
  $("online-message").className = `status-message ${type}`;
}

function openImport(mode = "pgn") {
  setImportMode(mode);
  $("import-panel").classList.remove("hidden");
  $("import-input").focus();
  $("import-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setImportMode(mode) {
  importMode = mode;
  document.querySelectorAll(".tab-button").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  $("import-label").textContent = mode === "fen" ? "Load a position" : "Paste PGN";
  $("import-help").textContent = mode === "fen"
    ? "Paste a valid FEN position."
    : "Paste a PGN game, including its move list.";
  $("import-input").placeholder = mode === "fen"
    ? "Paste FEN here..."
    : '[Event "Casual Game"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6';
  setStatus("");
}

function positionAt(ply) {
  const position = new Chess(initialFen);
  for (let i = 0; i < ply; i++) {
    if (!position.move(moves[i].san)) break;
  }
  return position;
}

function resetClassificationState() {
  classificationGeneration++;
  classificationQueue = [];
  classificationData = [];
  moveClassifications = new Array(moves.length).fill(null);
  classificationSignature = "";
  engineLines.clear();
}

function loadPgn(pgn, source = "LOCAL", title = "Imported game", save = true) {
  if (!pgn || !pgn.trim()) {
    setStatus("Paste a PGN game first.", "error");
    return false;
  }

  const parsed = new Chess();
  let loaded = false;

  try {
    loaded = parsed.load_pgn(pgn.trim(), { sloppy: true });
  } catch {
    loaded = false;
  }

  if (!loaded) {
    setStatus("That PGN could not be read. Check the format and try again.", "error");
    return false;
  }

  const headers = parsed.header();
  const history = parsed.history({ verbose: true });

  initialFen = headers.FEN || START_FEN;
  game = new Chess(initialFen);
  moves = history;
  currentPly = moves.length;
  gameSource = source;
  gameTitle = title;
  currentPgn = pgn.trim();
  playerNames = {
    white: headers.White || "White",
    black: headers.Black || "Black"
  };

  resetClassificationState();

  if (save) {
    saveRecentGame({
      title,
      source,
      pgn: currentPgn,
      date: headers.Date || new Date().toISOString().slice(0, 10),
      result: headers.Result || "*",
      white: playerNames.white,
      black: playerNames.black
    });
  }

  $("import-panel").classList.add("hidden");
  showView("analysis");
  renderAnalysis();
  return true;
}

function loadFen(fen, source = "LOCAL", title = "FEN position") {
  const nextGame = new Chess();

  if (!fen || !nextGame.load(fen.trim())) {
    setStatus("That FEN position is invalid.", "error");
    return false;
  }

  game = nextGame;
  initialFen = nextGame.fen();
  moves = [];
  currentPly = 0;
  gameSource = source;
  gameTitle = title;
  currentPgn = "";
  playerNames = { white: "White", black: "Black" };

  resetClassificationState();
  $("import-panel").classList.add("hidden");
  showView("analysis");
  renderAnalysis();
  return true;
}

function renderAnalysis() {
  game = positionAt(currentPly);
  selectedSquare = null;
  legalTargets = [];

  $("analysis-subtitle").textContent = gameTitle;
  $("game-source").textContent = gameSource.toUpperCase();
  $("white-player").textContent = playerNames.white;
  $("black-player").textContent = playerNames.black;
  $("white-meta").textContent = "White pieces";
  $("black-meta").textContent = "Black pieces";
  $("move-count").textContent = moves.length;
  $("move-list-count").textContent = `${moves.length} plies`;
  $("move-count-badge").textContent = currentPly === 0
    ? "Start"
    : `${Math.ceil(currentPly / 2)}${currentPly % 2 ? "." : "..."}`;

  const headers = positionAt(0).header();
  const result = headers.Result && headers.Result !== "*" ? headers.Result : "*";
  $("result-label").textContent = result === "*" ? "Game in progress" : `Result: ${result}`;

  renderBoard();
  ensureMoveClassifications();
  renderMoveList();
  renderPositionStatus();
  updateControls();
  updateEvaluation();
}

function renderBoard() {
  const board = $("chessboard");
  const matrix = game.board();
  board.innerHTML = "";

  const files = flipped ? "hgfedcba" : "abcdefgh";
  const ranks = flipped ? "12345678" : "87654321";
  const historyMove = currentPly > 0 ? moves[currentPly - 1] : null;

  for (const rank of ranks) {
    for (const file of files) {
      const squareName = `${file}${rank}`;
      const fileIndex = file.charCodeAt(0) - 97;
      const rankIndex = 8 - Number(rank);
      const piece = matrix[rankIndex][fileIndex];
      const square = document.createElement("button");
      const isLight = (fileIndex + Number(rank)) % 2 === 0;

      square.type = "button";
      square.className = `square ${isLight ? "light" : "dark"}`;
      square.dataset.square = squareName;
      square.setAttribute("role", "gridcell");
      square.setAttribute(
        "aria-label",
        `${squareName}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`
      );

      if (historyMove && (historyMove.from === squareName || historyMove.to === squareName)) {
        square.classList.add("last-move");
      }

      if (selectedSquare === squareName) square.classList.add("selected");

      if (legalTargets.some(move => move.to === squareName)) {
        square.classList.add(piece ? "legal-capture" : "legal-target");
      }

      if (piece) {
        const span = document.createElement("span");
        span.className = `piece ${piece.color === "w" ? "piece-white" : "piece-black"}`;
        span.textContent = PIECES[`${piece.color}${piece.type}`];
        square.appendChild(span);
      }

      const showFile = rank === "1";
      const showRank = flipped ? file === "h" : file === "a";

      if (showFile || showRank) {
        const coord = document.createElement("span");
        coord.className = "square-coordinate";
        coord.textContent = showFile && showRank
          ? `${file}${rank}`
          : showFile ? file : rank;
        square.appendChild(coord);
      }

      square.addEventListener("click", () => handleSquareClick(squareName));
      board.appendChild(square);
    }
  }

  renderBoardClassification();
}

function handleSquareClick(squareName) {
  const piece = game.get(squareName);

  if (selectedSquare) {
    const targetMove = legalTargets.find(move => move.to === squareName);

    if (targetMove) {
      makeBoardMove(selectedSquare, squareName, targetMove);
      return;
    }

    if (piece && piece.color === game.turn()) {
      selectSquare(squareName);
      return;
    }

    selectedSquare = null;
    legalTargets = [];
    renderBoard();
    return;
  }

  if (piece && piece.color === game.turn()) selectSquare(squareName);
}

function selectSquare(squareName) {
  selectedSquare = squareName;
  legalTargets = game.moves({ square: squareName, verbose: true });
  renderBoard();
}

function makeBoardMove(from, to, targetMove) {
  const played = game.move({
    from,
    to,
    promotion: targetMove.promotion || "q"
  });

  if (!played) return;

  if (currentPly < moves.length) moves = moves.slice(0, currentPly);
  moves.push(played);
  currentPly = moves.length;
  currentPgn = "";
  resetClassificationState();
  renderAnalysis();
}

function renderMoveList() {
  const list = $("move-list");
  list.innerHTML = "";

  if (!moves.length) {
    const empty = document.createElement("p");
    empty.className = "move-list-empty";
    empty.textContent = "No moves to display for this position.";
    list.appendChild(empty);
    return;
  }

  for (let i = 0; i < moves.length; i += 2) {
    const pair = document.createElement("div");
    pair.className = "move-pair";

    const number = document.createElement("span");
    number.className = "move-number";
    number.textContent = `${Math.floor(i / 2) + 1}.`;
    pair.appendChild(number);

    for (let side = 0; side < 2; side++) {
      const ply = i + side;

      if (ply >= moves.length) {
        pair.appendChild(document.createElement("span"));
        continue;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "move-cell";
      button.appendChild(document.createTextNode(moves[ply].san));

      const classification = moveClassifications[ply];
      if (classification) {
        const info = CLASSIFICATION_INFO[classification];
        const marker = document.createElement("span");
        marker.className = `move-classification classification-${classification}`;
        marker.textContent = info.symbol;
        marker.title = info.label;
        button.appendChild(marker);
        button.title = `${moves[ply].san} — ${info.label}`;
      } else {
        button.title = `Go to move ${ply + 1}`;
      }

      if (currentPly === ply + 1) button.classList.add("active");

      button.addEventListener("click", () => goToPly(ply + 1));
      pair.appendChild(button);
    }

    list.appendChild(pair);
  }

  const activeMove = list.querySelector(".move-cell.active");
  if (activeMove) activeMove.scrollIntoView({ block: "nearest" });
}

function renderPositionStatus() {
  const move = currentPly > 0 ? moves[currentPly - 1] : null;
  const fullMove = Math.ceil(currentPly / 2);

  $("position-status").textContent = move
    ? `${fullMove}. ${move.san}`
    : "Starting position";

  $("turn-status").textContent = game.in_checkmate()
    ? "Checkmate"
    : game.in_check()
      ? `${game.turn() === "w" ? "White" : "Black"} in check`
      : `${game.turn() === "w" ? "White" : "Black"} to move`;
}

function updateControls() {
  $("first-move").disabled = currentPly === 0;
  $("previous-move").disabled = currentPly === 0;
  $("next-move").disabled = currentPly >= moves.length;
  $("last-move").disabled = currentPly >= moves.length;
}

function moveToUci(move) {
  return `${move.from}${move.to}${move.promotion || ""}`;
}

function materialBalance(position, color) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let total = 0;

  position.board().flat().forEach(piece => {
    if (piece && piece.color === color) total += values[piece.type] || 0;
  });

  return total;
}

function isBookMove(index) {
  const sequence = moves.slice(0, index + 1).map(moveToUci);

  return BOOK_LINES.some(line =>
    sequence.length <= line.length &&
    sequence.every((uci, i) => line[i] === uci)
  );
}

function ensureMoveClassifications() {
  const signature = `${initialFen}|${moves.map(moveToUci).join(",")}`;

  if (signature === classificationSignature) return;

  classificationSignature = signature;
  classificationGeneration++;

  const generation = classificationGeneration;
  classificationQueue = [];
  classificationData = new Array(moves.length);
  moveClassifications = new Array(moves.length).fill(null);

  if (!moves.length) {
    renderMoveList();
    renderBoardClassification();
    return;
  }

  const position = new Chess(initialFen);

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const beforeFen = position.fen();
    const beforePosition = new Chess(beforeFen);
    const movingColor = beforePosition.turn();
    const materialBefore = materialBalance(beforePosition, movingColor);

    const applied = position.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q"
    });

    if (!applied) continue;

    const afterFen = position.fen();
    const afterPosition = new Chess(afterFen);
    const materialAfter = materialBalance(afterPosition, movingColor);

    classificationData[i] = {
      index: i,
      generation,
      move,
      movingColor,
      beforeFen,
      afterFen,
      before: null,
      after: null,
      bestMove: null,
      sacrificedMaterial: materialAfter < materialBefore,
      book: isBookMove(i)
    };

    if (classificationData[i].book) {
      moveClassifications[i] = "book";
      continue;
    }

    classificationQueue.push({
      type: "classification",
      phase: "before",
      index: i,
      generation,
      fen: beforeFen,
      turn: movingColor,
      scoreType: "cp",
      score: 0,
      depth: 0
    });

    classificationQueue.push({
      type: "classification",
      phase: "after",
      index: i,
      generation,
      fen: afterFen,
      turn: afterPosition.turn(),
      scoreType: "cp",
      score: 0,
      depth: 0
    });
  }

  renderMoveList();
  renderBoardClassification();
  startNextEvaluation();
}

function initStockfish() {
  try {
    stockfishWorker = new Worker("./stockfish/stockfish-19-lite-single.js");

    stockfishWorker.onmessage = event => {
      const line = String(event.data || "").trim();

      if (line === "uciok") {
        stockfishWorker.postMessage("isready");
        return;
      }

      if (line === "readyok") {
        stockfishReady = true;
        $("engine-status").textContent = "Stockfish ready.";
        startNextEvaluation();
        return;
      }

      if (line.startsWith("info ")) {
        handleStockfishInfo(line);
        return;
      }

      if (line.startsWith("bestmove ")) finishStockfishEvaluation(line);
    };

    stockfishWorker.onerror = () => {
      stockfishFailed = true;
      stockfishReady = false;
      activeEvaluation = null;
      queuedEvaluation = null;
      classificationQueue = [];
      $("engine-status").textContent = "Stockfish failed to load. Check the engine file path and browser console.";
    };

    $("engine-status").textContent = "Loading Stockfish engine…";
    stockfishWorker.postMessage("uci");
  } catch {
    stockfishFailed = true;
    $("engine-status").textContent = "Could not start Stockfish. Check the engine file path.";
  }
}

function requestStockfishEvaluation(fen, turn) {
  if (stockfishFailed || !stockfishWorker) return;

  queuedEvaluation = {
    type: "display",
    id: ++evaluationRequestId,
    fen,
    turn,
    scoreType: "cp",
    score: 0,
    depth: 0
  };

  startNextEvaluation();
}

function startNextEvaluation() {
  if (!stockfishReady || activeEvaluation || stockfishFailed) return;

  if (queuedEvaluation) {
    activeEvaluation = queuedEvaluation;
    queuedEvaluation = null;
  } else if (classificationQueue.length) {
    activeEvaluation = classificationQueue.shift();
  } else {
    return;
  }

  stockfishWorker.postMessage(`position fen ${activeEvaluation.fen}`);
  stockfishWorker.postMessage(`go depth ${activeEvaluation.type === "classification" ? analysisDepth : 16}`);
}

function handleStockfishInfo(line) {
  if (!activeEvaluation) return;

  const depthMatch = line.match(/\bdepth (\d+)/);
  const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)/);
  const multipvMatch = line.match(/\bmultipv (\d+)/);

  if (multipvMatch && Number(multipvMatch[1]) !== 1) return;

  if (depthMatch) {
    const depth = Number(depthMatch[1]);
    if (depth >= activeEvaluation.depth) activeEvaluation.depth = depth;
  }

  if (scoreMatch) {
    const depth = depthMatch ? Number(depthMatch[1]) : activeEvaluation.depth;

    if (depth >= activeEvaluation.scoreDepth || activeEvaluation.scoreDepth === undefined) {
      activeEvaluation.scoreType = scoreMatch[1];
      activeEvaluation.score = Number(scoreMatch[2]);
      activeEvaluation.scoreDepth = depth;
    }

    if (activeEvaluation.type === "display" && activeEvaluation.id === evaluationRequestId) {
      displayStockfishScore(activeEvaluation);
    }
  }
}

function scoreForMover(result) {
  if (!result) return 0;

  let score = result.score;

  if (result.scoreType === "mate") {
    const distance = Math.abs(score);
    const mateValue = (21 - Math.min(10, distance)) * 100;
    score = score > 0 ? mateValue : -mateValue;
  }

  return score;
}

function winningChancesFromCp(cp) {
  const bounded = Math.max(-1000, Math.min(1000, cp));
  return 2 / (1 + Math.exp(-0.00368208 * bounded)) - 1;
}

function scoreFromColorView(result, color) {
  if (!result) return 0;

  const score = scoreForMover(result);
  return result.turn === color ? score : -score;
}

function winningChancesFromResult(result, color) {
  return winningChancesFromCp(scoreFromColorView(result, color));
}

function classifyMove(data) {
  if (!data || !data.before || !data.after) return null;

  if (data.bestMove && data.bestMove === moveToUci(data.move)) {
    return "best";
  }

  const beforeChances = winningChancesFromResult(data.before, data.movingColor);
  const afterChances = winningChancesFromResult(data.after, data.movingColor);
  const loss = Math.max(0, (beforeChances - afterChances) / 2);

  if (loss >= 0.3) return "blunder";
  if (loss >= 0.2) return "mistake";
  if (loss >= 0.1) return "inaccuracy";
  if (loss <= 0.02) return "excellent";
  return "good";
}

function finishStockfishEvaluation(line) {
  if (!activeEvaluation) return;

  const job = activeEvaluation;
  const match = line.match(/^bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
  const bestMoveUci = match ? match[1] : null;

  if (job.type === "classification" && job.generation === classificationGeneration) {
    const data = classificationData[job.index];

    if (data) {
      if (job.phase === "before") {
        data.before = {
          scoreType: job.scoreType,
          score: job.score,
          turn: job.turn
        };
        data.bestMove = bestMoveUci;
      } else {
        data.after = {
          scoreType: job.scoreType,
          score: job.score,
          turn: job.turn
        };

        const classification = classifyMove(data);
        if (classification) moveClassifications[job.index] = classification;
        renderMoveList();
        renderBoardClassification();
      }
    }
  } else if (job.type === "display" && job.id === evaluationRequestId) {
    let bestMoveText = "";

    if (bestMoveUci) {
      const position = new Chess(job.fen);
      const played = position.move({
        from: bestMoveUci.slice(0, 2),
        to: bestMoveUci.slice(2, 4),
        promotion: bestMoveUci[4] || "q"
      });
      if (played) bestMoveText = played.san;
    }

    $("engine-status").textContent = bestMoveText
      ? `Stockfish · Depth ${job.depth} · Best move: ${bestMoveText}`
      : `Stockfish · Depth ${job.depth} · Analysis complete`;
  }

  activeEvaluation = null;
  startNextEvaluation();
}

function displayStockfishScore(job) {
  let whiteScore = job.turn === "w" ? job.score : -job.score;

  if (job.scoreType === "mate") {
    const label = whiteScore > 0
      ? `+M${Math.abs(whiteScore)}`
      : whiteScore < 0 ? `-M${Math.abs(whiteScore)}` : "0.0";

    const whitePercent = whiteScore > 0 ? 97 : whiteScore < 0 ? 3 : 50;
    $("eval-white").style.height = `${whitePercent}%`;
    $("eval-black").style.height = `${100 - whitePercent}%`;
    $("evaluation-label").textContent = label;
    return;
  }

  const boundedScore = Math.max(-1500, Math.min(1500, whiteScore));
  let whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * boundedScore)) - 1);
  whitePercent = Math.max(4, Math.min(96, whitePercent));

  const pawns = whiteScore / 100;
  $("eval-white").style.height = `${whitePercent}%`;
  $("eval-black").style.height = `${100 - whitePercent}%`;
  $("evaluation-label").textContent = `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
  $("engine-status").textContent = `Stockfish · Depth ${job.depth || 1} · Evaluating position`;
}

function renderBoardClassification() {
  const board = $("chessboard");
  if (!board) return;

  board.querySelectorAll(".board-move-classification").forEach(el => el.remove());

  if (currentPly <= 0) return;

  const move = moves[currentPly - 1];
  const classification = moveClassifications[currentPly - 1];
  if (!move || !classification) return;

  const square = board.querySelector(`[data-square="${move.to}"]`);
  const info = CLASSIFICATION_INFO[classification];
  if (!square || !info) return;

  const marker = document.createElement("span");
  marker.className = `board-move-classification classification-${classification}`;
  marker.textContent = info.symbol;
  marker.title = info.label;
  marker.setAttribute("aria-label", info.label);
  square.appendChild(marker);
}

function updateEvaluation() {
  if (stockfishFailed) {
    $("engine-status").textContent = "Stockfish is unavailable.";
    return;
  }
  requestStockfishEvaluation(game.fen(), game.turn());
}

function goToPly(ply) {
  currentPly = Math.max(0, Math.min(moves.length, ply));
  renderAnalysis();
}

function makePgn() {
  const exportGame = new Chess(initialFen);
  for (const move of moves) exportGame.move(move.san);

  if (!playerNames.white) exportGame.header("White", "White");
  if (!playerNames.black) exportGame.header("Black", "Black");

  return exportGame.pgn({ max_width: 80, newline_char: "\n" });
}

function saveRecentGame(item) {
  try {
    const old = JSON.parse(localStorage.getItem("calcuchess-recent") || "[]");
    const filtered = old.filter(gameItem => !(gameItem.pgn === item.pgn && gameItem.source === item.source));
    filtered.unshift({ ...item, savedAt: Date.now() });
    localStorage.setItem("calcuchess-recent", JSON.stringify(filtered.slice(0, 10)));
    renderRecentGames();
  } catch {
    $("recent-count").textContent = "Browser storage unavailable";
  }
}

function renderRecentGames() {
  const list = $("recent-games");
  let recent = [];

  try {
    recent = JSON.parse(localStorage.getItem("calcuchess-recent") || "[]");
  } catch {
    recent = [];
  }

  $("recent-count").textContent = `${recent.length} saved ${recent.length === 1 ? "game" : "games"}`;
  list.innerHTML = "";

  if (!recent.length) {
    list.innerHTML = `<div class="empty-state"><span class="empty-piece">♘</span><p>No games yet.</p><span>Import a game to start your analysis history.</span></div>`;
    return;
  }

  recent.forEach(item => {
    const row = document.createElement("div");
    row.className = "game-row";

    const main = document.createElement("div");
    main.className = "game-row-main";

    const title = document.createElement("div");
    title.className = "game-row-title";
    title.textContent = item.title || `${item.white || "White"} vs ${item.black || "Black"}`;

    const meta = document.createElement("div");
    meta.className = "game-row-meta";
    meta.textContent = `${item.source || "LOCAL"} · ${item.date || "Date unknown"}`;

    main.append(title, meta);

    const result = document.createElement("span");
    result.className = "game-row-result";
    result.textContent = item.result || "*";

    const open = document.createElement("button");
    open.className = "button button-outline button-small";
    open.textContent = "Review";
    open.addEventListener("click", () => loadPgn(item.pgn, item.source || "LOCAL", item.title || "Saved game", false));

    row.append(main, result, open);
    list.appendChild(row);
  });
}

function showOnlineResults(title) {
  $("online-results").classList.remove("hidden");
  $("results-title").textContent = title;
  $("online-games").innerHTML = "";
}

function renderOnlineGames(items, source, username) {
  const list = $("online-games");
  list.innerHTML = "";

  if (!items.length) {
    setOnlineStatus("No public games were found for that username.");
    return;
  }

  onlineGames = items;
  setOnlineStatus(`Showing ${items.length} games for ${username}.`, "success");

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "game-row";

    const main = document.createElement("div");
    main.className = "game-row-main";

    const title = document.createElement("div");
    title.className = "game-row-title";
    title.textContent = `${item.white || "White"} vs ${item.black || "Black"}`;

    const meta = document.createElement("div");
    meta.className = "game-row-meta";
    meta.textContent = `${source} · ${item.date || "Date unknown"} · ${item.timeControl || "Chess"}`;

    main.append(title, meta);

    const result = document.createElement("span");
    result.className = "game-row-result";
    result.textContent = item.result || "*";

    const open = document.createElement("button");
    open.className = "button button-green button-small";
    open.textContent = "Analyse";
    open.addEventListener("click", () => {
      if (item.pgn) loadPgn(item.pgn, source, `${item.white || "White"} vs ${item.black || "Black"}`);
      else setOnlineStatus("This game did not include a PGN.", "error");
    });

    row.append(main, result, open);
    list.appendChild(row);
  });
}

async function fetchChesscomGames(username) {
  const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();
  const archivesUrl = `https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername)}/games/archives`;
  const archivesResponse = await fetch(archivesUrl, { headers: { Accept: "application/json" } });

  if (!archivesResponse.ok) {
    if (archivesResponse.status === 404) throw new Error("Chess.com profile not found or unavailable.");
    if (archivesResponse.status === 429) throw new Error("Chess.com is temporarily rate-limiting requests. Try again shortly.");
    throw new Error(`Chess.com archives request failed (${archivesResponse.status}).`);
  }

  const archivesData = await archivesResponse.json();
  const archives = archivesData.archives || [];
  if (!archives.length) return [];

  const archiveResponse = await fetch(archives[archives.length - 1], { headers: { Accept: "application/json" } });
  if (!archiveResponse.ok) throw new Error(`Chess.com game archive request failed (${archiveResponse.status}).`);

  const archiveData = await archiveResponse.json();

  return (archiveData.games || []).slice().reverse().slice(0, 10).map(item => ({
    pgn: item.pgn || "",
    white: item.white?.username || "White",
    black: item.black?.username || "Black",
    result: item.white?.result === "win"
      ? "1-0"
      : item.black?.result === "win"
        ? "0-1"
        : item.white?.result === "agreed" || item.black?.result === "agreed"
          ? "½-½"
          : "*",
    date: item.end_time ? new Date(item.end_time * 1000).toISOString().slice(0, 10) : "",
    timeControl: item.time_class || "Chess"
  })).filter(item => item.pgn);
}

async function fetchLichessGames(username) {
  const endpoint = `https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=10&opening=true&pgnInJson=true`;
  const response = await fetch(endpoint, { headers: { Accept: "application/x-ndjson" } });

  if (!response.ok) {
    if (response.status === 404) throw new Error("Could not find that Lichess profile.");
    throw new Error("Could not retrieve games from Lichess.");
  }

  const body = await response.text();

  return body.split("\n").filter(line => line.trim()).map(line => {
    const item = JSON.parse(line);
    const white = item.players?.white || {};
    const black = item.players?.black || {};

    return {
      pgn: item.pgn || "",
      white: white.user?.name || white.name || "White",
      black: black.user?.name || black.name || "Black",
      result: item.winner === "white" ? "1-0" : item.winner === "black" ? "0-1" : "½-½",
      date: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "",
      timeControl: item.speed || "Chess"
    };
  }).filter(item => item.pgn);
}

async function searchOnlineGames(source, username) {
  const cleanUsername = username.trim().replace(/^@/, "");
  if (!cleanUsername) return;

  showOnlineResults(`${source} games`);
  setOnlineStatus(`Searching ${source}…`);

  const forms = document.querySelectorAll(".username-form button");
  forms.forEach(button => button.disabled = true);

  try {
    const gamesFound = source === "CHESS.COM"
      ? await fetchChesscomGames(cleanUsername)
      : await fetchLichessGames(cleanUsername);

    renderOnlineGames(gamesFound, source, cleanUsername);
  } catch (error) {
    setOnlineStatus(`${error.message} If the browser blocks the request, try importing a PGN file instead.`, "error");
  } finally {
    forms.forEach(button => button.disabled = false);
  }

  $("online-results").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function loadSample() {
  const sample = `[Event "CalcuChess Sample"]
[Site "CalcuChess"]
[Date "2026.01.01"]
[Round "-"]
[White "White"]
[Black "Black"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 *`;

  loadPgn(sample, "SAMPLE", "Sample game", false);
}

$("nav-home").addEventListener("click", () => showView("home"));
$("nav-analysis").addEventListener("click", () => showView("analysis"));
$("home-link").addEventListener("click", event => {
  event.preventDefault();
  showView("home");
});
$("quick-analysis").addEventListener("click", () => {
  showView("analysis");
  if (!moves.length) renderAnalysis();
});
$("back-home").addEventListener("click", () => showView("home"));

$("open-pgn").addEventListener("click", () => openImport("pgn"));
$("open-fen").addEventListener("click", () => openImport("fen"));
$("analysis-import").addEventListener("click", () => {
  showView("home");
  openImport("pgn");
});
$("close-import").addEventListener("click", () => $("import-panel").classList.add("hidden"));

document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => setImportMode(button.dataset.mode));
});

$("clear-input").addEventListener("click", () => {
  $("import-input").value = "";
  setStatus("");
  $("import-input").focus();
});

$("load-game").addEventListener("click", () => {
  const input = $("import-input").value.trim();
  if (importMode === "fen") loadFen(input);
  else loadPgn(input, "LOCAL", "Imported PGN");
});

$("import-input").addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") $("load-game").click();
});

$("chesscom-form").addEventListener("submit", event => {
  event.preventDefault();
  searchOnlineGames("CHESS.COM", $("chesscom-username").value);
});

$("lichess-form").addEventListener("submit", event => {
  event.preventDefault();
  searchOnlineGames("LICHESS", $("lichess-username").value);
});

$("clear-results").addEventListener("click", () => {
  $("online-results").classList.add("hidden");
  $("online-games").innerHTML = "";
});

$("first-move").addEventListener("click", () => goToPly(0));
$("previous-move").addEventListener("click", () => goToPly(currentPly - 1));
$("next-move").addEventListener("click", () => goToPly(currentPly + 1));
$("last-move").addEventListener("click", () => goToPly(moves.length));

$("flip-board").addEventListener("click", () => {
  flipped = !flipped;
  renderBoard();
});

$("reset-board").addEventListener("click", () => goToPly(0));
$("load-sample").addEventListener("click", loadSample);

$("export-pgn").addEventListener("click", () => {
  const blob = new Blob([makePgn()], { type: "application/x-chess-pgn;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "calcuchess-analysis.pgn";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.addEventListener("keydown", event => {
  if (event.target.matches("input, textarea, button, select")) return;
  if ($("analysis-view").classList.contains("hidden")) return;

  if (event.key === "ArrowLeft") goToPly(currentPly - 1);
  if (event.key === "ArrowRight") goToPly(currentPly + 1);
  if (event.key === "Home") goToPly(0);
  if (event.key === "End") goToPly(moves.length);
});

initStockfish();
renderRecentGames();
renderBoard();
renderMoveList();
renderPositionStatus();
updateControls();
updateEvaluation();
ensureMoveClassifications();