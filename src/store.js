import { localStored, readable, writable } from 'utils/state'
import { randomOf, seed } from 'controllers/Prng'

const Store = {
  seed: readable(seed),

  renderer: {
    instance: undefined, // Will be set by <App> when mounted
    debug: localStored(false, 'debug'),

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
    padding: readable(30),
    palette: readable(
      randomOf([
        // ['white', 'black'],
        // ['#8c7b43', '#e2e2e5', '#c5cfcb', '#b3cbcd', '#b4bcba', '#97bfca', '#9aa2a5', '#777d80', '#565a5b'],
        // ['white', '#AAA', '#666', '#EEE', 'black'],
        // ['#fe0500', '#ff7c3b', '#ffe1b3', '#fde4f9', '#f28cfe', '#c656ff', '#a23df4', '#2314fd'],
        ['#5181c9', '#49b094', '#5da3d3', '#2b6c4b', '#b79497', '#5b8cde']
      ])
    ),
    pattern: readable(randomOf([
      randomOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) + '-',
      'R-',
      'R-RT',
      '11-22T--3344---55--'
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
    maxLength: readable(20),
    initialDistribution: readable([
      'Builder',
      'Restorer', 'Restorer', 'Restorer',
      'Shifter', 'Shifter', 'Shifter', 'Shifter', 'Shifter', 'Shifter'
    ]),
    content: writable([])
  },

  // Public store for the RAF controller
  raf: {
    fps: readable(30),
    isRunning: writable(true),
    frameCount: writable(0)
  }
}

window.Store = Store
export default Store
