const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')

class CustomPage {
  constructor (page) {
    this.page = page
  }

  static async build () {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    const customPage = new CustomPage(page)
    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property]
      }
    })
  }

  async login () {
    const user = await userFactory()
    const { session, sig } = sessionFactory(user)

    await this.page.setCookie({ name: 'session', value: session })
    await this.page.setCookie({ name: 'session.sig', value: sig })

    await this.page.goto('localhost:3000/blogs')
    await this.page.waitFor('a[href="/auth/logout"]')
  }

  async getContentsOf (selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  // It is important to note that when run with puppeteer, we are sending this fetch statement to be executed by the browser
  // It is sent as a string and any variable we use in it do not go along for the ride
  // By passing arguments to the evaluate function we can say "pass in these parameters when you run this function"
  get (path) {
    return this.page.evaluate((_path) => {
      return (fetch(_path, {
        method: 'GET',
        credentials: 'same-origin', // same-origin says to use our cookies for this site for our credentials
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()))
    }, path)
  }

  post (path, data) {
    return this.page.evaluate((_path, _data) => {
      return (fetch(_path, {
        method: 'POST',
        credentials: 'same-origin', // same-origin says to use our cookies for this site for our credentials
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
      }).then(res => res.json()))
    }, path, data)
  }
}

module.exports = CustomPage
