import { localStored, readable, writable } from 'utils/state'

const Store = {
  scene: {
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

  // Public store for the RAF controller
  raf: {
    fps: readable(60),
    isRunning: writable(true),
    frameCount: writable(0)
  }
}

window.Store = Store
export default Store
