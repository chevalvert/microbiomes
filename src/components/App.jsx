import Store from 'store'
import { Component } from 'utils/jsx'
import { readable } from 'utils/state'

import Scene from 'components/Scene'

export default class App extends Component {
  beforeRender () {
    this.handleResize = this.handleResize.bind(this)
  }

  template () {
    return (
      <main id='App' class='app'>
        <Scene ref={this.ref('scene')} />
        <h1 class='copied-on-trace'>
          <div>generative</div>
          <div>graphic</div>
          <div>drift</div>
        </h1>
      </main>
    )
  }

  afterRender () {
    window.addEventListener('resize', this.handleResize)
  }

  afterMount () {
    Store.scene.instance = readable(this.refs.scene)

    // WIP: rendered too late
    // for (const element of this.refs.texts) {
    //   this.refs.scene.renderTextElement(element, 'trace')
    // }
  }

  handleResize () {
    this.log('TODO: handleResize')
  }
}
