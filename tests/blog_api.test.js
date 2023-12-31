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
  const testBlog = new Blog(helper.listWithOneBlog[0]);
  const result = (await testBlog.save()).toJSON();
  expect(result.id).toBeDefined();
  await Blog.findByIdAndDelete(result.id);
});

test('HTTP POST to /api/blogs to successfully creates a new blog post', async () => {
  await api
    .post('/api/blogs')
    .send(helper.listWithOneBlog[0])
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogs = await helper.blogsInDb();
  expect(blogs).toHaveLength(helper.blogs.length + 1);

  const titles = blogs.map((n) => n.title);
  expect(titles).toContain('Go To Statement Considered Harmful');
});

test('if the likes property is missing from the request, it will default to the value 0', async () => {
  const { likes, ...blogWithoutLikes } = helper.listWithOneBlog[0];
  await api.post('/api/blogs').send(blogWithoutLikes);
  const blogs = await helper.blogsInDb();
  const addedBlog = blogs.find(
    (n) => n.title === helper.listWithOneBlog[0].title
  );
  expect(addedBlog.likes).toBe(0);
});

test('if the title or url properties are missing from the POST request, response is 400', async () => {
  const { title, ...blogWithoutTitle } = helper.listWithOneBlog[0];
  await api
    .post('/api/blogs')
    .send(blogWithoutTitle)
    .expect(400);

  const { url, ...blogWithoutUrl } = helper.listWithOneBlog[0];
  await api
    .post('/api/blogs')
    .send(blogWithoutUrl)
    .expect(400);
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogToDelete = (await helper.blogsInDb())[0];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);

    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion).toHaveLength(helper.blogs.length - 1);

    const titles = blogsAfterDeletion.map((n) => n.titles);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
