import Store from 'store'

export function setup () {
  const renderer = Store.renderer.instance.get()

  // Draw text on a black background for the Restorers
  renderer.draw('trace', ctx => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  })
  drawTexts()
  renderer.cache('trace')

  // Draw the pattern as a background
  renderer.draw('trace', ctx => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    const u = ctx.canvas.resolution

    for (let i = 0; i < ctx.canvas.width; i++) {
      for (let j = 0; j < ctx.canvas.height; j++) {
        const x = i * u
        const y = j * u
        const color = Store.scene.pattern.current({ i, j, ctx, colors: Store.scene.palette.current })
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x, y, u, u)
        }
      }
    }
  })

  // Draw the text on top of the pattern
  drawTexts()

  function drawTexts () {
    for (const text of document.querySelectorAll('#App > .drawn-on-trace *')) {
      renderer.drawElement('trace', text)
    }
  }
}

export function update () {
  const debug = Store.renderer.debug.get()
  const now = Date.now()

  Store.renderer.instance.current.clear()
  for (const creature of Store.population.content.get()) {
    creature.update()
    creature.render({ debug: debug || creature.timestamp + 3000 > now })
  }
}

export default { setup, update }
