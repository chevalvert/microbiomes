import { clamp } from 'missing-math'
import randomOf from 'utils/array-random'

export default class Shifter {
  constructor (scene, {
    bounds = [100, 100],
    position = [0, 0],
    size = 1,
    direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
    // direction = randomOf([[0, -1], [2, 1]])
  } = {}) {
    this.scene = scene
    this.bounds = bounds
    this.position = position
    this.size = size
    this.direction = direction
  }

  update () {
    if (Math.random() > 0.7) {
      this.direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
    }

    this.position[0] = clamp(this.position[0] + randomOf([-1, 0, 1]), 0, this.bounds[0])
    this.position[1] = clamp(this.position[1] + randomOf([-1, 0, 1]), 0, this.bounds[1])
  }

  render () {
    // this.scene.context.save()
    // this.scene.context.beginPath()
    // this.scene.context.arc(Math.floor(this.position[0] + this.size / 2), Math.floor(this.position[1] + this.size / 2), Math.floor(this.size / 2), 0, Math.PI * 2)
    // this.scene.context.clip()

    this.scene.context.drawImage(
      this.scene.refs.canvas,
      this.position[0],
      this.position[1],
      this.size,
      this.size,
      this.position[0] + this.direction[0],
      this.position[1] + this.direction[1],
      this.size,
      this.size
    )

    // this.scene.context.restore()

    this.scene.debug(this.position, {
      text: this.constructor.name,
      dimensions: [this.size, this.size]
    })
  }
}
