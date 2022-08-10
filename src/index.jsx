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

;(async () => {
  Raf.start()

  scene = render(<Scene />, document.body).components[0]
  render((
    <h1>
      <span class='copy'>generative</span><br />
      <span class='copy'>graphic</span><br />
      <span class='copy'>drift</span>
    </h1>
  ), document.body)
  document.body.classList.remove('is-loading')

  // Wait for DOM to be completely loaded
  if (document.readyState !== 'complete') {
    await new Promise(resolve => {
      document.onreadystatechange = () => {
        if (document.readyState === 'complete') resolve()
      }
    })
  }

  // Background
  const PADDING = 75
  const TRACE = scene.getContext('trace')
  TRACE.fillStyle = BACKGROUND
  TRACE.fillRect(PADDING, PADDING, window.innerWidth - PADDING * 2, window.innerHeight - PADDING * 2)
  // noise()

  grid([PADDING, PADDING], [window.innerWidth - PADDING * 2, window.innerHeight - PADDING * 2])

  // WIP: copy onto canvas every .copy element
  TRACE.fillStyle = 'white'
  TRACE.textBaseline = 'ideographic' // Match CSS baseline
  const font = new window.FontFace('Styrene', 'url(fonts/styrenea-regular.woff2)')
  await font.load()
  document.fonts.add(font)

  for (const el of document.querySelectorAll('.copy')) {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el, null)
    const fontSize = style.getPropertyValue('font-size')
    TRACE.font = `${fontSize} Styrene`
    TRACE.fillText(el.innerText, rect.left, rect.top + parseInt(fontSize))
  }

  // Population
  const shifters = []
  // shifters.push(new Shifter(scene, {
  //   position: [window.innerWidth / 2, window.innerHeight / 2],
  //   size: random(50, 150)
  // }))

  for (let i = 0; i < 30; i++) {
    const shifter = new Shifter(scene, {
      position: [random(0, window.innerWidth), random(0, window.innerHeight)],
      shape: 'blob',
      size: 50
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
    const size = 100
    grid([e.pageX - size / 2, e.pageY - size / 2], [size, size])

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
          // ? COLORS[Math.round((y) % (COLORS.length - 1))]
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
