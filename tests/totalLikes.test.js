const helper = require('./test_helper');

describe.skip('total likes', () => {

  test('of empty list is zero', () => {
    const result = helper.totalLikes([]);
    expect(result).toBe(0);
  });

  test('when list has only one blog, equals the likes of that', () => {
    const result = helper.totalLikes(helper.listWithOneBlog);
    expect(result).toBe(5);
  });

  test('of a bigger list is calculated right', () => {
    expect(helper.totalLikes(helper.blogs)).toBe(36);
  });
});
