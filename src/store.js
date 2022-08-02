import { localStored, readable, writable } from 'utils/state'

const Store = {
  scene: {
    showDebugOverlay: localStored(false, 'showDebugOverlay')
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
