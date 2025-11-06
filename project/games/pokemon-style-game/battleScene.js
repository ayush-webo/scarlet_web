const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function updateHealthBar(monster, barId) {
  const healthBar = document.querySelector(`#${barId}`)
  const percentage = Math.max(0, (monster.health / 100) * 100)
  
  gsap.to(healthBar, {
    width: percentage + '%',
    duration: 0.3
  })
  
  // Update health bar color based on health
  healthBar.classList.remove('low', 'critical')
  if (percentage <= 25) {
    healthBar.classList.add('critical')
  } else if (percentage <= 50) {
    healthBar.classList.add('low')
  }
}

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  renderedSprites = [draggle, emby]
  queue = []

  // Initialize health bars with color
  updateHealthBar(draggle, 'enemyHealthBar')
  updateHealthBar(emby, 'playerHealthBar')

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    button.style.borderColor = attack.color
    document.querySelector('#attacksBox').append(button)
  })

  // Event listeners for attack buttons
  document.querySelectorAll('#attacksBox button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      
      // Disable all buttons during attack
      document.querySelectorAll('#attacksBox button').forEach(btn => {
        btn.disabled = true
      })
      
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      // Update health bar with animation
      updateHealthBar(draggle, 'enemyHealthBar')

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            duration: 0.4,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0,
                duration: 0.4
              })

              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      } else {
        // Enemy attacks after player
        const randomAttack =
          draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

        queue.push(() => {
          draggle.attack({
            attack: randomAttack,
            recipient: emby,
            renderedSprites
          })

          // Update health bar with animation
          updateHealthBar(emby, 'playerHealthBar')

          if (emby.health <= 0) {
            queue.push(() => {
              emby.faint()
            })

            queue.push(() => {
              gsap.to('#overlappingDiv', {
                opacity: 1,
                duration: 0.4,
                onComplete: () => {
                  cancelAnimationFrame(battleAnimationId)
                  animate()
                  document.querySelector('#userInterface').style.display = 'none'

                  gsap.to('#overlappingDiv', {
                    opacity: 0,
                    duration: 0.4
                  })

                  battle.initiated = false
                  audio.Map.play()
                }
              })
            })
          } else {
            // Re-enable buttons after enemy attack
            queue.push(() => {
              document.querySelectorAll('#attacksBox button').forEach(btn => {
                btn.disabled = false
              })
            })
          }
        })
      }
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })

    button.addEventListener('mouseleave', () => {
      document.querySelector('#attackType').innerHTML = 'Attack Type'
      document.querySelector('#attackType').style.color = '#1a1a2e'
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else {
    e.currentTarget.style.display = 'none'
  }
})
