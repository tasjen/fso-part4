
const dummy = (blogs) => {
  return 1;
};

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
];

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
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
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
