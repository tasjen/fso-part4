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
  const testBlog = new Blog(helper.listWithOneBlog);
  const result = (await testBlog.save()).toJSON();
  expect(result.id).toBeDefined();
  await Blog.findByIdAndDelete(result.id);
});

test('HTTP POST to /api/blogs to successfully creates a new blog post', async () => {
  await api
    .post('/api/blogs')
    .send(helper.listWithOneBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogs = await helper.blogsInDb();
  expect(blogs).toHaveLength(helper.blogs.length + 1);

  const titles = blogs.map((n) => n.title);
  expect(titles).toContain('Go To Statement Considered Harmful');
});

test('if the likes property is missing from the request, it will default to the value 0', async () => {
  await api
    .post('/api/blogs')
    .send(helper.listWithOneBlog);
  const blogs = await helper.blogsInDb();
  const addedBlog = blogs.find((n) => n.title === helper.listWithOneBlog.title);
  expect(addedBlog.likes).toBe(0);
});

afterAll(async () => {
  await mongoose.connection.close();
});
