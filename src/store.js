import { localStored, readable, writable } from 'utils/state'
import randomOf from 'utils/array-random'

const Store = {
  renderer: {
    instance: undefined, // Will be set by <App> when mounted
    showDebugOverlay: localStored(false, 'showDebugOverlay'),
    layers: readable({
      trace: {
        resolution: 1 / 3,
        smooth: false,
        round: true,
        clear: false,
        exportable: true,
        style: {
          backgroundColor: 'black'
        }
      },
      creatures: {
        resolution: 1 / 3,
        smooth: false,
        round: true,
        clear: true,
        exportable: true,
        style: {
          mixBlendMode: 'color'
        }
      },
      debug: {
        resolution: 1,
        smooth: false,
        round: false,
        clear: true,
        exportable: false
      }
    })
  },

  // Public store for the Scene controller
  scene: {
    padding: readable(75),
    palettes: readable([
      ['white', 'black'],
      ['#fe0500', '#ff7c3b', '#ffe1b3', '#fde4f9', '#f28cfe', '#c656ff', '#a23df4', '#2314fd'],
      ['#5181c9', '#49b094', '#5da3d3', '#2b6c4b', '#b79497', '#5b8cde']
    ]),
    patterns: readable([
      ({ x, y, u, colors }) => Math.round(x / u) % 2 !== Math.round(y / u) % 2
        ? randomOf(colors)
        : 'black',

      ({ x, y, u, colors }) => Math.round(x / u) % 2 !== Math.round(y / u) % 2
        ? colors[Math.round((y) % (colors.length - 1))]
        : 'black',

      ({ x, y, u, colors }) => Math.round(x / u) % 2 !== Math.round(y / u) % 2
        ? colors[Math.round((Math.sqrt(x * y)) % (colors.length - 1))]
        : 'black'
    ])
  },

  // Public store for the Population controller
  population: {
    maxLength: readable(10),
    content: writable([])
  },

  // Public store for the RAF controller
  raf: {
    fps: readable(60),
    isRunning: writable(true),
    frameCount: writable(0)
  }
}

window.Store = Store
export default Store
