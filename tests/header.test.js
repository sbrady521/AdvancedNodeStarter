const Page = require('./helpers/page')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('Blogster logo successfully loaded', async () => {
  await page.waitFor('a.brand-logo')
  const text = await page.getContentsOf('a.brand-logo')
  expect(text).toEqual('Blogster')
})

test('Clicking login starts oauth flow', async () => {
  await page.click('.right a')
  await page.waitForNavigation()
  const url = await page.url()
  expect(url).toMatch(/accounts.google.com/)
})

test('Log out button should show up when logged in', async () => {

  await page.login()
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

  expect(text).toEqual('Logout')
})
