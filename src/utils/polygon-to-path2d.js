/* global Path2D */
export default (points, { close = true } = {}) => {
  const path = new Path2D()
  for (let index = 0; index < points.length; index++) {
    path[index ? 'lineTo' : 'moveTo'](points[index][0], points[index][1])
  }

  if (close) path.closePath()
  return path
}
