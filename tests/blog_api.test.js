const supertest = require('supertest');
const mongoose = require('mongoose');

const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.blogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('all notes are returned', async () => {
  const res = await api.get('/api/blogs');
  expect(res.body).toHaveLength(helper.blogs.length);
});

test('the unique identifier property of the blog posts is named id', async () => {
  const testBlog = new Blog({
    title: 'title_test',
    author: 'author_test',
    url: 'url_test',
    likes: 1,
  })
  const result = (await testBlog.save()).toJSON();
  expect(result.id).toBeDefined();
  await Blog.findByIdAndDelete(result.id);
});

test('HTTP POST to /api/blogs to successfully creates a new blog post', async () => {
  const newBlog = {
    title: 'title_test',
    author: 'author_test',
    url: 'url_test',
    likes: 1,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogs = await helper.blogsInDb();
  expect(blogs).toHaveLength(helper.blogs.length + 1);

  const titles = blogs.map((n) => n.title);
  expect(titles).toContain('title_test');
})

afterAll(async () => {
  await mongoose.connection.close();
});
