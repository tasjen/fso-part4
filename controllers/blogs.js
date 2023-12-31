const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  res.json(await Blog.find({}));
});

blogsRouter.post('/', async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body;
    const blog = new Blog({
      title,
      author,
      url,
      likes: likes ?? 0,
    });
    const result = await blog.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).end();
    next(err);
  }

});

module.exports = blogsRouter;
