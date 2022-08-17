import Store from 'store'
import randomOf from 'utils/array-random'

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

  const colors = randomOf(Store.scene.palettes.get())
  const pattern = randomOf(Store.scene.patterns.get())

  // Render pixel grid
  renderer.draw('trace', ctx => {
    const u = ctx.canvas.resolution
    for (let x = bounds[0]; x < bounds[2] + bounds[0]; x += u) {
      for (let y = bounds[1]; y < bounds[3] + bounds[1]; y += u) {
        ctx.fillStyle = pattern({ x, y, u, colors })
        ctx.fillRect(x, y, u, u)
      }
    }
  })

  // Render texts
  for (const text of document.querySelectorAll('#App > .drawn-on-trace *')) {
    renderer.drawElement('trace', text)
  }
}

export function update () {
  Store.renderer.instance.current.clear()
  for (const creature of Store.population.content.get()) {
    creature.update()
    creature.render()
  }
}

export default { setup, update }
