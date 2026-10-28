const BP_LEVELS = [
  { elo: 100, skill: 0, depth: 1, blunder: 0.55, label: "100", blurb: "Just learning the rules" },
  { elo: 200, skill: 0, depth: 1, blunder: 0.47, label: "200", blurb: "Beginner" },
  { elo: 400, skill: 1, depth: 1, blunder: 0.36, label: "400", blurb: "Casual beginner" },
  { elo: 800, skill: 4, depth: 2, blunder: 0.2, label: "800", blurb: "Club improver" },
  { elo: 1000, skill: 7, depth: 3, blunder: 0.14, label: "1000", blurb: "Solid club player" },
  { elo: 1200, skill: 10, depth: 4, blunder: 0.09, label: "1200", blurb: "Tactical club player" },
  { elo: 1600, skill: 15, depth: 8, blunder: 0.03, label: "1600", blurb: "Strong club player" },
  { elo: 2000, skill: 20, depth: 13, blunder: 0.01, label: "2000", blurb: "Expert" },
  { elo: 2200, skill: 20, depth: 17, blunder: 0, label: "2200", blurb: "Master level" }
];

const BP_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const BP_MSG = {
  checkmate: [
    "Checkmate! That is the whole point of the game — take the king. Beautiful finish!",
    "Checkmate! The king has no escape. That is how you close out a game.",
    "Mate! Lovely final move, the king is trapped with nowhere to run.",
    "Checkmate! You found the killer blow and every flight square is covered.",
    "That is mate! When the king is attacked and cannot flee, the game is over.",
    "Checkmate! Great vision spotting the final square. That is a win.",
    "Mate in one delivered! Superb — the king is attacked and boxed in.",
    "Checkmate! You cornered the king perfectly. That is the ultimate goal in chess.",
    "Checkmate on the board! Attacking the king with no escape is what every game is aiming for.",
    "That is checkmate — beautifully done. Keep hunting the king like that and you will win many games."
  ],
  stalemate: [
    "Stalemate — the game is a draw. Your opponent has no legal moves but is not in check.",
    "That is stalemate. No moves and no check means a draw. Leave the enemy king an escape square next time.",
    "Draw by stalemate. It happens when the opponent cannot move but is not in check.",
    "Stalemate! Technically a draw. If you were winning, give the lone king a bit of room.",
    "It ends stalemate, so the point is split. Keep the enemy king breathing room when converting a win.",
    "Stalemate — no check, no legal moves, draw. A classic lesson in precision with a big edge.",
    "That ends in stalemate. When hunting a lone king, always give the opponent one legal move.",
    "Draw by stalemate. Frustrating when ahead! The enemy king needs a legal move to avoid this.",
    "Stalemate ends the game with no winner. When you are ahead, always leave the enemy king one safe square.",
    "Draw by stalemate. A gentle reminder to keep counting the opponent's available squares at the end."
  ],
  castleK: [
    "Castling kingside! You tucked the king away and brought the rook toward the center.",
    "Short castle. This is one of the most valuable early moves: king safe, rook active.",
    "O-O! Your king is now shielded behind a wall of pawns. Great safety-first move.",
    "You castled short. The king finds safety and the rook joins the game.",
    "King-side castle complete. Safety first — the king is tucked in the corner.",
    "Castled on the king's side. This guards the king and connects your pieces. Well done!",
    "O-O! Getting the king out of the center early is a golden opening rule.",
    "Short castle — the king is safe and the rook is ready to fight for the center files.",
    "Short castle! The safest square for your king in the opening. Great habit.",
    "You castled kingside — the king breathes easy and the rook is ready to join the party."
  ],
  castleQ: [
    "Castling queenside! Long castle brings the king to the other side and a rook to the center.",
    "O-O-O — the king heads to the queenside while the rook grabs the d-file. Bold play!",
    "Queen-side castle! The rook lands on a central file and the king is tucked away.",
    "Long castle! This often signals opposite-side attacks. The king is safe on the flank.",
    "You castled queenside. The rook immediately eyes the center files. Nice.",
    "O-O-O! The king is sheltered and the rook is active. Keep pushing kingside pawns for attack.",
    "Queen-side castle done. A strong way to connect the rooks and secure the king.",
    "Long castle — king safe, rook centralized. A powerful multitasking move.",
    "Long castle! The king steps aside and the rook lands on a central file. Ambitious play.",
    "Queen-side castle done. Your king is sheltered while your rook eyes the center. Nice choice."
  ],
  great: [
    "What a move! The engine loves it — you grabbed a big advantage there.",
    "Brilliant! That is exactly the kind of move that wins games. Top marks.",
    "Excellent find! That significantly swings the position in your favor.",
    "Wow, strong move! You spotted something the engine really approves of.",
    "Superb! That is a genuinely powerful move — the evaluation jumped your way.",
    "Fantastic! You found a real resource. That is the move of a strong player.",
    "Incredible eye! That move grabs a decisive edge. Keep this up.",
    "That is a killer move! The evaluation shot up. Excellent calculation.",
    "Superb move — the kind of find that turns a normal game into a great one.",
    "That is excellent! You spotted a resource your opponent completely missed."
  ],
  best: [
    "That is the engine's top choice — perfect move selection!",
    "Excellent — exactly what the engine would play. Great preparation.",
    "Top engine move! You and the computer agree, which is always a good sign.",
    "Spot on! That is the strongest move in the position.",
    "The engine's first choice — nicely done. That keeps your advantage.",
    "Perfect move! Finding the engine's top line is no small feat.",
    "Great call — that is the best move available. Keep playing like this.",
    "Exactly right! The engine approves wholeheartedly.",
    "Perfect — that is exactly what the engine would play. Top-level move selection.",
    "Spot on! The engine agrees completely. Playing like that wins games."
  ],
  good: [
    "Nice move! That improves your position and keeps things healthy.",
    "Good choice — a solid, sensible move the engine likes.",
    "Well played! That is a strong, constructive move.",
    "Good! You are building your position nicely with that one.",
    "That is a positive move — the engine gives it the thumbs up.",
    "Nice. A strong move that improves your pieces and keeps your structure sound.",
    "Good job! That is a healthy move that helps your position.",
    "Solid and strong — the engine approves. Keep it up!",
    "A healthy, positive move. You are slowly building a better position.",
    "Nice choice — the engine approves and your position keeps improving."
  ],
  solid: [
    "A steady move. Nothing flashy, but it keeps your position sound.",
    "Safe and sensible. Sometimes the quiet moves are the best teachers.",
    "A reasonable, solid choice. You are keeping your structure together.",
    "Fine move. Nothing wrong with playing it safe and staying solid.",
    "A quiet, sensible move. Now look for ways to improve your worst-placed piece.",
    "OK, that keeps things tidy. Try to centralize your pieces and control more squares.",
    "A calm move. Keep developing and aim to control the center.",
    "Solid enough. Remember to get your pieces to active squares as the game opens up.",
    "Steady and safe. Quiet moves like this keep your position tidy while you look for a plan.",
    "A sensible, low-risk move. Now ask yourself: what is my worst piece doing?"
  ],
  blunder: [
    "Careful! That move gives away material — the opponent can simply take it. Check what your opponent can capture next.",
    "That is a blunder. You left something hanging. Before moving, ask: what did my opponent just attack?",
    "Ouch, that drops material. Good habit: after choosing a move, check the piece cannot be captured for free.",
    "That is a real mistake — it loses material. Try the checks, captures, threats scan before committing.",
    "Careful there! You left a piece undefended. Scan the board for your opponent's threats before moving.",
    "That hangs material. Friendly tip: glance at what the opponent's pieces attack right before you play.",
    "That is a blunder — the opponent wins material. Remember: safety first, then improvement.",
    "Unfortunately that loses material. Slow down and double-check your piece is defended where it lands.",
    "That drops material. A quick check of your opponent's captures before moving will save you next time.",
    "Ouch — a piece is left loose there. Remember the habit: look at what your opponent can take."
  ],
  mistake: [
    "That is a slight mistake — it gives your opponent a bit of an edge. Keep an eye on undefended pieces.",
    "Hmm, not the best. It costs some ground. Look for a move that also addresses your opponent's threats.",
    "That is a small error. The position is still playable — watch the opponent's active pieces.",
    "A bit loose. That concedes some advantage. Try to keep your pieces coordinated.",
    "That is a minor slip. It is recoverable — focus on defending your weak squares.",
    "Not ideal. You gave your opponent something to work with. Watch for tactical shots.",
    "A small mistake there. Reset and look for the safest, most active move next turn.",
    "That gives back a little ground. A quick blunder-check before moving helps you avoid this.",
    "A small slip that gives your opponent something to work with. Keep your pieces defended and coordinated.",
    "Not the best choice — you concede a little ground. Reset and look for a safer, more active move."
  ],
  inaccuracy: [
    "Slightly imprecise, but nothing serious. The position is still fine.",
    "A tiny inaccuracy. You keep a perfectly playable game — just a touch loose.",
    "Not the top choice, but it is minor. Chess is forgiving here.",
    "A small imprecision. No real harm done — keep going.",
    "That is slightly inaccurate, but you are still in good shape.",
    "Minor slip, nothing to worry about. Stay aware of your opponent's plans.",
    "A touch imprecise. The engine shrugs it off. Play on!",
    "Slightly off the best move, but perfectly fine. Keep the momentum going.",
    "Only a tiny inaccuracy — the game is very much still on. No need to worry.",
    "A slightly loose move, but nothing serious. Stay alert and keep playing your plan."
  ],
  capture: [
    "Good capture! You won material — always nice when a piece is free.",
    "Taken! Snapping up free material is one of the most satisfying things in chess.",
    "Great, you grabbed material. When your opponent leaves something undefended, take it.",
    "Capture! That wins material. Keep punishing loose pieces like that.",
    "Nicely done — you picked up material. Material wins games, so well spotted.",
    "You win material there. Always be ready to grab free pieces.",
    "Clean capture! Rewarding your opponent's oversight is exactly right.",
    "Taken! Winning material is often the first step toward winning the game.",
    "Clean capture! Taking free material is one of the most satisfying things in chess.",
    "You grabbed material there — well spotted. Punishing loose pieces wins games."
  ],
  badCapture: [
    "That capture backfires — the piece you took was defended and now you are down material.",
    "Careful! That capture loses material because the opponent recaptures favorably.",
    "Not a great trade. You took a defended piece and came out behind.",
    "That capture gives material back. Always count the defenders before you grab.",
    "Hmm, that trade costs you material. Check what recaptures before you take.",
    "That was a poisoned capture — the opponent wins material in the exchange.",
    "Watch out! Snapping that up let the opponent recapture with a gain.",
    "That capture hurts you. Count attackers versus defenders on the square first.",
    "That capture was a trap — the defender was waiting. Always count attackers before you take.",
    "Unfortunately the recapture goes in your opponent's favour. Check who guards a piece before grabbing it."
  ],
  recapture: [
    "Good recapture. You restored the material balance — that is important.",
    "You took it back. Keeping material even is a key defensive skill.",
    "Nice recapture. Always try to win back the piece when you can.",
    "Recaptured! You did not let the opponent keep the extra material.",
    "Solid — you took back and kept things level. Good awareness.",
    "That recapture keeps you in the game. Never ignore a chance to restore material.",
    "Good, you won the piece back. Balancing exchanges keeps you competitive.",
    "Recapture done. Staying even in material is often the priority.",
    "Good — you won the material straight back. Recapturing promptly keeps the balance.",
    "You took it back. Staying level in material is exactly what you want after an exchange."
  ],
  check: [
    "Check! Forcing moves are powerful — the opponent must respond to your threat.",
    "Nice check. Forcing the king to react can disrupt the opponent's plans.",
    "Check! You dictated the play there. Forcing moves are great teachers.",
    "A check! Remember, every check is a forcing move — look at what it sets up.",
    "Good check. It buys you a tempo and can expose the enemy king.",
    "Check! You are making the opponent answer to you. Keep up the pressure.",
    "Well-timed check. Forcing moves often reveal the opponent's weaknesses.",
    "Check! Use the tempo to improve your position on the next move.",
    "A forcing check! Your opponent has to answer you — use the free tempo to improve.",
    "Nice check. Forcing moves are the backbone of good combinations."
  ],
  promotion: [
    "Promotion! Your pawn reached the other side — a new queen is a huge advantage.",
    "Queening! Turning a pawn into a queen is one of the most rewarding moments in chess.",
    "You promoted! That extra firepower can decide the game on its own.",
    "A new queen! Great job escorting that pawn all the way up the board.",
    "Promotion! All that pawn-pushing paid off. Now use the new piece.",
    "The pawn promotes! Advancing passed pawns in the endgame is a fundamental skill.",
    "New queen on the board! That is usually the winning margin.",
    "Promoted! Driving a pawn to the last rank is textbook endgame technique.",
    "A brand-new queen! All that careful pawn pushing has paid off in style.",
    "Promotion! Turning a humble pawn into a queen is one of the great joys of chess."
  ],
  fork: [
    "Fork! Your piece attacks two enemies at once — a classic winning tactic.",
    "Beautiful fork! Attacking multiple pieces with one move wins material.",
    "That is a fork! Knights are famous for them. Great tactical eye.",
    "Fork! The opponent cannot save everything. That is how tactics win games.",
    "Nice double attack! A fork forces the opponent to give something up.",
    "Fork! Hitting two targets at once is a hallmark of sharp calculation.",
    "Excellent fork! You will win material because they can only move one piece.",
    "That is a textbook fork. Keep looking for these multi-piece attacks.",
    "Textbook fork! Two pieces attacked at once — your opponent can only save one.",
    "Lovely double attack. Forcing your opponent to choose which piece to lose is how tactics win games."
  ],
  pin: [
    "Pin! That piece cannot move without exposing something bigger behind it.",
    "Nice pin. The enemy piece is frozen — that is a powerful positional weapon.",
    "That is a pin! Restrictions like this slowly strangle the opponent.",
    "Pin! You are tying a piece down. Great way to limit your opponent's options.",
    "Good pin. The pinned piece is effectively stuck. Exploit it next moves.",
    "That is a lovely pin. Pins and skewers are the backbone of tactics.",
    "Pin! The opponent's piece is locked in place. Keep pressing the advantage.",
    "Excellent pin! Freezing a defender can set up a winning combination.",
    "Great pin — that piece is stuck defending something it cannot move away from.",
    "A firm pin. Keeping a key defender frozen can set up a winning idea later."
  ],
  skewer: [
    "Skewer! The front piece must move and exposes the one behind it.",
    "Nice skewer — a reverse pin that wins material when they step aside.",
    "That is a skewer! Attacking a valuable piece in front of another is deadly.",
    "Skewer! The opponent has to move the front piece and the back one falls.",
    "Great skewer. Forcing the front piece away wins what is behind it.",
    "That is a textbook skewer. Watch the material come your way.",
    "Skewer! A wonderful tactic — the front piece cannot stay to defend.",
    "Excellent skewer! This is how you convert a positional edge into material.",
    "Nice skewer! Move the front piece and what sits behind it falls right into your hands.",
    "That is a skewer in action — forcing the valuable piece to step aside. Enjoy the material."
  ],
  develop: [
    "Nice development! Getting pieces off the back rank is priority one in the opening.",
    "Good developing move. Active pieces control more of the board.",
    "Development! Bring your knights and bishops out before the big attacks.",
    "That develops a piece toward the center. Classic opening principles.",
    "Well developed. controlling the center with your minor pieces pays off.",
    "Good — piece activity first. Developing keeps your options flexible.",
    "Development move! Remember the opening checklist: control center, develop, castle.",
    "Nice, you brought a piece into the game. Centralized pieces are strong pieces.",
    "Good development! More active pieces means more control of the board.",
    "You brought another piece into the game. Keep clearing that back rank and your position will fly."
  ],
  centerPawn: [
    "Central pawn push! Pawns in the center control key squares and open lines.",
    "Good — staking a claim in the center. Central control is a core principle.",
    "That pawn strike at the center opens lines for your pieces. Nice.",
    "Central pawn advance! It grabs space and frees your bishops and queens.",
    "Nice central push. Fighting for e4/d4/e5/d5 is how strong games begin.",
    "You expanded in the center. Space plus development equals a great position.",
    "Central pawn move — it challenges the opponent and opens diagonals.",
    "Good central break. Controlling the middle gives your pieces room to breathe.",
    "A solid claim in the center. Space in the middle gives every piece more room to work.",
    "Central pawn play — you are fighting for the key squares. That is strong, classical chess."
  ],
  flankPawn: [
    "A flank pawn move. Useful sometimes, but keep an eye on the center.",
    "Wing pawn push. It can gain space, but do not neglect central control.",
    "That is a queenside/kingside pawn move. Reasonable for space, just stay central-minded.",
    "Flank advance. These can prepare attacks, but development still comes first.",
    "A wing pawn nudge. Fine for gaining room, but watch the middle of the board.",
    "Side pawn move. It can be useful to fix pawns or gain space on that flank.",
    "Pawn on the wing. Just make sure it supports your plans and not just a random push.",
    "Flank pawn push. Good for queenside space in some structures — stay aware of the center.",
    "A useful nudge on the wing. Just keep one eye on the center while you grab space out there.",
    "Wing pawn moves can prepare attacks later. Remember to come back to the middle afterwards."
  ],
  queenEarly: [
    "The queen came out early. It is powerful but can be chased by enemy pieces.",
    "Bringing the queen out early is risky — the opponent can attack it and gain time.",
    "Early queen move. It can work, but be ready for the opponent to harass it.",
    "The queen ventures out. Watch for knight and bishop moves that hit her with tempo.",
    "Early queen. Fine for quick attacks, but do not let it become a target.",
    "Queen out. Just be careful: every time the opponent attacks her, they develop a piece.",
    "That early queen can be strong if it has a safe square to retreat to.",
    "Queen developed early. Keep her on a square where she cannot be easily kicked around.",
    "The queen is out early. It is a powerful piece — make sure it has a safe square to fall back to.",
    "Early queen moves can work, but watch out for enemy knights and bishops chasing her with tempo."
  ],
  rookFile: [
    "Rook to a file! Placing rooks on open or semi-open files is key endgame/middlegame technique.",
    "Good rook placement. Rooks thrive on open files where they can penetrate.",
    "That rook eyes an open file. Classic principle — rooks belong on open lines.",
    "Nice, the rook takes up a good file. It can pressure pawns and invade.",
    "Rook on a file. This is how you activate your heavy pieces. Well done.",
    "Good rook move. Open files are the natural highways for rooks.",
    "The rook claims a file. Aim to double rooks or invade the seventh rank later.",
    "Rook to an open file — a hallmark of strong positional play.",
    "Nice rook placement on an open file. Rooks love empty files — they can roam and invade.",
    "Your rook takes up a good file. From there it can hit pawns and slide into the enemy camp."
  ],
  endgameKing: [
    "Good king activation! In the endgame the king becomes a strong fighting piece.",
    "The king steps up. Centralizing the king late is exactly right.",
    "Nice king move. In the endgame, an active king can decide the game.",
    "King to the center! Endgame rule: the king is a attacker, not just a defender.",
    "Well done activating the king. It supports pawns and controls key squares.",
    "The king joins the fight. That is endgame 101 — well applied.",
    "Good centralizing king move. It will help escort your pawns forward.",
    "King activity in the endgame is huge. Nice choice.",
    "The king joins the fight! In the endgame that is exactly where he belongs.",
    "Good centralizing king move. An active king often decides the result at the finish."
  ],
  retreat: [
    "A retreat. Sometimes stepping back keeps your piece safe and ready to redeploy.",
    "Backwards, but safe. Retreating to a better square is not always wrong.",
    "That pulls a piece back. Make sure it heads to a more useful post.",
    "Retreat move. If it avoids a trap or improves the piece, it is worthwhile.",
    "You stepped back. Just be sure the piece is heading somewhere more active.",
    "A withdrawal. Regrouping can be smart — now re-route it to a strong square.",
    "Piece retreat. If it was in danger, saving it was the right call.",
    "Back it goes. Try to find a square where the piece has more scope next turn.",
    "A sensible step back. Retreating to a stronger square keeps your piece safe and useful.",
    "No shame in going backwards — rerouting a piece to a better square is smart chess."
  ],
  tradeAhead: [
    "Trading while ahead! Simplifying with a material edge brings you closer to a win.",
    "Good trade. When you are ahead, swapping pieces reduces the opponent's counterplay.",
    "Smart exchange. Trading down is the classic way to convert a material advantage.",
    "You swapped pieces while ahead. Simplification is a winning technique.",
    "Nice — trading favors the side with more material. That is you right now.",
    "Good simplification. Fewer pieces on the board makes your extra material count more.",
    "Exchange accepted. Trading when ahead is mature, winning chess.",
    "Well traded. Keeping it simple with a material edge is exactly right.",
    "Smart trading! With extra material on the board, fewer pieces means an easier job for you.",
    "You simplified while ahead — the classic, professional way to bring the point home."
  ],
  tradeBehind: [
    "Careful — trading when you are behind gives up counterplay. Keep pieces on if you need chances.",
    "That trade may help the opponent who is ahead. As the defender, keep more pieces on.",
    "Trading down while behind makes the opponent's task easier. Try to keep tension.",
    "Consider avoiding trades when you trail in material — more pieces mean more chances.",
    "That swap eases the opponent's conversion. As the underdog, look for complications.",
    "Be cautious trading while behind. You want the position to stay chaotic.",
    "That exchange helps the side with more material. Keep pieces on and complicate.",
    "When behind, trades are usually the opponent's friend. Hold tension if you can.",
    "Careful — swaps help the side that is ahead. As the underdog, keep more pieces on and create chaos.",
    "While behind you usually want tension, not trades. Keep the position complicated if you can."
  ],
  firstMove: [
    "First move! Opening the game — a central pawn push like e4 or d4 is a great start.",
    "And we are off! 1.e4 or 1.d4 control the center and free your pieces.",
    "Opening move. Nice — controlling the center from move one is ideal.",
    "Good start! Develop a plan: control the center, get pieces out, castle.",
    "First move played. Try to build a pawn presence in the center early.",
    "The game begins! A central pawn move opens lines for the queen and bishop.",
    "Opening with a central claim. Solid first step — now keep developing.",
    "First move. Sets the tone — aim for quick development and king safety.",
    "And we are off! Control the center, develop your pieces, and get your king safe.",
    "A confident first move. Now follow the classic plan: center, develop, castle."
  ],
  shuffle: [
    "A waiting move. Try to give your pieces more purpose and activity.",
    "That shuffles without a clear plan. Look to improve your worst-placed piece.",
    "A quiet king move. In even positions, seek ways to seize the initiative.",
    "Not much gained there. Aim your moves at concrete targets or squares.",
    "That move is a bit aimless. Ask: which piece needs a better job?",
    "A waiting shuffle. Try to create threats instead of passing the turn.",
    "Little progress. Push a pawn, activate a rook, or improve your worst piece.",
    "A treading-water move. Look for the most active improving move you can find.",
    "A waiting move. Try to give every piece a more purposeful job next turn.",
    "A quiet shuffle — look around for the piece doing the least work and improve it."
  ],
  fallback: [
    "Played. Keep focusing on development, central control, and king safety.",
    "A move on the board. Now scan: what is your opponent's biggest threat?",
    "OK. Try to give every move a clear purpose — attack, defend, or improve.",
    "Noted. Remember the hierarchy: don't hang pieces, then improve your position.",
    "Fine. Look for the most active square for each of your pieces.",
    "You moved. Keep asking which of your pieces is doing the least work.",
    "Played. Stay alert to tactics and keep your pieces coordinated.",
    "Alright. Each move, weigh checks, captures, and threats before you commit.",
    "Played. Keep weighing checks, captures, and threats on every turn.",
    "A move on the board. Stay alert, keep your pieces coordinated, and enjoy the game."
  ]
};

let bpWorker = null;
let bpReady = false;
let bpQueue = [];
let bpCurrent = null;

let bpGame = null;
let bpPlayer = "w";
let bpLevel = BP_LEVELS[4];
let bpPhase = "setup";
let bpSelected = null;
let bpTargets = [];
let bpLastMove = null;
let bpHistory = [];
let bpToken = 0;
let bpPromoPending = null;
let bpPreEval = null;
let bpStats = { moves: 0, blunders: 0, mistakes: 0, inaccuracies: 0, greats: 0 };
let bpCats = [];
let bpBoardFlipped = false;

function bpSqToRC(sq) {
  return { r: 8 - Number(sq[1]), c: sq.charCodeAt(0) - 97 };
}
function bpRCToSq(r, c) {
  return String.fromCharCode(97 + c) + (8 - r);
}
function bpGet(board, r, c) {
  if (r < 0 || r > 7 || c < 0 || c > 7) return undefined;
  return board[r][c];
}
function bpShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function bpPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function bpMaterial(game, color) {
  let total = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) total += BP_VALUES[p.type] || 0;
    }
  return total;
}
function bpPlayerPlyCount() {
  if (!bpGame) return 0;
  return bpGame.history({ verbose: true }).filter(m => m.color === bpPlayer).length;
}
function bpRecount() {
  bpStats = { moves: bpCats.length, blunders: 0, mistakes: 0, inaccuracies: 0, greats: 0 };
  for (const c of bpCats) {
    if (c === "blunder") bpStats.blunders++;
    else if (c === "mistake") bpStats.mistakes++;
    else if (c === "inaccuracy") bpStats.inaccuracies++;
    else if (c === "great") bpStats.greats++;
  }
}

function bpAttacks(board, from, piece) {
  const { r, c } = bpSqToRC(from);
  const color = piece.color;
  const enemy = color === "w" ? "b" : "w";
  const out = [];
  const push = (rr, cc) => {
    const p = bpGet(board, rr, cc);
    if (!p) return true;
    if (p.color === enemy) out.push(bpRCToSq(rr, cc));
    return false;
  };
  const ray = dirs => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
        const p = board[rr][cc];
        if (p) {
          if (p.color === enemy) out.push(bpRCToSq(rr, cc));
          break;
        }
        rr += dr; cc += dc;
      }
    }
  };
  const R = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const B = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  if (piece.type === "p") {
    const dir = color === "w" ? 1 : -1;
    if (c - 1 >= 0 && bpGet(board, r + dir, c - 1) && bpGet(board, r + dir, c - 1).color === enemy) out.push(bpRCToSq(r + dir, c - 1));
    if (c + 1 <= 7 && bpGet(board, r + dir, c + 1) && bpGet(board, r + dir, c + 1).color === enemy) out.push(bpRCToSq(r + dir, c + 1));
  } else if (piece.type === "n") {
    for (const [dr, dc] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) push(r + dr, c + dc);
  } else if (piece.type === "k") {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; push(r + dr, c + dc); }
  } else if (piece.type === "r") ray(R);
  else if (piece.type === "b") ray(B);
  else if (piece.type === "q") ray(R.concat(B));
  return out;
}

function bpDetectTactics(game, from, to, piece) {
  const board = game.board();
  const enemy = piece.color === "w" ? "b" : "w";
  const targets = bpAttacks(board, to, piece).map(sq => game.get(sq)).filter(Boolean).filter(p => p.color === enemy);
  const significant = targets.filter(p => p.type !== "p");
  const hitsKingOrBig = targets.some(p => p.type === "k" || p.type === "q" || p.type === "r");
  if (targets.length >= 2 && (hitsKingOrBig || significant.length >= 2)) return "fork";

  if (piece.type === "r" || piece.type === "b" || piece.type === "q") {
    const { r, c } = bpSqToRC(to);
    const dirs = piece.type === "r" ? [[1, 0], [-1, 0], [0, 1], [0, -1]]
      : piece.type === "b" ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
      : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc, first = null;
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
        const p = board[rr][cc];
        if (p) { first = { p, rr, cc }; break; }
        rr += dr; cc += dc;
      }
      if (!first || first.p.color !== enemy) continue;
      const nr = first.rr + dr, nc = first.cc + dc;
      const next = bpGet(board, nr, nc);
      if (first.p.type === "k" && next && next.color === enemy) return "skewer";
      if (next && next.type === "k" && next.color === enemy) return "pin";
    }
  }
  return null;
}

function bpInitWorker() {
  try {
    bpWorker = new Worker("./stockfish/stockfish-19-lite-single.js");
    bpWorker.onmessage = e => bpOnMessage(String(e.data || "").trim());
    bpWorker.onerror = () => { bpReady = false; };
    bpWorker.postMessage("uci");
  } catch {
    bpReady = false;
  }
}

function bpOnMessage(line) {
  if (line === "uciok") { bpWorker.postMessage("isready"); return; }
  if (line === "readyok") { bpReady = true; bpPump(); return; }
  if (!bpCurrent) return;
  if (line.startsWith("info ")) {
    const mp = line.match(/\bmultipv (\d+)/);
    const idx = mp ? Number(mp[1]) : 1;
    const sc = line.match(/\bscore (cp|mate) (-?\d+)/);
    const pv = line.match(/\bpv (.+)$/);
    if (sc && pv) {
      bpCurrent.lines.set(idx, {
        uci: pv[1].trim().split(/\s+/)[0],
        type: sc[1],
        val: Number(sc[2])
      });
    }
    return;
  }
  if (line.startsWith("bestmove ")) {
    const bm = line.split(/\s+/)[1];
    const lines = Array.from(bpCurrent.lines.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
    bpCurrent.resolve({ bestmove: bm, lines });
    bpCurrent = null;
    bpPump();
  }
}

function bpPump() {
  if (!bpReady || bpCurrent || !bpWorker) return;
  const job = bpQueue.shift();
  if (!job) return;
  bpCurrent = { lines: new Map(), resolve: job.resolve };
  if (job.options) for (const o of job.options) bpWorker.postMessage(o);
  bpWorker.postMessage(`position fen ${job.fen}`);
  bpWorker.postMessage(`go depth ${job.depth}`);
}

function bpSearch(fen, depth, options) {
  return new Promise(resolve => {
    bpQueue.push({ fen, depth, options, resolve });
    bpPump();
  });
}

function bpApplyLevel(level) {
  return [`setoption name Skill Level value ${level.skill}`, "setoption name MultiPV value 4"];
}

function bpWhitePov(line, turn) {
  if (line.type === "mate") {
    const m = line.val;
    const mateIn = m > 0 ? (turn === "w" ? m : -(Math.abs(m) + 1)) : (turn === "w" ? m : Math.abs(m) - 1);
    return { mate: mateIn, cp: mateIn > 0 ? 100000 : -100000 };
  }
  const cp = turn === "w" ? line.val : -line.val;
  return { cp };
}

async function bpBotMove() {
  const token = bpToken;
  const fen = bpGame.fen();
  const level = bpLevel;
  let result;
  try {
    result = await bpSearch(fen, level.depth, bpApplyLevel(level));
  } catch {
    return;
  }
  if (token !== bpToken) return;

  let choice = result.bestmove;
  const roll = Math.random();
  if (roll < level.blunder) {
    const legal = bpGame.moves({ verbose: true });
    if (level.elo <= 400) {
      const m = bpPick(legal);
      choice = m.from + m.to + (m.promotion || "");
    } else {
      const alts = result.lines.slice(1).map(l => l.uci);
      if (alts.length && Math.random() < 0.7) choice = bpPick(alts);
      else { const m = bpPick(legal); choice = m.from + m.to + (m.promotion || ""); }
    }
  }

  const from = choice.slice(0, 2);
  const to = choice.slice(2, 4);
  const promo = choice.slice(4) || "q";
  let played = null;
  try { played = bpGame.move({ from, to, promotion: promo }); } catch { played = null; }
  if (!played) {
    const legal = bpGame.moves({ verbose: true });
    if (!legal.length) return;
    const m = bpPick(legal);
    played = bpGame.move({ from: m.from, to: m.to, promotion: m.promotion || "q" });
  }
  if (!played) return;

  bpHistory.push({ san: played.san, color: played.color });
  bpLastMove = { from: played.from, to: played.to };
  bpPreEval = null;
  bpRender();

  if (bpCheckGameEnd()) return;
  if (bpGame.turn() === bpPlayer) {
    bpPhase = "playing";
    bpSetStatus(`Opponent played ${played.san}. Your move.`, "neutral");
    bpRender();
    bpPreEval = await bpEvalCurrent();
  }
}

async function bpEvalCurrent() {
  if (!bpReady || !bpGame) return null;
  const token = bpToken;
  const fen = bpGame.fen();
  const turn = bpGame.turn();
  try {
    const res = await bpSearch(fen, 8, ["setoption name Skill Level value 20", "setoption name MultiPV value 1"]);
    if (token !== bpToken) return null;
    const top = res.lines[0];
    if (!top) return null;
    const pov = bpWhitePov(top, turn);
    if (top.uci) pov.uci = top.uci;
    return pov;
  } catch { return null; }
}

function bpContext(move) {
  const hist = bpGame.history({ verbose: true });
  if (hist.length === 1) return "firstMove";
  const piece = bpGame.get(move.to);
  if (!piece) return null;
  const fromRank = Number(move.from[1]);
  const toRank = Number(move.to[1]);
  const backward = piece.color === "w" ? toRank < fromRank : toRank > fromRank;
  if (piece.type === "p") {
    const file = move.to[0];
    return file === "d" || file === "e" ? "centerPawn" : "flankPawn";
  }
  if (piece.type === "q") {
    if (backward) return "retreat";
    if (hist.length <= 20) return "queenEarly";
    return null;
  }
  if (piece.type === "r") {
    const board = bpGame.board();
    const c = move.to.charCodeAt(0) - 97;
    let friendlyPawn = false;
    for (let r = 0; r < 8; r++) {
      const p = board[r][c];
      if (p && p.type === "p" && p.color === piece.color) { friendlyPawn = true; break; }
    }
    return friendlyPawn ? null : "rookFile";
  }
  if (piece.type === "n" || piece.type === "b") {
    const homeRank = piece.color === "w" ? "1" : "8";
    if (move.from[1] === homeRank) return "develop";
    return backward ? "retreat" : null;
  }
  if (piece.type === "k") {
    const board = bpGame.board();
    let queens = 0, heavies = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.type === "p" || p.type === "k") continue;
        if (p.type === "q") queens++;
        heavies++;
      }
    if (queens === 0 && heavies <= 6) return "endgameKing";
    return "shuffle";
  }
  return null;
}

function bpClassify(move, beforeEval, afterEval) {
  if (bpGame.in_checkmate()) return "checkmate";
  if (bpGame.in_stalemate()) return "stalemate";
  if (move.flags && move.flags.indexOf("k") !== -1) return "castleK";
  if (move.flags && move.flags.indexOf("q") !== -1) return "castleQ";
  if (move.promotion) return "promotion";

  let swing = null;
  if (beforeEval && afterEval && typeof beforeEval.cp === "number" && typeof afterEval.cp === "number") {
    swing = move.color === "w" ? beforeEval.cp - afterEval.cp : afterEval.cp - beforeEval.cp;
    if (!Number.isFinite(swing)) swing = null;
  }

  if (swing !== null && swing >= 250) return "blunder";

  const tactics = bpDetectTactics(bpGame, move.to, move.to, bpGame.get(move.to) || { type: move.piece, color: move.color });
  const tacticSafe = swing === null || swing < 60;
  if (tacticSafe) {
    if (tactics === "fork") return "fork";
    if (tactics === "pin") return "pin";
    if (tactics === "skewer") return "skewer";
  }

  const playedUci = move.from + move.to + (move.promotion || "");
  if (beforeEval && beforeEval.uci && beforeEval.uci === playedUci) return "best";

  if (move.captured) {
    if (swing !== null && swing >= 40) return "badCapture";
    const hist = bpGame.history({ verbose: true });
    const prev = hist.length >= 2 ? hist[hist.length - 2] : null;
    if (prev && prev.captured && prev.to === move.to && prev.color !== move.color) return "recapture";
    const ourMat = bpMaterial(bpGame, move.color);
    const theirMat = bpMaterial(bpGame, move.color === "w" ? "b" : "w");
    const preLead = ourMat - (BP_VALUES[move.captured] || 0) - theirMat;
    if (preLead >= 200) return "tradeAhead";
    if (preLead <= -200) return "tradeBehind";
    return "capture";
  }

  if (swing !== null && swing >= 120) return "blunder";
  if (swing !== null && swing >= 60) return "mistake";
  if (swing !== null && swing >= 25) return "inaccuracy";

  if (swing !== null && swing <= -150) return "great";
  if (bpGame.in_check()) return "check";

  const ctx = bpContext(move);
  if (ctx) return ctx;

  if (swing !== null && swing <= -80) return "great";
  if (swing !== null && swing <= -25) return "good";
  return Math.random() < 0.5 ? "solid" : "fallback";
}

function bpSetStatus(message, kind) {
  const el = document.getElementById("bp-status");
  if (!el) return;
  el.textContent = message;
  el.className = "depth-status " + (kind || "neutral");
}

function bpShowCoach(category) {
  const bank = BP_MSG[category] || BP_MSG.fallback;
  const text = bpPick(bank);
  const el = document.getElementById("bp-coach");
  if (!el) return;
  el.innerHTML = `<span class="bp-coach-tag">${bpCategoryLabel(category)}</span><p>${text}</p>`;
}
function bpCategoryLabel(cat) {
  const map = {
    checkmate: "Checkmate", stalemate: "Stalemate", castleK: "Castling", castleQ: "Castling",
    great: "Great move", best: "Best move", good: "Good move", solid: "Solid",
    blunder: "Blunder", mistake: "Mistake", inaccuracy: "Inaccuracy", capture: "Winning material",
    badCapture: "Bad trade", recapture: "Recapture", check: "Check", promotion: "Promotion",
    fork: "Fork", pin: "Pin", skewer: "Skewer", develop: "Development", centerPawn: "Center control",
    flankPawn: "Wing pawn", queenEarly: "Early queen", rookFile: "Rook activity", endgameKing: "King activity",
    tradeAhead: "Good trade", tradeBehind: "Risky trade", firstMove: "Opening", shuffle: "Waiting move", fallback: "Move played"
  };
  return map[cat] || "Move";
}

function bpCheckGameEnd() {
  if (bpGame.in_checkmate()) {
    const winner = bpGame.turn() === "w" ? "b" : "w";
    bpPhase = "over";
    if (winner === bpPlayer) bpShowOverlay("win");
    else bpShowOverlay("lose");
    bpSetStatus(winner === bpPlayer ? "Checkmate — you won!" : "Checkmate — the bot got you.", winner === bpPlayer ? "ok" : "danger");
    bpRender();
    return true;
  }
  if (bpGame.in_stalemate()) { bpPhase = "over"; bpShowOverlay("draw"); bpSetStatus("Stalemate — draw.", "neutral"); bpRender(); return true; }
  if (bpGame.in_draw()) { bpPhase = "over"; bpShowOverlay("draw"); bpSetStatus("Draw.", "neutral"); bpRender(); return true; }
  return false;
}

function bpHandleSquare(square) {
  if (bpPhase !== "playing" || !bpGame || bpGame.turn() !== bpPlayer) return;
  const piece = bpGame.get(square);
  if (bpSelected) {
    const target = bpTargets.find(m => m.to === square);
    if (target) { bpAttemptMove(bpSelected, square, target); return; }
    if (piece && piece.color === bpPlayer) { bpSelect(square); return; }
    bpSelected = null; bpTargets = []; bpRenderBoard(); return;
  }
  if (piece && piece.color === bpPlayer) bpSelect(square);
}

function bpSelect(square) {
  bpSelected = square;
  bpTargets = bpGame.moves({ square, verbose: true });
  bpRenderBoard();
}

function bpAttemptMove(from, to, target) {
  const piece = bpGame.get(from);
  const isPromo = Boolean(target.promotion) || (piece && piece.type === "p" && to[1] === (bpPlayer === "w" ? "8" : "1"));
  if (isPromo) { bpPromoPending = { from, to }; document.getElementById("bp-promo").classList.remove("hidden"); return; }
  bpPlayMove(from, to, null);
}

async function bpPlayMove(from, to, promotion) {
  const token = bpToken;
  const beforeEval = bpPreEval;
  let played;
  try { played = bpGame.move({ from, to, promotion: promotion || "q" }); } catch { played = null; }
  if (!played) { bpSelected = null; bpTargets = []; bpRenderBoard(); return; }

  bpSelected = null; bpTargets = [];
  bpLastMove = { from: played.from, to: played.to };
  bpHistory.push({ san: played.san, color: played.color });
  bpPhase = "bot";
  bpSetStatus("Opponent is thinking…", "thinking");
  bpRender();

  const afterEval = await bpEvalCurrent();
  if (token !== bpToken) return;
  const cat = bpClassify(played, beforeEval, afterEval);
  bpCats.push(cat);
  bpRecount();
  bpShowCoach(cat);

  if (bpCheckGameEnd()) return;
  bpPreEval = afterEval;
  await bpBotMove();
}

function bpUndo() {
  if (!bpGame || !bpGame.history().length) return;
  bpToken++;
  const token = bpToken;
  let undone = 0;
  if (bpGame.turn() === bpPlayer && bpGame.history().length >= 2) {
    bpGame.undo(); bpGame.undo(); undone = 2;
  } else if (bpGame.turn() !== bpPlayer) {
    bpGame.undo(); undone = 1;
  } else {
    bpGame.undo(); undone = 1;
  }
  if (undone >= 1) {
    bpHistory = bpGame.history();
    bpLastMove = null;
    const hist = bpGame.history({ verbose: true });
    if (hist.length) bpLastMove = { from: hist[hist.length - 1].from, to: hist[hist.length - 1].to };
  }
  bpCats.splice(bpPlayerPlyCount());
  bpRecount();
  bpSelected = null; bpTargets = []; bpPreEval = null;
  if (bpGame.turn() !== bpPlayer) {
    bpPhase = "bot";
    bpSetStatus("Opponent is thinking…", "thinking");
    bpRender();
    bpBotMove();
    return;
  }
  bpPhase = "playing";
  bpSetStatus("Move taken back. Your move.", "neutral");
  bpRender();
  bpEvalCurrent().then(v => {
    if (token === bpToken && bpPhase === "playing") bpPreEval = v;
  });
}

function bpNewGame(level, player) {
  bpToken++;
  bpLevel = level || bpLevel;
  bpPlayer = player || bpPlayer;
  bpGame = new Chess();
  bpPhase = "playing";
  bpSelected = null; bpTargets = []; bpLastMove = null; bpHistory = [];
  bpPromoPending = null; bpPreEval = null;
  bpCats = [];
  bpStats = { moves: 0, blunders: 0, mistakes: 0, inaccuracies: 0, greats: 0 };
  bpBoardFlipped = bpPlayer === "b";
  const promo = document.getElementById("bp-promo");
  if (promo) promo.classList.add("hidden");
  bpHideOverlay();
  bpSetStatus(bpPlayer === "w" ? "You are White. Your move." : "You are Black. The bot opens.", "neutral");
  bpRender();
  if (bpPlayer === "b") { bpPhase = "bot"; bpRender(); bpBotMove(); }
  else {
    const token = bpToken;
    bpEvalCurrent().then(v => {
      if (token === bpToken && bpPhase === "playing") bpPreEval = v;
    });
  }
}

function bpRender() {
  bpRenderBoard();
  bpRenderSidebar();
}

function bpRenderBoard() {
  const board = document.getElementById("bp-board");
  if (!board) return;
  board.innerHTML = "";
  const matrix = bpGame ? bpGame.board() : null;
  const files = "abcdefgh";
  const ranks = bpBoardFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileList = bpBoardFlipped ? "hgfedcba".split("") : files.split("");
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
      if (bpLastMove && (bpLastMove.from === sq || bpLastMove.to === sq)) square.classList.add("last-move");
      if (bpSelected === sq) square.classList.add("selected");
      if (bpTargets.some(m => m.to === sq)) square.classList.add(piece ? "legal-capture" : "legal-target");
      if (piece) {
        const span = document.createElement("span");
        span.className = "piece " + (piece.color === "w" ? "piece-white" : "piece-black");
        span.textContent = PIECES[piece.color + piece.type];
        square.appendChild(span);
      }
      const showFile = bpBoardFlipped ? rank === 1 : rank === 8;
      const showRank = bpBoardFlipped ? file === "a" : file === "h";
      if (showFile || showRank) {
        const coord = document.createElement("span");
        coord.className = "square-coordinate";
        coord.textContent = showFile && showRank ? sq : showFile ? file : rank;
        square.appendChild(coord);
      }
      square.addEventListener("click", () => bpHandleSquare(sq));
      board.appendChild(square);
    }
  }
  if (bpGame && bpGame.in_check()) {
    const turn = bpGame.turn();
    let kingSq = null;
    for (let r = 0; r < 8 && !kingSq; r++) for (let c = 0; c < 8; c++) {
      const p = matrix[r][c];
      if (p && p.type === "k" && p.color === turn) { kingSq = String.fromCharCode(97 + c) + (8 - r); break; }
    }
    if (kingSq) { const el = board.querySelector(`[data-square="${kingSq}"]`); if (el) el.classList.add("in-check"); }
  }
}

function bpRenderSidebar() {
  const moveList = document.getElementById("bp-move-list");
  if (!moveList) return;
  moveList.innerHTML = "";
  const hist = bpGame ? bpGame.history() : [];
  if (!hist.length) { moveList.innerHTML = '<p class="move-list-empty">No moves yet.</p>'; }
  else {
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
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set("bp-level-label", "Bot " + bpLevel.label + " · " + bpLevel.blurb);
  set("bp-you-label", bpPlayer === "w" ? "You (White)" : "You (Black)");
  set("bp-moves-row", String(bpStats.moves));
  set("bp-blunders-row", String(bpStats.blunders));
  set("bp-mistakes-row", String(bpStats.mistakes));
  set("bp-greats-row", String(bpStats.greats));
  set("bp-move-count", hist.length + " plies");
}

function bpShowOverlay(kind) {
  const overlay = document.getElementById("bp-overlay");
  const card = document.getElementById("bp-overlay-card");
  if (!overlay || !card) return;
  overlay.classList.remove("hidden");
  if (kind === "win") card.innerHTML = `<p class="depth-eyebrow">VICTORY</p><h2>You beat the bot!</h2><p>Checkmate against the ${bpLevel.label} bot. You played ${bpStats.moves} moves with ${bpStats.blunders} blunder(s).</p><div class="depth-actions"><button class="button button-green" id="bp-again">Play again</button><button class="button button-outline" id="bp-change">Change opponent</button></div>`;
  else if (kind === "lose") card.innerHTML = `<p class="depth-eyebrow">DEFEAT</p><h2>The bot wins this one</h2><p>Checkmate against the ${bpLevel.label} bot. A great learning game — try again and watch for the tactics.</p><div class="depth-actions"><button class="button button-green" id="bp-again">Play again</button><button class="button button-outline" id="bp-change">Change opponent</button></div>`;
  else card.innerHTML = `<p class="depth-eyebrow">DRAW</p><h2>Drawn game</h2><p>A balanced battle against the ${bpLevel.label} bot. Well fought!</p><div class="depth-actions"><button class="button button-green" id="bp-again">Play again</button><button class="button button-outline" id="bp-change">Change opponent</button></div>`;
  const again = document.getElementById("bp-again");
  const change = document.getElementById("bp-change");
  if (again) again.addEventListener("click", () => bpNewGame(bpLevel, bpPlayer));
  if (change) change.addEventListener("click", () => bpShowSetup());
}
function bpHideOverlay() {
  const overlay = document.getElementById("bp-overlay");
  if (overlay) overlay.classList.add("hidden");
}

function bpShowSetup() {
  bpToken++;
  bpPhase = "setup";
  const overlay = document.getElementById("bp-overlay");
  const card = document.getElementById("bp-overlay-card");
  if (!overlay || !card) return;
  overlay.classList.remove("hidden");
  overlay.classList.add("light");
  let buttons = BP_LEVELS.map(l => `<button class="bp-level-btn" data-elo="${l.elo}"><strong>${l.label}</strong><span>${l.blurb}</span></button>`).join("");
  card.innerHTML = `<p class="depth-eyebrow">PLAY AGAINST STOCKFISH</p><h2>Choose your opponent</h2><p>Pick a bot strength, then choose your side. Every move gets friendly coaching to help you improve.</p><div class="bp-level-grid">${buttons}</div><div class="bp-color-row"><button class="button button-outline" data-color="w">Play White</button><button class="button button-outline" data-color="b">Play Black</button><button class="button button-outline" data-color="r">Random side</button></div>`;
  overlay.querySelectorAll(".bp-level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = BP_LEVELS.find(l => String(l.elo) === btn.dataset.elo);
      overlay.querySelectorAll(".bp-level-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      bpLevel = lvl;
    });
  });
  overlay.querySelectorAll("[data-color]").forEach(btn => {
    btn.addEventListener("click", () => {
      let color = btn.dataset.color;
      if (color === "r") color = Math.random() < 0.5 ? "w" : "b";
      overlay.classList.remove("light");
      bpNewGame(bpLevel, color);
    });
  });
}

function bpWire() {
  const nav = document.getElementById("nav-bot");
  if (nav) nav.addEventListener("click", () => { showView("bot"); if (bpPhase === "setup" || !bpGame) bpShowSetup(); });
  const playBot = document.getElementById("play-bot");
  if (playBot) playBot.addEventListener("click", () => { showView("bot"); bpShowSetup(); });
  const back = document.getElementById("bp-back");
  if (back) back.addEventListener("click", () => showView("home"));
  const undo = document.getElementById("bp-undo");
  if (undo) undo.addEventListener("click", bpUndo);
  const newBtn = document.getElementById("bp-new");
  if (newBtn) newBtn.addEventListener("click", () => bpShowSetup());
  const flip = document.getElementById("bp-flip");
  if (flip) flip.addEventListener("click", () => { bpBoardFlipped = !bpBoardFlipped; bpRenderBoard(); });
  const promo = document.getElementById("bp-promo");
  if (promo) promo.addEventListener("click", e => {
    const btn = e.target.closest("button[data-promo]");
    if (!btn || !bpPromoPending) return;
    const p = btn.dataset.promo;
    const pending = bpPromoPending;
    bpPromoPending = null;
    promo.classList.add("hidden");
    if (!p) { bpSelected = null; bpTargets = []; bpRenderBoard(); return; }
    bpPlayMove(pending.from, pending.to, p);
  });
}

bpInitWorker();
bpWire();
