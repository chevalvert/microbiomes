import Hotkeys from 'Hotkeys-js'

export default ({ key, filter, callback } = {}) => {
  callback && Hotkeys(key, event => {
    if (filter && filter(event)) return

    event.preventDefault()
    event.stopPropagation()

    callback(event)
  })
}
