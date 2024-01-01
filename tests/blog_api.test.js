const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

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
  await api.post('/api/blogs').send(blogWithoutTitle).expect(400);

  const { url, ...blogWithoutUrl } = helper.listWithOneBlog[0];
  await api.post('/api/blogs').send(blogWithoutUrl).expect(400);
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogToDelete = (await helper.blogsInDb())[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion).toHaveLength(helper.blogs.length - 1);

    const titles = blogsAfterDeletion.map((n) => n.titles);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('updating of a blog', () => {
  test('succeeds with status code 200', async () => {
    const blogToUpdate = (await helper.blogsInDb())[0];
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200);

    const blogAfterUpdate = await Blog.findById(blogToUpdate.id);
    expect(blogAfterUpdate.likes).toBe(blogToUpdate.likes + 1);
  });
});

describe.only('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const [username, name, password] = ['user0', 'name0', 'password0'];
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, name, passwordHash });

    await user.save();
  });

  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: 'user1',
      name: 'name1',
      password: 'password1',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'user0',
      name: 'name1',
      password: 'password1',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('adding a user without or less than 3 characters long username or password gives error', async () => {
    const usersAtStart = await helper.usersInDb();

    await api
      .post('/api/users')
      .send({ name: 'name1', password: 'password1' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    await api
      .post('/api/users')
      .send({ username: 'username1', name: 'name1' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    await api
      .post('/api/users')
      .send({ username: 'u1', name: 'name1', password: 'password1' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    await api
      .post('/api/users')
      .send({ username: 'username1', name: 'name1', password: 'p1' })
      .expect(400)
      .expect('Content-Type', /application\/json/);
      
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
