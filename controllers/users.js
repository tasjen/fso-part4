const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { ValidationError } = require('../utils/errors');

usersRouter.get('/', async (req, res) => {
  res.json(await User.find({}));
});

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;
  if (!password) {
    throw new ValidationError('`password` is required.');
  }
  if (password.length < 3) {
    throw new ValidationError('`password` must be at least 3 characters long');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = usersRouter;
