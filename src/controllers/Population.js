import Store from 'store'
import { randomOf } from 'controllers/Prng'

import Creature from 'abstractions/Creature'
import Builder from 'abstractions/creatures/Builder'
import Restorer from 'abstractions/creatures/Restorer'
import Shifter from 'abstractions/creatures/Shifter'

const CREATURES = {
  Builder,
  Restorer,
  Shifter
}

export function add ({ type, ...params } = {}) {
  const maxLength = Store.population.maxLength.get()

  Store.population.content.update(population => {
    const creature = new (CREATURES[type] || Creature)(params)
    population.push(creature)
    if (population.length > maxLength) population.shift()
  }, true)
}

export function randomize () {
  for (let i = 0; i < Store.population.maxLength.get(); i++) {
    add({
      shape: 'blob',
      animated: true,
      type: randomOf(Store.population.initialTypeDistribution.get()),
      size: randomOf(Store.population.initialSizeDistribution.get())
    })
  }
}

export default { add, randomize }
