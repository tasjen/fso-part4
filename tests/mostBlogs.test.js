const helper = require('./test_helper');

describe('the author who has the largest amount of blogs', () => {

  test('of empty list is null', () => {
    expect(helper.mostBlogs([])).toEqual(null);
  });

  test('when list has only one blog, is that author with one blog', () => {
    expect(helper.mostBlogs(helper.listWithOneBlog)).toEqual({
      author: helper.listWithOneBlog[0].author,
      blogs: 1,
    });
  });

  test('of a bigger list is an author having the most blogs', () => {
    expect(helper.mostBlogs(helper.blogs)).toEqual({ author: 'Robert C. Martin', blogs: 3 });
  });
});
