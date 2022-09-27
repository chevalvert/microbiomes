import Population from 'controllers/Population'
import { randomInt } from 'missing-math'

let timer
let isRunning = false

function tick () {
  timer = window.setTimeout(() => {
    Population.add(Population.createRandomCreature())
    tick()
  }, randomInt(window.ENV.ghostRemote[0], window.ENV.ghostRemote[1]))
}

export function start () {
  if (isRunning) return
  isRunning = true
  tick()
}

export function stop () {
  isRunning = false
  window.clearTimeout(timer)
}

export default { start, stop }
