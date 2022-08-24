import Store from 'store'
import { wrap, randomInt } from 'missing-math'
import Polygon from 'abstractions/Polygon'
import stringToColor from 'utils/string-to-color'
import { randomOf } from 'controllers/Prng'

export default class Creature {
  get renderer () { return Store.renderer.instance.current }

  constructor ({
    animated = false,
    speed = randomInt(1, 3),
    shape = 'rectangle',
    size = 10,
    bounds = [0, 0, window.innerWidth, window.innerHeight],
    position = [
      randomInt(bounds[0], bounds[0] + bounds[2]),
      randomInt(bounds[1], bounds[1] + bounds[3])
    ]
  } = {}) {
    this.speed = speed
    this.timestamp = Date.now()
    this.animated = animated
    this.size = size
    this.bounds = bounds
    this.position = position.map(v => Math.floor(v - size / 2))
    this.ppos = this.position

    this.seed = position[0] + position[1] + Date.now()

    const resolution = this.renderer.getContext('trace').canvas.resolution
    this.polygon = Polygon.shape(shape, { size, resolution })
    this.sprite = Polygon.tamagotchize(this.polygon, {
      resolution,
      direction: randomOf(['horizontal', 'vertical']),
      slicesLength: randomOf([2, 3, 4]),
      framesLength: 10,
      amt: 0.1
    })

    this.debugColor = stringToColor(this.constructor.name)
  }

  get path () {
    const index = Math.round((Store.raf.frameCount.current + this.seed) / 5) % this.sprite.length
    return this.sprite[index]
  }

  get radius () { return this.size / 2 }
  get center () { return [this.position[0] + this.radius, this.position[1] + this.radius] }
  get orientation () {
    const dx = Math.abs(this.position[0] - this.ppos[0])
    const dy = Math.abs(this.position[1] - this.ppos[1])
    return dx > dy ? 'horizontal' : 'vertical'
  }

  update ({
    speed = this.speed,
    octaves = 4 + (this.seed % 4)
  } = {}) {
    this.ppos = [...this.position]

    const angle = this.renderer.noise(this.seed, null, { octaves })
    const xoff = Math.sin(angle * Math.PI * 2) * speed
    const yoff = Math.cos(angle * Math.PI * 2) * speed

    this.position[0] = wrap(
      this.center[0] + xoff,
      this.bounds[0],
      this.bounds[0] + this.bounds[2]
    ) - this.radius

    this.position[1] = wrap(
      this.center[1] + yoff,
      this.bounds[1],
      this.bounds[1] + this.bounds[3]
    ) - this.radius
  }

  render ({ debug = false } = {}) {
    this.renderer.draw('creatures', ctx => {
      ctx.save()
      ctx.fillStyle = this.color
      ctx.lineWidth = ctx.canvas.resolution
      ctx.translate(this.center[0], this.center[1])
      ctx.fill(this.path)
      ctx.restore()
    })

    if (debug) {
      // Render bbox
      this.renderer.debug(this.position, {
        text: this.constructor.name.toLowerCase(),
        dimensions: [this.size, this.size]
      })

      // Render path
      this.renderer.debug(this.center, {
        color: this.debugColor,
        path: this.path,
        lineWidth: 3,
        dimensions: [this.size, this.size]
      })
    }
  }
}
