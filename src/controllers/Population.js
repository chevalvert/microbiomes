import Store from 'store'
import randomOf from 'utils/array-random'

// import Builder from 'abstractions/Builder'
import Shifter from 'abstractions/Shifter'

const CREATURES = {
  // Builder,
  Shifter
}

export function add ({ type = 'Shifter', ...params } = {}) {
  const maxLength = Store.population.maxLength.get()

  Store.population.content.update(population => {
    population.push(new CREATURES[type](params))
    if (population.length > maxLength) population.shift()
  }, true)
}

export function randomize () {
  for (let i = 0; i < 10; i++) {
    add({
      shape: 'blob',
      type: randomOf(Object.keys(CREATURES)),
      size: 50
    })
  }
}

export default { add, randomize }
