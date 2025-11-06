const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const highScoreEl = document.querySelector(".highScore");

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

let player = {
    speed: 5,
    minSpeed: 5,
    score: 0,
    start: false,
    x: 0,
    y: 0
};

// High score from localStorage
let highScore = localStorage.getItem('carGameHighScore') || 0;
highScoreEl.textContent = `High Score: ${highScore}`;

startScreen.addEventListener("click", startGame);

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false // Pause key
};

let isPaused = false;

function keyDown(e) {
    e.preventDefault();
    
    // Pause functionality
    if (e.key === ' ' || e.key === 'Space') {
        if (player.start) {
            isPaused = !isPaused;
            if (isPaused) {
                score.innerHTML = "PAUSED - Press SPACE to continue";
            }
        }
        return;
    }
    
    keys[e.key] = true;
}

function keyUp(e) {
    e.preventDefault();
    keys[e.key] = false;
}

function gamePlay() {
    let car = document.querySelector(".car");
    if (!car) return;
    
    let road = gameArea.getBoundingClientRect();

    if (player.start && !isPaused) {
        moveLines();
        moveEnemyCar(car);

        // Movement with boundaries
        if (keys.ArrowUp && player.y > road.top + 150) {
            player.y -= player.speed;
        }
        if (keys.ArrowDown && player.y < road.bottom - 80) {
            player.y += player.speed;
        }
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys.ArrowRight && player.x < road.width - 70) {
            player.x += player.speed;
        }

        car.style.top = `${player.y}px`;
        car.style.left = `${player.x}px`;

        player.score++;
        
        // Increase difficulty gradually
        let level = Math.floor(player.score / 500);
        player.speed = player.minSpeed + (level * 0.3);

        score.innerHTML = `Score: ${player.score} | Speed: ${player.speed.toFixed(1)}`;
    }
    
    if (player.start) {
        window.requestAnimationFrame(gamePlay);
    }
}

function moveLines() {
    let lines = document.querySelectorAll(".line");
    lines.forEach((line) => {
        if (line.y >= 700) {
            line.y -= 750;
        }
        line.y += player.speed;
        line.style.top = line.y + "px";
    });
}

function isCollide(car, enemyCar) {
    let carRect = car.getBoundingClientRect();
    let enemyCarRect = enemyCar.getBoundingClientRect();

    return !(
        carRect.top > enemyCarRect.bottom ||
        carRect.left > enemyCarRect.right ||
        carRect.right < enemyCarRect.left ||
        carRect.bottom < enemyCarRect.top
    );
}

function moveEnemyCar(car) {
    let enemyCars = document.querySelectorAll(".enemyCar");
    enemyCars.forEach((enemyCar) => {
        if (isCollide(car, enemyCar)) {
            endGame();
        }

        if (enemyCar.y >= 750) {
            enemyCar.y = -300;
            enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        }
        enemyCar.y += player.speed;
        enemyCar.style.top = enemyCar.y + "px";
    });
}

function startGame() {
    score.classList.remove("hide");
    highScoreEl.classList.remove("hide");
    startScreen.classList.add("hide");
    gameArea.innerHTML = "";

    player.start = true;
    player.score = 0;
    player.speed = player.minSpeed;
    isPaused = false;

    // Create road lines
    for (let i = 0; i < 5; i++) {
        let roadLine = document.createElement("div");
        roadLine.setAttribute("class", "line");
        roadLine.y = i * 150;
        roadLine.style.top = roadLine.y + "px";
        gameArea.appendChild(roadLine);
    }

    // Create player car
    let car = document.createElement("div");
    car.setAttribute("class", "car");
    gameArea.appendChild(car);

    player.x = car.offsetLeft;
    player.y = car.offsetTop;

    // Create enemy cars
    for (let i = 0; i < 3; i++) {
        let enemyCar = document.createElement("div");
        enemyCar.setAttribute("class", "enemyCar");
        enemyCar.y = (i + 1) * 350 * -1;
        enemyCar.style.top = enemyCar.y + "px";
        enemyCar.style.backgroundImage = `url("./images/car${(i % 3) + 1}.png")`;
        enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        gameArea.appendChild(enemyCar);
    }

    window.requestAnimationFrame(gamePlay);
}

function endGame() {
    player.start = false;
    isPaused = false;
    
    // Update high score
    if (player.score > highScore) {
        highScore = player.score;
        localStorage.setItem('carGameHighScore', highScore);
        highScoreEl.textContent = `High Score: ${highScore}`;
        startScreen.innerHTML = `<p>🎉 NEW HIGH SCORE! 🎉<br/>Score: ${player.score}<br/><br/>Click to Play Again<br/>Use Arrow Keys to Move<br/>Press SPACE to Pause</p>`;
    } else {
        startScreen.innerHTML = `<p>Game Over!<br/>Score: ${player.score}<br/><br/>Click to Play Again<br/>Use Arrow Keys to Move<br/>Press SPACE to Pause</p>`;
    }
    
    startScreen.classList.remove("hide");
}
