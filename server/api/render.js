const fs = require('fs-extra')
const path = require('path')
const Handlebars = require('handlebars')
Handlebars.registerHelper('json', context => JSON.stringify(context))

const CACHE = new Map()

const pkg = require('../../package.json')
const app = require(process.env.CONFIGURATION)

module.exports = template => (req, res, next) => {
  const cachable = ['max-age=O', 'no-cache'].includes(req.get('Cache-Control'))
  try {
    let render = CACHE.get(template)
    if (!cachable || !render) {
      render = Handlebars.compile(
        fs.readFileSync(path.join(__dirname, '..', 'templates', template), 'utf8')
      )
      CACHE.set(template, render)
    }

    const html = render({
      app,
      pkg,
      env: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production'
    })

    res.send(html)
  } catch (error) {
    next(error)
  }
}
