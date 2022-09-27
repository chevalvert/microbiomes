import Store from 'store'
import { Component } from 'utils/jsx'
import { derived, readable } from 'utils/state'

import Renderer from 'components/Renderer'

export default class App extends Component {
  beforeRender () {
    this.state = {
      screenId: readable(window.ENV.id),
      remainingTicks: derived(Store.raf.frameCount, frameCount => Math.max(0, window.ENV.ticksBeforeRefresh - frameCount)),
      buildersLength: derived(Store.population.content, creatures => creatures.filter(c => c.constructor.name === 'Builder').length),
      restorersLength: derived(Store.population.content, creatures => creatures.filter(c => c.constructor.name === 'Restorer').length),
      shiftersLength: derived(Store.population.content, creatures => creatures.filter(c => c.constructor.name === 'Shifter').length)
    }
  }

  template (props, state) {
    return (
      <main id='App' class='app'>
        <Renderer ref={this.ref('renderer')} />
        <h1 class='drawn-on-trace'>
          <div>generative</div>
          <div>graphic</div>
          <div>drift</div>
        </h1>
        <section class='app__stats'>
          <div class='flexgroup'>
            <span data-label='screen' store-text={state.screenId} />
            {window.ENV.ticksBeforeRefresh && (
              <span data-label='remaining ticks' store-text={state.remainingTicks} />
            )}
          </div>
          <span data-label='builders' store-text={state.buildersLength} />
          <span data-label='restorers' store-text={state.restorersLength} />
          <span data-label='shifters' store-text={state.shiftersLength} />
        </section>
      </main>
    )
  }

  afterMount () {
    Store.renderer.instance = readable(this.refs.renderer)
  }
}
