const boxEls = document.querySelectorAll('.box');
const statusEl = document.querySelector('.status');
const restartBtnEl = document.querySelector('.restartBtn');
const xScoreEl = document.querySelector('.xScore');
const oScoreEl = document.querySelector('.oScore');
const modeSelectEl = document.querySelector('.modeSelect');
const startGameBtnEl = document.querySelector('.startGameBtn');

let x = "<img src='X-Player.png' alt='X'>";
let o = "<img src='O-Player.png' alt='O'>";

// Total Win Possibilities
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initial game state
let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = x;
let player = "X";
let running = false;
let xScore = 0;
let oScore = 0;
let gameMode = null; // 'human' or 'ai'

// Load scores from localStorage
loadScores();

// Event listeners
restartBtnEl.addEventListener('click', restartGame);
startGameBtnEl.addEventListener('click', selectGameMode);

function loadScores() {
    xScore = parseInt(localStorage.getItem('ticTacToeXScore')) || 0;
    oScore = parseInt(localStorage.getItem('ticTacToeOScore')) || 0;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    xScoreEl.textContent = xScore;
    oScoreEl.textContent = oScore;
}

function selectGameMode() {
    gameMode = document.querySelector('input[name="gameMode"]:checked')?.value;
    if (!gameMode) {
        alert('Please select a game mode!');
        return;
    }
    
    modeSelectEl.classList.add('hide');
    init();
}

function init() {
    boxEls.forEach(box => {
        box.addEventListener('click', boxClick);
        box.classList.remove('disabled');
    });
    statusEl.textContent = `Player "${player}" Turn`;
    statusEl.style.color = "black";
    running = true;
}

function boxClick(e) {
    const index = e.target.dataset.index;
    
    if (options[index] !== "" || !running) {
        return;
    }
    
    updateBox(e.target, index);
    
    if (checkWinner()) return;
    
    // AI move
    if (gameMode === 'ai' && player === "O" && running) {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    if (!running) return;
    
    // Simple AI - try to win, block, or random
    let move = findBestMove();
    if (move === -1) return;
    
    const box = boxEls[move];
    updateBox(box, move);
    checkWinner();
}

function findBestMove() {
    // Check if AI can win
    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = "O";
            if (checkWinCondition("O")) {
                options[i] = "";
                return i;
            }
            options[i] = "";
        }
    }
    
    // Check if need to block player
    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = "X";
            if (checkWinCondition("X")) {
                options[i] = "";
                return i;
            }
            options[i] = "";
        }
    }
    
    // Take center if available
    if (options[4] === "") return 4;
    
    // Take random available spot
    let available = [];
    options.forEach((opt, idx) => {
        if (opt === "") available.push(idx);
    });
    
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
}

function checkWinCondition(checkPlayer) {
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return options[a] === checkPlayer && 
               options[b] === checkPlayer && 
               options[c] === checkPlayer;
    });
}

function updateBox(box, index) {
    options[index] = player;
    box.innerHTML = currentPlayer;
}

function changePlayer() {
    player = (player === 'X') ? "O" : "X";
    currentPlayer = (currentPlayer === x) ? o : x;
    statusEl.textContent = `Player "${player}" Turn`;
    statusEl.style.color = "black";
}

function restartGame() {
    options = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = x;
    player = "X";
    running = false;
    statusEl.textContent = `Player "${player}" Turn`;
    statusEl.style.color = "black";
    restartBtnEl.textContent = "Restart 🔁";
  
    boxEls.forEach(box => {
        box.innerHTML = "";
        box.classList.remove('win');
        box.classList.remove('disabled');
    });
    
    modeSelectEl.classList.remove('hide');
    gameMode = null;
}

function checkWinner() {
    let isWon = false;
    let winningPattern = null;
    
    for (let i = 0; i < winPatterns.length; i++) {
        const pattern = winPatterns[i];
        const [a, b, c] = pattern;
        const box1 = options[a];
        const box2 = options[b];
        const box3 = options[c];
        
        if (box1 === "" || box2 === "" || box3 === "") {
            continue;
        }
        
        if (box1 === box2 && box2 === box3) {
            isWon = true;
            winningPattern = pattern;
            break;
        }
    }

    if (isWon) {
        winningPattern.forEach(idx => {
            boxEls[idx].classList.add('win');
        });
        
        statusEl.textContent = `🎉 Player "${player}" Won! 🎉`;
        statusEl.style.color = "green";
        restartBtnEl.textContent = "Play Again 😉";
        running = false;
        
        // Update scores
        if (player === "X") {
            xScore++;
            localStorage.setItem('ticTacToeXScore', xScore);
        } else {
            oScore++;
            localStorage.setItem('ticTacToeOScore', oScore);
        }
        updateScoreDisplay();
        
        // Disable further clicks
        boxEls.forEach(box => box.classList.add('disabled'));
        return true;
        
    } else if (!options.includes("")) {
        statusEl.textContent = `😐 Game Draw! 😐`;
        statusEl.style.color = "#f39c12";
        restartBtnEl.textContent = "Play Again 😉";
        running = false;
        return true;
    } else {
        changePlayer();
        return false;
    }
}
