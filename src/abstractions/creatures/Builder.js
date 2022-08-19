import Store from 'store'
import Creature from 'abstractions/Creature'

export default class Builder extends Creature {
  get color () {
    return 'yellow'
  }

  render () {
    super.render()

    this.renderer.draw('trace', ctx => {
      const colors = Store.scene.palette.get()
      const pattern = Store.scene.pattern.get()

      const u = ctx.canvas.resolution
      ctx.save()
      ctx.translate(this.position[0], this.position[1])
      ctx.clip(this.path)
      for (let i = 0; i < this.size; i += u) {
        for (let j = 0; j < this.size; j += u) {
          const x = i - Math.round(this.size / 2)
          const y = j - Math.round(this.size / 2)
          ctx.fillStyle = pattern({
            // Adding this.position because the translation is not applied here
            x: x + this.position[0],
            y: y + this.position[1],
            u,
            colors
          })
          ctx.fillRect(x, y, u, u)
        }
      }
      ctx.restore()
    })
  }
}
