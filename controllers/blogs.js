const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  res.json(await Blog.find({}));
});

blogsRouter.post('/', async (req, res) => {
  const { title, author, url, likes = 0 } = req.body;
  const blog = new Blog({
    title,
    author,
    url,
    likes,
  });
  const result = await blog.save();
  res.status(201).json(result);
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
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
