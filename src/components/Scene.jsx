import Store from 'store'
import classnames from 'classnames'
import { Noise } from 'noisejs'
import { Component } from 'utils/jsx'
import capitalize from 'utils/capitalize'
import { roundTo } from 'missing-math'
import noop from 'utils/noop'

const CACHE = new Map()
const ROUNDABLE_METHODS = [
  'arc',
  'translate',
  'drawImage',
  'fillRect',
  'fillText',
  'lineTo',
  'moveTo'
]

export default class Scene extends Component {
  beforeRender (props) {
    this.handleResize = this.handleResize.bind(this)
    this.state = {
      contexts: new Map(),
      noiseMap: new Noise() // TODO: seed
    }
  }

  template (props, state) {
    return (
      <section
        id='Scene'
        class='scene'
        store-class-has-debug-overlay={Store.scene.showDebugOverlay}
      >
        {Object.entries(Store.scene.layers.current).map(([name, { smooth }]) => (
          <canvas
            id={capitalize(name)}
            class={classnames('scene__canvas--' + name, { pixelated: !smooth })}
            ref={this.refMap('canvas', name)}
          />
        ))}
      </section>
    )
  }

  getContext (name) {
    return this.state.contexts.get(name)
  }

  afterRender () {
    window.addEventListener('resize', this.handleResize)
  }

  afterMount () {
    this.#forEachLayers((canvas, context, { name, smooth, resolution, round }) => {
      canvas.width = window.innerWidth * resolution
      canvas.height = window.innerHeight * resolution
      canvas.resolution = 1 / resolution

      context = context || canvas.getContext('2d')
      context.imageSmoothingEnabled = smooth
      context.scale(resolution, resolution)
      context.round = v => isNaN(v) ? v : roundTo(v, 1 / resolution)

      if (round) {
        for (const method of ROUNDABLE_METHODS) {
          const origin = context[method]
          context[method] = (...args) => origin.call(context, ...args.map(context.round))
        }
      }
      this.state.contexts.set(name, context)
    })
  }

  clear () {
    this.#forEachLayers((canvas, context, { clear }) => {
      if (!clear) return
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    })
  }

  handleResize () {
    this.log('TODO: handleResize')
  }

  #forEachLayers (callback = noop) {
    const layers = Store.scene.layers.get()
    for (const name in layers) {
      const canvas = this.refs.canvas.get(name)
      const context = this.state.contexts.get(name)
      callback(canvas, context, { ...layers[name], name })
    }
  }

  debug (position, {
    text = null,
    dimensions = [1, 1],
    color = 'cyan',
    path
  } = {}) {
    const ctx = this.state.contexts.get('debug')

    ctx.strokeStyle = color

    if (path) {
      ctx.save()
      ctx.translate(position[0], position[1])
      ctx.stroke(path)
      ctx.restore()
    } else ctx.strokeRect(position[0] - dimensions[0] / 2, position[1] - dimensions[1] / 2, dimensions[0], dimensions[1])

    if (!text) return
    ctx.fillStyle = color
    ctx.lineWidth = 3
    ctx.font = '20px Styrene'
    ctx.fillText(text, position[0] - this.measureText(text) / 2, position[1])
  }

  measureText (text, layerName = 'debug') {
    const id = layerName + '__' + text
    if (CACHE.has(id)) return CACHE.get(id)

    const { width } = this.getContext(layerName).measureText(text)
    CACHE.set(id, width)
    return width
  }

  noise (i, j, {
    noise = 'perlin',
    octaves = 8
  } = {}) {
    const res = 2 ** octaves
    if (!j && j !== 0) j = Store.raf.frameCount.current
    return this.state.noiseMap[noise + '2'](i / res, j / res)
  }

  toDataURL () {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    this.#forEachLayers((c, context, { exportable }) => {
      if (!exportable) return
      ctx.drawImage(c, 0, 0, canvas.width, canvas.height)
    })

    return canvas.toDataURL()
  }
}
