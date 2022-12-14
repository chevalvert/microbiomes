import { readable, writable } from 'utils/state'
import { Component } from 'utils/jsx'
import noop from 'utils/noop'
import cuid from 'cuid'

export default class StepSelect extends Component {
  beforeRender (props) {
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      id: props.id || cuid(),
      value: props['store-value'] || writable(props.value || 0),
      options: readable(props.options || [])
    }
  }

  template (props, state) {
    return (
      <div class='select' id={state.id} data-label={props.label}>
        <select
          ref={this.ref('select')}
          event-change={this.handleChange}
        >
          {
            props.options.map(({ label, value, disabled, selected }) => (
              <option
                value={value}
                disabled={disabled}
                selected={selected}
              >
                {label || value}
              </option>
            ))
          }
        </select>
      </div>
    )
  }

  handleChange (e) {
    this.state.value.set(e.target.value)
    ;(this.props['event-change'] || noop)(e)
  }
}
