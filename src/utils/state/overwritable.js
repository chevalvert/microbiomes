import { Writable } from './writable'

function overwritable (source) {
  const signal = new Writable(source.current)

  signal.source = source
  const setValue = signal.set.bind(signal)
  source.subscribe(setValue)

  signal.set = function (value, force) {
    source.unsubscribe(setValue)
    signal.overwritten = true
    setValue(value, force)
  }

  return signal
}

export default overwritable
