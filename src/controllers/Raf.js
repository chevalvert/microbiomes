import Store from 'store'
import { raf, fpsLimiter } from '@internet/raf'

let isRunning = Store.raf.isRunning.get()

const tick = () => Store.raf.frameCount.update(fc => ++fc)
const second = fpsLimiter(Store.raf.fps.current, tick)

Store.raf.isRunning.subscribe(state => {
  if (state === isRunning) return

  state ? start() : stop()
  isRunning = state
})

export function start () {
  raf.add(second)
}

export function stop () {
  raf.remove(second)
}

export default { start, stop }
