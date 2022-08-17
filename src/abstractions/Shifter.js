import randomOf from 'utils/array-random'

import Creature from 'abstractions/Creature'

export default class Shifter extends Creature {
  constructor ({
    direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]]),
    ...params
  } = {}) {
    super(params)
    this.direction = direction
  }

  update () {
    super.update()
    if (Math.random() > 0.9) {
      this.direction = randomOf([[-1, 0], [1, 0], [0, 1], [0, -1]])
    }
  }

  render () {
    super.render()

    this.renderer.draw('creatures', ctx => {
      ctx.save()
      ctx.fillStyle = '#f25700'
      ctx.lineWidth = ctx.canvas.resolution
      ctx.translate(this.position[0], this.position[1])
      ctx.fill(this.path)
      ctx.restore()
    })

    this.renderer.draw('trace', ctx => {
      ctx.save()
      ctx.translate(this.position[0], this.position[1])
      ctx.clip(this.path)
      ctx.drawImage(
        ctx.canvas,
        this.center[0] / ctx.canvas.resolution,
        this.center[1] / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        this.direction[0] - this.size / 2 + ctx.canvas.resolution,
        this.direction[1] - this.size / 2 + ctx.canvas.resolution,
        this.size,
        this.size
      )
      ctx.restore()
    })
  }
}
