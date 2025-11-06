const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const moles = document.querySelectorAll(".mole");
const startButton = document.querySelector("#start");
const timerEl = document.querySelector("#timer");
const highScoreEl = document.querySelector("#highScore");
const difficultySelect = document.querySelector("#difficulty");

let lastHole;
let timeUp = false;
let score = 0;
let timeLeft = 30;
let timerInterval;
let highScore = localStorage.getItem('whackHighScore') || 0;
let difficulty = 'medium';

// Display high score
highScoreEl.textContent = `High Score: ${highScore}`;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];

  if (hole === lastHole) {
    return randomHole(holes);
  }

  lastHole = hole;
  return hole;
}

function peep() {
  // Adjust timing based on difficulty
  let minTime, maxTime;
  switch(difficulty) {
    case 'easy':
      minTime = 800;
      maxTime = 1500;
      break;
    case 'medium':
      minTime = 400;
      maxTime = 1000;
      break;
    case 'hard':
      minTime = 200;
      maxTime = 700;
      break;
  }
  
  const time = randomTime(minTime, maxTime);
  const hole = randomHole(holes);
  
  hole.classList.add("up");
  
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  // Reset everything
  scoreBoard.textContent = 0;
  timeLeft = 30;
  timeUp = false;
  score = 0;
  
  // Get difficulty
  difficulty = difficultySelect.value;
  
  // Hide button and difficulty selector
  startButton.style.display = "none";
  difficultySelect.disabled = true;
  
  // Start timer
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
  
  // Start moles
  peep();
}

function updateTimer() {
  timerEl.textContent = `Time: ${timeLeft}s`;
  
  // Color coding for timer
  if (timeLeft <= 5) {
    timerEl.style.backgroundColor = "#e74c3c";
  } else if (timeLeft <= 10) {
    timerEl.style.backgroundColor = "#f39c12";
  } else {
    timerEl.style.backgroundColor = "#3498db";
  }
}

function endGame() {
  timeUp = true;
  clearInterval(timerInterval);
  
  // Check for high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('whackHighScore', highScore);
    highScoreEl.textContent = `High Score: ${highScore}`;
    startButton.innerHTML = "🎉 NEW HIGH SCORE! Play Again?";
  } else {
    startButton.innerHTML = "Play Again?";
  }
  
  startButton.style.display = "inline-block";
  difficultySelect.disabled = false;
  
  // Remove any remaining moles
  holes.forEach(hole => hole.classList.remove("up"));
}

function bonk(e) {
  if (!e.isTrusted) return; // Prevent cheating
  if (timeUp) return;
  
  score++;
  this.parentNode.classList.remove("up");
  this.classList.add("bonked");
  
  setTimeout(() => {
    this.classList.remove("bonked");
  }, 200);
  
  scoreBoard.textContent = score;
}

// Event listeners
moles.forEach((mole) => mole.addEventListener("click", bonk));
startButton.addEventListener("click", startGame);

// Prevent context menu on moles
moles.forEach(mole => {
  mole.addEventListener('contextmenu', (e) => e.preventDefault());
});
