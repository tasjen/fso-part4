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

const mostBlogs = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs
        .reduce((result, blog) => {
          const author = result.find((e) => e.author === blog.author);
          if (!author) {
            result.push({ author: blog.author, blogs: 1 });
          } else author.blogs += 1;
          return result;
        }, [])
        .reduce((most, author) => {
          return author.blogs > most.blogs ? author : most;
        });
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
