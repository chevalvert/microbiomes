import WebSocket from 'reconnectingwebsocket'
import { writable } from 'utils/state'

export default ({
  content: writable({}),
  isClosed: writable(true),
  sendJson: function (object) {
    this.socket.send(JSON.stringify(object))
  },
  open: function (url = window.location.origin.replace('http', 'ws').replace(/(#.*)$/, '')) {
    this.socket = new WebSocket(url)
    this.socket.onopen = () => this.isClosed.set(false)
    this.socket.onclose = () => this.isClosed.set(true)
    this.socket.onmessage = message => {
      try {
        const content = JSON.parse(message.data)
        this.content.set(content)
      } catch (error) {
        console.warn(error)
      }
    }
    return this
  }
})
