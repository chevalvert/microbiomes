import Store from 'store'
import { Noise } from 'noisejs'
import { Component } from 'utils/jsx'
import { writable } from 'utils/state'

const CACHE = new Map()

export default class Scene extends Component {
  beforeRender (props) {
    this.state = {
      width: writable(window.innerWidth / props.resolution),
      height: writable(window.innerHeight / props.resolution),
      context: undefined,
      debugContext: undefined,
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
        <canvas
          ref={this.ref('canvas')}
          store-width={state.width}
          store-height={state.height}
        />
        <canvas
          ref={this.ref('debug')}
          class='scene__debug'
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </section>
    )
  }

  get width () { return this.refs.canvas.width }
  get height () { return this.refs.canvas.height }
  get context () { return this.state.context }

  afterRender () {
    // TODO
    // window.addEventListener('resize', this.handleResize)

  }

  afterMount () {
    this.state.context = this.refs.canvas.getContext('2d')
    this.state.context.imageSmoothingEnabled = false

    this.state.debugContext = this.refs.debug.getContext('2d')
    this.state.debugContext.scale(this.props.resolution, this.props.resolution)
  }

  clear () {
    this.state.debugContext.clearRect(0, 0, this.width, this.height)
  }

  debug (position, {
    text = null,
    dimensions = [1, 1],
    color = 'cyan',
    path
  } = {}) {
    const ctx = this.state.debugContext

    ctx.strokeStyle = color

    if (path) {
      ctx.save()
      ctx.translate(position[0], position[1])
      ctx.stroke(path)
      ctx.restore()
    } else ctx.strokeRect(position[0], position[1], dimensions[0], dimensions[1])

    if (!text) return
    ctx.fillStyle = color
    ctx.font = '4px monospace'
    ctx.fillText(text, position[0] + dimensions[0] / 2 - this.measureText(text) / 2, position[1] + dimensions[1] / 2 - 1)
  }

  measureText (text) {
    if (CACHE.has(text)) return CACHE.get(text)

    const { width } = this.state.debugContext.measureText(text)
    CACHE.set(text, width)
    return width
  }

  noise (i, j, {
    noise = 'perlin',
    octaves = 7
  } = {}) {
    const res = 2 ** octaves
    if (!j && j !== 0) j = Store.raf.frameCount.current
    return this.state.noiseMap[noise + '2'](i / res, j / res)
  }

  screenToWorld (x, y) {
    return [
      Math.round(x / this.props.resolution),
      Math.round(y / this.props.resolution)
    ]
  }

  toDataURL () {
    const { width, height } = this.refs.canvas.getBoundingClientRect()

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(this.refs.canvas, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL()
  }
}
