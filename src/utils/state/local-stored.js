/* global localStorage */
import { writable } from 'utils/state'

const NS = `${window.ENV.name}@${window.ENV.version}/${window.location.pathname}__`

const DEFAULTS = {
  encode: JSON.stringify,
  decode: value => {
    let v
    try {
      v = JSON.parse(value)
    } catch {
      v = value
    }
    return v
  }
}

function localStored (initialValue, key, {
  decode = DEFAULTS.decode,
  encode = DEFAULTS.encode,
  silent = false
} = {}) {
  const signal = writable(initialValue)

  const ns = NS + key
  const value = localStorage.getItem(ns) || initialValue

  if (value !== null) {
    if (silent) signal.current = decode(value)
    else signal.set(decode(value))
  } else {
    localStorage.setItem(ns, encode(signal.current))
  }

  signal.subscribe(value => localStorage.setItem(ns, encode(value)))
  return signal
}

export default localStored
