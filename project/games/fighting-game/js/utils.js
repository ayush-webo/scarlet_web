function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId)
  const displayText = document.querySelector('#displayText')
  const restartBtn = document.querySelector('#restartBtn')
  
  displayText.style.display = 'flex'
  restartBtn.style.display = 'block'
  
  if (player.health === enemy.health) {
    displayText.innerHTML = '⚔️ TIE ⚔️<br><small style="font-size: 16px;">Both fighters stand!</small>'
  } else if (player.health > enemy.health) {
    displayText.innerHTML = '🏆 PLAYER 1 WINS! 🏆<br><small style="font-size: 16px;">Victory is yours!</small>'
  } else {
    displayText.innerHTML = '🏆 PLAYER 2 WINS! 🏆<br><small style="font-size: 16px;">Victory is yours!</small>'
  }
}

let timer = 60
let timerId
let gameStarted = false

function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000)
    timer--
    const timerValue = document.querySelector('#timerValue')
    timerValue.innerHTML = timer
    
    // Add warning animation when time is low
    if (timer <= 10) {
      timerValue.classList.add('warning')
    } else {
      timerValue.classList.remove('warning')
    }
  }

  if (timer === 0) {
    determineWinner({ player, enemy, timerId })
  }
}

function updateHealthBar(fighter, elementId) {
  const healthBar = document.querySelector(`#${elementId}`)
  const healthPercentage = Math.max(0, fighter.health)
  
  gsap.to(healthBar, {
    width: healthPercentage + '%',
    duration: 0.3
  })
  
  // Change color based on health
  healthBar.classList.remove('low', 'critical')
  if (healthPercentage <= 30) {
    healthBar.classList.add('critical')
  } else if (healthPercentage <= 50) {
    healthBar.classList.add('low')
  }
}

function restartGame() {
  // Reset timer
  timer = 60
  document.querySelector('#timerValue').innerHTML = timer
  document.querySelector('#timerValue').classList.remove('warning')
  
  // Reset health
  player.health = 100
  enemy.health = 100
  player.dead = false
  enemy.dead = false
  
  // Reset health bars
  updateHealthBar(player, 'playerHealth')
  updateHealthBar(enemy, 'enemyHealth')
  
  // Hide game over UI
  document.querySelector('#displayText').style.display = 'none'
  document.querySelector('#restartBtn').style.display = 'none'
  
  // Reset positions
  player.position.x = 100
  player.position.y = 0
  player.velocity.x = 0
  player.velocity.y = 0
  
  enemy.position.x = 700
  enemy.position.y = 100
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  
  // Reset sprites to idle
  player.switchSprite('idle')
  enemy.switchSprite('idle')
  
  // Start timer
  gameStarted = true
  decreaseTimer()
}

// Initialize health bars on load
window.addEventListener('load', () => {
  updateHealthBar(player, 'playerHealth')
  updateHealthBar(enemy, 'enemyHealth')
})

// Add restart button listener
document.querySelector('#restartBtn').addEventListener('click', restartGame)
