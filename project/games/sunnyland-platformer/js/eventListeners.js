window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!isPaused) {
      pauseGame()
    } else {
      resumeGame()
    }
    return
  }

  if (isPaused) return

  switch (event.key) {
    case 'w':
      if (player.isOnGround) {
        player.jump()
      }
      keys.w.pressed = true
      break
    case 'a':
      keys.a.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    case ' ':
      event.preventDefault()
      player.roll()
      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})
