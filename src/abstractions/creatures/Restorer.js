import Creature from 'abstractions/Creature'

export default class Restorer extends Creature {
  get color () {
    return 'black'
  }

  constructor (params) {
    super(params)
    this.cache = this.renderer.state.cachedLayers.get('trace')
  }

  render () {
    super.render()

    this.renderer.draw('trace', ctx => {
      ctx.save()
      ctx.translate(this.position[0], this.position[1])
      ctx.clip(this.path)

      ctx.drawImage(
        this.cache,
        this.center[0] / ctx.canvas.resolution,
        this.center[1] / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        this.size / ctx.canvas.resolution,
        ctx.canvas.resolution - this.size / 2,
        ctx.canvas.resolution - this.size / 2,
        this.size,
        this.size
      )
      ctx.restore()
    })
  }
}
