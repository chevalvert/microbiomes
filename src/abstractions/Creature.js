import Store from 'store'
import { wrap, randomInt, radians, roundTo } from 'missing-math'
import path2d from 'utils/polygon-to-path2d'
import polybool from 'poly-bool'
import stringToColor from 'utils/string-to-color'

export const SHAPES = {
  rectangle: function (radius, resolution = 1) {
    const r = roundTo(radius, resolution)
    return path2d([[-r, -r], [-r, r], [r, r], [r, -r]])
  },

  blob: function (radius, resolution = 1) {
    let polygon
    for (let i = 0; i < 5; i++) {
      const x = roundTo(randomInt(-radius, 0), resolution)
      const y = roundTo(randomInt(-radius, 0), resolution)
      const w = roundTo(randomInt(radius - x), resolution)
      const h = roundTo(randomInt(radius - y), resolution)

      const p = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]]
      polygon = polygon
        ? polybool(p, polygon, 'or')
        : p
    }
    return polygon.length && polygon[0].length
      ? path2d(polygon[0])
      : SHAPES.rectangle(radius, resolution)
  },

  circle: function (radius, resolution = 1) {
    let polygon
    for (let a = 0; a < 360; a += 360 / 16) {
      const w = roundTo(Math.cos(radians(a)) * radius, resolution)
      const h = roundTo(Math.sin(radians(a)) * radius, resolution)
      const p = [[[0, 0], [w, 0], [w, h], [0, h]]]
      polygon = polygon
        ? polybool(p, polygon, 'or')
        : p
    }

    return path2d(polygon[0])
  }
}

export default class Creature {
  get renderer () { return Store.renderer.instance.current }

  constructor ({
    shape = 'rectangle',
    size = 10,
    bounds = [0, 0, window.innerWidth, window.innerHeight],
    position = [
      randomInt(bounds[0], bounds[0] + bounds[2]),
      randomInt(bounds[1], bounds[1] + bounds[3])
    ]
  } = {}) {
    this.timestamp = Date.now()
    this.size = size
    this.bounds = bounds
    this.position = position.map(v => Math.floor(v - size / 2))
    this.seed = position[0] + position[1] + Date.now()

    this.path = SHAPES[shape](this.radius, this.renderer.getContext('trace').canvas.resolution)
    this.debugColor = stringToColor(this.constructor.name)
  }

  get radius () { return this.size / 2 }
  get center () {
    return [
      this.position[0] - this.radius,
      this.position[1] - this.radius
    ]
  }

  // TODO: implement multiple behaviors
  update () {
    // TODOBUG: all tends to go in the same direction
    const angle = this.renderer.noise(this.seed, null, { octaves: 6 })
    const xoff = Math.sin(angle * Math.PI * 2)
    const yoff = Math.cos(angle * Math.PI * 2)

    this.position[0] = wrap(
      Math.round(this.position[0] + xoff),
      this.bounds[0] + this.radius,
      this.bounds[0] + this.bounds[2] - this.radius
    )

    this.position[1] = wrap(
      Math.round(this.position[1] + yoff),
      this.bounds[1] + this.radius,
      this.bounds[1] + this.bounds[3] - this.radius
    )
  }

  render ({ debug = false } = {}) {
    this.renderer.draw('creatures', ctx => {
      ctx.save()
      ctx.fillStyle = this.color
      ctx.lineWidth = ctx.canvas.resolution
      ctx.translate(this.position[0], this.position[1])
      ctx.fill(this.path)
      ctx.restore()
    })

    if (debug) {
      // Render bbox
      this.renderer.debug(this.position, {
        dimensions: [this.size, this.size]
      })

      // Render path
      this.renderer.debug(this.position, {
        color: this.debugColor,
        text: this.constructor.name.toLowerCase(),
        path: this.path,
        lineWidth: 3,
        dimensions: [this.size, this.size]
      })
    }
  }
}
