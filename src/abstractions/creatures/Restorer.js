import Creature from 'abstractions/Creature'

export default class Restorer extends Creature {
  get color () {
    return 'black'
  }

  constructor (params) {
    super(params)
    this.cache = this.renderer && this.renderer.state.cachedLayers.get('trace')
  }

  render (...args) {
    super.render(...args)

    this.renderer.draw('trace', ctx => {
      ctx.save()
      ctx.translate(this.center[0], this.center[1])
      ctx.clip(this.path)

      ctx.NO_ROUND = true
      ctx.drawImage(
        this.cache,
        this.position[0] / ctx.canvas.resolution,
        this.position[1] / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        Math.floor(-this.radius),
        Math.floor(-this.radius),
        Math.ceil(this.size),
        Math.ceil(this.size)
      )
      ctx.NO_ROUND = false

      ctx.restore()
    })
  }
}
