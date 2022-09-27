import Hotkeys from 'Hotkeys-js'

export default (key, callback) => {
  callback && Hotkeys(key, event => {
    event.preventDefault()
    event.stopPropagation()
    callback(event)
  })
}
