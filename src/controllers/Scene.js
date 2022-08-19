import Store from 'store'
import { randomOf } from 'controllers/Prng'

// function noise () {
//   const u = TRACE.canvas.resolution
//   for (let i = 0; i < window.innerWidth / u; i++) {
//     for (let j = 0; j < window.innerHeight / u; j++) {
//       TRACE.fillStyle = `hsl(${roundTo((j * u / window.innerHeight) * 180, 10)}, ${roundTo((((i * u) / (window.innerWidth))) * 100, 10)}%, 70%)`
//       // const n = renderer.noise(i * u, j * u)
//       // TRACE.fillStyle = COLORS[Math.floor(Math.abs(n) * COLORS.length)]
//       TRACE.fillRect(i * u, j * u, u, u)
//     }
//   }
// }

export function setup () {
  const renderer = Store.renderer.instance.get()
  const padding = Store.scene.padding.get()
  const bounds = [padding, padding, window.innerWidth - padding * 2, window.innerHeight - padding * 2]

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
    for (let x = bounds[0]; x < bounds[2] + bounds[0]; x += u) {
      for (let y = bounds[1]; y < bounds[3] + bounds[1]; y += u) {
        ctx.fillStyle = Store.scene.pattern.current({ x, y, u, colors: Store.scene.palette.current })
        ctx.fillRect(x, y, u, u)
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
