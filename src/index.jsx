import Store from 'store'
import { render } from 'utils/jsx'
import { random, roundTo } from 'missing-math'
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

  scene = render(<Scene />, document.body).components[0]
  render(<h1>Microbiomes</h1>, document.body)
  document.body.classList.remove('is-loading')

  // Background
  const TRACE = scene.getContext('trace')
  TRACE.fillStyle = BACKGROUND
  TRACE.fillRect(0, 0, window.innerWidth, window.innerHeight)

  // noise()
  // grid()

  // Population
  const shifters = []
  shifters.push(new Shifter(scene, {
    position: [window.innerWidth / 2, window.innerHeight / 2],
    size: random(50, 150)
  }))

  for (let i = 0; i < 30; i++) {
    const shifter = new Shifter(scene, {
      position: [random(0, window.innerWidth), random(0, window.innerHeight)],
      size: 100
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
    grid([e.pageX, e.pageY], [100, 100])

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

  // window.addEventListener('mousemove', e => {
  //   // const [i, j] = scene.screenToWorld(e.pageX, e.pageY)
  //   window.requestAnimationFrame(() => {
  //     scene.clear()
  //     shifters[0].position = [e.pageX, e.pageY]
  //     shifters[0].update()
  //     shifters[0].render()
  //   })
  // })

  function grid ([xstart, ystart] = [0, 0], [w, h] = [window.innerWidth, window.innerHeight]) {
    const u = TRACE.canvas.resolution
    for (let x = xstart; x < xstart + w; x += u) {
      for (let y = ystart; y < ystart + h; y += u) {
        TRACE.fillStyle = Math.round(x / u) % 2 !== Math.round(y / u) % 2
          ? randomOf(COLORS)
          : BACKGROUND
        TRACE.fillRect(x, y, u, u)
      }
    }
  }

  function noise () {
    const u = TRACE.canvas.resolution
    for (let i = 0; i < window.innerWidth / u; i++) {
      for (let j = 0; j < window.innerHeight / u; j++) {
        TRACE.fillStyle = `hsl(${roundTo((j * u / window.innerHeight) * 180, 10)}, ${roundTo((((i * u) / (window.innerWidth))) * 100, 10)}%, 70%)`
        // const n = scene.noise(i * u, j * u)
        // TRACE.fillStyle = COLORS[Math.floor(Math.abs(n) * COLORS.length)]
        TRACE.fillRect(i * u, j * u, u, u)
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
