import Store from 'store'
import Creature from 'abstractions/Creature'

export default class Builder extends Creature {
  get color () {
    return 'yellow'
  }

  render (...args) {
    super.render(...args)

    this.renderer.draw('trace', ctx => {
      const colors = Store.scene.palette.get()
      const pattern = Store.scene.pattern.get()

      const u = ctx.canvas.resolution
      ctx.save()
      ctx.translate(this.center[0], this.center[1])
      ctx.clip(this.path)
      // TODO: improve perf by using points-in-polygon instead of clipping
      for (let i = 0; i < this.size / u; i++) {
        for (let j = 0; j < this.size / u; j++) {
          ctx.fillStyle = pattern({
            i: i + Math.round(this.center[0] / u) - Math.round(this.radius / u),
            j: j + Math.round(this.center[1] / u) - Math.round(this.radius / u),
            colors,
            ctx
          })

          const x = (i * u) - this.radius
          const y = (j * u) - this.radius
          ctx.fillRect(x, y, u, u)
        }
      }
      ctx.restore()
    })
  }
}
