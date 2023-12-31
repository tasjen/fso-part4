const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs.reduce((mostFav, blog) =>
        blog.likes > mostFav.likes ? blog : mostFav
      );
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
