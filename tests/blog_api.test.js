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

afterAll(async () => {
  await mongoose.connection.close();
});
