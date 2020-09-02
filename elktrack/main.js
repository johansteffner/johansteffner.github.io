class Game {
  constructor(el) {
    this.canvas = document.createElement('canvas')

    this.canvas.width = window.innerWidth * 2
    this.canvas.height = window.innerHeight * 2

    this.canvas.style.width = `${window.innerWidth}px`
    this.canvas.style.height = `${window.innerHeight}px`
    this.canvas.style.display = `block`

    this.context = this.canvas.getContext("2d")

    el.replaceWith(this.canvas)
  }

  elements = []

  addElement(el) {
    this.elements.push(el)
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  start() {
    this.last = new Date()
    this.tick()
  }

  tick() {
    this.clear()

    const t = new Date()

    for (const el of this.elements) {
      el.update(this.canvas, t - this.last)
    }

    this.last = t

    for (const el of this.elements) {
      el.draw(this.context, this.canvas)
    }

    requestAnimationFrame(this.tick.bind(this))
  }
}

class Background {
  update() { }

  draw(ctx, canvas) {
    ctx.fillStyle = '#fcd09f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

class Foreground {
  update() { }

  draw(ctx, canvas) {
    ctx.fillStyle = '#0b6623'
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2)
  }
}

class Wall {
  constructor(side) {
    this.side = side
  }

  update() { }

  draw(ctx, canvas) {
    ctx.fillStyle = '#caa472'

    if (this.side === 'left') {
      ctx.fillRect(0, canvas.height / 2 - canvas.height / 17.5, canvas.width / 15, canvas.height / 10)
    } else {
      ctx.fillRect(canvas.width - canvas.width / 15, canvas.height / 2 - canvas.height / 17.5, canvas.width / 15, canvas.height / 10)
    }
  }
}

class Moose {
  constructor() {
    this.posX = null
    this.posY = 0

    this.image = new Image(333, 180)
    this.image.src = 'elk.png';

    this.mode = 'preRight'

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(mediaStream => {
        const audioContext = new AudioContext()
        this.analyser = audioContext.createAnalyser()
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

        audioContext.createMediaStreamSource(mediaStream).connect(this.analyser)
      })
  }

  update(canvas, dt) {
    const maxSpeed = canvas.width / 4.3

    if (this.analyser) {
      this.analyser.getByteTimeDomainData(this.dataArray)

      if (Math.max(...this.dataArray) - Math.min(...this.dataArray) > 50) {
        if (this.mode === 'stopRight') {
          setTimeout(() => { this.mode = 'moveLeft' }, 2000)
        } else if (this.mode === 'stopLeft') {
          setTimeout(() => { this.mode = 'moveRight' }, 2000)
        }
      }
    }

    this.posY = canvas.height / 2 - this.image.height / 2

    if (this.posX == null) {
      this.posX = canvas.width
    }

    if (this.mode === 'preRight') {
      const posT = canvas.width - this.image.width - canvas.width / 15
      const diff = posT - this.posX
      const dir = (diff < 0 ? -1 : diff > 0 ? 1 : 0)

      this.posX = this.posX + dir * Math.min(maxSpeed * dt / 1000, Math.abs(diff))

      if (this.posX == posT) {
        this.mode = 'stopRight'
      }
    } else if (this.mode === 'moveLeft') {
      this.posX = this.posX - maxSpeed * dt / 1000

      if (this.posX <= -this.image.width * 2) {
        this.mode = 'preLeft'
      }
    } else if (this.mode === 'preLeft') {
      const posT = canvas.width / 15
      const diff = posT - this.posX
      const dir = (diff < 0 ? -1 : diff > 0 ? 1 : 0)

      this.posX = this.posX + dir * Math.min(maxSpeed * dt / 1000, Math.abs(diff))

      if (this.posX == posT) {
        this.mode = 'stopLeft'
      }
    } else if (this.mode === 'moveRight') {
      this.posX = this.posX + maxSpeed * dt / 1000

      if (this.posX >= canvas.width + this.image.width) {
        this.mode = 'preRight'
      }
    }
  }

  draw(ctx, canvas) {
    if (!this.image) {
      return
    }

    const maxSpeed = canvas.width / 4.3

    if (this.mode === 'moveLeft') {
      ctx.globalAlpha = 0.5
      ctx.drawImage(this.image, this.posX - maxSpeed / 250, this.posY - this.image.height / 2, this.image.width, this.image.height)
      ctx.drawImage(this.image, this.posX + maxSpeed / 250, this.posY - this.image.height / 2, this.image.width, this.image.height)

      ctx.globalAlpha = 0.25
      ctx.drawImage(this.image, this.posX + maxSpeed / 125, this.posY - this.image.height / 2, this.image.width, this.image.height)
    } else if (this.mode === 'moveRight') {
      ctx.globalAlpha = 0.5
      ctx.drawImage(this.image, this.posX + maxSpeed / 250, this.posY - this.image.height / 2, this.image.width, this.image.height)
      ctx.drawImage(this.image, this.posX - maxSpeed / 250, this.posY - this.image.height / 2, this.image.width, this.image.height)

      ctx.globalAlpha = 0.25
      ctx.drawImage(this.image, this.posX - maxSpeed / 125, this.posY - this.image.height / 2, this.image.width, this.image.height)
    }

    ctx.globalAlpha = 1
    ctx.drawImage(this.image, this.posX, this.posY - this.image.height / 2, this.image.width, this.image.height)
  }
}

const game = new Game(document.getElementById('game'))

game.addElement(new Background())
game.addElement(new Moose())
game.addElement(new Foreground())
game.addElement(new Wall('left'))
game.addElement(new Wall('right'))

game.start()