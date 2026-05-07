document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.game-board');
    const gameInfo = document.getElementById('gameInfo');
    const gameResultInfo = document.getElementById('gameResultInfo');
    const nextGameBtn = document.getElementById('nextGameBtn');
    const mode2PlayersBtn = document.getElementById('mode2Players');
    const mode1PvRandomBtn = document.getElementById('mode1PvRandom');
    const mode1PvBeatableBtn = document.getElementById('mode1PvBeatable');
    const mode1PvPerfectBtn = document.getElementById('mode1PvPerfect');
    const mode1PvMinimaxBtn = document.getElementById('mode1PvMinimax');
    const mode1PvDQNBtn = document.getElementById('mode1PvDQN');

    // Base URL of the tic-tac-toe move API. Local dev hits a uvicorn server on :7860;
    // production hits the deployed Hugging Face Space (fill in before deploying).
    const isLocalDev = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    const API_BASE = isLocalDev ? 'http://localhost:7860' : 'https://anandaa-tic-tac-toe.hf.space';

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let isSinglePlayerMode = false; // Default to 2-player
    let p1Mode = 'random'; // Default 1-player mode (can be 'random', 'beatable', 'perfect', 'minimax', 'dqn')
    let playerIsX = false; // For alternating which player starts in 1p mode. X always starts in any case, but player may not be X.

    // Messages for display
    const PLAYER_TURN_MESSAGE = (player) => `It's ${player}'s turn`;
    const WIN_MESSAGE = (player) => `Player ${player} has won!`;
    const DRAW_MESSAGE = 'Game ended in a draw!';

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // --- Game Initialization and Reset ---

    function initializeGame() {
        // Clear board and reset state
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        gameResultInfo.style.display = 'none';
        nextGameBtn.style.display = 'none';
        gameBoard.innerHTML = ''; // Clear previous squares and winning line

        // Determine starting player for the new game
        currentPlayer = 'X';
        if (isSinglePlayerMode) {
            playerIsX = !playerIsX; // Alternate starting player for 1-player
            // currentPlayer = playerXStarts ? 'X' : 'O'; // <-- removed. In 1-player mode, player can be X or O, but X always starts.
            gameInfo.textContent = `1-Player Game - ${PLAYER_TURN_MESSAGE(currentPlayer)}`;
        } else {
            // currentPlayer = 'X'; // doesn't mean anything to alternate players in 2-player
            gameInfo.textContent = `2-Player Game - ${PLAYER_TURN_MESSAGE(currentPlayer)}`;
        }

        // Create board squares
        for (let i = 0; i < 9; i++) {
            const square = document.createElement('button');
            square.classList.add('board-square', 'btn', 'btn-secondary');
            square.dataset.cellIndex = i;
            const squareContent = document.createElement('span');
            squareContent.classList.add('square-content');
            square.appendChild(squareContent);
            square.addEventListener('click', handleCellClick);
            gameBoard.appendChild(square);
        }

        // If it's a 1-player game and the computer is 'X' (or current player is O when computer is X)
        // This is where you'd potentially trigger the computer's first move
        if (isSinglePlayerMode && currentPlayer === 'O' && playerIsX) {
            // This should never trigger, because X always starts. (leaving it here in case of future changes / just in case)
            setTimeout(computerMove, 100); // Call computerMove function after a delay
            console.log("Computer's turn (O)");
        } else if (isSinglePlayerMode && currentPlayer === 'X' && !playerIsX) { // If X is computer and it's their turn
            setTimeout(computerMove, 100); // Call computerMove function after a delay
            console.log("Computer's turn (X)");
        }
    }

    // --- Game Logic ---

    function handleCellClick(e) {
        const clickedCell = e.target.closest('.board-square'); // Ensure we get the button itself
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        if (board[clickedCellIndex] !== '' || !isGameActive) {
            return; // Cell already occupied or game not active
        }

        handlePlayerMove(clickedCell, clickedCellIndex);
        checkResult();

        if (isGameActive && isSinglePlayerMode && currentPlayer === (playerIsX ? 'O' : 'X')) { // Computer's turn
            setTimeout(computerMove, 500); // Call computerMove after a delay
        }
    }

    function handlePlayerMove(cell, index) {
        board[index] = currentPlayer;
        cell.querySelector('.square-content').textContent = currentPlayer;
        cell.disabled = true; // Disable the clicked button

        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameInfo();
    }

    function updateGameInfo() {
        const modeText = isSinglePlayerMode ? '1-Player Game' : '2-Player Game';
        if (isGameActive) {
            gameInfo.textContent = `${modeText} - ${PLAYER_TURN_MESSAGE(currentPlayer)}`;
        }
        // If game is not active, info will be handled by gameResultInfo
    }

    function checkResult() {
        let roundWon = false;
        let winningCombination = null;

        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningCombination = winCondition;
                break;
            }
        }

        if (roundWon) {
            isGameActive = false;
            const winner = currentPlayer === 'X' ? 'O' : 'X'; // The player who just made the winning move
            gameResultInfo.textContent = WIN_MESSAGE(winner);
            gameResultInfo.style.display = 'block';
            nextGameBtn.style.display = 'block';
            disableBoard();
            drawWinningLine(winningCombination);
            return;
        }

        if (!board.includes('')) {
            isGameActive = false;
            gameResultInfo.textContent = DRAW_MESSAGE;
            gameResultInfo.style.display = 'block';
            nextGameBtn.style.display = 'block';
            disableBoard();
            return;
        }
    }

    function disableBoard() {
        document.querySelectorAll('.board-square').forEach(square => {
            square.disabled = true;
        });
    }

    function drawWinningLine(winningCombination) {
        const line = document.createElement('div');
        line.classList.add('winning-line');

        // Determine line class based on combination
        const [idx1, idx2, idx3] = winningCombination;
        if (idx1 === 0 && idx2 === 1 && idx3 === 2) line.classList.add('win-row-0');
        else if (idx1 === 3 && idx2 === 4 && idx3 === 5) line.classList.add('win-row-1');
        else if (idx1 === 6 && idx2 === 7 && idx3 === 8) line.classList.add('win-row-2');
        else if (idx1 === 0 && idx2 === 3 && idx3 === 6) line.classList.add('win-col-0');
        else if (idx1 === 1 && idx2 === 4 && idx3 === 7) line.classList.add('win-col-1');
        else if (idx1 === 2 && idx2 === 5 && idx3 === 8) line.classList.add('win-col-2');
        else if (idx1 === 0 && idx2 === 4 && idx3 === 8) line.classList.add('win-diag-0');
        else if (idx1 === 2 && idx2 === 4 && idx3 === 6) line.classList.add('win-diag-1');

        gameBoard.appendChild(line);
    }

    // --- Computer Player Logic ---

    async function computerMove() {
        if (!isGameActive) return;

        // Lock the board while waiting for the API response.
        const lockedSquares = [];
        document.querySelectorAll('.board-square').forEach(square => {
            if (!square.disabled) {
                square.disabled = true;
                lockedSquares.push(square);
            }
        });

        // Convert local board ('', 'X', 'O') to API format (' ', 'x', 'o').
        const apiBoard = board.map(c => c === '' ? ' ' : c.toLowerCase());
        const apiCurPlayer = currentPlayer === 'X' ? 1 : 2;

        // Snapshot to detect mid-await game resets.
        const boardSnapshot = board.slice();
        const playerSnapshot = currentPlayer;

        let chosenIndex;
        try {
            const response = await fetch(`${API_BASE}/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player: p1Mode,
                    board: apiBoard,
                    cur_player: apiCurPlayer,
                }),
            });
            if (!response.ok) throw new Error(`API returned status ${response.status}`);
            const data = await response.json();
            chosenIndex = data.move;
        } catch (err) {
            alert(`Failed to get computer move: ${err.message}`);
            return;
        }

        // Bail if the game was reset / advanced while we were waiting.
        if (!isGameActive ||
            currentPlayer !== playerSnapshot ||
            board.some((v, i) => v !== boardSnapshot[i])) {
            return;
        }

        // Re-enable the squares we locked; handlePlayerMove will re-disable the chosen one.
        lockedSquares.forEach(square => { square.disabled = false; });

        const cellToClick = document.querySelector(`[data-cell-index="${chosenIndex}"]`);
        handlePlayerMove(cellToClick, chosenIndex);
        checkResult();
    }

    // --- Event Listeners ---

    nextGameBtn.addEventListener('click', initializeGame);

    mode2PlayersBtn.addEventListener('change', () => {
        isSinglePlayerMode = false;
        initializeGame();
    });


    mode1PvRandomBtn.addEventListener('change', () => {
        isSinglePlayerMode = true;
        p1Mode = 'random';
        initializeGame();
    });

    mode1PvBeatableBtn.addEventListener('change', () => {
        isSinglePlayerMode = true;
        p1Mode = 'beatable';
        initializeGame();
    });

    mode1PvPerfectBtn.addEventListener('change', () => {
        isSinglePlayerMode = true;
        p1Mode = 'perfect';
        initializeGame();
    });

    mode1PvMinimaxBtn.addEventListener('change', () => {
        isSinglePlayerMode = true;
        p1Mode = 'minimax';
        initializeGame();
    });

    mode1PvDQNBtn.addEventListener('change', () => {
        isSinglePlayerMode = true;
        p1Mode = 'dqn';
        initializeGame();
    });

    // Initial game setup
    initializeGame();
});