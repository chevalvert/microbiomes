import Store from 'store'
import { Component } from 'utils/jsx'
import { readable } from 'utils/state'

import Renderer from 'components/Renderer'

export default class App extends Component {
  template () {
    return (
      <main id='App' class='app'>
        <Renderer ref={this.ref('renderer')} />
        <h1 class='drawn-on-trace'>
          <div>generative</div>
          <div>graphic</div>
          <div>drift</div>
        </h1>
      </main>
    )
  }

  afterMount () {
    Store.renderer.instance = readable(this.refs.renderer)
  }
}
