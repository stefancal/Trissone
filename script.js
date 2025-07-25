document.addEventListener('DOMContentLoaded', () => {
    
    const bigBoardEl = document.getElementById('big-board');
    const messageEl = document.getElementById('message');
    const currentPlayerEl = document.getElementById('current-player'); // Aggiunto per aggiornare correttamente il current player
    const timerEl = document.getElementById('timer');

    let smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
    let bigBoard = Array(9).fill(null);
    let currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    let nextSmallTris = null;
    let gameOver = false;
    let timeLeft = 60;
    let timerInterval = null;


    function updateUI() {
        currentPlayerEl.textContent = `Current Player: ${currentPlayer}`;
    }

    // Check for a win in the given board
    function checkWin(board) {
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let [a, b, c] of winningLines) {
            if (board[a] === board[b] && board[a] === board[c] && board[a] !== null && board[a] !== 'D') {
                return board[a];
            }
        }

        return null;
    }

    // Check if the given board is full
    function isFull(board) {
        return board.every(cell => cell !== null);
    }

    /**
     * Make a move in the game
     * @param {*} smallIndex The index of the small board
     * @param {*} cellIndex The index of the cell in the small board
     */
    function makeMove(smallIndex, cellIndex) {
        if (gameOver) return;

        // Disallow playing elsewhere if the destination is not full
        if (nextSmallTris !== null && smallIndex !== nextSmallTris && !isFull(smallBoards[nextSmallTris])) return;

        // Prevent playing in already taken cells
        if (smallBoards[smallIndex][cellIndex] !== null) return;

        // Record the move
        smallBoards[smallIndex][cellIndex] = currentPlayer;

        const smallBoardEl = document.querySelector(`.small-board[data-si="${smallIndex}"]`);
        const cellEl = smallBoardEl.querySelector(`.cell[data-ci="${cellIndex}"]`);
        cellEl.textContent = currentPlayer;
        cellEl.classList.add("taken");
        cellEl.classList.add(currentPlayer === 'X' ? 'x-symbol' : 'o-symbol');

        // Mark win for the small board (only once)
        const winner = checkWin(smallBoards[smallIndex]);
        if (winner && bigBoard[smallIndex] === null) {
            bigBoard[smallIndex] = winner;
            smallBoardEl.classList.add(`won-${winner}`);
            smallBoardEl.classList.add('board-won-animate');

            // Create overlay element to show winner
            const overlay = document.createElement('div');
            overlay.className = `win-overlay win-${winner.toLowerCase()}`;
            overlay.textContent = winner;
            smallBoardEl.appendChild(overlay);

            // Animation
            setTimeout(() => {
                smallBoardEl.classList.remove('board-won-animate');
            }, 1000);
        }

        // Mark as drawn if all cells are filled
        if (!winner && bigBoard[smallIndex] === null && isFull(smallBoards[smallIndex])) {
            bigBoard[smallIndex] = 'D';
            smallBoardEl.classList.add('drawn');
            const drawOverlay = document.createElement('div');
            drawOverlay.className = 'win-overlay win-draw';
            drawOverlay.textContent = 'D';
            smallBoardEl.appendChild(drawOverlay);
        }

        // Check big board win or draw
        const gameWinner = checkWin(bigBoard);
        if (gameWinner) {
            messageEl.textContent = `The winner is: ${gameWinner}!`;
            gameOver = true;
            clearInterval(timerInterval);
            return;
        } else if (isFull(bigBoard)) {
            messageEl.textContent = `It's a draw!`;
            gameOver = true;
            clearInterval(timerInterval);
            return;
        }

        // Determine next redirect target
        nextSmallTris = !isFull(smallBoards[cellIndex]) ? cellIndex : null;

        // Switch players
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateUI();
        document.body.classList.remove('player-x', 'player-o');
        document.body.classList.add(currentPlayer === 'X' ? 'player-x' : 'player-o');
        messageEl.textContent = `Current Player: ${currentPlayer}`;

        highlightNextSmall();
        startTimer();
    }

    // Highlight the next small board to play in
    function highlightNextSmall() {
        document.querySelectorAll('.small-board').forEach((el, index) => {
            el.classList.remove('highlight-x', 'highlight-o');
            
            const boardIsFull = isFull(smallBoards[index]);

            if (nextSmallTris === null) {
                // Free choice
                el.classList.add(isWon ? 'highlight-free' : 'highlight-free');
            } else if (nextSmallTris === index) {
                // Forced to play here, even if already won
                el.classList.add('highlight-free');
            } else if (isWon) {
                el.classList.add('highlight-won');
            }
        });
    }

    // Initialize the game board
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

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 20;
        timerEl.textContent = `Time left: ${timeLeft}s`;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `Time left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (gameOver) return;

                // Time expired: make a random move for currentPlayer
                makeRandomMove();
            }
        }, 1000);
    }

    function makeRandomMove() {
        let candidatesBoards = [];

        if (nextSmallTris !== null && !isFull(smallBoards[nextSmallTris])) {
            candidatesBoards = [nextSmallTris];
        } else {
            candidatesBoards = bigBoard
                .map((v, i) => (v === null && !isFull(smallBoards[i]) ? i : -1))
                .filter(i => i !== -1);
        }

        if (candidatesBoards.length === 0) {
            messageEl.textContent = 'No moves available!';
            gameOver = true;
            clearInterval(timerInterval);
            return;
        }

        const chosenBoard = candidatesBoards[Math.floor(Math.random() * candidatesBoards.length)];

        const freeCells = [];
        smallBoards[chosenBoard].forEach((cell, idx) => {
            if (cell === null) freeCells.push(idx);
        });

        if (freeCells.length === 0) {
            return;
        }

        const chosenCell = freeCells[Math.floor(Math.random() * freeCells.length)];

        makeMove(chosenBoard, chosenCell);
    }

    setupBoard();
    startTimer();
});
