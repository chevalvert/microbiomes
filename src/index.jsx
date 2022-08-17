import Store from 'store'
import { render } from 'utils/jsx'
import DOMReady from 'utils/dom-is-ready'

import App from 'components/App'

import Draw from 'controllers/Draw'
import Hotkey from 'controllers/Hotkey'
import Raf from 'controllers/Raf'

// WIP: insert creatures from another client
import WebSocketServer from 'controllers/WebSocketServer'
WebSocketServer.content.subscribe(console.log.bind(console))
WebSocketServer.open()

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
  .subscribe(({ reload }) => reload && window.location.reload())
/// #endif

;(async () => {
  await DOMReady()
  await new window.FontFace('Styrene', 'url(fonts/styrenea-regular.woff2)').load()

  render(<App />, document.body)

  Draw.setup()
  Store.raf.frameCount.subscribe(Draw.update)

  Raf.start()
})()

Hotkey('w', () => Store.scene.showDebugOverlay.update(state => !state))
Hotkey('p', () => Store.raf.isRunning.update(state => !state))

/// #if DEVELOPMENT
Hotkey('cmd+k', async () => {
  const body = new window.FormData()
  body.append('image', Store.scene.instance.current.toDataURL())
  await window.fetch('/dev/snapshot', { method: 'POST', body })
  console.log('Snapshot successfully taken')
})
/// #endif
