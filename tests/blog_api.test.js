const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

const { username, name, password } = helper.user;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(password, 10);

  const { id } = (
    await new User({ username, name, passwordHash }).save()
  ).toJSON();

  const blogObjects = helper.blogs.map(
    (blog) => new Blog({ ...blog, user: id })
  );
  const promiseArray = blogObjects.map((blog) => blog.save());

  await Promise.all([...promiseArray]);
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

describe('HTTP POST to /api/blogs', () => {
  let token;
  const blog = helper.listWithOneBlog[0];
  beforeEach(async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username, password });
    token = loginResponse.body.token;

    Blog.findOneAndDelete({ title: blog.title });
  });

  test('returns 201 if the blog is successfully added', async () => {
    const blogsBefore = await helper.blogsInDb();

    await api
      .post('/api/blogs')
      .send(blog)
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await helper.blogsInDb();
    expect(blogsAfter).toHaveLength(blogsBefore.length + 1);

    const titles = blogsAfter.map((n) => n.title);
    expect(titles).toContain(blog.title);
  });

  test('returns 400 if title or url is missing', async () => {
    const blogsBefore = await helper.blogsInDb();

    const { title, ...blogWithoutTitle } = blog;
    const { url, ...blogWithoutUrl } = blog;

    await api
      .post('/api/blogs')
      .send({ blogWithoutTitle })
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    await api
      .post('/api/blogs')
      .send({ blogWithoutUrl })
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await helper.blogsInDb();
    expect(blogsAfter).toEqual(blogsBefore);
  });

  test(`the saved blog has 0 'likes' as a default value
    if 'likes' is missing from the request`, async () => {
    const { likes, ...blogWithoutLikes } = blog;
    const blogsBefore = await helper.blogsInDb();
    await api
      .post('/api/blogs')
      .send(blogWithoutLikes)
      .set({ Authorization: `Bearer ${token}` })
      .expect(201);
    const blogsAfter = await helper.blogsInDb();
    const addedBlog = blogsAfter.find((n) => n.title === blog.title);

    expect(addedBlog.likes).toBe(0);
    expect(blogsAfter).toHaveLength(blogsBefore.length + 1);
  });

  test('returns 401 if token is invalid', async () => {
    const blogsBefore = helper.blogsInDb();
    await api
      .post('/api/blogs')
      .send(blog)
      .set({ Authorization: `Bearer ${token.slice(1)}` })
      .expect(401);

    const blogsAfter = helper.blogsInDb();
    expect(blogsAfter).toEqual(blogsBefore);
  });
});

describe.skip('HTTP DELETE to /api/blog/:id', () => {
  test('succeeds with status code 204 if id and token is valid', async () => {
    const blogToDelete = (await helper.blogsInDb())[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion).toHaveLength(helper.blogs.length - 1);

    const titles = blogsAfterDeletion.map((n) => n.titles);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('HTTP PUT to /api/blog/:id', () => {
  let token;
  const blog = helper.listWithOneBlog[0];
  beforeEach(async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username, password })
      token = loginResponse.body.token;
    });
    
    test('succeeds with status code 200', async () => {
      const blogsBefore = await helper.blogsInDb();
      const blogToUpdate = blogsBefore[0];
      await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    const blogsAfter = await helper.blogsInDb();
    const blogAfterUpdate = await Blog.findById(blogToUpdate.id);
    expect(blogAfterUpdate.likes).toBe(blogToUpdate.likes + 1);
    expect(blogsAfter).toHaveLength(blogsBefore.length);
  });
});

describe('HTTP POST to /api/users', () => {
  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: 'user2',
      name: 'name2',
      password: 'password2',
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

    const result = await api
      .post('/api/users')
      .send(helper.user)
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
