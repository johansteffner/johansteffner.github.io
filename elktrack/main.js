class Game {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext("2d")
    this.scale = parseInt(window.localStorage.getItem('scale') || '100', 10)
    this.vpos = parseInt(window.localStorage.getItem('vpos') || '0', 10)
    this.sensitivity = parseInt(window.localStorage.getItem('sensitivity') || '75', 10)

    this.resize()
    window.addEventListener('resize', () => this.resize())

    const ui = document.createElement('div')

    ui.style.position = 'absolute'
    ui.style.top = '0'
    ui.style.right = '0'
    ui.style.display = 'flex'
    ui.style.flexDirection = 'column'

    const scaleLabel = document.createElement('label')

    scaleLabel.innerHTML = 'scale'
    scaleLabel.style.fontFamily = 'monospace'

    const scaleSlider = document.createElement('input')

    scaleSlider.type = 'range'
    scaleSlider.min = '0'
    scaleSlider.max = '200'
    scaleSlider.value = `${this.scale}`

    scaleSlider.onchange = e => {
      this.scale = parseInt(e.target.value, 10)
      window.localStorage.setItem('scale', this.scale)
    }

    ui.appendChild(scaleLabel)
    ui.appendChild(scaleSlider)

    const vposLabel = document.createElement('label')

    vposLabel.innerHTML = 'vpos'
    vposLabel.style.fontFamily = 'monospace'

    const vposSlider = document.createElement('input')

    vposSlider.type = 'range'
    vposSlider.min = '-1000'
    vposSlider.max = '1000'
    vposSlider.value = `${this.vpos}`

    vposSlider.onchange = e => {
      this.vpos = parseInt(e.target.value, 10)
      window.localStorage.setItem('vpos', this.vpos)
    }

    ui.appendChild(vposLabel)
    ui.appendChild(vposSlider)

    const sensitivityLabel = document.createElement('label')

    sensitivityLabel.innerHTML = 'sensitivity'
    sensitivityLabel.style.fontFamily = 'monospace'

    const sensitivitySlider = document.createElement('input')

    sensitivitySlider.type = 'range'
    sensitivitySlider.min = '0'
    sensitivitySlider.max = '255'
    sensitivitySlider.value = `${this.sensitivity}`

    sensitivitySlider.onchange = e => {
      this.sensitivity = parseInt(e.target.value, 10)
      window.localStorage.setItem('sensitivity', this.sensitivity)
    }

    ui.appendChild(sensitivityLabel)
    ui.appendChild(sensitivitySlider)

    document.body.appendChild(this.canvas)
    document.body.appendChild(ui)
  }

  elements = []

  resize() {
    this.canvas.width = window.innerWidth * 2
    this.canvas.height = window.innerHeight * 2

    this.canvas.style.width = `${window.innerWidth}px`
    this.canvas.style.height = `${window.innerHeight}px`
    this.canvas.style.display = `block`
  }

  addElement(el) {
    this.elements.push(el)
  }

  clear() {
    this.context.resetTransform()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2 - this.vpos)
    this.context.scale(this.scale / 100, this.scale / 100)
  }

  start() {
    this.tick(0)
  }

  tick(ts) {
    this.clear()

    for (const el of this.elements) {
      el.update(ts)
    }

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
    ctx.fillRect(-10000, -10000 / 2, 20000, 10000)
  }
}

class Foreground {
  update() { }

  draw(ctx, canvas) {
    ctx.fillStyle = '#0b6623'
    ctx.fillRect(-10000, 0, 20000, 10000)
  }
}

class Wall {
  constructor(game, side) {
    this.side = side
  }

  update() { }

  draw(ctx, canvas) {
    ctx.fillStyle = '#caa472'

    if (this.side === 'left') {
      ctx.fillRect(-10000, -100, 10000 - 1150, 250)
    } else {
      ctx.fillRect(1150, -100, 10000 - 1150, 250)
    }
  }
}

class Moose {
  constructor(game) {
    this.posX = 0
    this.posY = 0

    this.image = new Image(222, 120)
    this.image.src = 'elk.png';

    this.mode = 'preRight'
    this.last = 0

    this.game = game

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(mediaStream => {
        const audioContext = new AudioContext()
        this.analyser = audioContext.createAnalyser()
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

        audioContext.createMediaStreamSource(mediaStream).connect(this.analyser)
      })

    document.addEventListener('keydown', () => {
      if (this.mode === 'stopRight') {
        setTimeout(() => { this.mode = 'moveLeft' }, 2000)
      } else if (this.mode === 'stopLeft') {
        setTimeout(() => { this.mode = 'moveRight' }, 2000)
      }
    })
  }

  update(ts) {
    const dt = ts - this.last
    this.last = ts
    const maxSpeed = 2300 / 4.3


    if (this.analyser) {
      this.analyser.getByteTimeDomainData(this.dataArray)

      if (Math.max(...this.dataArray) - Math.min(...this.dataArray) > this.game.sensitivity) {
        if (this.mode === 'stopRight') {
          setTimeout(() => { this.mode = 'moveLeft' }, 2000)
        } else if (this.mode === 'stopLeft') {
          setTimeout(() => { this.mode = 'moveRight' }, 2000)
        }
      }
    }


    if (this.mode === 'preRight') {
      const posT = 1100
      const diff = posT - this.posX
      const dir = (diff < 0 ? -1 : diff > 0 ? 1 : 0)

      this.posX = this.posX + dir * Math.min(maxSpeed * dt / 1000, Math.abs(diff))

      if (this.posX == posT) {
        this.mode = 'stopRight'
      }
    } else if (this.mode === 'moveLeft') {
      this.posX = this.posX - maxSpeed * dt / 1000

      if (this.posX <= -1800) {
        this.mode = 'preLeft'
      }
    } else if (this.mode === 'preLeft') {
      const posT = -1100
      const diff = posT - this.posX
      const dir = (diff < 0 ? -1 : diff > 0 ? 1 : 0)

      this.posX = this.posX + dir * Math.min(maxSpeed * dt / 1000, Math.abs(diff))

      if (this.posX == posT) {
        this.mode = 'stopLeft'
      }
    } else if (this.mode === 'moveRight') {
      this.posX = this.posX + maxSpeed * dt / 1000

      if (this.posX >= 1800) {
        this.mode = 'preRight'
      }
    }
  }

  draw(ctx) {
    if (!this.image) {
      return
    }

    ctx.drawImage(this.image, this.posX - this.image.width / 2, this.posY - this.image.height, this.image.width, this.image.height)
  }
}

const game = new Game()

game.addElement(new Background(game))
game.addElement(new Foreground(game))
game.addElement(new Moose(game))
game.addElement(new Wall(game, 'left'))
game.addElement(new Wall(game, 'right'))

game.start()