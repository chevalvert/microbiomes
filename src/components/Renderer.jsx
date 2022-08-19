import Store from 'store'
import classnames from 'classnames'
import { Noise } from 'noisejs'
import { Component } from 'utils/jsx'
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

export default class Renderer extends Component {
  beforeRender (props) {
    this.state = {
      contexts: new Map(),
      cachedLayers: new Map(),
      noiseMap: new Noise() // TODO: seed
    }
  }

  template (props, state) {
    return (
      <section id='Renderer' class='renderer'>
        {Object.entries(Store.renderer.layers.current).map(([name, { smooth }]) => (
          <canvas
            data-name={name}
            class={classnames({ pixelated: !smooth })}
            ref={this.refMap('canvas', name)}
          />
        ))}
      </section>
    )
  }

  afterMount () {
    this.#forEachLayers((canvas, context, { name, smooth, resolution, round, style = {} }) => {
      canvas.width = window.innerWidth * resolution
      canvas.height = window.innerHeight * resolution
      canvas.resolution = 1 / resolution

      for (const [prop, value] of Object.entries(style)) {
        canvas.style[prop] = value
      }

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

  cache (layerName) {
    const ctx = this.getContext(layerName)
    const canvas = document.createElement('canvas')
    canvas.width = ctx.canvas.width
    canvas.height = ctx.canvas.height
    canvas.getContext('2d').drawImage(ctx.canvas, 0, 0)
    this.state.cachedLayers.set(layerName, canvas)
  }

  getContext (layerName) {
    return this.state.contexts.get(layerName)
  }

  draw (layerName, callback) {
    const ctx = this.getContext(layerName)
    callback(ctx)
  }

  drawElement (layerName, el) {
    this.draw(layerName, ctx => {
      const style = window.getComputedStyle(el, null)
      ctx.fillStyle = style.getPropertyValue('color')
      ctx.textBaseline = 'ideographic'

      const fontSize = style.getPropertyValue('font-size')
      ctx.font = `${fontSize} Styrene`

      const { left, top } = el.getBoundingClientRect()
      ctx.fillText(el.innerText, left, top + parseInt(fontSize))
    })
  }

  debug (position, {
    text = null,
    dimensions = [10, 10],
    color = 'black',
    lineWidth = null,
    path
  } = {}) {
    this.draw('debug', ctx => {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth || ctx.canvas.resolution

      if (path) {
        ctx.save()
        ctx.translate(position[0], position[1])
        ctx.stroke(path)
        ctx.restore()
      } else {
        ctx.strokeRect(position[0] - dimensions[0] / 2, position[1] - dimensions[1] / 2, dimensions[0], dimensions[1])
      }

      if (text) {
        const padding = 5
        const fontSize = 12
        ctx.font = `${fontSize}px Styrene`

        const width = this.#measureText(text)
        const x = position[0] - dimensions[0] / 2 + padding - (ctx.lineWidth / 2)
        const y = position[1] - dimensions[1] / 2 - fontSize - padding

        ctx.fillStyle = 'black'
        ctx.fillRect(x - padding, y - padding, width + padding * 2, fontSize + padding * 2)

        ctx.fillStyle = 'white'
        ctx.fillText(text, x, y + fontSize - padding / 2)
      }
    })
  }

  noise (i, j, {
    noise = 'perlin',
    octaves = 8
  } = {}) {
    const res = 2 ** octaves
    if (!j && j !== 0) j = Store.raf.frameCount.current
    return this.state.noiseMap[noise + '2'](i / res, j / res)
  }

  #forEachLayers (callback = noop) {
    const layers = Store.renderer.layers.get()
    for (const name in layers) {
      const canvas = this.refs.canvas.get(name)
      const context = this.state.contexts.get(name)
      callback(canvas, context, { ...layers[name], name })
    }
  }

  #measureText (text, layerName = 'debug') {
    const id = layerName + '__' + text
    if (CACHE.has(id)) return CACHE.get(id)

    const { width } = this.getContext(layerName).measureText(text)
    CACHE.set(id, width)
    return width
  }

  toDataURL () {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    this.#forEachLayers((c, _, { exportable }) => {
      if (!exportable) return
      ctx.drawImage(c, 0, 0, canvas.width, canvas.height)
    })

    return canvas.toDataURL()
  }
}
