import { map, randomInt, radians, roundTo } from 'missing-math'
import polybool from 'poly-bool'
import path2d from 'utils/polygon-to-path2d'

const SHAPES = {
  rectangle: function (radius, resolution = 1) {
    const r = roundTo(radius, resolution)
    return [[-r, -r], [-r, r], [r, r], [r, -r]]
  },

  blob: function (radius, resolution = 1) {
    const parts = []
    for (let i = 0; i < 5; i++) {
      const x = roundTo(randomInt(-radius, 0), resolution)
      const y = roundTo(randomInt(-radius, 0), resolution)
      const w = roundTo(randomInt(radius - x), resolution)
      const h = roundTo(randomInt(radius - y), resolution)
      parts.push([[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]])
    }

    return union(parts) || SHAPES.rectangle(radius, resolution)
  },

  circle: function (radius, resolution = 1) {
    const parts = []
    for (let a = 0; a < 360; a += 360 / 16) {
      const w = roundTo(Math.cos(radians(a)) * radius, resolution)
      const h = roundTo(Math.sin(radians(a)) * radius, resolution)
      parts.push([[[0, 0], [w, 0], [w, h], [0, h]]])
    }

    return union(parts)
  }
}

function union (polygons) {
  let polygon = null
  for (const p of polygons) {
    polygon = polygon
      ? polybool(p, polygon, 'or')
      : p
  }
  return polygon[0]
}

function bbox (polygon) {
  let xmin = Number.POSITIVE_INFINITY
  let ymin = Number.POSITIVE_INFINITY
  let xmax = Number.NEGATIVE_INFINITY
  let ymax = Number.NEGATIVE_INFINITY

  for (const [x, y] of polygon) {
    if (x < xmin) xmin = x
    if (x > xmax) xmax = x
    if (y < ymin) ymin = y
    if (y > ymax) ymax = y
  }

  return {
    x: xmin,
    y: ymin,
    width: xmax - xmin,
    height: ymax - ymin
  }
}

export function tamagotchize (polygon, {
  direction = 'horizontal', // 'horizontal'|'vertical'
  resolution = 1,
  framesLength = 6,
  slicesLength = 3,
  amt = 0.1
} = {}) {
  const { x, y, width, height } = bbox(polygon)

  const frames = []
  for (let index = 0; index < framesLength; index++) {
    const slices = []

    for (let i = 0; i < slicesLength; i++) {
      let rect
      const offset = [0, 0]

      switch (direction) {
        case 'vertical':
          offset[1] = Math.sin(map(index, 0, framesLength, 0, Math.PI * 2) + map(i, 0, slicesLength, 0, Math.PI * 2)) * (amt * height)
          rect = [
            [x + (width / slicesLength) * i, y],
            [x + (width / slicesLength) * (i + 1), y],
            [x + (width / slicesLength) * (i + 1), y + height],
            [x + (width / slicesLength) * i, y + height]
          ]
          break

        case 'horizontal' :
          offset[0] = Math.sin(map(index, 0, framesLength, 0, Math.PI * 2) + map(i, 0, slicesLength, 0, Math.PI * 2)) * (amt * height)
          rect = [
            [x, y + (height / slicesLength) * i],
            [x, y + (height / slicesLength) * (i + 1)],
            [x + width, y + (height / slicesLength) * (i + 1)],
            [x + width, y + (height / slicesLength) * i]
          ]
          break

        default: throw new Error(`Polygon.tamagotchize direction should either be 'horizontal' or 'vertical', got ${direction}.`)
      }

      const slice = polybool(polygon, rect, 'and')
      const translated = slice[0].map(p => ([p[0] + offset[0], p[1] + offset[1]]))
      slices.push(translated)
    }

    frames.push(union(slices))
  }

  return frames.map(frame => toPath2d(frame, resolution))
}

export function toPath2d (polygon, resolution = 1) {
  const polygons = polygon.map(p => p.map(v => roundTo(v, resolution)))
  // Handle conversion to JSON, which is unsupported by default
  const path = path2d(polygons)
  path.toString = () => polygons
  return path
}

export function shape (shape = 'rectangle', { size = 10, resolution } = {}) {
  return SHAPES[shape](size / 2, resolution)
}

export default { shape, tamagotchize, toPath2d }
