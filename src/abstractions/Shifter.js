/* global Path2D */
import { clamp, randomInt, radians, roundTo } from 'missing-math'
import randomOf from 'utils/array-random'
import polybool from 'poly-bool'

function makePath2D (points, { close = true } = {}) {
  const path = new Path2D()
  for (let index = 0; index < points.length; index++) {
    path[index ? 'lineTo' : 'moveTo'](points[index][0], points[index][1])
  }

  if (close) path.closePath()
  return path
}

const SHAPES = {
  blob: function (radius, resolution = 1) {
    let polygon
    for (let i = 0; i < 10; i++) {
      const x = roundTo(randomInt(-radius, 0), resolution)
      const y = roundTo(randomInt(-radius, 0), resolution)
      const w = roundTo(randomInt(radius - x), resolution)
      const h = roundTo(randomInt(radius - y), resolution)

      const p = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]]
      polygon = polygon
        ? polybool(p, polygon, 'or')
        : p
    }
    return makePath2D(polygon[0])
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

    return makePath2D(polygon[0])
  }
}

export default class Shifter {
  constructor (scene, {
    bounds = [window.innerWidth, window.innerHeight],
    position = [0, 0],
    size = 1,
    direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]]),
    shape = 'circle'
  } = {}) {
    this.scene = scene
    this.bounds = bounds
    this.position = position.map(v => Math.floor(v - size / 2))
    this.size = size
    this.direction = direction
    this.seed = position[0] + position[1] + Date.now()

    this.path = SHAPES[shape](this.radius, this.scene.getContext('trace').canvas.resolution)
  }

  get radius () { return this.size / 2 }
  get center () {
    return [
      this.position[0] - this.radius,
      this.position[1] - this.radius
    ]
  }

  update () {
    // BUG: all tends to go in the same direction
    const angle = this.scene.noise(this.seed, null, { octaves: 6 })
    const xoff = Math.sin(angle * Math.PI * 2)
    const yoff = Math.cos(angle * Math.PI * 2)

    if (Math.random() > 0.9) {
      this.direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
    }

    this.position[0] = clamp(Math.round(this.position[0] + xoff), this.radius, this.bounds[0] - this.radius)
    this.position[1] = clamp(Math.round(this.position[1] + yoff), this.radius, this.bounds[1] - this.radius)
  }

  render () {
    const trace = this.scene.getContext('trace')
    const creatures = this.scene.getContext('creatures')

    // WIP
    // creatures.save()
    // creatures.strokeStyle = 'red'
    // creatures.lineWidth = creatures.canvas.resolution
    // creatures.translate(this.position[0], this.position[1])
    // creatures.stroke(this.path)
    // creatures.restore()

    trace.save()
    trace.translate(this.position[0], this.position[1])
    trace.clip(this.path)
    trace.drawImage(
      trace.canvas,
      this.center[0] / trace.canvas.resolution,
      this.center[1] / trace.canvas.resolution,
      this.size / trace.canvas.resolution,
      this.size / trace.canvas.resolution,
      this.direction[0] - this.size / 2 + trace.canvas.resolution,
      this.direction[1] - this.size / 2 + trace.canvas.resolution,
      this.size,
      this.size
    )
    trace.restore()

    // Render path
    this.scene.debug(this.position, {
      path: this.path,
      text: this.constructor.name,
      dimensions: [this.size, this.size]
    })

    // Render bbox
    this.scene.debug(this.position, {
      color: 'blue',
      dimensions: [this.size, this.size]
    })
  }
}
