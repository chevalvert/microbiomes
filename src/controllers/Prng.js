import fastRandom from 'fast-random'

export const seed = window.location.hash.substring(1) || Date.now()

let randomizer = fastRandom(seed)
// Warm-up (the first few results tends to always be in the lower bounds)
for (let i = 0; i < 100; i++) random()

export function reset () { randomizer = fastRandom(seed) }
export function random () { return randomizer.nextFloat() }

export function randomFloat (min, max) {
  return randomizer.nextFloat() * (max - min) + min
}

export function randomInt (min, max) {
  return Math.floor(randomizer.nextFloat() * (max - min) + min)
}

export function randomOf (arr) {
  return arr[Math.floor(randomizer.nextFloat() * arr.length)]
}

export default {
  seed, reset, random, randomFloat, randomInt, randomOf
}
