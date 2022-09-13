import { Component } from 'utils/jsx'
import { writable } from 'utils/state'
import classnames from 'classnames'
import noop from 'utils/noop'

export default class Button extends Component {
  beforeRender (props) {
    this.handleClick = this.handleClick.bind(this)

    this.state = {
      isWaiting: writable(false),
      isDisabled: props['store-disabled'] || writable(props.disabled)
    }
  }

  template (props) {
    return (
      <button
        class={classnames('button', 'input', props.class)}
        store-class-is-waiting={this.state.isWaiting}
        store-class-is-disabled={this.state.isDisabled}
        event-click={this.handleClick}
        event-mouseenter={props['event-mouseenter'] || noop}
        event-mouseleave={props['event-mouseleave'] || noop}
        title={props.title}
        type={props.type}
        store-disabled={this.state.isDisabled}
      >
        {props.label && <span class='button__text' innerHTML={props.label} />}
        {props.icon && <span class='button__icon' innerHTML={props.icon} ref={this.ref('icon')} />}
      </button>
    )
  }

  async handleClick (e) {
    if (this.state.isWaiting.get()) return e.preventDefault()

    this.state.isWaiting.set(true)
    await (this.props['event-click'] || noop)(e)

    // Trigger animation on .button__icon if any
    this.refs.icon.style.animation = 'none'
    void this.refs.icon.offsetHeight // eslint-disable-line no-void
    this.refs.icon.style.animation = null

    // Testing for mounted before doing anything, because the event-click may
    // cause this component to be destroyed
    if (!this.mounted) return
    this.state.isWaiting.set(false)
  }
}
