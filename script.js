document.addEventListener('DOMContentLoaded', () => {
const bigBoardEl = document.getElementById('big-board');
const messageEl = document.getElementById('message');

let smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
let bigBoard = Array(9).fill(null);
let currentPlayer = 'X';
let nextSmall = null;
let gameOver = false;

function checkWin(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // righe
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonne
    [0, 4, 8], [2, 4, 6]             // diagonali
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isFull(board) {
  return board.every(cell => cell !== null);
}

function makeMove(si, ci) {
  if (gameOver) return;
  if (nextSmall !== null && si !== nextSmall) return;
  if (smallBoards[si][ci] !== null) return;
  if (bigBoard[si] !== null) return;

  smallBoards[si][ci] = currentPlayer;

  const sbEl = document.querySelector(`.small-board[data-si="${si}"]`);
  const cellEl = sbEl.querySelector(`.cell[data-ci="${ci}"]`);
  cellEl.textContent = currentPlayer;
  cellEl.classList.add("taken");

  const winner = checkWin(smallBoards[si]);
  if (winner) {
    bigBoard[si] = winner;
    sbEl.classList.add(`won-${winner}`);
  } else if (isFull(smallBoards[si])) {
    bigBoard[si] = 'D'; // Draw
  }

  const gameWinner = checkWin(bigBoard);
  if (gameWinner) {
    messageEl.textContent = `🎉 Vince ${gameWinner}!`;
    gameOver = true;
    return;
  } else if (isFull(bigBoard)) {
    messageEl.textContent = `😐 Pareggio!`;
    gameOver = true;
    return;
  }

  nextSmall = bigBoard[ci] === null ? ci : null;
  highlightNextSmall();

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  messageEl.textContent = `Turno di ${currentPlayer}`;
}

function highlightNextSmall() {
  document.querySelectorAll('.small-board').forEach((el, index) => {
    el.style.outline = (nextSmall === null || index === nextSmall) && bigBoard[index] === null
      ? '3px solid orange'
      : 'none';
  });
}

function setupBoard() {
  for (let si = 0; si < 9; si++) {
    const sb = document.createElement('div');
    sb.className = 'small-board';
    sb.dataset.si = si;

    for (let ci = 0; ci < 9; ci++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.si = si;
      cell.dataset.ci = ci;
      cell.addEventListener('click', () => makeMove(si, ci));
      sb.appendChild(cell);
    }

    bigBoardEl.appendChild(sb);
  }
  highlightNextSmall();
  messageEl.textContent = `Turno di ${currentPlayer}`;
}

setupBoard();

});
