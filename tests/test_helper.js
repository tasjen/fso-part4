const Blog = require('../models/blog');
const User = require('../models/user');

const dummy = (blogs) => {
  return 1;
};

const listWithOneBlog = [
  {
    title: 'title_test',
    author: 'author_test',
    url: 'url_test',
    likes: 5,
  },
];

const blogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON());
}

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

const mostLikes = (blogs) => {
  return blogs.length === 0
  ? null
  : blogs
      .reduce((result, blog) => {
        const author = result.find((e) => e.author === blog.author);
        if (!author) {
          result.push({ author: blog.author, likes: blog.likes });
        } else author.likes += blog.likes;
        return result;
      }, [])
      .reduce((most, author) => {
        return author.likes > most.likes ? author : most;
      });
}

module.exports = {
  dummy,
  listWithOneBlog,
  blogs,
  blogsInDb,
  usersInDb,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
