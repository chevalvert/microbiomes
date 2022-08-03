import Store from 'store'
import { render } from 'utils/jsx'
import { random } from 'missing-math'
import randomOf from 'utils/array-random'

import Shifter from 'abstractions/Shifter'
import Scene from 'components/Scene'

import Hotkey from 'controllers/Hotkey'
import Raf from 'controllers/Raf'

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
  .subscribe(({ reload }) => reload && window.location.reload())
/// #endif

let scene
const u = 3
const BACKGROUND = 'black'
const COLORS = [
  // '#9eb04c',
  // '#865ec0',
  '#5181c9',
  // '#49b094',
  '#5da3d3',
  // '#2b6c4b',
  '#b79497',
  // '#5b8cde',
  // '#a597c9',
  // '#a8ae21'
]

;(async () => {
  Raf.start()

  scene = render(<Scene resolution={u} />, document.body).components[0]
  render(<h1>Microbiomes</h1>, document.body)
  document.body.classList.remove('is-loading')

  // Background
  scene.context.fillStyle = BACKGROUND
  scene.context.fillRect(0, 0, scene.width, scene.height)

  // noise()
  // grid()

  // Population
  const shifters = []

  shifters.push(new Shifter(scene, {
    position: [scene.width / 2, scene.height / 2],
    bounds: [scene.width, scene.height],
    size: 20
  }))

  for (let i = 0; i < 100; i++) {
    const shifter = new Shifter(scene, {
      position: [random(0, scene.width), random(0, scene.height)].map(Math.floor),
      bounds: [scene.width, scene.height],
      size: 20
    })
    shifters.push(shifter)
  }

  Store.raf.frameCount.subscribe(tick)

  // window.setInterval(() => {
  //   Store.raf.isRunning.set(false)
  //   window.setTimeout(() => {
  //     grid()
  //     Store.raf.isRunning.set(true)
  //   }, 1000)
  // }, 3000)

  window.addEventListener('click', e => {
    const [i, j] = scene.screenToWorld(e.pageX, e.pageY)

    grid([i, j], [30, 30])

    // for (let index = 0; index < 200; index++) {
    //   scene.context.fillStyle = randomOf(COLORS)
    //   const xoff = random(-20, 20)
    //   const yoff = random(-20, 20)
    //   scene.context.fillRect(Math.floor(i + xoff), Math.floor(j + yoff), 1, 1)
    // }

    // shifters.push(new Shifter(scene, {
    //   position: scene.screenToWorld(e.pageX, e.pageY),
    //   bounds: [scene.width, scene.height],
    //   size: 10
    // }))
  })

  function grid ([istart, jstart] = [0, 0], [w, h] = [scene.width, scene.height]) {
    for (let i = istart; i < istart + w; i++) {
      for (let j = jstart; j < jstart + h; j++) {
        scene.context.fillStyle = i % 2 !== j % 2 ? randomOf(COLORS) : BACKGROUND
        scene.context.fillRect(i, j, u, u)
      }
    }
  }

  function noise () {
    for (let i = 0; i < scene.width; i++) {
      for (let j = 0; j < scene.height; j++) {
        const n = scene.noise(i, j)
        scene.context.fillStyle = COLORS[Math.floor(Math.abs(n) * COLORS.length)]
        scene.context.fillRect(i, j, u, u)
      }
    }
  }

  function tick () {
    scene.clear()
    for (const shifter of shifters) {
      shifter.update()
      shifter.render()
    }
  }
})()

Hotkey('w', () => Store.scene.showDebugOverlay.update(state => !state))
Hotkey('p', () => Store.raf.isRunning.update(state => !state))

/// #if DEVELOPMENT
Hotkey('cmd+k', async () => {
  const body = new window.FormData()
  body.append('image', scene.toDataURL())
  await window.fetch('/dev/snapshot', { method: 'POST', body })
  console.log('Snapshot successfully taken')
})
/// #endif
