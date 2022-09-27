import Store from 'store'
import { render } from 'utils/jsx'
import DOMReady from 'utils/dom-is-ready'

import App from 'components/App'

import GhostRemote from 'controllers/GhostRemote'
import Hotkey from 'controllers/Hotkey'
import Population from 'controllers/Population'
import Prng from 'controllers/Prng'
import Raf from 'controllers/Raf'
import Scene from 'controllers/Scene'
import WebSocketServer from 'controllers/WebSocketServer'

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
  .subscribe(({ reload }) => reload && window.location.reload())
/// #endif

;(async () => {
  await DOMReady()
  await new window.FontFace('Styrene', 'url(/fonts/styrenea-regular.woff2)').load()
  render(<App />, document.body)

  WebSocketServer.open(window.ENV.remoteWebSocketServer)

  window.document.title += ' | ' + Prng.seed

  Scene.setup()
  Store.raf.frameCount.subscribe(Scene.update)

  if (window.ENV.ghostRemote) GhostRemote.start()
  WebSocketServer.content.subscribe(data => data.id === window.ENV.id && Population.add(data.creature))

  Raf.start()

  if (window.ENV.ticksBeforeRefresh) {
    console.log(`Refreshing in ${window.ENV.ticksBeforeRefresh} ticks !`)
    Store.raf.frameCount.subscribe(frameCount => {
      if (frameCount < window.ENV.ticksBeforeRefresh) return
      window.location.reload()
    })
  }
})()

window.onresize = () => window.location.reload()

Hotkey('w', () => Store.renderer.debug.update(state => !state))
Hotkey('p', () => Store.raf.isRunning.update(state => !state))

/// #if DEVELOPMENT
Hotkey('cmd+k', async () => {
  const body = new window.FormData()
  body.append('image', Store.renderer.instance.current.toDataURL())
  await window.fetch('/dev/snapshot', { method: 'POST', body })
  console.log('Snapshot successfully taken')
})
/// #endif
