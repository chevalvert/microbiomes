import { localStored, readable, writable } from 'utils/state'
import { randomOf, seed } from 'controllers/Prng'

const Store = {
  seed: readable(seed),

  renderer: {
    instance: undefined, // Will be set by <App> when mounted
    debug: localStored(false, 'debug'),

    layers: readable({
      trace: {
        resolution: 1 / window.ENV.renderer.scale,
        smooth: false,
        round: true,
        clear: false,
        exportable: true,
        style: {
          backgroundColor: 'black'
        }
      },
      creatures: {
        resolution: 1 / window.ENV.renderer.scale,
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
    padding: readable(window.ENV.scene.padding),
    palette: readable(
      randomOf([
        ...window.ENV.scene.palettes
        // ['white', 'black'],
        // ['#8c7b43', '#e2e2e5', '#c5cfcb', '#b3cbcd', '#b4bcba', '#97bfca', '#9aa2a5', '#777d80', '#565a5b'],
        // ['white', '#AAA', '#666', '#EEE', 'black'],
        // ['#fe0500', '#ff7c3b', '#ffe1b3', '#fde4f9', '#f28cfe', '#c656ff', '#a23df4', '#2314fd'],
      ])
    ),
    pattern: readable(randomOf([
      randomOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) + '-',
      ...window.ENV.scene.patterns
    ].map(string => ({ i, j, ctx, colors }) => {
      // Interpret the pattern string as a looping array of color indexes
      const cols = ctx.canvas.width + (ctx.canvas.width % 2 === 0 ? 1 : 0)
      const index = i + j * cols
      const pattern = string.split('')
      const next = pattern[index % pattern.length]

      // Skip padding
      const padding = Store.scene.padding.current
      if (i < padding || i > ctx.canvas.width - padding) return 'black'
      if (j < padding || j > ctx.canvas.height - padding) return 'black'

      // Decode next symbol
      if (next === 'R') return randomOf(colors)
      if (next === 'T') return 'transparent'
      return colors[next % colors.length] || 'black'
    })))
  },

  // Public store for the Population controller
  population: {
    maxLength: readable(window.ENV.population.maxLength),
    initialTypeDistribution: readable(window.ENV.population.initialTypeDistribution),
    initialSizeDistribution: readable(window.ENV.population.initialSizeDistribution),
    content: writable([])
  },

  // Public store for the RAF controller
  raf: {
    fps: readable(window.ENV.renderer.fps || 60),
    isRunning: writable(true),
    frameCount: writable(0)
  }
}

window.Store = Store
export default Store
