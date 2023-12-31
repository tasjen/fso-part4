const helper = require('./test_helper');

describe('favorite blog', () => {

  test('of empty list is null', () => {
    expect(helper.favoriteBlog([])).toEqual(null);
  });

  test('when list has only one blog, is that one blog', () => {
    expect(helper.favoriteBlog(helper.listWithOneBlog)).toEqual(helper.listWithOneBlog[0]);
  });

  test('of a bigger list is a blog having the most likes', () => {
    expect(helper.favoriteBlog(helper.blogs)).toEqual(helper.blogs[2]);
  });
})
