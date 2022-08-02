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

const u = 5
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

  const scene = render(<Scene resolution={u} />, document.body).components[0]
  render(<h1>Microbiomes</h1>, document.body)
  document.body.classList.remove('is-loading')

  // Background
  scene.context.fillStyle = BACKGROUND
  scene.context.fillRect(0, 0, scene.width, scene.height)

  grid()

  // Population
  const shifters = []
  for (let i = 0; i < 20; i++) {
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
    Store.raf.isRunning.update(state => !state)
  })

  function grid () {
    for (let i = 0; i < scene.width; i++) {
      for (let j = 0; j < scene.height; j++) {
        scene.context.fillStyle = i % 2 !== j % 2 ? randomOf(COLORS) : BACKGROUND
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

Hotkey({
  key: 'w',
  callback: () => Store.scene.showDebugOverlay.update(state => !state)
})
