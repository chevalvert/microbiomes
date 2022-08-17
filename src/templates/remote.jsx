import { render } from 'utils/jsx'
import WebSocketServer from 'controllers/WebSocketServer'

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
  .subscribe(({ reload }) => reload && window.location.reload())
/// #endif

WebSocketServer.open()

render([
  <button event-click={send}>Add 1 Shifter</button>
], document.body)

function send () {
  WebSocketServer.sendJson({
    id: window.ENV.id,
    creature: {
      shape: 'blob',
      size: 100
    }
  })
}
