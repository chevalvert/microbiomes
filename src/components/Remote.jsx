import Store from 'store'
import { Component } from 'utils/jsx'
import { readable, writable } from 'utils/state'

import Button from 'components/Button'
import Select from 'components/Select'

import IconSend from 'iconoir/icons/right-round-arrow.svg'
import IconGenerate from 'iconoir/icons/refresh-double.svg'

import { createRandomCreature } from 'controllers/Population'
import WebSocketServer from 'controllers/WebSocketServer'

export default class Remote extends Component {
  beforeRender () {
    this.handleGenerate = this.handleGenerate.bind(this)
    this.handleTick = this.handleTick.bind(this)
    this.handleSend = this.handleSend.bind(this)

    this.state = {
      steps: readable(Math.ceil(Math.max(...window.ENV.population.initialSizeDistribution))),
      context: writable(undefined),

      currentScreen: writable((+window.ENV.id || 1).toString()),

      creature: writable(undefined),
      creatureType: writable('Creature'),
      creatureSize: writable(0),
      creatureSpeed: writable(0)
    }
  }

  template (props, state) {
    return (
      <main id='Remote' class='remote' store-data-creature={state.creatureType}>
        <header>
          <h1>
            <span>generative</span>
            <span>graphic</span>
            <span>drift</span>
          </h1>
        </header>

        <section
          class='remote__renderer'
          ref={this.ref('renderer')}
          style={`--steps: ${state.steps.get() / 10}`} // ???
        >
          <canvas ref={this.ref('canvas')} />
        </section>

        <section class='remote__stats'>
          <span data-label='function' store-text={state.creatureType} />
          <span data-label='size' store-text={state.creatureSize} />
          <span data-label='speed' store-text={state.creatureSpeed} />
        </section>

        <section class='remote__toolbar'>
          <Button
            icon={IconGenerate}
            class='button--generate'
            label='new drifter'
            event-click={this.handleGenerate}
          />
          <div class='flexgroup'>
            <Select
              // TODO: dynamic
              store-value={state.currentScreen}
              // TODO: handle change
              options={[
                { value: 1, label: 'screen #1', selected: window.ENV.id === '1' },
                { value: 2, label: 'screen #2', selected: window.ENV.id === '2' },
                { value: 3, label: 'screen #3', selected: window.ENV.id === '3' }
              ]}
            />
            <Button
              icon={IconSend}
              class='button--send'
              label='send drifter'
              event-click={this.handleSend}
            />
          </div>
        </section>
      </main>
    )
  }

  afterMount () {
    Store.raf.frameCount.subscribe(this.handleTick)
    this.handleGenerate()

    this.refs.context = this.refs.canvas.getContext('2d')
    this.refs.context.imageSmoothingEnabled = false
    this.refs.canvas.width = this.state.steps.current
    this.refs.canvas.height = this.state.steps.current
  }

  handleGenerate () {
    const creature = createRandomCreature(['Builder', 'Restorer', 'Shifter'])

    this.state.creature.set(creature)

    this.state.creatureType.set(creature.constructor.name)
    this.state.creatureSpeed.set(creature.speed)
    this.state.creatureSize.set(creature.size)
  }

  handleTick () {
    const creature = this.state.creature.get()
    if (!creature) return

    const { width, height } = this.refs.context.canvas
    this.refs.context.clearRect(0, 0, width, height)

    this.refs.context.save()
    this.refs.context.fillStyle = 'white'

    const cx = width / 2 + creature.radius / 2
    const cy = height / 2 + creature.radius / 2
    this.refs.context.translate(Math.floor(cx), Math.floor(cy))
    this.refs.context.fill(creature.path)
    this.refs.context.restore()
  }

  handleSend () {
    WebSocketServer.sendJson({
      id: this.state.currentScreen.current,
      creature: this.state.creature.current.toJSON()
    })
  }

  beforeDestroy () {
    Store.raf.frameCount.unsubscribe(this.handleTick)
  }
}
