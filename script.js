document.addEventListener('DOMContentLoaded', () => {
    const bigBoardEl = document.getElementById('big-board');
    const messageEl = document.getElementById('message');

    // Initialize 9 small boards, each with 9 cells
    let smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
    // Initialize the big board to track the winners of each small board
    let bigBoard = Array(9).fill(null);
    // Randomly choose the starting player
    let currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    // The next small board the player must play in (null = free choice)
    let nextSmallTris = null;
    // Track whether the game is over
    let gameOver = false;

    // Check if a board (small or big) has a winner
    function checkWin(board) {
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let [a, b, c] of winningLines) {
            if (
                board[a] === board[b] &&
                board[a] === board[c] &&
                board[a] !== null &&
                board[a] !== 'D' // Do not count draws as wins
            ) {
                return board[a];
            }
        }

        return null;
    }

    // Check if a board is completely filled
    function isFull(board) {
        return board.every(cell => cell !== null);
    }

    // Handle a player's move
    function makeMove(smallIndex, cellIndex) {
        if (gameOver) return;

        // Enforce redirection unless the destination board is full or won
        if (nextSmallTris !== null && smallIndex !== nextSmallTris) return;

        // Do not allow moves on already taken cells
        if (smallBoards[smallIndex][cellIndex] !== null) return;

        // Record the move
        smallBoards[smallIndex][cellIndex] = currentPlayer;

        const smallBoardEl = document.querySelector(`.small-board[data-si="${smallIndex}"]`);
        const cellEl = smallBoardEl.querySelector(`.cell[data-ci="${cellIndex}"]`);
        cellEl.textContent = currentPlayer;
        cellEl.classList.add("taken");

        // Check if the small board is won and only assign the winner once
        const winner = checkWin(smallBoards[smallIndex]);
        if (winner && bigBoard[smallIndex] === null) {
            bigBoard[smallIndex] = winner;
            smallBoardEl.classList.add(`won-${winner}`);
        } else if (isFull(smallBoards[smallIndex]) && bigBoard[smallIndex] === null) {
            bigBoard[smallIndex] = 'D'; // Mark as draw if full and no winner
        }

        // Check for a win or draw on the big board
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

        // Determine the next small board to redirect to
        nextSmallTris = bigBoard[cellIndex] === null ? cellIndex : null;
        highlightNextSmall();

        // Switch the current player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        messageEl.textContent = `Current Player: ${currentPlayer}`;
    }

    // Visually highlight the next small board to play in
    function highlightNextSmall() {
        document.querySelectorAll('.small-board').forEach((el, index) => {
            el.style.outline = (nextSmallTris === null || index === nextSmallTris) && bigBoard[index] === null
                ? '3px solid orange'
                : 'none';
        });
    }

    // Setup the full game board in the DOM
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
        messageEl.textContent = `Current Player: ${currentPlayer}`;
    }

    setupBoard();
});
