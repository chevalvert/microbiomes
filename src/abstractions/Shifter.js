/* global Path2D */
import { clamp, randomInt } from 'missing-math'
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

export default class Shifter {
  constructor (scene, {
    bounds = [100, 100],
    position = [0, 0],
    size = 1,
    direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
  } = {}) {
    this.scene = scene
    this.bounds = bounds
    this.position = position.map(v => Math.floor(v - size / 2))
    this.size = size
    this.direction = direction
    this.seed = position[0] + position[1] + Date.now()

    // WIP: create pixelated blob
    let polygon
    for (let i = 0; i < 10; i++) {
      const x = randomInt(0, size)
      const y = randomInt(0, size)
      const w = randomInt(size - x)
      const h = randomInt(size - y)

      const p = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]]
      polygon = polygon
        ? polybool(p, polygon, 'or')
        : p
    }
    // TODO: center on bbox (use a Path abstraction extending Path2D)
    this.path = makePath2D(polygon[0])
  }

  update () {
    const angle = this.scene.noise(this.seed, null, { octaves: 6 })

    // BUG: all go towards zero
    const xoff = Math.sin(angle * Math.PI * 2)
    const yoff = Math.cos(angle * Math.PI * 2)

    if (Math.random() > 0.7) {
      this.direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
    }

    this.position[0] = clamp(Math.round(this.position[0] + xoff), 0, this.bounds[0] - this.size)
    this.position[1] = clamp(Math.round(this.position[1] + yoff), 0, this.bounds[1] - this.size)
  }

  render () {
    this.scene.context.save()
    this.scene.context.translate(this.position[0], this.position[1])
    this.scene.context.clip(this.path)

    this.scene.context.drawImage(
      this.scene.refs.canvas,
      this.position[0],
      this.position[1],
      this.size,
      this.size,
      this.direction[0],
      this.direction[1],
      this.size,
      this.size
    )

    this.scene.context.restore()

    // Rener path
    this.scene.debug(this.position, {
      path: this.path,
      text: this.constructor.name,
      dimensions: [this.size, this.size]
    })

    // Render bbox
    // this.scene.debug(this.position, { color: 'blue', dimensions: [this.size, this.size] })
  }
}
