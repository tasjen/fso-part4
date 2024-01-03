const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', userExtractor, async (req, res) => {
  const { title, author, url, likes = 0 } = req.body;
  const user = req.user;  

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });
  const savedBlog = await blog.save();
  user.blogs = [...user.blogs, savedBlog._id];
  await user.save();
  
  res.status(201).json(await savedBlog.populate('user'));
});

blogsRouter.delete('/:id', userExtractor, async (req, res) => {

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(204).end();
  }

  const user = req.user;
  if (!user) {
    return res.status(404).json({ error: 'user not found' })
  }

  if (blog.user._id.toString() !== user._id.toString()) {
    return res.status(401).json({ error: 'token invalid' });
  }

  blog.deleteOne();
  res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
  const { title, author, url, likes } = req.body;
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' }
  );
  res.json(updatedBlog);
});

module.exports = blogsRouter;
