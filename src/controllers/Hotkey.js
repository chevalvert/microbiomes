import Hotkeys from 'hotkeys-js'

export default (key, callback) => {
  callback && Hotkeys(key, event => {
    event.preventDefault()
    event.stopPropagation()
    callback(event)
  })
}
