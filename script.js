

document.addEventListener('DOMContentLoaded', () => {

    const bigBoardEl = document.getElementById('big-board');
    const messageEl = document.getElementById('message');

    let smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
    let bigBoard = Array(9).fill(null);
    let currentPlayer = 'X';
    let nextSmallTris = null;
    let gameOver = false;

    function checkWin(board) {
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // righe
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonne
            [0, 4, 8], [2, 4, 6]             // diagonali
        ];

        for (let [a, b, c] of winningLines) {
            if (board[a] === board[b] && board[a] === board[c] && board[a] !== null) {
                return board[a];
            }
        }

        return null;
    }

    function isFull(board) {
        return board.every(cell => cell !== null);
    }

    function makeMove(smallIndex, cellIndex) {
        // Check if the game is over or if the move is invalid
        if (gameOver) return;
        if (nextSmallTris !== null && smallIndex !== nextSmallTris) return;
        if (smallBoards[smallIndex][cellIndex] !== null) return;
        if (bigBoard[smallIndex] !== null) return;

        // Make the move
        smallBoards[smallIndex][cellIndex] = currentPlayer;

        // Update the small board and check for a win
        const smallBoardEl = document.querySelector(`.small-board[data-si="${smallIndex}"]`);
        const cellEl = smallBoardEl.querySelector(`.cell[data-ci="${cellIndex}"]`);
        cellEl.textContent = currentPlayer;
        cellEl.classList.add("taken");

        // Check if the small board is won or drawn
        const winner = checkWin(smallBoards[smallIndex]);
        if (winner) {
            bigBoard[smallIndex] = winner;
            smallBoardEl.classList.add(`won-${winner}`);
        } else if (isFull(smallBoards[smallIndex])) {
            bigBoard[smallIndex] = 'D'; // Draw
        }

        // Check if the big board is won or drawn
        const gameWinner = checkWin(bigBoard);
        if (gameWinner) {
            messageEl.textContent = `The winner is: ${gameWinner}!`;
            gameOver = true;
            return;
        } else if (isFull(bigBoard)) {
            messageEl.textContent = `It's a draw!`;
            gameOver = true;
            return;
        }

        // Update the next small board to play in
        if (!isFull(bigBoard[cellIndex])) {
            nextSmallTris = cellIndex;
        } else {
            nextSmallTris = null; // If the next small board is full, reset to null (any small board can be played)
        }
        highlightNextSmall();

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        messageEl.textContent = `Current Player ${currentPlayer}`;
    }

    function highlightNextSmall() {
        document.querySelectorAll('.small-board').forEach((el, index) => {
            el.style.outline = (nextSmallTris === null || index === nextSmallTris) && bigBoard[index] === null
            ? '3px solid orange'
            : 'none';
        });
    }

    function setupBoard() {
        for (let smallIndex = 0; smallIndex < 9; smallIndex++) {
            const sb = document.createElement('div');
            sb.className = 'small-board';
            sb.dataset.si = smallIndex;

            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.si = smallIndex;
                cell.dataset.ci = cellIndex;
                cell.addEventListener('click', () => makeMove(smallIndex, cellIndex));
                sb.appendChild(cell);
            }

            bigBoardEl.appendChild(sb);
        }

        highlightNextSmall();
        messageEl.textContent = `Current player ${currentPlayer}`;
    }

    setupBoard();

});
