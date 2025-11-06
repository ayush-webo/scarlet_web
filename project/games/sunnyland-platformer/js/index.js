const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = 2

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

const oceanLayerData = {
  l_New_Layer_1: l_New_Layer_1,
}

const brambleLayerData = {
  l_New_Layer_2: l_New_Layer_2,
}

const layersData = {
  l_New_Layer_8: l_New_Layer_8,
  l_Back_Tiles: l_Back_Tiles,
  l_Decorations: l_Decorations,
  l_Front_Tiles: l_Front_Tiles,
  l_Shrooms: l_Shrooms,
  l_Collisions: l_Collisions,
  l_Grass: l_Grass,
  l_Trees: l_Trees,
}

const tilesets = {
  l_New_Layer_1: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_New_Layer_2: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_New_Layer_8: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Back_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Decorations: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Front_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Shrooms: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Collisions: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Grass: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Trees: { imageUrl: './images/decorations.png', tileSize: 16 },
}

// Tile setup
const collisionBlocks = []
const platforms = []
const blockSize = 16

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage,
          srcX,
          srcY,
          tileSize,
          tileSize,
          x * 16,
          y * 16,
          16,
          16,
        )
      }
    })
  })
}

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  return offscreenCanvas
}

// Game variables
let player = new Player({
  x: 100,
  y: 100,
  size: 32,
  velocity: { x: 0, y: 0 },
})

let oposums = []
let eagles = []
let sprites = []
let hearts = []
let gems = []
let gemUI = null
let gemCount = 0
let totalGems = 0
let isPaused = false
let gameStartTime = Date.now()
let animationFrameId = null

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

let lastTime = performance.now()
let camera = {
  x: 0,
  y: 0,
}

const SCROLL_POST_RIGHT = 330
const SCROLL_POST_TOP = 100
const SCROLL_POST_BOTTOM = 220
let oceanBackgroundCanvas = null
let brambleBackgroundCanvas = null

function initHearts() {
  return [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]
}

function init() {
  gems = []
  gemCount = 0
  totalGems = 0
  gameStartTime = Date.now()
  
  gemUI = new Sprite({
    x: 13,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: './images/gem.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 15,
      height: 13,
      frames: 5,
    },
  })

  // Count and create gems
  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        totalGems++
        gems.push(
          new Sprite({
            x: x * 16,
            y: y * 16,
            width: 15,
            height: 13,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * 16,
              y: y * 16,
              width: 15,
              height: 13,
            },
          }),
        )
      }
    })
  })

  // Update gem counter UI
  updateGemCounter()

  player = new Player({
    x: 100,
    y: 100,
    size: 32,
    velocity: { x: 0, y: 0 },
  })

  eagles = [
    new Eagle({
      x: 816,
      y: 172,
      width: 40,
      height: 41,
    }),
  ]

  oposums = [
    new Oposum({
      x: 650,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 906,
      y: 515,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1150,
      y: 515,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1663,
      y: 200,
      width: 36,
      height: 28,
    }),
  ]

  sprites = []
  hearts = initHearts()

  camera = {
    x: 0,
    y: 0,
  }

  // Hide game over screens
  document.querySelector('#victoryScreen').style.display = 'none'
  document.querySelector('#gameOverScreen').style.display = 'none'
  isPaused = false
}

function updateGemCounter() {
  document.querySelector('#gemCounter').textContent = `${gemCount} / ${totalGems}`
}

function showVictory() {
  const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000)
  const minutes = Math.floor(elapsedTime / 60)
  const seconds = elapsedTime % 60
  
  document.querySelector('#victoryTime').textContent = 
    `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  document.querySelector('#victoryScreen').style.display = 'block'
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

function showGameOver() {
  document.querySelector('#gameOverGems').textContent = `Gems collected: ${gemCount} / ${totalGems}`
  document.querySelector('#gameOverScreen').style.display = 'block'
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

function pauseGame() {
  if (!isPaused) {
    isPaused = true
    document.querySelector('#pauseMenu').style.display = 'block'
  }
}

function resumeGame() {
  isPaused = false
  document.querySelector('#pauseMenu').style.display = 'none'
  lastTime = performance.now()
}

function restartGame() {
  init()
  document.querySelector('#pauseMenu').style.display = 'none'
  resumeGame()
}

// Make functions globally accessible
window.pauseGame = pauseGame
window.resumeGame = resumeGame
window.restartGame = restartGame

function animate(backgroundCanvas) {
  if (!isPaused) {
    const currentTime = performance.now()
    const deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime

    player.handleInput(keys)
    player.update(deltaTime, collisionBlocks)

    // Update enemies
    for (let i = oposums.length - 1; i >= 0; i--) {
      const oposum = oposums[i]
      oposum.update(deltaTime, collisionBlocks)

      const collisionDirection = checkCollisions(player, oposum)
      if (collisionDirection) {
        if (collisionDirection === 'bottom' && !player.isOnGround) {
          player.velocity.y = -200
          sprites.push(
            new Sprite({
              x: oposum.x,
              y: oposum.y,
              width: 32,
              height: 32,
              imageSrc: './images/enemy-death.png',
              spriteCropbox: {
                x: 0,
                y: 0,
                width: 40,
                height: 41,
                frames: 6,
              },
            }),
          )
          oposums.splice(i, 1)
        } else if (
          (collisionDirection === 'left' || collisionDirection === 'right') &&
          player.isOnGround &&
          player.isRolling
        ) {
          sprites.push(
            new Sprite({
              x: oposum.x,
              y: oposum.y,
              width: 32,
              height: 32,
              imageSrc: './images/enemy-death.png',
              spriteCropbox: {
                x: 0,
                y: 0,
                width: 40,
                height: 41,
                frames: 6,
              },
            }),
          )
          oposums.splice(i, 1)
        } else if (
          collisionDirection === 'left' ||
          collisionDirection === 'right'
        ) {
          const fullHearts = hearts.filter((heart) => !heart.depleted)

          if (!player.isInvincible && fullHearts.length > 0) {
            fullHearts[fullHearts.length - 1].depleted = true
          } else if (fullHearts.length === 0) {
            showGameOver()
            return
          }

          player.setIsInvincible()
        }
      }
    }

    // Update eagles
    for (let i = eagles.length - 1; i >= 0; i--) {
      const eagle = eagles[i]
      eagle.update(deltaTime, collisionBlocks)

      const collisionDirection = checkCollisions(player, eagle)
      if (collisionDirection) {
        if (collisionDirection === 'bottom' && !player.isOnGround) {
          player.velocity.y = -200
          sprites.push(
            new Sprite({
              x: eagle.x,
              y: eagle.y,
              width: 32,
              height: 32,
              imageSrc: './images/enemy-death.png',
              spriteCropbox: {
                x: 0,
                y: 0,
                width: 40,
                height: 41,
                frames: 6,
              },
            }),
          )
          eagles.splice(i, 1)
        } else {
          const fullHearts = hearts.filter((heart) => !heart.depleted)

          if (!player.isInvincible && fullHearts.length > 0) {
            fullHearts[fullHearts.length - 1].depleted = true
          } else if (fullHearts.length === 0) {
            showGameOver()
            return
          }

          player.setIsInvincible()
        }
      }
    }

    // Update sprites
    for (let i = sprites.length - 1; i >= 0; i--) {
      const sprite = sprites[i]
      sprite.update(deltaTime)

      if (sprite.iteration === 1) {
        sprites.splice(i, 1)
      }
    }

    // Collect gems
    for (let i = gems.length - 1; i >= 0; i--) {
      const gem = gems[i]
      gem.update(deltaTime)

      const collisionDirection = checkCollisions(player, gem)
      if (collisionDirection) {
        sprites.push(
          new Sprite({
            x: gem.x - 8,
            y: gem.y - 8,
            width: 32,
            height: 32,
            imageSrc: './images/item-feedback.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 32,
              height: 32,
              frames: 5,
            },
          }),
        )

        gems.splice(i, 1)
        gemCount++
        updateGemCounter()

        if (gems.length === 0) {
          showVictory()
          return
        }
      }
    }

    // Camera tracking
    if (player.x > SCROLL_POST_RIGHT && player.x < 1680) {
      const scrollPostDistance = player.x - SCROLL_POST_RIGHT
      camera.x = scrollPostDistance
    }

    if (player.y < SCROLL_POST_TOP && camera.y > 0) {
      const scrollPostDistance = SCROLL_POST_TOP - player.y
      camera.y = scrollPostDistance
    }

    if (player.y > SCROLL_POST_BOTTOM) {
      const scrollPostDistance = player.y - SCROLL_POST_BOTTOM
      camera.y = -scrollPostDistance
    }

    // Render scene
    c.save()
    c.scale(dpr + 1, dpr + 1)
    c.translate(-camera.x, camera.y)
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0)
    c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0)
    c.drawImage(backgroundCanvas, 0, 0)
    player.draw(c)

    for (let i = oposums.length - 1; i >= 0; i--) {
      oposums[i].draw(c)
    }

    for (let i = eagles.length - 1; i >= 0; i--) {
      eagles[i].draw(c)
    }

    for (let i = sprites.length - 1; i >= 0; i--) {
      sprites[i].draw(c)
    }

    for (let i = gems.length - 1; i >= 0; i--) {
      gems[i].draw(c)
    }

    c.restore()

    // UI rendering
    c.save()
    c.scale(dpr + 1, dpr + 1)
    for (let i = hearts.length - 1; i >= 0; i--) {
      hearts[i].draw(c)
    }

    gemUI.draw(c)
    c.restore()
  }

  animationFrameId = requestAnimationFrame(() => animate(backgroundCanvas))
}

const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData)
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData)
    const backgroundCanvas = await renderStaticLayers(layersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

init()
startRendering()
