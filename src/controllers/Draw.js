import Store from 'store'
import { random } from 'missing-math'
import randomOf from 'utils/array-random'

import Shifter from 'abstractions/Shifter'

const creatures = []
const PADDING = 75
const BACKGROUND = 'black'
const COLORS = [
  // '#fe0500',
  // '#ff7c3b',
  // '#ffe1b3',
  // '#fde4f9',
  // '#f28cfe',
  // '#c656ff',
  // '#a23df4',
  // '#2314fd',

  // '#9eb04c',
  // '#865ec0',

  '#5181c9',
  '#49b094',
  '#5da3d3',
  '#2b6c4b',
  '#b79497',
  '#5b8cde',

  // '#a597c9',
  // '#a8ae21'
]

// function noise () {
//   const u = TRACE.canvas.resolution
//   for (let i = 0; i < window.innerWidth / u; i++) {
//     for (let j = 0; j < window.innerHeight / u; j++) {
//       TRACE.fillStyle = `hsl(${roundTo((j * u / window.innerHeight) * 180, 10)}, ${roundTo((((i * u) / (window.innerWidth))) * 100, 10)}%, 70%)`
//       // const n = scene.noise(i * u, j * u)
//       // TRACE.fillStyle = COLORS[Math.floor(Math.abs(n) * COLORS.length)]
//       TRACE.fillRect(i * u, j * u, u, u)
//     }
//   }
// }

export function setup () {
  const scene = Store.scene.instance.get()

  // Background
  scene.draw('trace', ctx => {
    const rect = [PADDING, PADDING, window.innerWidth - PADDING * 2, window.innerHeight - PADDING * 2]
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(...rect)

    // Render pixel grid
    const u = ctx.canvas.resolution
    for (let x = rect[0]; x < rect[2] + rect[0]; x += u) {
      for (let y = rect[1]; y < rect[3] + rect[1]; y += u) {
        ctx.fillStyle = Math.round(x / u) % 2 !== Math.round(y / u) % 2
          ? randomOf(COLORS)
          // ? COLORS[Math.round((y) % (COLORS.length - 1))]
          : BACKGROUND
        ctx.fillRect(x, y, u, u)
      }
    }
  })

  // WIP Render app text
  for (const text of document.querySelectorAll('.copied-on-trace *')) {
    scene.drawElement('trace', text)
  }

  // Population
  for (let i = 0; i < 30; i++) {
    const shifter = new Shifter(scene, {
      position: [random(0, window.innerWidth), random(0, window.innerHeight)],
      shape: 'blob',
      size: 50
    })
    creatures.push(shifter)
  }
}

export function update () {
  Store.scene.instance.current.clear()
  for (const creature of creatures) {
    creature.update()
    creature.render()
  }
}

export default { setup, update }
