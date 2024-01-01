const helper = require('./test_helper');

describe.skip('the author who has the largest amount of likes', () => {

  test('of empty list is null', () => {
    expect(helper.mostLikes([])).toEqual(null);
  });

  test('when list has only one blog, is that author with the likes of that one blog', () => {
    expect(helper.mostLikes(helper.listWithOneBlog)).toEqual({
      author: helper.listWithOneBlog[0].author,
      likes: helper.listWithOneBlog[0].likes,
    });
  });

  test('of a bigger list is an author having the most blogs', () => {
    expect(helper.mostLikes(helper.blogs)).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 });
  });
});
