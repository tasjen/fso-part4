const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = helper.dummy(blogs)
  expect(result).toBe(1)
})