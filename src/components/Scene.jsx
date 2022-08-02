import Store from 'store'
import { Component } from 'utils/jsx'
import { writable } from 'utils/state'

export default class Scene extends Component {
  beforeRender (props) {
    this.state = {
      width: writable(window.innerWidth / props.resolution),
      height: writable(window.innerHeight / props.resolution),
      context: undefined,
      debugContext: undefined
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
    this.state.debugContext = this.refs.debug.getContext('2d')

    this.state.debugContext.scale(this.props.resolution, this.props.resolution)
  }

  debug (position, {
    text = null,
    dimensions = [1, 1],
    color = 'cyan'
  } = {}) {
    const ctx = this.state.debugContext

    ctx.strokeStyle = color
    ctx.strokeRect(position[0], position[1], dimensions[0], dimensions[1])

    if (!text) return
    ctx.fillStyle = color
    ctx.font = '3px monospace'
    ctx.fillText(text, position[0], position[1] - 1)
  }

  clear () {
    this.state.debugContext.clearRect(0, 0, this.width, this.height)
  }
}
