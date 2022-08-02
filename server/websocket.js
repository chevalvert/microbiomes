const WebSocket = require('ws')
const logger = require('./utils/logger')

const wss = new WebSocket.Server({ noServer: true })
const map = new Map()

wss.on('connection', async (ws, req) => {
  const id = req.session.id
  logger({ color: 'white', prefix: '[WEBSOCKET]' })(`${id} connected`)
  map.set(id, ws)
  ws.send(JSON.stringify({ event: 'connection', message: id }))
  ws.on('close', () => map.delete(id))
})

module.exports = {
  handleUpgrade: (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
  },

  broadcast: message => {
    for (const client of wss.clients) client.send(message)
  },

  send: (id, message) => {
    const ws = map.get(id)
    if (ws) ws.send(message)
  }
}
